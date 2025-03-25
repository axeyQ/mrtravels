import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get bookings for a user
export const getUserBookings = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get bookings for a bike
export const getBikeBookings = query({
  args: { bikeId: v.id("bikes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_bikeId", (q) => q.eq("bikeId", args.bikeId))
      .collect();
  },
});

// Check if a bike is available in a time range
export const checkBikeAvailability = query({
  args: { 
    bikeId: v.id("bikes"),
    startTime: v.number(),
    endTime: v.number()
  },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_bikeId", (q) => q.eq("bikeId", args.bikeId))
      .filter(q => 
        q.or(
          q.and(
            q.gte(q.field("startTime"), args.startTime),
            q.lt(q.field("startTime"), args.endTime)
          ),
          q.and(
            q.gt(q.field("endTime"), args.startTime),
            q.lte(q.field("endTime"), args.endTime)
          ),
          q.and(
            q.lte(q.field("startTime"), args.startTime),
            q.gte(q.field("endTime"), args.endTime)
          )
        )
      )
      .filter(q => q.neq(q.field("status"), "cancelled"))
      .collect();
    
    return bookings.length === 0;
  },
});

// Create a booking
export const createBooking = mutation({
  args: {
    bikeId: v.id("bikes"),
    userId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Get the bike to calculate price
    const bike = await ctx.db.get(args.bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    
    // Calculate total price
    const hours = Math.ceil((args.endTime - args.startTime) / (1000 * 60 * 60));
    const totalPrice = hours * bike.pricePerHour;
    
    // Create the booking
    return await ctx.db.insert("bookings", {
      bikeId: args.bikeId,
      userId: args.userId,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "pending",
      totalPrice,
    });
  },
});

// Update booking status
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
    return args.bookingId;
  },
});