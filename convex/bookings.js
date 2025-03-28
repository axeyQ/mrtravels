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

// Check if a bike is available for booking in a given time period
export const checkBikeAvailability = query({
  args: {
    bikeId: v.id("bikes"),
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const { bikeId, startTime, endTime } = args;
    
    // Check if the bike exists
    const bike = await ctx.db.get(bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    
    // Check if the bike is available for booking in general
    if (!bike.isAvailable) {
      return {
        isAvailable: false,
        reason: "Bike is marked as unavailable by the admin"
      };
    }
    
    // Check if there are any existing bookings for this bike that overlap with the requested time period
    const overlappingBookings = await ctx.db
      .query("bookings")
      .filter((q) =>
        q.and(
          q.eq(q.field("bikeId"), bikeId),
          q.or(
            // Only check active bookings (pending or confirmed), not completed or cancelled
            q.and(
              q.gte(q.field("startTime"), startTime),
              q.lt(q.field("startTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            ),
            q.and(
              q.gt(q.field("endTime"), startTime),
              q.lte(q.field("endTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            ),
            q.and(
              q.lte(q.field("startTime"), startTime),
              q.gte(q.field("endTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            )
          )
        )
      )
      .collect();
    
    if (overlappingBookings.length > 0) {
      // The bike is already booked during this time
      return {
        isAvailable: false,
        reason: "This bike is already booked for this time period",
        conflictingBookings: overlappingBookings
      };
    }
    
    // No conflicts found, the bike is available
    return {
      isAvailable: true
    };
  },
});
  
  // Get all currently booked bikes (for filtering available bikes)
  export const getCurrentlyBookedBikes = query({
    args: {
      startTime: v.number(),
      endTime: v.number(),
    },
    handler: async (ctx, args) => {
      const { startTime, endTime } = args;
      
      // Find all active bookings that overlap with the specified time period
      const overlappingBookings = await ctx.db
        .query("bookings")
        .filter((q) =>
          q.or(
            // Only consider pending and confirmed bookings, not completed or cancelled
            q.and(
              q.gte(q.field("startTime"), startTime),
              q.lt(q.field("startTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            ),
            q.and(
              q.gt(q.field("endTime"), startTime),
              q.lte(q.field("endTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            ),
            q.and(
              q.lte(q.field("startTime"), startTime),
              q.gte(q.field("endTime"), endTime),
              q.or(
                q.eq(q.field("status"), "pending"),
                q.eq(q.field("status"), "confirmed")
              )
            )
          )
        )
        .collect();
      
      // Extract the bikeIds from the bookings
      const bookedBikeIds = new Set(overlappingBookings.map(booking => booking.bikeId));
      
      // Log the number of booked bikes (for debugging)
      console.log(`Found ${bookedBikeIds.size} booked bikes for time period: ${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`);
      
      return Array.from(bookedBikeIds);
    },
  });
  

// Create a booking
export const createBooking = mutation({
  args: {
    bikeId: v.id("bikes"),
    userId: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    status: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const { bikeId, userId, userName, userPhone, startTime, endTime, totalPrice } = args;
    
    // Check if bike exists
    const bike = await ctx.db.get(bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    
    // Check if bike is available
    if (!bike.isAvailable) {
      throw new Error("Bike is not available for booking");
    }
    
    // Simple booking creation without any fancy checks
    const bookingId = await ctx.db.insert("bookings", {
      bikeId,
      userId,
      userName,
      userPhone,
      startTime,
      endTime,
      totalPrice,
      status: "pending", // Initial status
    });
    
    return bookingId;
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
// Debug function to help diagnose bike availability issues
export const debugBikeAvailability = query({
    args: {
      bikeId: v.id("bikes"),
      startTime: v.number(),
      endTime: v.number(),
    },
    handler: async (ctx, args) => {
      const { bikeId, startTime, endTime } = args;
      
      // Check if the bike exists
      const bike = await ctx.db.get(bikeId);
      if (!bike) {
        return {
          exists: false,
          error: "Bike not found"
        };
      }
      
      // Get all bookings for this bike, regardless of status
      const allBookings = await ctx.db
        .query("bookings")
        .filter((q) => q.eq(q.field("bikeId"), bikeId))
        .collect();
      
      // Find active bookings (pending or confirmed)
      const activeBookings = allBookings.filter(booking => 
        booking.status === "pending" || booking.status === "confirmed"
      );
      
      // Find bookings that would conflict with the requested time period
      const conflictingBookings = allBookings.filter(booking => {
        // Check for overlapping time periods
        const bookingOverlaps = (
          // Booking starts during requested period
          (booking.startTime >= startTime && booking.startTime < endTime) ||
          // Booking ends during requested period
          (booking.endTime > startTime && booking.endTime <= endTime) ||
          // Booking completely spans requested period
          (booking.startTime <= startTime && booking.endTime >= endTime)
        );
        
        // Only count as conflict if active (pending or confirmed)
        return bookingOverlaps && (booking.status === "pending" || booking.status === "confirmed");
      });
      
      return {
        bike: {
          id: bikeId,
          name: bike.name,
          isAvailable: bike.isAvailable
        },
        timeRange: {
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        },
        bookingsCount: {
          total: allBookings.length,
          active: activeBookings.length,
          conflicting: conflictingBookings.length
        },
        isAvailable: bike.isAvailable && conflictingBookings.length === 0,
        activeBookings: activeBookings.map(b => ({
          id: b._id,
          status: b.status,
          startTime: new Date(b.startTime).toISOString(),
          endTime: new Date(b.endTime).toISOString(),
          overlapsWithRequest: (
            (b.startTime >= startTime && b.startTime < endTime) ||
            (b.endTime > startTime && b.endTime <= endTime) ||
            (b.startTime <= startTime && b.endTime >= endTime)
          )
        }))
      };
    },
  });

  export const debugBookingSchema = query({
    handler: async (ctx) => {
      // Get the table schemas
      const schema = {
        bookings: {
          description: "Expected fields in bookings table",
          fields: [
            "bikeId",
            "userId", 
            "userName", 
            "userPhone", 
            "startTime", 
            "endTime",
            "totalPrice",
            "status"
            // List any other fields that should be in your schema
          ]
        }
      };
      
      // Sample booking data (this is what your code is trying to create)
      const sampleBooking = {
        bikeId: "placeholder_id", // would be an actual ID in real usage
        userId: "user_id",
        userName: "John Doe",
        userPhone: "+1234567890",
        startTime: Date.now(),
        endTime: Date.now() + 2 * 60 * 60 * 1000,
        totalPrice: 50,
        status: "pending",
        createdAt: Date.now()
      };
      
      // Find fields in sample booking that aren't in schema
      const extraFields = Object.keys(sampleBooking).filter(
        field => !schema.bookings.fields.includes(field)
      );
      
      return {
        schemaDefinition: schema,
        sampleBooking: sampleBooking,
        potentialIssues: {
          extraFields: extraFields,
          message: extraFields.length > 0 
            ? `Found ${extraFields.length} fields that might not be in your schema: ${extraFields.join(', ')}`
            : "No schema issues detected"
        },
        recommendation: extraFields.length > 0
          ? "Add these fields to your schema or remove them from your code"
          : "Schema looks good"
      };
    }
  });

  // New mutation to update payment status (for simulation in phase 1)
  export const updatePaymentStatus = mutation({
    args: {
      bookingId: v.id("bookings"),
      success: v.boolean(),
      transactionId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
      const { bookingId, success, transactionId } = args;
      
      // Get the booking
      const booking = await ctx.db.get(bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }
      
      const now = Date.now();
      
      if (success) {
        // Update booking for successful payment
        await ctx.db.patch(bookingId, {
          status: "confirmed", // Confirm the booking
          paymentStatus: "deposit_paid",
          depositAmount: 42, // Rs.42 deposit
          depositPaidAt: now,
          paymentTransactionId: transactionId,
          remainingAmount: booking.totalPrice - 40, // Rs.40 goes to bike owner
        });
        
        return { success: true, bookingId };
      } else {
        // Handle failed payment
        await ctx.db.patch(bookingId, {
          paymentStatus: "payment_failed",
        });
        
        return { success: false, bookingId };
      }
    },
  });
// New mutation to record payment completion (for when customer returns)
export const completePayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    adminId: v.string(),
    paymentMethod: v.string(), // "cash", "phonepe", etc.
  },
  handler: async (ctx, args) => {
    const { bookingId, adminId, paymentMethod } = args;
    
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();
      
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can complete payments");
    }
    
    // Get the booking
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    if (booking.paymentStatus !== "deposit_paid") {
      throw new Error("Booking deposit must be paid before completing payment");
    }
    
    // Update the booking status
    await ctx.db.patch(bookingId, {
      status: "completed",
      paymentStatus: "fully_paid",
    });
    
    return { success: true, bookingId };
  },
});

export const getBikeBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});