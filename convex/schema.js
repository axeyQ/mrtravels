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
    rating: v.optional(v.number()),
  }),
  
  bookings: defineTable({
    bikeId: v.id("bikes"),
    userId: v.string(),
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
    role: v.string(), // "user" or "admin"
    imageUrl: v.optional(v.string()),
  }).index("by_userId", ["userId"]).index("by_phoneNumber", ["phoneNumber"]),
});