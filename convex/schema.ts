import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table
  users: defineTable({
    clerkId: v.string(), // Clerk auth ID
    username: v.string(), // johndoe
    fullname: v.string(), // John Doe
    email: v.string(), // user email
    image: v.optional(v.string()), // profile image
    role: v.optional(
      v.union(
        v.literal("producer"),
        v.literal("certifier"),
        v.literal("buyer"),
        v.literal("regulator"),
        v.literal("auditor")
      )
    ), // user role in HyDit
    walletAddress: v.optional(v.string()), // MetaMask wallet
    verified: v.optional(v.boolean()), // true if user is KYC/certified
    organization: v.optional(v.string()), // company / agency name
    posts: v.optional(v.number()), // number of posts
    searchable: v.optional(v.boolean()), // whether user can be searched
  }).index("by_clerk_id", ["clerkId"]),
});
