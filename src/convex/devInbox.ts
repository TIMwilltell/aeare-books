import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

function assertLocalAuthMode() {
	if (process.env.AEARE_AUTH_EMAIL_MODE !== "local") {
		throw new Error("Local auth inbox is disabled");
	}
}

export const storeMagicLinkEmail = internalMutation({
	args: {
		email: v.string(),
		url: v.string(),
		token: v.string(),
		subject: v.string(),
		html: v.string(),
		text: v.string(),
		expiresAt: v.number(),
	},
	handler: async (ctx, args) => {
		assertLocalAuthMode();
		await ctx.db.insert("devMagicLinks", {
			...args,
			createdAt: Date.now(),
		});
	},
});

export const getLatestMagicLink = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		assertLocalAuthMode();
		const [message] = await ctx.db
			.query("devMagicLinks")
			.withIndex("by_email_and_createdAt", (q) => q.eq("email", args.email))
			.order("desc")
			.take(1);
		return message ?? null;
	},
});

export const clearMagicLinks = mutation({
	args: { email: v.optional(v.string()) },
	handler: async (ctx, args) => {
		assertLocalAuthMode();

		if (args.email) {
			const email = args.email;
			const rows = await ctx.db
				.query("devMagicLinks")
				.withIndex("by_email_and_createdAt", (q) => q.eq("email", email))
				.take(100);
			for (const row of rows) {
				await ctx.db.delete(row._id);
			}
			return;
		}

		const rows = await ctx.db.query("devMagicLinks").take(100);
		for (const row of rows) {
			await ctx.db.delete(row._id);
		}
	},
});
