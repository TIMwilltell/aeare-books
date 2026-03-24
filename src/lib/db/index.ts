import Dexie, { type Table } from 'dexie';

export interface Book {
	id?: number;
	isbn: string;
	title: string;
	author: string;
	coverUrl?: string;
	arLevel?: number;
	arPoints?: number;
	arDataSource?: 'fetched' | 'manual';
	createdAt: Date;
	updatedAt: Date;
}

export interface ArCacheEntry {
	isbn: string;
	arLevel: number;
	arPoints: number;
	cachedAt: Date;
}

export type SyncOperation = 'create' | 'update' | 'delete';

export interface SyncQueueItem {
	id?: number;
	operation: SyncOperation;
	tableName: string;
	recordId: number;
	data?: unknown;
	createdAt: Date;
	status: 'pending' | 'synced' | 'failed';
}

class AeAreDatabase extends Dexie {
	books!: Table<Book, number>;
	syncQueue!: Table<SyncQueueItem, number>;
	arCache!: Table<ArCacheEntry, string>;

	constructor() {
		super('AeAreDB');
		this.version(1).stores({
			books: '++id, isbn, title, author, createdAt',
			syncQueue: '++id, operation, tableName, recordId, status, createdAt'
		});
		this.version(2).stores({
			books: '++id, isbn, title, author, createdAt',
			syncQueue: '++id, operation, tableName, recordId, status, createdAt',
			arCache: 'isbn, cachedAt'
		});
	}
}

export const db = new AeAreDatabase();

// CRUD Operations

export async function addBook(
	title: string,
	author: string,
	isbn: string,
	coverUrl?: string,
	arLevel?: number,
	arPoints?: number,
	arDataSource?: 'fetched' | 'manual'
): Promise<number> {
	const now = new Date();
	const id = await db.books.add({
		title,
		author,
		isbn,
		coverUrl,
		arLevel,
		arPoints,
		arDataSource,
		createdAt: now,
		updatedAt: now
	});
	return id;
}

export async function updateBook(id: number, data: Partial<Omit<Book, 'id'>>): Promise<number> {
	await db.books.update(id, { ...data, updatedAt: new Date() });
	return id;
}

export async function deleteBook(id: number): Promise<void> {
	await db.books.delete(id);
}

export async function getAllBooks(): Promise<Book[]> {
	return await db.books.orderBy('createdAt').reverse().toArray();
}

export async function getBook(id: number): Promise<Book | undefined> {
	return await db.books.get(id);
}

export async function searchBooks(query: string): Promise<Book[]> {
	const lowerQuery = query.toLowerCase().trim();
	if (!lowerQuery) {
		return getAllBooks();
	}
	return await db.books
		.filter(
			(book) =>
				book.title.toLowerCase().includes(lowerQuery) ||
				book.author.toLowerCase().includes(lowerQuery) ||
				book.isbn.includes(lowerQuery)
		)
		.toArray();
}

export async function getBooksCount(): Promise<number> {
	return await db.books.count();
}

// AR Cache Operations

export async function getArCache(isbn: string): Promise<{ arLevel: number; arPoints: number } | null> {
	const entry = await db.arCache.get(isbn);
	if (!entry) {
		return null;
	}
	return {
		arLevel: entry.arLevel,
		arPoints: entry.arPoints
	};
}

export async function setArCache(isbn: string, arLevel: number, arPoints: number): Promise<void> {
	await db.arCache.put({
		isbn,
		arLevel,
		arPoints,
		cachedAt: new Date()
	});
}
