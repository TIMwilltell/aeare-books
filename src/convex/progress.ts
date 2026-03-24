import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByBook = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progressEvents")
      .withIndex("bookId", (q) => q.eq("bookId", args.bookId))
      .order("asc")
      .collect();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("progressEvents").order("desc").collect();
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
    return await ctx.db.insert("progressEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
