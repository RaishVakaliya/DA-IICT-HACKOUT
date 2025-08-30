import { internalMutation, internalQuery } from "./_generated/server";
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

export const migrateHydcoinCreditsSource = internalMutation({
  handler: async (ctx) => {
    const creditsToMigrate = await ctx.db
      .query("hydcoin_credits")
      .filter((q) => q.eq(q.field("status"), "retired"))
      .filter((q) => q.eq(q.field("source"), undefined))
      .collect();

    for (const credit of creditsToMigrate) {
      await ctx.db.patch(credit._id, {
        issueDate: credit._creationTime, // Use creation time as a placeholder
        source: {
          type: "generation",
          producerId: credit.ownerId, // Assuming owner was the producer for older retired credits
          metadata: {
            productionBatchId: "migrated",
            facility: "unknown",
            productionDate: 0, // Placeholder
          },
        },
      });
    }
    console.log(`Migrated ${creditsToMigrate.length} hydcoin_credits documents.`);
  },
});

export const getCreditsMissingSource = internalQuery({
  handler: async (ctx) => {
    const missingSourceCredits = await ctx.db
      .query("hydcoin_credits")
      .filter((q) => q.eq(q.field("status"), "retired"))
      .filter((q) => q.eq(q.field("source"), undefined))
      .collect();
    return missingSourceCredits;
  },
});
