import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  type QueryCtx,
  type MutationCtx,
  action,
} from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import * as bcrypt from "bcryptjs";

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
      // If the user is the admin, ensure their role is set to "admin"
      if (args.clerkId === process.env.ADMIN_CLERK_ID) {
        await ctx.db.patch(existingUser._id, { role: "admin" });
      }
      return existingUser._id;
    }

    // Determine the role for the new user
    const isAdmin = args.clerkId === process.env.ADMIN_CLERK_ID;
    const userRole = isAdmin ? "admin" : args.role || "buyer";

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      fullname: args.fullname,
      username: args.username,
      image: args.image,
      role: userRole, // Default role
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
  if (!identity) {
    // Return null if there's no authenticated user
    return null;
  }

  const currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  // Return the user if found, otherwise null.
  // This handles cases where the user exists in Clerk but hasn't been synced to the Convex DB yet.
  return currentUser;
}

export const getCurrentUser = query({
  handler: async (ctx) => {
    return await getAuthenticatedUser(ctx);
  },
});

export const isCertifierOrAdmin = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    if (!user) {
      return false;
    }
    const adminClerkId = process.env.ADMIN_CLERK_ID;
    return (
      user.role === "certifier" ||
      user.role === "admin" ||
      user.clerkId === adminClerkId
    );
  },
});

export const isAdminUser = query({
  handler: async (ctx) => {
    const user = await getAuthenticatedUser(ctx);
    return user?.role === "admin";
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    return user;
  },
});

export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      return null;
    }

    // Return only public information
    return {
      _id: user._id,
      username: user.username,
      fullname: user.fullname,
      image: user.image,
      organization: user.organization,
      role: user.role, // Include role as it's part of the producer feature
      // Add other public fields as needed
    };
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

    if (!currentUser) {
      throw new Error("User not found");
    }

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
    if (args.organization !== undefined)
      updateData.organization = args.organization;

    // Update the user
    await ctx.db.patch(currentUser._id, updateData);

    // Return the updated user
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const setTransactionPin = mutation({
  args: {
    hashedPin: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("User not found");
    }
    await ctx.db.patch(currentUser._id, { transactionPin: args.hashedPin });
    return { success: true, message: "Transaction PIN set successfully." };
  },
});

export const hashPin = action({
  args: {
    pin: v.string(),
  },
  handler: async (_, args) => {
    return await bcrypt.hash(args.pin, 10);
  },
});

export const getHashedPinForVerification = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    return user?.transactionPin || null;
  },
});

export const verifyTransactionPin = action({
  args: {
    pin: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const hashedPin: string | null = await ctx.runQuery(
      api.users.getHashedPinForVerification,
      { userId: args.userId }
    );
    if (!hashedPin) {
      return false;
    }
    return await bcrypt.compare(args.pin, hashedPin);
  },
});

// Internal mutation to process a withdrawal request (approve/reject)
export const processWithdrawal = internalMutation({
  args: {
    requestId: v.id("withdrawal_requests"),
    outcome: v.union(v.literal("processed"), v.literal("failed")),
  },
  handler: async (ctx, { requestId, outcome }) => {
    const request = await ctx.db.get(requestId);
    if (!request) throw new Error("Request not found");

    // Update the request status
    await ctx.db.patch(requestId, {
      status: outcome,
      processedAt: Date.now(),
    });

    // Update credit statuses based on outcome
    for (const creditId of request.creditIds) {
      if (outcome === "processed") {
        // Success: retire credits (deduct from wallet)
        await ctx.db.patch(creditId, {
          status: "retired",
          retirementDate: Date.now(),
        });
      } else {
        // Failure: return credits to active status (back in wallet)
        await ctx.db.patch(creditId, {
          status: "active",
        });
      }
    }
  },
});

export const getMyUser = internalQuery({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },
});

export const setStripeCustomerId = internalMutation({
  args: {
    clerkId: v.string(),
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { stripeCustomerId: args.stripeCustomerId });

    return user._id;
  },
});

export const getMyProducerApplication = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      return null;
    }

    const application = await ctx.db
      .query("producer_applications")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .first();

    return application;
  },
});

export const submitProducerApplication = mutation({
  args: {
    producerDetails: v.object({
      companyName: v.string(),
      registrationNumber: v.string(),
      businessAddress: v.string(),
      contactPerson: v.string(),
      website: v.optional(v.string()),
    }),
    documents: v.array(
      v.object({
        type: v.string(),
        url: v.string(),
        uploadDate: v.number(),
      })
    ),
  },
  handler: async (ctx, { producerDetails, documents }) => {
    const currentUser = await getAuthenticatedUser(ctx);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Check if there's an existing pending or approved application for this user
    const existingApplication = await ctx.db
      .query("producer_applications")
      .withIndex("by_userId", (q) => q.eq("userId", currentUser._id))
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "approved")
        )
      )
      .first();

    if (existingApplication) {
      throw new Error(
        "An active producer application already exists for this user."
      );
    }

    const newDocuments = documents.map((doc) => ({
      ...doc,
      status: "pending" as "pending", // Initial status for new documents
    }));

    await ctx.db.insert("producer_applications", {
      userId: currentUser._id,
      status: "pending",
      producerDetails,
      documents: newDocuments,
    });

    return {
      success: true,
      message: "Producer application submitted successfully.",
    };
  },
});

export const getPendingProducerApplications = query({
  handler: async (ctx) => {
    // Only allow administrators to call this query
    const isAdmin = await ctx.runQuery(api.users.isAdminUser);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only administrators can view pending applications.");
    }

    const pendingApplications = await ctx.db
      .query("producer_applications")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // Join with users table to get user details for each application
    const applicationsWithUserDetails = await Promise.all(
      pendingApplications.map(async (app) => {
        const user = await ctx.db.get(app.userId);
        return {
          ...app,
          user: user
            ? {
                _id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
              }
            : null,
        };
      })
    );

    return applicationsWithUserDetails;
  },
});

export const updateDocumentStatusPublic = mutation({
  args: {
    applicationId: v.id("producer_applications"),
    documentIndex: v.number(),
    status: v.union(v.literal("verified"), v.literal("rejected")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; message: string }> => {
    // Ensure the user is an admin before allowing the update
    const isAdmin = await ctx.runQuery(api.users.isAdminUser);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only administrators can update document status.");
    }
    return await ctx.runMutation(internal.users.updateDocumentStatus, args);
  },
});

export const updateProducerApplicationStatusPublic = mutation({
  args: {
    applicationId: v.id("producer_applications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; message: string }> => {
    // Ensure the user is an admin or certifier before allowing the update
    const isAuthorized = await ctx.runQuery(api.users.isCertifierOrAdmin);
    if (!isAuthorized) {
      throw new Error("Unauthorized: Only administrators or certifiers can update application status.");
    }
    return await ctx.runMutation(
      internal.users.updateProducerApplicationStatus,
      args
    );
  },
});

export const getAllUsers = query({
  handler: async (ctx) => {
    const isAdmin = await ctx.runQuery(api.users.isAdminUser);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only administrators can fetch all users.");
    }
    return await ctx.db.query("users").collect();
  },
});

export const assignRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("producer"),
      v.literal("certifier"),
      v.literal("buyer"),
      v.literal("regulator"),
    ),
  },
  handler: async (ctx, args) => {
    const isAdmin = await ctx.runQuery(api.users.isAdminUser);
    if (!isAdmin) {
      throw new Error("Unauthorized: Only administrators can assign roles.");
    }
    await ctx.db.patch(args.userId, { role: args.role });
    return { success: true, message: "Role assigned successfully." };
  },
});

export const updateDocumentStatus = internalMutation({
  args: {
    applicationId: v.id("producer_applications"),
    documentIndex: v.number(),
    status: v.union(v.literal("verified"), v.literal("rejected")),
  },
  handler: async (ctx, { applicationId, documentIndex, status }) => {
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found.");
    if (!application.documents)
      throw new Error("Application has no documents.");

    const updatedDocuments = [...application.documents];
    if (documentIndex < 0 || documentIndex >= updatedDocuments.length) {
      throw new Error("Document index out of bounds.");
    }

    updatedDocuments[documentIndex].status = status;

    await ctx.db.patch(applicationId, { documents: updatedDocuments });

    return { success: true, message: "Document status updated." };
  },
});

export const updateProducerApplicationStatus = internalMutation({
  args: {
    applicationId: v.id("producer_applications"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, { applicationId, status, reviewNotes }) => {
    const application = await ctx.db.get(applicationId);
    if (!application) throw new Error("Application not found.");

    // Update the application status in producer_applications table
    const reviewer = await getAuthenticatedUser(ctx);
    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    await ctx.db.patch(applicationId, {
      status,
      reviewNotes,
      reviewedBy: reviewer._id, // Assuming admin is authenticated
      reviewedAt: Date.now(),
    });

    // If approved, update the user's role to producer
    if (status === "approved") {
      await ctx.db.patch(application.userId, { role: "producer" });
    }

    return { success: true, message: `Producer application ${status}.` };
  },
});

export const updateWithdrawalRequestStatus = mutation({
  args: {
    requestId: v.id("withdrawal_requests"),
    status: v.union(v.literal("processed"), v.literal("failed")),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const isAuthorized = await ctx.runQuery(api.users.isCertifierOrAdmin);
    if (!isAuthorized) {
      throw new Error("Unauthorized: Only administrators or certifiers can update withdrawal status.");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request) throw new Error("Request not found");

    // Update the request status
    const reviewer = await getAuthenticatedUser(ctx);
    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    await ctx.db.patch(args.requestId, { 
      status: args.status, 
      processedAt: Date.now(),
      reviewedBy: reviewer._id,
      reviewNotes: args.reviewNotes,
    });

    // Handle the credits based on the outcome
    for (const creditId of request.creditIds) {
      if (args.status === "processed") {
        // On success, the credits are effectively removed from circulation for this user
        // and handled by the external payout system. We mark them as 'withdrawn'.
        await ctx.db.patch(creditId, { 
          status: "withdrawn",
          retirementDate: Date.now(), // Using retirementDate to signify exit from system
        });
      } else {
        // On failure, return credits to 'active' status in the user's wallet
        await ctx.db.patch(creditId, { 
          status: "active" 
        });
      }
    }
    
    return { success: true, message: `Withdrawal request ${args.status}.` };
  },
});
