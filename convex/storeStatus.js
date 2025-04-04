// convex/storeStatus.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the current store status
export const getStoreStatus = query({
  args: {},
  handler: async (ctx) => {
    // Try to find the store status document
    const storeStatusDoc = await ctx.db
      .query("storeStatus")
      .first();
    
    // If no document exists yet, default to store being open
    if (!storeStatusDoc) {
      return { isOpen: true };
    }
    
    return { isOpen: storeStatusDoc.isOpen };
  },
});

// Update the store status (admin only)
export const updateStoreStatus = mutation({
  args: {
    adminId: v.string(),
    isOpen: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { adminId, isOpen } = args;
    
    // Check if user is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update store status");
    }

    // Find existing store status document
    const existingStatus = await ctx.db
      .query("storeStatus")
      .first();
    
    if (existingStatus) {
      // Update existing document
      await ctx.db.patch(existingStatus._id, { 
        isOpen,
        updatedAt: Date.now(),
        updatedBy: adminId
      });
      return existingStatus._id;
    } else {
      // Create new document
      return await ctx.db.insert("storeStatus", {
        isOpen,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        updatedBy: adminId
      });
    }
  },
});