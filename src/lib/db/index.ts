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
	isRead: boolean;
	readDate: Date | null;
	notes: string;
	quizScore?: number;
	quizDate?: Date;
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

export type ProgressEventType = 'marked_read' | 'quiz_completed' | 'notes_added' | 'book_added';

export interface ProgressEvent {
	id?: number;
	bookId: number;
	eventType: ProgressEventType;
	value?: string;
	eventDate: Date;
	createdAt: Date;
}

class AeAreDatabase extends Dexie {
	books!: Table<Book, number>;
	syncQueue!: Table<SyncQueueItem, number>;
	arCache!: Table<ArCacheEntry, string>;
	progressEvents!: Table<ProgressEvent, number>;

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
		this.version(3).stores({
			books: '++id, isbn, title, author, isRead, createdAt',
			syncQueue: '++id, operation, tableName, recordId, status, createdAt',
			arCache: 'isbn, cachedAt',
			progressEvents: '++id, bookId, eventType, eventDate, createdAt'
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
		isRead: false,
		readDate: null,
		notes: '',
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

// Progress Event Operations

export async function addProgressEvent(
	bookId: number,
	eventType: ProgressEventType,
	value?: string,
	eventDate?: Date
): Promise<number> {
	const now = new Date();
	return await db.progressEvents.add({
		bookId,
		eventType,
		value,
		eventDate: eventDate || now,
		createdAt: now
	});
}

export async function getProgressEventsByBook(bookId: number): Promise<ProgressEvent[]> {
	return await db.progressEvents
		.where('bookId')
		.equals(bookId)
		.sortBy('eventDate');
}

export async function deleteProgressEventsByBook(bookId: number): Promise<void> {
	await db.progressEvents.where('bookId').equals(bookId).delete();
}
