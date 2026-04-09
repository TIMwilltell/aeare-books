import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canReadOwnedBook, requireCurrentUserId, requireOwnedBook } from "./lib/ownership";

export const get = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const book = await ctx.db.get(args.id);
    return canReadOwnedBook(book, userId) ? book : null;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db
      .query("books")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const now = Date.now();
    const bookId = await ctx.db.insert("books", {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("progressEvents", {
      userId,
      bookId,
      eventType: "book_added",
      eventDate: now,
      createdAt: now,
    });

    return bookId;
  },
});

export const updateBook = mutation({
  args: {
    id: v.id("books"),
    isbn: v.optional(v.string()),
    title: v.optional(v.string()),
    author: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
    arLevel: v.optional(v.number()),
    arPoints: v.optional(v.number()),
    arDataSource: v.optional(v.string()),
    isRead: v.optional(v.boolean()),
    readDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    quizScore: v.optional(v.number()),
    quizDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const { id, ...updates } = args;
    const book = await ctx.db.get(id);
    requireOwnedBook(book, userId);
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const book = await ctx.db.get(args.id);
    requireOwnedBook(book, userId);

    for await (const progressEvent of ctx.db
      .query("progressEvents")
      .withIndex("bookId", (q) => q.eq("bookId", args.id))) {
      await ctx.db.delete(progressEvent._id);
    }

    await ctx.db.delete(args.id);
  },
});
