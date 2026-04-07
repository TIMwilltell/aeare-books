import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;
const BOOK_ACCESS_ERROR = "Book not found or not accessible";

export async function requireCurrentUserId(ctx: AuthCtx): Promise<Id<"users">> {
	const userId = await getAuthUserId(ctx);
	if (!userId) {
		throw new Error("Not authenticated");
	}

	return userId;
}

export function canReadOwnedBook(book: Doc<"books"> | null, userId: Id<"users">): book is Doc<"books"> {
	return book !== null && book.userId === userId;
}

export function requireOwnedBook(book: Doc<"books"> | null, userId: Id<"users">): Doc<"books"> {
	if (!book) {
		throw new Error(BOOK_ACCESS_ERROR);
	}

	if (book.userId !== userId) {
		throw new Error(BOOK_ACCESS_ERROR);
	}

	return book;
}
