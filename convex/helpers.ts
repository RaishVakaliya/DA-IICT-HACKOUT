import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getWithdrawalRequest = internalQuery({
  args: { withdrawalId: v.id("withdrawal_requests") },
  handler: async (ctx, { withdrawalId }) => {
    const withdrawal = await ctx.db.get(withdrawalId);
    if (!withdrawal) return null;

    const user = await ctx.db.get(withdrawal.userId);
    if (!user) return null;

    return { ...withdrawal, user };
  },
});
