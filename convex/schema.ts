import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========================
  // Users table
  // ========================
  users: defineTable({
    clerkId: v.string(),                     // Clerk auth ID
    username: v.string(),                    // johndoe
    fullname: v.string(),                    // John Doe
    email: v.string(),                       // user email
    image: v.optional(v.string()),           // profile image
    role: v.union(
      v.literal("producer"),
      v.literal("certifier"),
      v.literal("buyer"),
      v.literal("regulator"),
      v.literal("auditor")
    ),                                       // user role in HyDit
    walletAddress: v.optional(v.string()),   // MetaMask wallet
    verified: v.boolean(),                   // true if user is KYC/certified
    organization: v.optional(v.string()),    // company / agency name
    createdAt: v.number(),                   // timestamp (Date.now())
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_wallet", ["walletAddress"])
    .index("by_role", ["role"]),

  // ========================
  // HyDcoin Transactions
  // ========================
  hydcoin_transactions: defineTable({
    txHash: v.string(),                      // blockchain tx hash
    from: v.string(),                        // sender wallet
    to: v.string(),                          // receiver wallet
    amount: v.number(),                      // HyDcoin transferred
    type: v.union(
      v.literal("mint"),                     // new tokens created
      v.literal("transfer"),                 // user-to-user
      v.literal("purchase"),                 // buying credits
      v.literal("retire")                    // retiring credits
    ),
    blockNumber: v.number(),                 // blockchain block number
    timestamp: v.number(),                   // on-chain timestamp
    metadata: v.optional(v.string()),        // any extra info
  })
    .index("by_from", ["from"])
    .index("by_to", ["to"])
    .index("by_type", ["type"])
    .index("by_tx", ["txHash"]),

  // ========================
  // Green Hydrogen Credits
  // ========================
  credits: defineTable({
    tokenId: v.string(),                     // ERC-1155 token ID
    producerWallet: v.string(),              // wallet of producer
    certifierWallet: v.optional(v.string()), // certifier who approved
    amount: v.number(),                      // number of credits
    status: v.union(
      v.literal("pending"), 
      v.literal("active"), 
      v.literal("retired")
    ),
    proofCid: v.optional(v.string()),        // IPFS CID of proof document
    txHash: v.string(),                      // blockchain mint tx hash
    issuedAt: v.number(),                    // timestamp of issue
    retiredAt: v.optional(v.number()),       // if retired
  })
    .index("by_producer", ["producerWallet"])
    .index("by_status", ["status"])
    .index("by_token", ["tokenId"]),

  // ========================
  // Proofs / Documents
  // ========================
  proofs: defineTable({
    producerWallet: v.string(),              // owner of the proof
    creditTokenId: v.optional(v.string()),   // link to credit
    ipfsCid: v.string(),                     // IPFS hash
    fileType: v.string(),                    // pdf, csv, json, etc
    description: v.optional(v.string()),     // human-readable notes
    uploadedAt: v.number(),                  // timestamp
    verified: v.boolean(),                   // certifier checked or not
  })
    .index("by_producer", ["producerWallet"])
    .index("by_credit", ["creditTokenId"])
    .index("by_ipfs", ["ipfsCid"]),
});
