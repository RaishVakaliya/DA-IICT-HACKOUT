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

export const migrateUsersSchema = internalMutation({
  handler: async (ctx) => {
    console.log("Starting users schema migration...");
    const usersToMigrate = await ctx.db.query("users").collect();

    for (const user of usersToMigrate) {
      const patchData: any = {};
      if (user.documents !== undefined) {
        patchData.documents = undefined; // Remove the field
      }
      if (user.producerApplicationStatus !== undefined) {
        patchData.producerApplicationStatus = undefined; // Remove the field
      }
      if (user.producerDetails !== undefined) {
        patchData.producerDetails = undefined; // Remove the field
      }

      if (Object.keys(patchData).length > 0) {
        await ctx.db.patch(user._id, patchData);
        console.log(`Patched user ${user._id} to remove old producer fields.`);
      }
    }
    console.log("Users schema migration completed.");
  },
});

export const migrateUserHydcoinBalances = internalMutation({
  handler: async (ctx) => {
    console.log("Starting Hydcoin balance migration...");
    const users = await ctx.db.query("users").collect();

    for (const user of users) {
      const activeCreditsCount = await ctx.db
        .query("hydcoin_credits")
        .withIndex("by_ownerId_status", (q) =>
          q.eq("ownerId", user._id).eq("status", "active")
        )
        .collect(); // Still using collect().length for counting after discussion

      await ctx.db.patch(user._id, { hydcoinBalance: activeCreditsCount.length });
      console.log(`User ${user.username} (${user._id}) balance updated to ${activeCreditsCount.length}.`);
    }
    console.log("Hydcoin balance migration completed.");
  },
});
