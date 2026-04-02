import {
  type MutationCtx,
  type QueryCtx,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";

function readIdentityProfile(identity: {
  tokenIdentifier: string;
  subject?: string;
  issuer?: string;
  email?: string;
  name?: string;
  pictureUrl?: string;
  picture?: string;
}) {
  return {
    tokenIdentifier: identity.tokenIdentifier,
    subject: identity.subject,
    issuer: identity.issuer,
    email: identity.email,
    name: identity.name,
    pictureUrl: identity.pictureUrl ?? identity.picture,
  };
}

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

const userResultValidator = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  tokenIdentifier: v.string(),
  subject: v.optional(v.string()),
  issuer: v.optional(v.string()),
  email: v.optional(v.string()),
  name: v.optional(v.string()),
  pictureUrl: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
  lastSeenAt: v.number(),
});

export const getCurrentUser = query({
  args: {},
  returns: v.union(userResultValidator, v.null()),
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();
  },
});

export const ensureCurrentUser = mutation({
  args: {},
  returns: userResultValidator,
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const profile = readIdentityProfile(identity);
    const now = Date.now();

    const existing = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) {
      const updates = {
        subject: profile.subject,
        issuer: profile.issuer,
        email: profile.email,
        name: profile.name,
        pictureUrl: profile.pictureUrl,
        updatedAt: now,
        lastSeenAt: now,
      };

      await ctx.db.patch(existing._id, updates);

      return {
        ...existing,
        ...updates,
      };
    }

    const userId = await ctx.db.insert("users", {
      tokenIdentifier: profile.tokenIdentifier,
      subject: profile.subject,
      issuer: profile.issuer,
      email: profile.email,
      name: profile.name,
      pictureUrl: profile.pictureUrl,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });

    const created = await ctx.db.get(userId);
    if (!created) {
      throw new Error("Failed to create user profile");
    }

    return created;
  },
});
