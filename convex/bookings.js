// convex/bookings.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// NEW FUNCTION: Check if a user has any active bookings
export const userHasActiveBooking = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    // Find any bookings with status "pending" or "confirmed"
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter(q => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();
    
    return activeBookings.length > 0;
  },
});

// NEW FUNCTION: Get a user's active booking details (for display purposes)
export const getUserActiveBooking = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const { userId } = args;
    
    // Find the active booking
    const activeBooking = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter(q => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .first();
    
    if (!activeBooking) {
      return null;
    }
    
    // Fetch the related bike info
    const bike = activeBooking ? await ctx.db.get(activeBooking.bikeId) : null;
    
    return {
      booking: activeBooking,
      bike: bike ? {
        id: bike._id,
        name: bike.name,
        imageUrl: bike.imageUrl,
        type: bike.type
      } : null
    };
  },
});

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
    console.log(`Found ${bookedBikeIds.size} booked bikes for time period: 
${new Date(startTime).toLocaleString()} - ${new Date(endTime).toLocaleString()}`);
    return Array.from(bookedBikeIds);
  },
});

// Create a booking - UPDATED with "one booking at a time" check
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
    
    // NEW: Check if user already has an active booking
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter(q => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();
    
    if (activeBookings.length > 0) {
      throw new Error("You already have an active booking. Please complete or cancel it before making a new booking.");
    }
    
    // Check if bike exists
    const bike = await ctx.db.get(bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    // Check if bike is available
    if (!bike.isAvailable) {
      throw new Error("Bike is not available for booking");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    // Use the name from the user profile if available, otherwise use the provided name
    const bookingUserName = user ?
      `${user.firstName || ''} ${user.lastName || ''}`.trim() :
      userName;
    // Simple booking creation without any fancy checks
    const bookingId = await ctx.db.insert("bookings", {
      bikeId,
      userId,
      userName: bookingUserName,
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
        (booking.startTime >= startTime && booking.startTime < endTime)
        ||
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

// Display booking schema for debugging
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
          ? `Found ${extraFields.length} fields that might not be in your schema: 
${extraFields.join(', ')}`
          : "No schema issues detected"
      },
      recommendation: extraFields.length > 0
        ? "Add these fields to your schema or remove them from your code"
        : "Schema looks good"
    };
  }
});

// Update payment status mutation with fixed validator
export const updatePaymentStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    success: v.boolean(),
    transactionId: v.optional(v.string()),
    depositAmount: v.optional(v.number()), // Added this parameter to fix validation error
  },
  handler: async (ctx, args) => {
    const { bookingId, success, transactionId, depositAmount } = args;
    // Get the booking
    const booking = await ctx.db.get(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    // Check if payment status is already updated to prevent redundant updates
    if (success && booking.paymentStatus === "deposit_paid") {
      return { success: true, bookingId, alreadyProcessed: true };
    }
    if (!success && booking.paymentStatus === "payment_failed") {
      return { success: false, bookingId, alreadyProcessed: true };
    }
    const now = Date.now();
    if (success) {
      // Update booking for successful payment
      await ctx.db.patch(bookingId, {
        status: "confirmed", // Confirm the booking
        paymentStatus: "deposit_paid",
        depositAmount: depositAmount || 42, // Default to 42 if not specified
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

// Complete payment mutation (when customer returns)
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

// Get a single booking by ID
export const getBikeBookingById = query({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.bookingId);
  },
});

// Create a custom booking (admin only)
export const createCustomBooking = mutation({
  args: {
    adminId: v.string(),
    bikeId: v.id("bikes"),
    userId: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    totalPrice: v.number(),
    notes: v.optional(v.string()),
    paymentStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const {
      adminId,
      bikeId,
      userId,
      userName,
      userPhone,
      startTime,
      endTime,
      totalPrice,
      notes = "",
      paymentStatus = "pending"
    } = args;
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", adminId))
      .unique();
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can create custom bookings");
    }
    // Check if bike exists
    const bike = await ctx.db.get(bikeId);
    if (!bike) {
      throw new Error("Bike not found");
    }
    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    
    // NEW: Check if user already has an active booking (but allow admins to override)
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .filter(q => 
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed")
        )
      )
      .collect();
    
    if (activeBookings.length > 0) {
      // For admin bookings, just provide a warning but still allow it
      console.warn(`Admin creating a booking for user ${userId} who already has ${activeBookings.length} active bookings`);
    }
    
    // Create booking with admin flag
    const bookingId = await ctx.db.insert("bookings", {
      bikeId,
      userId,
      userName,
      userPhone,
      startTime,
      endTime,
      totalPrice,
      status: "confirmed", // Custom bookings are automatically confirmed
      paymentStatus, // Allow admin to specify payment status
      notes, // Store any admin notes
      isAdminBooking: true, // Mark as admin booking
      createdAt: Date.now(), // Add creation timestamp
    });
    return { bookingId, success: true };
  },
});

// Get all users for admin to select from
export const getAllUserBasicInfo = query({
  args: { adminId: v.string() },
  handler: async (ctx, args) => {
    // Check if requester is admin
    const admin = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.adminId))
      .unique();
    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized: Only admins can access user information");
    }
    // Get all users with basic info only
    const users = await ctx.db
      .query("users")
      .collect();
    // Return only necessary fields
    return users.map(user => ({
      userId: user.userId,
      name: `${user.firstName} ${user.lastName}`.trim(),
      phone: user.phoneNumber || "",
      profileComplete: user.profileComplete || false,
      profilePictureUrl: user.profilePictureUrl || user.imageUrl || null,
    }));
  },
});

// NEW MUTATIONS FOR EARLY RETURNS AND EXTENSIONS

// Process an early return
export const processEarlyReturn = mutation({
  args: {
    bookingId: v.id("bookings"),
    actualEndTime: v.number(),
    adminId: v.optional(v.string()), // Optional for admin processing
    userId: v.string(), // Required for authorization
  },
  handler: async (ctx, args) => {
    const { bookingId, actualEndTime, adminId, userId } = args;
    
    // Get the booking
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    
    // Validate the user can perform this action
    if (adminId) {
      // Admin validation
      const admin = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", adminId))
        .unique();
      
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Only admins can process early returns for others");
      }
    } else {
      // Regular user validation
      if (booking.userId !== userId) {
        throw new Error("Unauthorized: You can only process early returns for your own bookings");
      }
      
      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be returned early");
      }
    }
    
    // Validate that actualEndTime is after startTime but before original endTime
    if (actualEndTime <= booking.startTime) {
      throw new Error("Actual end time must be after the booking start time");
    }
    
    if (actualEndTime >= booking.endTime) {
      throw new Error("For early returns, the actual end time must be before the original end time");
    }
    
    // Get the bike to calculate hourly rate
    const bike = await ctx.db.get(booking.bikeId);
    if (!bike) throw new Error("Associated bike not found");
    
    // Calculate original duration and actual duration
    const originalHours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
    const actualHours = Math.ceil((actualEndTime - booking.startTime) / (1000 * 60 * 60));
    
    // Apply minimum charge (e.g., 1 hour minimum)
    const billableHours = Math.max(actualHours, 1);
    
    // Calculate adjusted price and potential refund
    const hourlyRate = bike.pricePerHour;
    const adjustedPrice = billableHours * hourlyRate;
    const originalPrice = booking.totalPrice;
    const refundAmount = Math.max(0, originalPrice - adjustedPrice);
    
    // Update booking
    await ctx.db.patch(bookingId, {
      endTime: actualEndTime,
      actualEndTime: actualEndTime,
      adjustedPrice: adjustedPrice,
      originalPrice: originalPrice, // Store the original price for reference
      refundAmount: refundAmount,
      remainingAmount: adjustedPrice - (booking.depositAmount || 0),
      status: "completed",
      earlyReturn: true,
      returnProcessedAt: Date.now(),
      returnProcessedBy: adminId || userId
    });
    
    // Log this activity
    try {
      await ctx.db.insert("userActivities", {
        userId: booking.userId,
        action: "booking_early_return",
        details: JSON.stringify({
          bookingId: bookingId,
          bikeName: bike.name,
          originalEndTime: booking.endTime,
          actualEndTime: actualEndTime,
          originalPrice: originalPrice,
          adjustedPrice: adjustedPrice,
          refundAmount: refundAmount
        }),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to log early return activity:", error);
    }
    
    return { 
      success: true, 
      bookingId, 
      adjustedPrice,
      originalPrice,
      refundAmount,
      status: "completed"
    };
  }
});

// Extend a booking
export const extendBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    newEndTime: v.number(),
    adminId: v.optional(v.string()), // Optional for admin processing
    userId: v.string(), // Required for authorization
  },
  handler: async (ctx, args) => {
    const { bookingId, newEndTime, adminId, userId } = args;
    
    // Get the booking
    const booking = await ctx.db.get(bookingId);
    if (!booking) throw new Error("Booking not found");
    
    // Validate the user can perform this action
    if (adminId) {
      // Admin validation
      const admin = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", adminId))
        .unique();
      
      if (!admin || admin.role !== "admin") {
        throw new Error("Unauthorized: Only admins can extend bookings for others");
      }
    } else {
      // Regular user validation
      if (booking.userId !== userId) {
        throw new Error("Unauthorized: You can only extend your own bookings");
      }
      
      if (booking.status !== "confirmed") {
        throw new Error("Only confirmed bookings can be extended");
      }
    }
    
    // Validate that newEndTime is after original endTime
    if (newEndTime <= booking.endTime) {
      throw new Error("New end time must be after the original end time");
    }
    
    // Check if the bike is available for the extended period
    const bikeId = booking.bikeId;
    
    // Get all bookings for this bike that might conflict with the extension
    const conflictingBookings = await ctx.db
      .query("bookings")
      .filter((q) => 
        q.and(
          q.eq(q.field("bikeId"), bikeId),
          q.neq(q.field("_id"), bookingId), // Exclude the current booking
          q.or(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("status"), "confirmed")
          ),
          q.or(
            // Booking starts during our extension period
            q.and(
              q.gte(q.field("startTime"), booking.endTime),
              q.lt(q.field("startTime"), newEndTime)
            ),
            // Booking spans our extension period
            q.and(
              q.lte(q.field("startTime"), booking.endTime),
              q.gte(q.field("endTime"), newEndTime)
            )
          )
        )
      )
      .collect();
      
    if (conflictingBookings.length > 0) {
      throw new Error("The bike is already booked for the requested extension period");
    }
    
    // Get the bike to calculate hourly rate
    const bike = await ctx.db.get(bikeId);
    if (!bike) throw new Error("Associated bike not found");
    
    // Calculate additional hours and cost
    const originalHours = Math.ceil((booking.endTime - booking.startTime) / (1000 * 60 * 60));
    const newTotalHours = Math.ceil((newEndTime - booking.startTime) / (1000 * 60 * 60));
    const additionalHours = newTotalHours - originalHours;
    
    // Calculate additional cost
    const hourlyRate = bike.pricePerHour;
    const additionalCost = additionalHours * hourlyRate;
    const newTotalPrice = booking.totalPrice + additionalCost;
    
    // Update booking
    await ctx.db.patch(bookingId, {
      endTime: newEndTime,
      originalEndTime: booking.endTime, // Store the original end time
      totalPrice: newTotalPrice,
      originalPrice: booking.totalPrice, // Store the original price
      remainingAmount: (booking.remainingAmount || 0) + additionalCost,
      extended: true,
      extensionTime: Date.now(),
      extensionHours: additionalHours,
      extensionCost: additionalCost,
      extensionProcessedBy: adminId || userId
    });
    
    // Log this activity
    try {
      await ctx.db.insert("userActivities", {
        userId: booking.userId,
        action: "booking_extended",
        details: JSON.stringify({
          bookingId: bookingId,
          bikeName: bike.name,
          originalEndTime: booking.endTime,
          newEndTime: newEndTime,
          originalPrice: booking.totalPrice,
          newTotalPrice: newTotalPrice,
          additionalHours: additionalHours,
          additionalCost: additionalCost
        }),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error("Failed to log booking extension activity:", error);
    }
    
    return { 
      success: true, 
      bookingId, 
      additionalHours,
      additionalCost,
      newTotalPrice 
    };
  }
});