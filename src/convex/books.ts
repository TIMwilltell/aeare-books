import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").order("desc").collect();
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
    const now = Date.now();
    return await ctx.db.insert("books", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
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
    const { id, ...updates } = args;
    await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
