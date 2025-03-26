import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bikes: defineTable({
    name: v.string(),
    type: v.string(),
    description: v.string(),
    pricePerHour: v.number(),
    imageUrl: v.string(),
    isAvailable: v.boolean(),
    location: v.string(),
    features: v.array(v.string()),
    registrationNumber: v.optional(v.string()),
  }),
  
  bookings: defineTable({
    bikeId: v.id("bikes"),
    userId: v.string(),
    userName: v.string(),
    userPhone: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    status: v.string(), // "pending", "confirmed", "cancelled", "completed"
    totalPrice: v.number(),
  }).index("by_userId", ["userId"]).index("by_bikeId", ["bikeId"]),
  
  users: defineTable({
  userId: v.string(),
  firstName: v.string(),
  lastName: v.string(),
  phoneNumber: v.string(),
  imageUrl: v.optional(v.string()), // This was missing in your schema
  role: v.string(),
  createdAt: v.number(),
}).index("by_userId", ["userId"]).index("by_phoneNumber", ["phoneNumber"]),
});