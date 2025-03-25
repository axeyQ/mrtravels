import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all bikes
export const getAllBikes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bikes").collect();
  },
});

// Get filtered bikes (for user-facing pages)
export const getFilteredBikes = query({
  args: { 
    type: v.optional(v.string()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    isAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let bikesQuery = ctx.db.query("bikes");
    
    if (args.type) {
      bikesQuery = bikesQuery.filter(q => q.eq(q.field("type"), args.type));
    }
    
    if (args.minPrice !== undefined) {
      bikesQuery = bikesQuery.filter(q => q.gte(q.field("pricePerHour"), args.minPrice));
    }
    
    if (args.maxPrice !== undefined) {
      bikesQuery = bikesQuery.filter(q => q.lte(q.field("pricePerHour"), args.maxPrice));
    }
    
    if (args.isAvailable !== undefined) {
      bikesQuery = bikesQuery.filter(q => q.eq(q.field("isAvailable"), args.isAvailable));
    }
    
    return await bikesQuery.collect();
  },
});

// Get a specific bike by ID
export const getBikeById = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bikeId);
  },
});

// Add a bike (admin only)
export const addBike = mutation({
  args: {
    adminId: v.string(),
    name: v.string(),
    type: v.string(),
    description: v.string(),
    pricePerHour: v.number(),
    imageUrl: v.string(),
    isAvailable: v.boolean(),
    location: v.string(),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can add bikes");
    }
    
    const { adminId, ...bikeData } = args;
    
    // Insert the bike
    return await ctx.db.insert("bikes", bikeData);
  },
});

// Update a bike (admin only)
export const updateBike = mutation({
  args: {
    adminId: v.string(),
    bikeId: v.id("bikes"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    pricePerHour: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isAvailable: v.optional(v.boolean()),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can update bikes");
    }
    
    // Destructure to remove adminId and bikeId from update fields
    const { adminId, bikeId, ...updates } = args;
    
    // Check if bike exists
    const bike = await ctx.db.get(bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    
    // Update the bike
    await ctx.db.patch(bikeId, updates);
    return bikeId;
  },
});

// Delete a bike (admin only)
export const deleteBike = mutation({
  args: {
    adminId: v.string(),
    bikeId: v.id("bikes"),
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can delete bikes");
    }
    
    // Check if bike exists
    const bike = await ctx.db.get(args.bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    
    // Delete the bike
    await ctx.db.delete(args.bikeId);
    return args.bikeId;
  },
});