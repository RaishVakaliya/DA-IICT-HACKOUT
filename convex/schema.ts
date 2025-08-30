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
    phone: v.optional(v.string()), // phone number
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
    stripeAccountId: v.optional(v.string()), // For Stripe Connect payouts
    stripeCustomerId: v.optional(v.string()), // For Stripe Checkout
    producerApplicationStatus: v.optional(v.union(
      v.literal("not_applied"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    )),
    producerDetails: v.optional(v.object({
      companyName: v.string(),
      registrationNumber: v.string(),
      businessAddress: v.string(),
      contactPerson: v.string(),
      website: v.optional(v.string()),
    })),
    documents: v.optional(v.array(v.object({
      type: v.string(),
      url: v.string(), // URL to the uploaded document
      uploadDate: v.number(),
      status: v.union(v.literal("pending"), v.literal("verified"), v.literal("rejected")),
    }))),
  }).index("by_clerk_id", ["clerkId"]),


  // Transactions table for Hydcoin
  transactions: defineTable({
    fromUserId: v.optional(v.id("users")),
    toUserId: v.id("users"),
    amount: v.number(),
    type: v.union(
      v.literal("purchase"),
      v.literal("transfer"),
      v.literal("retirement")
    ),
    paymentId: v.optional(v.string()), // For purchase transactions
    creditIds: v.optional(v.array(v.id("hydcoin_credits"))), // Array of transferred credit IDs
  }),

  // Table to track individual, unique Hydcoin credits
  hydcoin_credits: defineTable({
    ownerId: v.id("users"),
    status: v.union(
      v.literal("issued"),
      v.literal("certified"),
      v.literal("active"),
      v.literal("retired"),
      v.literal("pending_withdrawal"),
      v.literal("withdrawn")
    ),
    source: v.optional(v.union(
      v.object({
        type: v.literal("purchase"),
        purchaseId: v.id("purchases"),
      }),
      v.object({
        type: v.literal("generation"),
        producerId: v.id("users"),
        certifierId: v.optional(v.id("users")),
        certificationDate: v.optional(v.number()),
        metadata: v.optional(v.object({
          productionBatchId: v.string(),
          facility: v.string(),
          productionDate: v.number(),
        })),
      })
    )),
    issueDate: v.optional(v.number()), // Timestamp of issuance
    retirementDate: v.optional(v.number()), // Timestamp of retirement
  }).index("by_ownerId", ["ownerId"]),

  // Table to track Stripe payment sessions
  purchases: defineTable({
    userId: v.id("users"),
    stripeId: v.string(),
    credits: v.number(),
  }).index("by_stripe_id", ["stripeId"]),


  // Table to manage withdrawal requests
  withdrawal_requests: defineTable({
    userId: v.id("users"),
    amount: v.number(), // Amount of Hydcoin to withdraw
    creditIds: v.array(v.id("hydcoin_credits")),
    method: v.union(v.literal("upi"), v.literal("credit_card"), v.literal("stripe")),
    details: v.object({ // Store simulated payment details
      upiId: v.optional(v.string()),
      cardholderName: v.optional(v.string()),
      cardNumber: v.optional(v.string()),
      stripeAccountId: v.optional(v.string()), // Last 4 digits for display
    }),
    status: v.union(v.literal("pending"), v.literal("processed"), v.literal("failed")),
    processedAt: v.optional(v.number()),
    stripeTransferId: v.optional(v.string()), // To track payout transfer
  }).index("by_userId", ["userId"]),
});
