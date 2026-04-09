import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';

import { api } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { modules } from './test.setup';
import schema from './schema';

function sessionSubject(userId: string, sessionId: string) {
	return `${userId}|${sessionId}`;
}

async function createUser(t: ReturnType<typeof convexTest>, name: string, email: string) {
	return await t.run(async (ctx) => {
		return await ctx.db.insert('users', {
			name,
			email,
			emailVerificationTime: Date.now()
		});
	});
}

test('books.getAll and books.add reject while signed out', async () => {
	const t = convexTest(schema, modules);

	await expect(t.query(api.books.getAll, {})).rejects.toThrow('Not authenticated');
	await expect(
		t.mutation(api.books.add, {
			isbn: '9780140328721',
			title: 'Matilda',
			author: 'Roald Dahl',
			isRead: false,
			notes: ''
		})
	).rejects.toThrow('Not authenticated');
});

test('books.add creates an owned book_added progress event', async () => {
	const t = convexTest(schema, modules);
	const userId = await createUser(t, 'Reader One', 'reader-one@example.com');
	const session = t.withIdentity({ subject: sessionSubject(userId, 'session-one') });

	const bookId = await session.mutation(api.books.add, {
		isbn: '9780142410370',
		title: 'Coraline',
		author: 'Neil Gaiman',
		isRead: false,
		notes: ''
	});

	const ownedBooks = await session.query(api.books.getAll, {});
	const ownedProgress = await session.query(api.progress.getAll, {});

	expect(ownedBooks).toHaveLength(1);
	expect(ownedBooks[0]?._id).toBe(bookId);
	expect(ownedBooks[0]?.userId).toBe(userId);
	expect(ownedProgress).toHaveLength(1);
	expect(ownedProgress[0]).toMatchObject({
		bookId,
		userId,
		eventType: 'book_added'
	});
	expect(typeof ownedProgress[0]?.eventDate).toBe('number');
	expect(ownedProgress[0]?.createdAt).toBe(ownedProgress[0]?.eventDate);
});

test('cross-account users cannot access another users books or progress', async () => {
	const t = convexTest(schema, modules);
	const userA = await createUser(t, 'Reader A', 'reader-a@example.com');
	const userB = await createUser(t, 'Reader B', 'reader-b@example.com');
	const sessionA = t.withIdentity({ subject: sessionSubject(userA, 'session-a') });
	const sessionB = t.withIdentity({ subject: sessionSubject(userB, 'session-b') });

	const bookId = await sessionA.mutation(api.books.add, {
		isbn: '9780439554930',
		title: 'Harry Potter and the Sorcerer\'s Stone',
		author: 'J.K. Rowling',
		isRead: false,
		notes: ''
	});

	await expect(sessionB.query(api.books.get, { id: bookId })).resolves.toBeNull();
	await expect(
		sessionB.mutation(api.books.updateBook, {
			id: bookId,
			title: 'Nope'
		})
	).rejects.toThrow('Book not found or not accessible');
	await expect(sessionB.query(api.progress.getByBook, { bookId })).rejects.toThrow(
		'Book not found or not accessible'
	);

	const foreignProgress = await sessionB.query(api.progress.getAll, {});
	expect(foreignProgress).toEqual([]);

	await expect(sessionB.mutation(api.books.remove, { id: bookId })).rejects.toThrow(
		'Book not found or not accessible'
	);

	const ownerBooks = await sessionA.query(api.books.getAll, {});
	const ownerProgress = await sessionA.query(api.progress.getAll, {});

	expect(ownerBooks.map((book) => book._id)).toEqual([bookId]);
	expect(ownerProgress).toHaveLength(1);
	expect(ownerProgress[0]?.bookId).toBe(bookId);
	await expect(
		t.run(async (ctx) => {
			return await ctx.db.get(bookId as Id<'books'>);
		})
	).resolves.not.toBeNull();
});
