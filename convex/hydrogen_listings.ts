import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

// Helper to get authenticated producer user
export async function getAuthenticatedProducer(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized: Not authenticated.");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("User not found.");
  if (currentUser.role !== "producer") throw new Error("Unauthorized: Only producers can perform this action.");

  return currentUser;
}

export const createListing = mutation({
  args: {
    quantityKg: v.number(),
    pricePerKg: v.number(),
    location: v.string(),
    energySource: v.string(),
    certificationDetails: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const producer = await getAuthenticatedProducer(ctx);

    const listingId = await ctx.db.insert("hydrogen_listings", {
      producerId: producer._id,
      quantityKg: args.quantityKg,
      pricePerKg: args.pricePerKg,
      location: args.location,
      energySource: args.energySource,
      certificationDetails: args.certificationDetails,
      listingStatus: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return listingId;
  },
});

export const updateListing = mutation({
  args: {
    listingId: v.id("hydrogen_listings"),
    quantityKg: v.optional(v.number()),
    pricePerKg: v.optional(v.number()),
    location: v.optional(v.string()),
    energySource: v.optional(v.string()),
    certificationDetails: v.optional(v.string()),
    listingStatus: v.optional(
      v.union(v.literal("active"), v.literal("inactive"), v.literal("sold_out"))
    ),
  },
  handler: async (ctx, args) => {
    const producer = await getAuthenticatedProducer(ctx);
    const { listingId, ...updates } = args;

    const existingListing = await ctx.db.get(listingId);
    if (!existingListing || existingListing.producerId !== producer._id) {
      throw new Error("Unauthorized or Listing not found.");
    }

    await ctx.db.patch(listingId, { ...updates, updatedAt: Date.now() });

    return { success: true };
  },
});

export const deactivateListing = mutation({
  args: {
    listingId: v.id("hydrogen_listings"),
  },
  handler: async (ctx, { listingId }) => {
    const producer = await getAuthenticatedProducer(ctx);

    const existingListing = await ctx.db.get(listingId);
    if (!existingListing || existingListing.producerId !== producer._id) {
      throw new Error("Unauthorized or Listing not found.");
    }

    await ctx.db.patch(listingId, { listingStatus: "inactive", updatedAt: Date.now() });

    return { success: true };
  },
});

export const getPublicListings = query({
  args: {},
  handler: async (ctx) => {
    const activeListings = await ctx.db
      .query("hydrogen_listings")
      .filter((q) => q.eq(q.field("listingStatus"), "active"))
      .collect();

    const listingsWithProducer = await Promise.all(
      activeListings.map(async (listing) => {
        const producer = await ctx.db.get(listing.producerId);
        return {
          ...listing,
          producerDetails: producer ? { _id: producer._id, username: producer.username, fullname: producer.fullname, organization: producer.organization } : null,
        };
      })
    );

    return listingsWithProducer;
  },
});

export const getMyListings = query({
  args: {},
  handler: async (ctx) => {
    const producer = await getAuthenticatedProducer(ctx); // Ensures user is a producer

    const myListings = await ctx.db
      .query("hydrogen_listings")
      .withIndex("by_producerId", (q) => q.eq("producerId", producer._id))
      .collect();

    return myListings;
  },
});
