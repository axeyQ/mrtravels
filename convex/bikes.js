import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBikes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("bikes").collect();
  },
});

export const addBike = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    description: v.string(),
    pricePerHour: v.number(),
    imageUrl: v.string(),
    isAvailable: v.boolean(),
  },
  handler: async (ctx, args) => {
    const bikeId = await ctx.db.insert("bikes", {
      name: args.name,
      type: args.type,
      description: args.description,
      pricePerHour: args.pricePerHour,
      imageUrl: args.imageUrl,
      isAvailable: args.isAvailable,
    });
    return bikeId;
  },
});