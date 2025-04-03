// convex/userActivities.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log a user activity
export const logUserActivity = mutation({
  args: {
    userId: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, action, details, ipAddress, userAgent } = args;
    
    // Create the activity log
    const activityId = await ctx.db.insert("userActivities", {
      userId,
      action,
      details,
      ipAddress,
      userAgent,
      timestamp: Date.now(),
    });
    
    return activityId;
  },
});

// Get activities for a specific user (admin only)
export const getUserActivities = query({
  args: {
    adminId: v.string(),
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { adminId, userId, limit = 50 } = args;
    
    // Verify that the requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();
      
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view user activity logs");
    }
    
    // Get the user activities, sorted by most recent first
    return await ctx.db
      .query("userActivities")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

// Get the most recent activities across all users (admin only)
export const getRecentActivities = query({
  args: {
    adminId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { adminId, limit = 50 } = args;
    
    // Verify that the requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();
      
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view recent activities");
    }
    
    // Get the most recent activities across all users
    return await ctx.db
      .query("userActivities")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});