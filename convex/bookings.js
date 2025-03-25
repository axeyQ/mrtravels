// convex/bookings.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all bookings (admin only)
export const getAllBookings = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can view all bookings");
    }
    
    return await ctx.db.query("bookings").collect();
  },
});

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
    userName: v.string(),
    userPhone: v.string(),
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
      userName: args.userName,
      userPhone: args.userPhone,
      startTime: args.startTime,
      endTime: args.endTime,
      status: "pending",
      totalPrice,
    });
  },
});

// Update booking status (admin only for most statuses)
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Check permissions
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .unique();
    
    // Users can only cancel their own bookings
    // Admins can update any booking status
    if (user.role !== "admin" && (args.status !== "cancelled" || booking.userId !== args.userId)) {
      throw new Error("Unauthorized: You don't have permission to update this booking");
    }
    
    // Update the booking status
    await ctx.db.patch(args.bookingId, {
      status: args.status,
    });
    
    return args.bookingId;
  },
});