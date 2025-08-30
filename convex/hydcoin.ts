import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// --- QUERIES ---

// Query to get the current user's Hydcoin balance by counting active credits
export const getBalance = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return null;

    // Return the pre-calculated hydcoinBalance from the user document
    return user.hydcoinBalance || 0;
  },
});

// Query to get the current user's transaction history
export const getTransactions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const transactionsAsSender = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("fromUserId"), user._id))
      .collect();

    const transactionsAsReceiver = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("toUserId"), user._id))
      .collect();

    const allTransactions = [...transactionsAsSender, ...transactionsAsReceiver];
    allTransactions.sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      allTransactions.map(async (tx) => {
        const fromUser = tx.fromUserId ? await ctx.db.get(tx.fromUserId) : null;
        const toUser = await ctx.db.get(tx.toUserId);
        return {
          ...tx,
          fromUsername: fromUser ? fromUser.username : "System",
          toUsername: toUser ? toUser.username : "Unknown",
          currentUserIsSender: tx.fromUserId === user._id,
        };
      })
    );
  },
});

export const getUserTransactions = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const transactionsAsSender = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("fromUserId"), user._id))
      .collect();

    const transactionsAsReceiver = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("toUserId"), user._id))
      .collect();

    const allTransactions = [...transactionsAsSender, ...transactionsAsReceiver];
    allTransactions.sort((a, b) => b._creationTime - a._creationTime);

    return Promise.all(
      allTransactions.map(async (tx) => {
        const fromUser = tx.fromUserId ? await ctx.db.get(tx.fromUserId) : null;
        const toUser = await ctx.db.get(tx.toUserId);
        return {
          _id: tx._id,
          _creationTime: tx._creationTime,
          amount: tx.amount,
          type: tx.type,
          fromUsername: fromUser ? fromUser.username : "System",
          toUsername: toUser ? toUser.username : "Unknown",
          // For public display, we might not want to expose `currentUserIsSender` directly
          // Instead, we can denote if the `user` (whose profile is being viewed) is involved
          // isProfileOwnerInvolved: tx.fromUserId === user._id || tx.toUserId === user._id,
          isProfileOwnerSender: tx.fromUserId === user._id,
          isProfileOwnerReceiver: tx.toUserId === user._id,
        };
      })
    );
  },
});

// Query to get the current user's withdrawal history
export const getPendingWithdrawals = query({
  handler: async (ctx) => {
    const isAuthorized = await ctx.runQuery(api.users.isCertifierOrAdmin);
    if (!isAuthorized) {
      return []; // Only admins or certifiers can see pending requests
    }

    const pendingWithdrawals = await ctx.db
      .query("withdrawal_requests")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();

    return Promise.all(
      pendingWithdrawals.map(async (req) => {
        const user = await ctx.db.get(req.userId);
        return {
          ...req,
          username: user?.username ?? "Unknown User",
        };
      })
    );
  },
});

export const getWithdrawalHistory = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) return [];

    const withdrawals = await ctx.db
      .query("withdrawal_requests")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return withdrawals;
  },
});

// --- MUTATIONS ---

// Mutation to transfer Hydcoin by re-assigning ownership of credits
export const transfer = mutation({
  args: { toUsername: v.string(), amount: v.number() },
  handler: async (ctx, { toUsername, amount }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const fromUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!fromUser) throw new Error("Sender not found");

    const toUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), toUsername))
      .first();

    if (!toUser) throw new Error(`User "${toUsername}" not found`);
    if (fromUser._id === toUser._id) throw new Error("Cannot transfer to yourself");

    const creditsToTransfer = await ctx.db
      .query("hydcoin_credits")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", fromUser._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(amount);

    if (creditsToTransfer.length < amount) throw new Error("Insufficient balance");

    const creditIds = creditsToTransfer.map((c) => c._id);

    for (const credit of creditsToTransfer) {
      await ctx.db.patch(credit._id, { ownerId: toUser._id });
    }

    // Update hydcoinBalance for both sender and receiver
    await ctx.db.patch(fromUser._id, { hydcoinBalance: (fromUser.hydcoinBalance || 0) - amount });
    await ctx.db.patch(toUser._id, { hydcoinBalance: (toUser.hydcoinBalance || 0) + amount });

    await ctx.db.insert("transactions", {
      fromUserId: fromUser._id,
      toUserId: toUser._id,
      amount,
      type: "transfer",
      creditIds,
    });

    return { success: true };
  },
});

// Mutation to retire/withdraw credits, marking them as used
export const retire = mutation({
  args: { amount: v.number() },
  handler: async (ctx, { amount }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const creditsToRetire = await ctx.db
      .query("hydcoin_credits")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(amount);

    if (creditsToRetire.length < amount) throw new Error("Insufficient balance");

    const creditIds = creditsToRetire.map((c) => c._id);

    for (const credit of creditsToRetire) {
      await ctx.db.patch(credit._id, {
        status: "retired",
        retirementDate: Date.now(),
        source: credit.source, // Include existing source to satisfy schema
      });
    }

    // Decrease the user's hydcoinBalance
    await ctx.db.patch(user._id, { hydcoinBalance: (user.hydcoinBalance || 0) - amount });

    await ctx.db.insert("transactions", {
      fromUserId: user._id, // The user is 'transferring' to a retired state
      toUserId: user._id, // The user still owns the retired credit
      amount,
      type: "retirement",
      creditIds,
    });

    return { success: true };
  },
});

// Mutation to request a withdrawal of Hydcoin credits
export const requestStripePayout = mutation({
  args: { amount: v.number() },
  handler: async (ctx, { amount }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");
    if (!user.stripeAccountId) throw new Error("Stripe account not connected.");

    const creditsToWithdraw = await ctx.db
      .query("hydcoin_credits")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(amount);

    if (creditsToWithdraw.length < amount) throw new Error("Insufficient active credits");

    const creditIds = creditsToWithdraw.map((c) => c._id);

    for (const credit of creditsToWithdraw) {
      await ctx.db.patch(credit._id, { status: "pending_withdrawal" });
    }

    await ctx.db.insert("withdrawal_requests", {
      userId: user._id,
      amount,
      creditIds,
      method: "stripe",
      details: { stripeAccountId: user.stripeAccountId },
      status: "pending",
    });

    return { success: true };
  },
});

export const requestWithdrawal = mutation({
  args: {
    amount: v.number(),
    method: v.union(v.literal("upi"), v.literal("stripe")),
    details: v.object({
      upiId: v.optional(v.string()),
      stripeAccountId: v.optional(v.string()),
    }),
  },
  handler: async (ctx, { amount, method, details }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("User not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) throw new Error("User not found");

    const creditsToWithdraw = await ctx.db
      .query("hydcoin_credits")
      .withIndex("by_ownerId", (q) => q.eq("ownerId", user._id))
      .filter((q) => q.eq(q.field("status"), "active"))
      .take(amount);

    if (creditsToWithdraw.length < amount) throw new Error("Insufficient active credits");

    const creditIds = creditsToWithdraw.map((c) => c._id);

    // Mark credits as pending withdrawal
    for (const credit of creditsToWithdraw) {
      console.log(`Marking credit ${credit._id} as pending_withdrawal`);
      await ctx.db.patch(credit._id, { status: "pending_withdrawal" });
    }

    console.log(`Created withdrawal request for ${amount} credits. Credits marked as pending_withdrawal.`);

    // Create a withdrawal request record
    await ctx.db.insert("withdrawal_requests", {
      userId: user._id,
      amount,
      creditIds,
      method,
      details,
      status: "pending",
    });

    return { success: true };
  },
});
