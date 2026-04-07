import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  books: defineTable({
    userId: v.optional(v.id("users")),
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
    .index("createdAt", ["createdAt"])
    .index("by_userId_and_createdAt", ["userId", "createdAt"]),

  progressEvents: defineTable({
    userId: v.optional(v.id("users")),
    bookId: v.id("books"),
    eventType: v.string(),
    value: v.optional(v.string()),
    eventDate: v.number(),
    createdAt: v.number(),
  })
    .index("bookId", ["bookId"])
    .index("eventDate", ["eventDate"])
    .index("by_userId_and_createdAt", ["userId", "createdAt"])
    .index("by_userId_and_bookId_and_eventDate", ["userId", "bookId", "eventDate"]),

  devMagicLinks: defineTable({
    email: v.string(),
    url: v.string(),
    token: v.string(),
    subject: v.string(),
    html: v.string(),
    text: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_email_and_createdAt", ["email", "createdAt"]),
});
