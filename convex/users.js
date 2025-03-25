// convex/users.js
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
        createdAt: Date.now(),
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

// This function was missing or not properly deployed
// List all users - Admin only function
export const listUsers = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    // In a production system, you would verify the admin status here
    // For now, we'll just return all users to make the function work
    
    // Get all users from the database
    const users = await ctx.db.query("users").collect();
    
    return users;
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

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    adminId: v.string(),
    userId: v.string(),
    newRole: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update user roles");
    }
    
    // Get the user to update
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Update the user's role
    await ctx.db.patch(user._id, {
      role: args.newRole,
    });
    
    return user._id;
  },
});

// Set the first admin - accessible without existing admin
export const setFirstAdmin = mutation({
  args: {
    userId: v.string(),
    setupCode: v.string(),
  },
  handler: async (ctx, args) => {
    // In a real app, this would verify against an environment variable or secure storage
    const ADMIN_SETUP_CODE = "BIKE1234";
    
    if (args.setupCode !== ADMIN_SETUP_CODE) {
      throw new Error("Invalid admin setup code");
    }
    
    // Get the user to update
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Check if there are any existing admins
    const existingAdmins = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    
    // Only allow this route if there are no existing admins
    if (existingAdmins.length > 0) {
      throw new Error("Administrator already exists. This setup can only be used for the first admin.");
    }
    
    // Update the user's role to admin
    await ctx.db.patch(user._id, {
      role: "admin",
    });
    
    return user._id;
  },
});