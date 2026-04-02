import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    tokenIdentifier: v.string(),
    subject: v.optional(v.string()),
    issuer: v.optional(v.string()),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_tokenIdentifier", ["tokenIdentifier"])
    .index("by_email", ["email"]),

  books: defineTable({
    isbn: v.string(),
    title: v.string(),
    author: v.string(),
    coverUrl: v.optional(v.string()),
    arLevel: v.optional(v.number()),
    arPoints: v.optional(v.number()),
    arDataSource: v.optional(v.string()),
    isRead: v.boolean(),
    readDate: v.optional(v.number()),
    notes: v.string(),
    quizScore: v.optional(v.number()),
    quizDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("isbn", ["isbn"])
    .index("title", ["title"])
    .index("createdAt", ["createdAt"]),

  progressEvents: defineTable({
    bookId: v.string(),
    eventType: v.string(),
    value: v.optional(v.string()),
    eventDate: v.number(),
    createdAt: v.number(),
  })
    .index("bookId", ["bookId"])
    .index("eventDate", ["eventDate"]),
});
