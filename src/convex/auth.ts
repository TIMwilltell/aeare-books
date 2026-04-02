import { query } from './_generated/server';
import { v } from 'convex/values';

export const getAuthState = query({
	args: {},
	handler: async (ctx) => {
		const identity = await ctx.auth.getUserIdentity();

		return {
			isAuthenticated: identity !== null,
			tokenIdentifier: identity?.tokenIdentifier ?? null,
		};
	},
});
