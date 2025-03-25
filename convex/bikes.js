import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all bikes
export const getAllBikes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bikes").collect();
  },
});

// Get bikes with filtering
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

// Add a new bike (admin only)
export const addBike = mutation({
  args: {
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
    // Note: In a real app, we would add admin authorization here
    return await ctx.db.insert("bikes", {
      name: args.name,
      type: args.type,
      description: args.description,
      pricePerHour: args.pricePerHour,
      imageUrl: args.imageUrl,
      isAvailable: args.isAvailable,
      location: args.location,
      features: args.features,
    });
  },
});

// Update a bike (admin only)
export const updateBike = mutation({
  args: {
    id: v.id("bikes"),
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
    const { id, ...fields } = args;
    // Note: In a real app, we would add admin authorization here
    await ctx.db.patch(id, fields);
    return id;
  },
});

// Delete a bike (admin only)
export const deleteBike = mutation({
  args: { id: v.id("bikes") },
  handler: async (ctx, args) => {
    // Note: In a real app, we would add admin authorization here
    await ctx.db.delete(args.id);
    return args.id;
  },
});