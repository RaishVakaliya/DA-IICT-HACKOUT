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
      posts: 0, // Initialize posts count
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

// export const getUser = query({
//   args: { clerkId: v.string() },
//   handler: async (ctx, args) => {
//     return await ctx.db
//       .query("users")
//       .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
//       .first();
//   },
// });

// Add this mutation to delete a user account
export const deleteAccount = mutation({
  handler: async (ctx) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Delete all user's posts
    const userPosts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Delete associated storage files, likes, and comments for each post
    for (const post of userPosts) {
      // Delete associated likes
      const likes = await ctx.db
        .query("likes")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();

      for (const like of likes) {
        await ctx.db.delete(like._id);
      }

      // Delete associated comments
      const comments = await ctx.db
        .query("comments")
        .withIndex("by_post", (q) => q.eq("postId", post._id))
        .collect();

      for (const comment of comments) {
        await ctx.db.delete(comment._id);
      }

      // Delete the storage file if it exists
      if (post.storageId) {
        await ctx.storage.delete(post.storageId);
      }

      // Delete the post
      await ctx.db.delete(post._id);
    }

    // Delete secret messages sent by this user
    const sentMessages = await ctx.db
      .query("secret_messages")
      .withIndex("by_creator", (q) => q.eq("clerkId", user.clerkId))
      .collect();

    for (const message of sentMessages) {
      await ctx.db.delete(message._id);
    }

    // Delete secret messages sent to this user
    const receivedMessages = await ctx.db
      .query("secret_messages")
      .withIndex("by_recipient", (q) => q.eq("recipientEmail", user.email))
      .collect();

    for (const message of receivedMessages) {
      await ctx.db.delete(message._id);
    }

    // Delete the user
    await ctx.db.delete(user._id);

    return { success: true };
  },
});

// Add this at the end of the file

// Search users by email
export const searchUsersByEmail = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // Find users with email containing the search query
    const users = await ctx.db
      .query("users")
      .filter(
        (q) =>
          q.gt(q.field("email"), args.searchQuery) &&
          q.lt(q.field("email"), args.searchQuery + "\uffff")
      )
      .collect();

    // Return only necessary fields for security and exclude current user
    // Also exclude users who have set searchable to false
    return users
      .filter(
        (user) =>
          user.email !== currentUser.email && // Exclude current user
          (user.searchable === undefined || user.searchable === true) // Only include searchable users
      )
      .map((user) => ({
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        username: user.username,
        image: user.image,
      }));
  },
});

// Add this mutation to update user profile
// Update the updateUser mutation to include privacy settings
export const updateUser = mutation({
  args: {
    fullname: v.string(),
    username: v.string(),
    image: v.optional(v.string()),
    // messagePermissions: v.optional(v.string()),
    searchable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get the authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Find the user in the database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    // Update the user profile with privacy settings
    await ctx.db.patch(user._id, {
      fullname: args.fullname,
      username: args.username,
      image: args.image,
      // Update privacy settings if provided
      // ...(args.messagePermissions !== undefined && { messagePermissions: args.messagePermissions }),
      ...(args.searchable !== undefined && { searchable: args.searchable }),
    });

    return { success: true };
  },
});
