import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';
import { modules } from './test.setup';

function sessionSubject(userId: string, sessionId: string) {
	return `${userId}|${sessionId}`;
}

test('getCurrentUser returns null while signed out', async () => {
	const t = convexTest(schema, modules);

	await expect(t.query(api.users.getCurrentUser, {})).resolves.toBeNull();
});

test('ensureCurrentUser rejects when no authenticated identity exists', async () => {
	const t = convexTest(schema, modules);

	await expect(t.query(api.users.ensureCurrentUser, {})).rejects.toThrow('Not authenticated');
});

test('getCurrentUser stays pinned to the same internal user across repeated sessions', async () => {
	const t = convexTest(schema, modules);
	const createdAt = Date.now();
	const userId = await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			name: 'Repeat Reader',
			email: 'repeat-reader@example.com',
			emailVerificationTime: createdAt
		});
	});

	const firstSession = t.withIdentity({ subject: sessionSubject(userId, 'session-one') });
	const secondSession = t.withIdentity({ subject: sessionSubject(userId, 'session-two') });

	const firstUser = await firstSession.query(api.users.getCurrentUser, {});
	const secondUser = await secondSession.query(api.users.getCurrentUser, {});

	expect(firstUser?._id).toBe(userId);
	expect(secondUser?._id).toBe(userId);
	expect(secondUser).toMatchObject({
		_id: firstUser?._id,
		email: 'repeat-reader@example.com',
		name: 'Repeat Reader'
	});
});
