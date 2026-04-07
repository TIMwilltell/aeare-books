import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = QueryCtx | MutationCtx;

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
		throw new Error("Book not found");
	}

	if (book.userId !== userId) {
		throw new Error("Not authorized to access this book");
	}

	return book;
}
