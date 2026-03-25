import { ConvexClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  coverUrl?: string;
  arLevel?: number;
  arPoints?: number;
  arDataSource?: "fetched" | "manual";
  isRead: boolean;
  readDate: number | null;
  notes: string;
  quizScore?: number;
  quizDate?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ArCacheEntry {
  isbn: string;
  arLevel: number;
  arPoints: number;
  cachedAt: Date;
}

export type SyncOperation = "create" | "update" | "delete";

export interface SyncQueueItem {
  id?: number;
  operation: SyncOperation;
  tableName: string;
  recordId: number;
  data?: unknown;
  createdAt: Date;
  status: "pending" | "synced" | "failed";
}

export type ProgressEventType =
  | "marked_read"
  | "quiz_completed"
  | "notes_added"
  | "book_added";

export interface ProgressEvent {
  id: string;
  bookId: string;
  eventType: ProgressEventType;
  value?: string;
  eventDate: number;
  createdAt: number;
}

// Create a new Convex client instance
function createClient(): ConvexClient {
  return new ConvexClient(
    import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONvex_DEPLOYMENT_URL,
  );
}

// Helper to get Convex client - creates a new instance
// Note: For better performance in Svelte components, use useConvexClient() at component
// initialization and pass the client to these functions. This function is for convenience
// and backward compatibility but creates a new client on each call.
function getClient(): ConvexClient {
  return createClient();
}

// Type guard for Date
function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

// Convert Convex document to Book (strips internal fields)
function toBook(doc: any): Book {
  return {
    id: doc._id,
    isbn: doc.isbn,
    title: doc.title,
    author: doc.author,
    coverUrl: doc.coverUrl,
    arLevel: doc.arLevel,
    arPoints: doc.arPoints,
    arDataSource: doc.arDataSource as "fetched" | "manual" | undefined,
    isRead: doc.isRead,
    readDate: doc.readDate ?? null,
    notes: doc.notes,
    quizScore: doc.quizScore,
    quizDate: doc.quizDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

// Convert Convex document to ProgressEvent (strips internal fields)
function toProgressEvent(doc: any): ProgressEvent {
  return {
    id: doc._id,
    bookId: doc.bookId,
    eventType: doc.eventType as ProgressEventType,
    value: doc.value,
    eventDate: doc.eventDate,
    createdAt: doc.createdAt,
  };
}

// CRUD Operations - Convex backend

export async function addBook(
  title: string,
  author: string,
  isbn: string,
  coverUrl?: string,
  arLevel?: number,
  arPoints?: number,
  arDataSource?: "fetched" | "manual",
): Promise<string> {
  const client = getClient();

  const id = await client.mutation(api.books.add, {
    isbn,
    title,
    author,
    coverUrl: coverUrl || undefined,
    arLevel: arLevel || undefined,
    arPoints: arPoints || undefined,
    arDataSource: arDataSource || undefined,
    isRead: false,
    readDate: undefined,
    notes: "",
    quizScore: undefined,
    quizDate: undefined,
  });

  return id;
}

export async function updateBook(
  id: string,
  data: Partial<Omit<Book, "id">>,
): Promise<string> {
  const client = getClient();

  // Convert Date to number if needed, and filter out null values
  const updates: Record<string, any> = {};

  if (data.readDate !== undefined) {
    updates.readDate = isDate(data.readDate)
      ? data.readDate.getTime()
      : (data.readDate ?? undefined);
  }
  if (data.quizDate !== undefined) {
    updates.quizDate = isDate(data.quizDate)
      ? data.quizDate.getTime()
      : (data.quizDate ?? undefined);
  }

  // Copy other fields
  if (data.isbn !== undefined) updates.isbn = data.isbn;
  if (data.title !== undefined) updates.title = data.title;
  if (data.author !== undefined) updates.author = data.author;
  if (data.coverUrl !== undefined) updates.coverUrl = data.coverUrl;
  if (data.arLevel !== undefined) updates.arLevel = data.arLevel;
  if (data.arPoints !== undefined) updates.arPoints = data.arPoints;
  if (data.arDataSource !== undefined) updates.arDataSource = data.arDataSource;
  if (data.isRead !== undefined) updates.isRead = data.isRead;
  if (data.notes !== undefined) updates.notes = data.notes;
  if (data.quizScore !== undefined) updates.quizScore = data.quizScore;

  await client.mutation(api.books.updateBook, {
    id: id as Id<"books">,
    ...updates,
  });
  return id;
}

export async function deleteBook(id: string): Promise<void> {
  const client = getClient();
  await client.mutation(api.books.remove, { id: id as Id<"books"> });
}

export async function getAllBooks(): Promise<Book[]> {
  const client = getClient();
  const books = await client.query(api.books.getAll, {});
  return (books ?? []).map(toBook);
}

export async function getBook(id: string): Promise<Book | null> {
  const client = getClient();
  const doc = await client.query(api.books.get, { id: id as Id<"books"> });
  return doc ? toBook(doc) : null;
}

export async function searchBooks(query: string): Promise<Book[]> {
  // For search, we get all books and filter client-side
  // This matches the previous behavior
  const allBooks = await getAllBooks();
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return allBooks;
  }
  return allBooks.filter(
    (book) =>
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.isbn.includes(lowerQuery),
  );
}

export async function getBooksCount(): Promise<number> {
  const books = await getAllBooks();
  return books.length;
}

// Progress Events - Convex backend

export async function addProgressEvent(
  bookId: string,
  eventType: ProgressEventType,
  value?: string,
  eventDate?: Date,
): Promise<string> {
  const client = getClient();
  const now = Date.now();

  const id = await client.mutation(api.progress.add, {
    bookId: bookId as Id<"books">,
    eventType,
    value: value || undefined,
    eventDate: eventDate ? eventDate.getTime() : now,
  });

  return id;
}

export async function getProgressEventsByBook(
  bookId: string,
): Promise<ProgressEvent[]> {
  const client = getClient();
  const events = await client.query(api.progress.getByBook, {
    bookId: bookId as Id<"books">,
  });
  return (events ?? []).map(toProgressEvent);
}

export async function deleteProgressEventsByBook(
  _bookId: string,
): Promise<void> {
  // Note: Convex doesn't have a bulk delete mutation for progress events
  // This would need a new Convex mutation to implement properly
  console.warn(
    "deleteProgressEventsByBook: Not fully implemented - needs Convex mutation",
  );
}

// AR Cache - Keep in memory for API caching (not core data)
const arCache = new Map<
  string,
  { arLevel: number; arPoints: number; cachedAt: number }
>();

export async function getArCache(
  isbn: string,
): Promise<{ arLevel: number; arPoints: number } | null> {
  const entry = arCache.get(isbn);
  if (!entry) {
    return null;
  }
  // Cache expires after 30 days
  if (Date.now() - entry.cachedAt > 30 * 24 * 60 * 60 * 1000) {
    arCache.delete(isbn);
    return null;
  }
  return {
    arLevel: entry.arLevel,
    arPoints: entry.arPoints,
  };
}

export async function setArCache(
  isbn: string,
  arLevel: number,
  arPoints: number,
): Promise<void> {
  arCache.set(isbn, {
    arLevel,
    arPoints,
    cachedAt: Date.now(),
  });
}

