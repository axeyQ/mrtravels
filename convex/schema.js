// Fixed schema.js with correct syntax
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bikes: defineTable({
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
  }).index("by_userId", ["userId"]).index("by_bikeId", ["bikeId"]),
  
  users: defineTable({
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.string()), // Clerk profile image
    profilePictureUrl: v.optional(v.string()), // Custom profile picture
    licenseNumber: v.optional(v.string()),
    licenseImageUrl: v.optional(v.string()),
    aadharImageUrl: v.optional(v.string()), // Front side
    aadharBackImageUrl: v.optional(v.string()), // Back side - new field
    profileComplete: v.optional(v.boolean()),
    role: v.string(), // "user", "admin"
    createdAt: v.number(),
  }).index("by_userId", ["userId"]).index("by_phoneNumber", ["phoneNumber"]),
  
  // Payments table - Note the correct syntax (no v.optional wrapping the entire table)
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
});