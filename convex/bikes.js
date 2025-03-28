import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const bikesTable = {
  adminId: v.string(),
  name: v.string(),
  type: v.string(),
  description: v.string(),
  pricePerHour: v.number(),
  imageUrl: v.optional(v.string()),
  isAvailable: v.boolean(),
  location: v.string(),
  features: v.array(v.string()),
  registrationNumber: v.optional(v.string()), // Added this field for admin-only identification
  createdAt: v.number(),
  updatedAt: v.number(),
};
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
        // Remove admin-only fields for user view
        return bikes.map(bike => {
          // Create a new object without the registrationNumber
          const { registrationNumber, ...userVisibleBike } = bike;
          return userVisibleBike;
        });
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
    registrationNumber: v.optional(v.string()),
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
    
    const now = Date.now();
    
    // Make sure to include adminId and the timestamp fields
    const bikeData = {
      adminId: args.adminId,
      name: args.name,
      type: args.type,
      description: args.description,
      pricePerHour: args.pricePerHour,
      imageUrl: args.imageUrl,
      isAvailable: args.isAvailable,
      location: args.location,
      features: args.features,
      registrationNumber: args.registrationNumber,
      createdAt: now,
      updatedAt: now
    };
    
    // Insert the bike with all required fields
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
    registrationNumber: v.optional(v.string()),
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

// Toggle bike availability (quick action for admin table)
export const toggleBikeAvailability = mutation({
  args: {
    adminId: v.string(),
    bikeId: v.id("bikes"),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { adminId, bikeId, isAvailable } = args;

    // Check if bike exists
    const existingBike = await ctx.db.get(bikeId);
    if (!existingBike) {
      throw new Error("Bike not found");
    }

    // TODO: Add admin check here

    // Update only the availability status
    return await ctx.db.patch(bikeId, {
      isAvailable,
      updatedAt: Date.now(),
    });
  },
});
// One-time migration function to fix bikes missing adminId
export const fixBikesWithoutAdminId = mutation({
  args: {
    adminId: v.string(), // The admin who will be set as owner of all broken bikes
  },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can run migrations");
    }
    
    // Get all bikes
    const allBikes = await ctx.db.query("bikes").collect();
    
    // Filter bikes missing adminId or timestamp fields
    const brokenBikes = allBikes.filter(bike => 
      !bike.adminId || !bike.createdAt || !bike.updatedAt
    );
    
    // Fix each broken bike
    const now = Date.now();
    const updates = [];
    
    for (const bike of brokenBikes) {
      const updateData = {
        ...(bike.adminId ? {} : { adminId: args.adminId }),
        ...(bike.createdAt ? {} : { createdAt: now }),
        ...(bike.updatedAt ? {} : { updatedAt: now })
      };
      
      // Only update if there are fields to update
      if (Object.keys(updateData).length > 0) {
        await ctx.db.patch(bike._id, updateData);
        updates.push(bike._id);
      }
    }
    
    return {
      fixedCount: updates.length,
      totalBikes: allBikes.length,
      fixedIds: updates
    };
  },
});