import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireCurrentUserId, requireOwnedBook } from "./lib/ownership";

export const getByBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const book = await ctx.db.get(args.bookId);
    requireOwnedBook(book, userId);

    return await ctx.db
      .query("progressEvents")
      .withIndex("by_userId_and_bookId_and_eventDate", (q) => q.eq("userId", userId).eq("bookId", args.bookId))
      .order("asc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireCurrentUserId(ctx);
    return await ctx.db
      .query("progressEvents")
      .withIndex("by_userId_and_createdAt", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const add = mutation({
  args: {
    bookId: v.id("books"),
    eventType: v.string(),
    value: v.optional(v.string()),
    eventDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await requireCurrentUserId(ctx);
    const book = await ctx.db.get(args.bookId);
    requireOwnedBook(book, userId);

    return await ctx.db.insert("progressEvents", {
      userId,
      ...args,
      createdAt: Date.now(),
    });
  },
});
