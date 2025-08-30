import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import Stripe from "stripe";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
      throw new Error("Missing CLERK_WEBHOOK_SECRET environment variable");
    }

    // Check headers
    const svix_id = request.headers.get("svix-id");
    const svix_signature = request.headers.get("svix-signature");
    const svix_timestamp = request.headers.get("svix-timestamp");

    if (!svix_id || !svix_signature || !svix_timestamp) {
      console.error("Missing required Svix headers", {
        svix_id: !!svix_id,
        svix_signature: !!svix_signature,
        svix_timestamp: !!svix_timestamp
      });
      return new Response("Missing required Svix headers", {
        status: 400,
      });
    }

    const payload = await request.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: any;

    //verify webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-signature": svix_signature,
        "svix-timestamp": svix_timestamp,
      }) as any;
    } catch (err) {
      console.error("Error verifying webhook:", err);
      return new Response("Error verifying webhook signature", { status: 400 });
    }

    const eventType = evt.type;
    console.log("Received webhook event:", eventType);

    if (eventType === "user.created" || eventType === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

      if (!email_addresses || email_addresses.length === 0) {
        console.error("No email addresses found in webhook data");
        return new Response("Invalid user data: no email address", { status: 400 });
      }

      const email = email_addresses[0].email_address;
      const name = `${first_name || ""} ${last_name || ""}`.trim();

      try {
        await ctx.runMutation(api.users.createUser, {
          clerkId: id,
          email,
          fullname: name,
          username: username || email.split("@")[0],
          image: image_url,
        });
        console.log("Successfully synced user data for:", id);
      } catch (error) {
        console.error("Error creating/updating user:", error);
        return new Response("Error creating/updating user", { status: 500 });
      }
    }

    return new Response("Webhook processed successfully", { status: 200 });
  }),
});

// Stripe Webhook
const handleStripeWebhook = httpAction(async (ctx, request) => {
  const signature = request.headers.get("stripe-signature") as string;
  const stripe = new Stripe(process.env.STRIPE_KEY!);

  let event: Stripe.Event;
  try {
    const body = await request.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.metadata?.userId || !session.metadata?.credits) {
      console.error("Webhook received with missing metadata:", session.metadata);
      return new Response("Missing metadata", { status: 400 });
    }

    try {
      await ctx.runMutation(internal.stripe.fulfill, {
        stripeId: session.id,
        userId: session.metadata.userId as any,
        credits: parseInt(session.metadata.credits),
      });
    } catch (err) {
      console.error("Error fulfilling purchase from webhook:", err);
      // Return a 500 error to indicate failure, Stripe will retry.
      return new Response("Webhook handler failed", { status: 500 });
    }
  }

  return new Response(null, { status: 200 });
});

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: handleStripeWebhook,
});

// Helper to check for admin privileges
async function isAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  // This ADMIN_CLERK_ID should be set in the Convex dashboard environment variables
  const adminClerkId = process.env.ADMIN_CLERK_ID;
  if (!adminClerkId) {
    console.error("ADMIN_CLERK_ID environment variable not set.");
    return false;
  }
  return identity.subject === adminClerkId;
}

// HTTP action to process a Stripe payout (admin only)
http.route({
  path: "/processStripePayout",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    if (!(await isAdmin(ctx))) {
      return new Response("Unauthorized", { status: 403 });
    }

    const { withdrawalId } = await request.json();
    if (!withdrawalId) return new Response("Missing withdrawalId", { status: 400 });

    try {
      await ctx.runAction(internal.stripe.processPayout, { withdrawalId: withdrawalId as any });
      return new Response("Payout processing started", { status: 200 });
    } catch (error: any) {
      console.error("Error processing payout:", error);
      return new Response(error.message || "Failed to process payout", { status: 500 });
    }
  }),
});

export default http;