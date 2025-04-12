// convex/schema.js
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
    
    // New fields for early return
    actualEndTime: v.optional(v.number()), // Actual time when bike was returned
    earlyReturn: v.optional(v.boolean()), // Flag to identify early returns
    adjustedPrice: v.optional(v.number()), // Price after early return adjustment
    originalPrice: v.optional(v.number()), // Original price before adjustment
    refundAmount: v.optional(v.number()), // Amount to be refunded
    returnProcessedAt: v.optional(v.number()), // When the return was processed
    returnProcessedBy: v.optional(v.string()), // User who processed the return
    
    // New fields for booking extension
    extended: v.optional(v.boolean()), // Flag to identify if booking was extended
    originalEndTime: v.optional(v.number()), // Original end time before extension
    extensionTime: v.optional(v.number()), // When the extension was made
    extensionHours: v.optional(v.number()), // Additional hours added
    extensionCost: v.optional(v.number()), // Additional cost for extension
    extensionProcessedBy: v.optional(v.string()), // User who processed the extension
  // Return inspection fields
  returnInspectionNotes: v.optional(v.string()),
  returnDamageFound: v.optional(v.boolean()),
  damageDescription: v.optional(v.string()),
  damageImages: v.optional(v.array(v.string())), // URLs to damage photos
  inspectedBy: v.optional(v.string()), // Admin who performed inspection
  inspectionTime: v.optional(v.number()),
  
  // Vehicle condition ratings (1-5)
  cleanlinessRating: v.optional(v.number()),
  mechanicalRating: v.optional(v.number()),
  fuelLevel: v.optional(v.number()), // Percentage
  
  // Additional charges
  additionalCharges: v.optional(v.number()),
  chargeReason: v.optional(v.string()),
   
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
    tags: v.optional(v.array(v.string())),
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
    
    // New fields for refunds
    isRefund: v.optional(v.boolean()),
    refundReason: v.optional(v.string()),
    originalPaymentId: v.optional(v.id("payments")),
  }).index("by_bookingId", ["bookingId"]).index("by_userId", ["userId"]),
  
 
  
  // Store status table
  storeStatus: defineTable({
    isOpen: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    updatedBy: v.string(), // Admin who last updated the status
  }),
});