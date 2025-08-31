import { internalMutation } from "../_generated/server";

// This migration is designed to clean up old, deprecated fields from the `users` table.
// Specifically, it removes `producerApplicationStatus`, `producerDetails`, and `documents`,
// which were moved to the `producer_applications` table.
export const cleanupUsersTable = internalMutation(async (ctx) => {
  const allUsers = await ctx.db.query("users").collect();
  let updatedCount = 0;

  for (const user of allUsers) {
    // Check if any of the deprecated fields exist on the user document.
    // The `any` type is used here to access potentially non-schema-compliant fields.
    const userDoc: any = user;
    if (
      userDoc.producerApplicationStatus !== undefined ||
      userDoc.producerDetails !== undefined ||
      userDoc.documents !== undefined
    ) {
      // Use `patch` to remove the fields by setting them to `undefined`.
      // ConvexDB removes fields that are set to `undefined`.
      await ctx.db.patch(user._id, {
        producerApplicationStatus: undefined,
        producerDetails: undefined,
        documents: undefined,
      });
      updatedCount++;
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} user documents.`);
  return { success: true, updatedCount };
});
