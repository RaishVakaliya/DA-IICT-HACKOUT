import { v } from "convex/values";
import Stripe from "stripe";
import { action, internalAction, internalMutation } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * Create a Stripe checkout session for the user to purchase Hydcoin credits.
 * 
 * @param credits The number of Hydcoin credits to purchase.
 * @returns The URL of the Stripe checkout session.
 */
export const pay = action({
    args: { credits: v.number() },
    handler: async (ctx, { credits }): Promise<string | null> => {
        const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getMyUser, {});
        if (!user) {
            throw new Error("User not found");
        }
        const stripe = new Stripe(process.env.STRIPE_KEY!);

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                name: user.fullname,
                email: user.email,
                metadata: {
                    userId: user._id,
                },
            });
            customerId = customer.id;
            await ctx.runMutation(internal.users.setStripeCustomerId, {
                userId: user._id,
                stripeCustomerId: customerId,
            });
        }

        const domain = process.env.HOSTING_URL ?? "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `${credits} Hydcoin Credits`,
                        },
                        unit_amount: credits * 83 * 100, // 1 credit = 83 INR, amount in paise
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${domain}/`,
            cancel_url: `${domain}/`,
            metadata: {
                userId: user._id,
                credits: credits.toString(), // Convert credits to string for metadata
            },
        });

        return session.url;
    },
});

/**
 * If you don’t need a marketplace and only want to take payments (like normal checkout),
 * you shouldn’t be calling createStripeAccountLink.
 * Instead, use:
 *  - stripe.checkout.sessions.create(...) for one-time purchases.
 *  - stripe.subscriptions.create(...) for subscriptions.
 */
export const createStripeAccountLink = action({
    args: {},
    handler: async (ctx) => {
        const user: Doc<"users"> | null = await ctx.runQuery(internal.users.getMyUser, {});
        if (!user) {
            throw new Error("User not found");
        }

        const stripe = new Stripe(process.env.STRIPE_KEY!);

        const domain = process.env.HOSTING_URL ?? "http://localhost:5173";

        let accountId = user.stripeAccountId;

        if (!accountId) {
            const account = await stripe.accounts.create({
                type: "express",
            });
            accountId = account.id;
            await ctx.runMutation(internal.stripe.storeStripeAccountId, {
                userId: user._id,
                stripeAccountId: accountId,
            });
        }

        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${domain}/`,
            return_url: `${domain}/`,
            type: "account_onboarding",
        });

        return accountLink.url;
    },
});

export const storeStripeAccountId = internalMutation({
    args: { userId: v.id("users"), stripeAccountId: v.string() },
    handler: async (ctx, { userId, stripeAccountId }) => {
        await ctx.db.patch(userId, {
            stripeAccountId: stripeAccountId,
        });
    },
});

export const processPayout = internalAction({
  args: { withdrawalId: v.id("withdrawal_requests") },
  handler: async (ctx, { withdrawalId }) => {
    const withdrawal = await ctx.runQuery(internal.helpers.getWithdrawalRequest, { withdrawalId });

    if (!withdrawal || withdrawal.status !== "pending") {
      throw new Error("Invalid withdrawal request.");
    }

    if (!withdrawal.user.stripeAccountId) {
      throw new Error("User does not have a Stripe account connected.");
    }

    const stripe = new Stripe(process.env.STRIPE_KEY!);

    try {
      const transfer = await stripe.transfers.create({
        amount: withdrawal.amount * 83 * 100, // Amount in paise (1 credit = 83 INR)
        currency: "inr", // set currency to 'inr' for UPI payments
        destination: withdrawal.user.stripeAccountId,
        transfer_group: `withdrawal_${withdrawalId}`,
      });

      // Success - mark as processed and retire credits
      await ctx.runMutation(internal.stripe.finalizePayout, {
        withdrawalId,
        stripeTransferId: transfer.id,
        creditIds: withdrawal.creditIds,
        outcome: "processed",
      });
    } catch (error) {
      console.error("Stripe payout failed:", error);
      
      // Failure - mark as failed and return credits to active status
      await ctx.runMutation(internal.stripe.finalizePayout, {
        withdrawalId,
        stripeTransferId: "",
        creditIds: withdrawal.creditIds,
        outcome: "failed",
      });
      
      throw error; // Re-throw to indicate failure
    }
  },
});

export const finalizePayout = internalMutation({
  args: {
    withdrawalId: v.id("withdrawal_requests"),
    stripeTransferId: v.string(),
    creditIds: v.array(v.id("hydcoin_credits")),
    outcome: v.union(v.literal("processed"), v.literal("failed")),
  },
  handler: async (ctx, { withdrawalId, stripeTransferId, creditIds, outcome }) => {
    // Update withdrawal request status
    await ctx.db.patch(withdrawalId, {
      status: outcome,
      stripeTransferId: outcome === "processed" ? stripeTransferId : undefined,
      processedAt: Date.now(),
    });

    // Update credit statuses based on outcome
    for (const creditId of creditIds) {
      if (outcome === "processed") {
        // Success: retire credits (deduct from wallet)
        await ctx.db.patch(creditId, {
          status: "retired",
          retirementDate: Date.now(),
        });
      } else {
        // Failure: return credits to active status (back in wallet)
        await ctx.db.patch(creditId, {
          status: "active",
        });
      }
    }
  },
});

export const fulfill = internalMutation({
    args: { stripeId: v.string(), userId: v.id("users"), credits: v.number() },
    handler: async (ctx, { stripeId, userId, credits }) => {
        const purchase = await ctx.db
            .query("purchases")
            .withIndex("by_stripe_id", (q) => q.eq("stripeId", stripeId))
            .unique();

        if (purchase) {
            console.log(`Purchase ${stripeId} already fulfilled.`);
            return;
        }

        const newPurchaseId = await ctx.db.insert("purchases", {
            userId,
            stripeId,
            credits,
        });

        for (let i = 0; i < credits; i++) {
            await ctx.db.insert("hydcoin_credits", {
                ownerId: userId,
                status: "active",
                source: {
                    type: "purchase",
                    purchaseId: newPurchaseId,
                },
            });
        }
    },
});
