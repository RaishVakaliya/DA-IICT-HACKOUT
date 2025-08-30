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
        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: "2024-06-20",
        });

        const domain = process.env.HOSTING_URL ?? "http://localhost:5173";

                const session = await stripe.checkout.sessions.create({
            customer: user.stripeCustomerId,
            automatic_payment_methods: { enabled: true },
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
                credits: credits.toString(),
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

        const stripe = new Stripe(process.env.STRIPE_KEY!, {
            apiVersion: "2024-06-20",
        });

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

    const transfer = await stripe.transfers.create({
      amount: withdrawal.amount * 83 * 100, // Amount in paise (1 credit = 83 INR)
      currency: "inr", // set currency to 'inr' for UPI payments
      destination: withdrawal.user.stripeAccountId,
      transfer_group: `withdrawal_${withdrawalId}`,
    });

    await ctx.runMutation(internal.stripe.finalizePayout, {
      withdrawalId,
      stripeTransferId: transfer.id,
      creditIds: withdrawal.creditIds,
    });
  },
});

export const finalizePayout = internalMutation({
  args: {
    withdrawalId: v.id("withdrawal_requests"),
    stripeTransferId: v.string(),
    creditIds: v.array(v.id("hydcoin_credits")),
  },
  handler: async (ctx, { withdrawalId, stripeTransferId, creditIds }) => {
    await ctx.db.patch(withdrawalId, {
      status: "processed",
      stripeTransferId,
      processedAt: Date.now(),
    });

    for (const creditId of creditIds) {
      await ctx.db.patch(creditId, {
        status: "retired",
        retirementDate: Date.now(),
      });
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
