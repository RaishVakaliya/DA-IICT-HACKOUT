import { mutation, query, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

export const getProducerListings = query({
  args: {
    producerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const producerListings = await ctx.db
      .query("hydrogen_listings")
      .withIndex("by_producerId", (q) => q.eq("producerId", args.producerId))
      .filter((q) => q.eq(q.field("listingStatus"), "active"))
      .collect();

    const listingsWithProducer = await Promise.all(
      producerListings.map(async (listing) => {
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

export const getListingById = query({
  args: {
    listingId: v.id("hydrogen_listings"),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.listingId);

    if (!listing) {
      return null;
    }

    const producer = await ctx.db.get(listing.producerId);
    const producerApplication = await ctx.db
      .query("producer_applications")
      .withIndex("by_userId", (q) => q.eq("userId", listing.producerId))
      .first();

    return {
      ...listing,
      producerDetails: producer
        ? {
            _id: producer._id,
            username: producer.username,
            fullname: producer.fullname,
            organization: producer.organization,
            companyName: producerApplication?.producerDetails?.companyName,
            email: producer.email,
            phone: producer.phone,
          }
        : null,
    };
  },
});

export const buyHydrogenListing = mutation({
  args: {
    listingId: v.id("hydrogen_listings"),
    quantity: v.number(),
    transactionPin: v.string(),
    isPinVerified: v.boolean(), // New argument for client-side verification
  },
  handler: async (ctx, args) => {
    const buyer = await ctx.runQuery(api.users.getCurrentUser);
    if (!buyer) {
      throw new Error("Unauthorized: Buyer not authenticated.");
    }

    // Verify transaction PIN (now done client-side and passed as an argument)
    if (!args.isPinVerified) {
      throw new Error("Invalid transaction PIN.");
    }

    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found.");
    }

    if (listing.listingStatus !== "active") {
      throw new Error("Listing is not active.");
    }

    if (args.quantity <= 0 || args.quantity > listing.quantityKg) {
      throw new Error("Invalid quantity to purchase.");
    }

    const seller = await ctx.db.get(listing.producerId);
    if (!seller) {
      throw new Error("Seller not found.");
    }

    const totalCost = args.quantity * listing.pricePerKg;

    if ((buyer.hydcoinBalance || 0) < totalCost) {
      throw new Error("Insufficient Hydcoin balance.");
    }

    // Deduct Hydcoin from buyer
    await ctx.db.patch(buyer._id, { hydcoinBalance: (buyer.hydcoinBalance || 0) - totalCost });

    // Add Hydcoin to seller
    await ctx.db.patch(seller._id, { hydcoinBalance: (seller.hydcoinBalance || 0) + totalCost });

    // Update listing quantity
    const newQuantity = listing.quantityKg - args.quantity;
    await ctx.db.patch(listing._id, {
      quantityKg: newQuantity,
      listingStatus: newQuantity === 0 ? "sold_out" : "active",
      updatedAt: Date.now(),
    });

    // Record transaction
    await ctx.db.insert("transactions", {
      fromUserId: buyer._id,
      toUserId: seller._id,
      amount: totalCost,
      type: "purchase",
      // paymentId: // Not applicable for Hydcoin internal transfer
    });

    return { success: true, message: "Purchase successful!" };
  },
});
