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
  }),
  bookings: defineTable({
    bikeId: v.id("bikes"),
    userId: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    status: v.string(), // "pending", "confirmed", "cancelled", "completed"
    totalPrice: v.number(),
  }).index("by_userId", ["userId"]),
});