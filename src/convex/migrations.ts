import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { internalMutation, internalQuery } from "./_generated/server";

const DEFAULT_BATCH_SIZE = 100;

const inventorySummaryValidator = v.object({
  total: v.number(),
  missingOwner: v.number(),
  backfillable: v.number(),
  unresolved: v.number(),
});

const backfillBatchResultValidator = v.object({
  scanned: v.number(),
  updated: v.number(),
  remainingCursor: v.union(v.string(), v.null()),
  isDone: v.boolean(),
});


export const inventoryLegacyOwnership = internalQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    books: inventorySummaryValidator,
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const bookPage = await ctx.db.query("books").order("asc").paginate(args.paginationOpts);

    let totalBooks = 0;
    let missingOwnerBooks = 0;
    for (const book of bookPage.page) {
      totalBooks += 1;
      if (book.userId === undefined) {
        missingOwnerBooks += 1;
      }
    }
    return {
      books: {
        total: totalBooks,
        missingOwner: missingOwnerBooks,
        // Legacy books currently have no trustworthy owner signal to derive from.
        backfillable: 0,
        unresolved: missingOwnerBooks,
      },
      continueCursor: bookPage.isDone ? null : bookPage.continueCursor,
      isDone: bookPage.isDone,
    };
  },
});

export const inventoryLegacyProgressOwnership = internalQuery({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    progressEvents: inventorySummaryValidator,
    continueCursor: v.union(v.string(), v.null()),
    isDone: v.boolean(),
  }),
	handler: async (ctx, args) => {
		const progressPage = await ctx.db.query("progressEvents").order("asc").paginate(args.paginationOpts);
		const bookUserIdCache = new Map();

    async function resolveBookUserId(bookId: Id<"books">) {
      if (bookUserIdCache.has(bookId)) {
        return bookUserIdCache.get(bookId);
      }

      const userId = (await ctx.db.get(bookId))?.userId;
			bookUserIdCache.set(bookId, userId);
			return userId;
		}

    let totalProgressEvents = 0;
    let missingOwnerProgressEvents = 0;
    let backfillableProgressEvents = 0;

    for (const progressEvent of progressPage.page) {
      totalProgressEvents += 1;
      if (progressEvent.userId !== undefined) {
        continue;
      }

			missingOwnerProgressEvents += 1;
			const parentBookUserId = await resolveBookUserId(progressEvent.bookId);
			if (parentBookUserId !== undefined) {
				backfillableProgressEvents += 1;
			}
    }

    return {
      progressEvents: {
        total: totalProgressEvents,
        missingOwner: missingOwnerProgressEvents,
        backfillable: backfillableProgressEvents,
        unresolved: missingOwnerProgressEvents - backfillableProgressEvents,
      },
      continueCursor: progressPage.isDone ? null : progressPage.continueCursor,
      isDone: progressPage.isDone,
    };
  },
});

export const backfillOwnedBooks = internalMutation({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: backfillBatchResultValidator,
  handler: async (ctx, args) => {
    const page = await ctx.db.query("books").order("asc").paginate(args.paginationOpts);

    let scanned = 0;
    for (const book of page.page) {
      if (book.userId === undefined) {
        scanned += 1;
      }
    }

    return {
      scanned,
      updated: 0,
      remainingCursor: page.isDone ? null : page.continueCursor,
      isDone: page.isDone,
    };
  },
});

export const backfillOwnedProgressEvents = internalMutation({
  args: {
    batchSize: v.optional(v.number()),
    paginationOpts: paginationOptsValidator,
	},
	returns: backfillBatchResultValidator,
	handler: async (ctx, args) => {
		if (args.batchSize !== undefined && (!Number.isInteger(args.batchSize) || args.batchSize <= 0)) {
			throw new Error("batchSize must be a positive integer");
		}

    const limit = args.batchSize ?? DEFAULT_BATCH_SIZE;
    const paginationOpts = {
      ...args.paginationOpts,
      numItems: Math.min(args.paginationOpts.numItems, limit),
    };
    const page = await ctx.db.query("progressEvents").order("asc").paginate(paginationOpts);
    const bookUserIdCache = new Map();

    async function resolveBookUserId(bookId: Id<"books">) {
      if (bookUserIdCache.has(bookId)) {
        return bookUserIdCache.get(bookId);
      }

      const userId = (await ctx.db.get(bookId))?.userId;
			bookUserIdCache.set(bookId, userId);
			return userId;
		}

    let scanned = 0;
    let updated = 0;

    for (const progressEvent of page.page) {
      if (progressEvent.userId !== undefined) {
        continue;
      }

      scanned += 1;
			if (updated >= limit) {
				continue;
			}

			const parentBookUserId = await resolveBookUserId(progressEvent.bookId);
			if (parentBookUserId === undefined) {
				continue;
			}

			await ctx.db.patch(progressEvent._id, { userId: parentBookUserId });
			updated += 1;
		}

    return {
      scanned,
      updated,
      remainingCursor: page.isDone ? null : page.continueCursor,
      isDone: page.isDone,
    };
  },
});
