import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Store or update user data when they log in
export const storeUser = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (existingUser) {
      // Update the user
      await ctx.db.patch(existingUser._id, {
        firstName: args.firstName,
        lastName: args.lastName,
        phoneNumber: args.phoneNumber,
        imageUrl: args.imageUrl,
      });
      return existingUser._id;
    } else {
      // Create a new user
      return await ctx.db.insert("users", {
        userId: args.userId,
        firstName: args.firstName,
        lastName: args.lastName,
        phoneNumber: args.phoneNumber,
        imageUrl: args.imageUrl,
        role: "user", // Default role is user
      });
    }
  },
});

// Get user data
export const getUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

// Check if a user is admin
export const isAdmin = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    return user?.role === "admin";
  },
});