import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
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

export default http;