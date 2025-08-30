import {
  mutation,
  query,
  internalMutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import { v } from "convex/values";

export const syncUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullname: v.string(),
    username: v.string(),
    image: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("producer"),
        v.literal("certifier"),
        v.literal("buyer"),
        v.literal("regulator"),
        v.literal("auditor")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        fullname: args.fullname,
        username: args.username,
        image: args.image,
        ...(args.role && { role: args.role }),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullname: args.fullname,
      username: args.username,
      image: args.image,
      role: args.role || "buyer", // Default role
      posts: 0, // Initialize posts count
      searchable: true, // Default to searchable
    });

    return userId;
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullname: v.string(),
    username: v.string(),
    image: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("producer"),
        v.literal("certifier"),
        v.literal("buyer"),
        v.literal("regulator"),
        v.literal("auditor")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullname: args.fullname,
      username: args.username,
      image: args.image,
      role: args.role || "buyer", // Default role
      posts: 0, // Initialize posts count
      searchable: true, // Default to searchable
    });

    return userId;
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    fullname: v.optional(v.string()),
    username: v.optional(v.string()),
    image: v.optional(v.string()),
    phone: v.optional(v.string()),
    organization: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const currentUser = await getAuthenticatedUser(ctx);
    
    // Verify the user is updating their own profile
    if (currentUser.clerkId !== args.clerkId) {
      throw new Error("Unauthorized: Can only update own profile");
    }

    // Prepare update object with only provided fields
    const updateData: any = {};
    if (args.fullname !== undefined) updateData.fullname = args.fullname;
    if (args.username !== undefined) updateData.username = args.username;
    if (args.image !== undefined) updateData.image = args.image;
    if (args.phone !== undefined) updateData.phone = args.phone;
    if (args.organization !== undefined) updateData.organization = args.organization;

    // Update the user
    await ctx.db.patch(currentUser._id, updateData);

    // Return the updated user
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});
