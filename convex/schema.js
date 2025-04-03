// Update to convex/schema.js - Add userActivities table
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bikes: defineTable({
    // existing bikes table schema
    adminId: v.optional(v.string()),
    name: v.string(),
    type: v.string(),
    description: v.string(),
    pricePerHour: v.number(),
    imageUrl: v.optional(v.string()),
    isAvailable: v.boolean(),
    location: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    registrationNumber: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }),
  
  bookings: defineTable({
    // existing bookings table schema
    bikeId: v.id("bikes"),
    userId: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    totalPrice: v.number(),
    status: v.string(), // "pending", "confirmed", "completed", "cancelled"
    // Payment-related fields
    paymentStatus: v.optional(v.string()), // "pending", "deposit_paid", "fully_paid"
    depositAmount: v.optional(v.number()),
    remainingAmount: v.optional(v.number()),
    paymentTransactionId: v.optional(v.string()),
    depositPaidAt: v.optional(v.number()),
    // New fields for custom bookings
    notes: v.optional(v.string()), // For custom booking notes
    isAdminBooking: v.optional(v.boolean()), // Flag to identify admin-created bookings
    createdAt: v.optional(v.number()), // Timestamp when booking was created
  }).index("by_userId", ["userId"]).index("by_bikeId", ["bikeId"]),
  
  users: defineTable({
    // existing users table schema
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Clerk profile image
    profilePictureUrl: v.optional(v.string()), // Custom profile picture
    licenseNumber: v.optional(v.string()),
    licenseImageUrl: v.optional(v.string()),
    aadharImageUrl: v.optional(v.string()), // Front side
    aadharBackImageUrl: v.optional(v.string()), // Back side
    profileComplete: v.optional(v.boolean()),
    role: v.string(), // "user", "admin"
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_phoneNumber", ["phoneNumber"]),
  
  // Payments table
  payments: defineTable({
    bookingId: v.id("bookings"),
    userId: v.string(),
    amount: v.number(),
    type: v.string(), // "deposit" or "remaining"
    status: v.string(), // "pending", "success", "failed"
    transactionId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    paymentTime: v.optional(v.number()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_bookingId", ["bookingId"]).index("by_userId", ["userId"]),
  
  // NEW: User activity logs table
  userActivities: defineTable({
    userId: v.string(),
    action: v.string(), // "login", "profile_update", "booking_created", etc.
    details: v.optional(v.string()), // JSON string with activity details
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_userId", ["userId"]).index("by_timestamp", ["timestamp"]),
});