import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

const DEFAULT_BATCH_SIZE = 100;

const inventorySummaryValidator = v.object({
  total: v.number(),
  missingOwner: v.number(),
  backfillable: v.number(),
  unresolved: v.number(),
});

const aggregatedInventoryValidator = v.object({
  books: inventorySummaryValidator,
  progressEvents: inventorySummaryValidator,
});

const aggregatedBackfillValidator = v.object({
  books: v.object({
    scanned: v.number(),
    updated: v.number(),
  }),
  progressEvents: v.object({
    scanned: v.number(),
    updated: v.number(),
  }),
});

export const summarizeLegacyOwnership = internalAction({
  args: {
    pageSize: v.optional(v.number()),
  },
  returns: aggregatedInventoryValidator,
  handler: async (ctx, args) => {
    const pageSize = args.pageSize ?? DEFAULT_BATCH_SIZE;

    let bookCursor: string | null = null;
    const books = { total: 0, missingOwner: 0, backfillable: 0, unresolved: 0 };

    while (true) {
      const page: {
        books: { total: number; missingOwner: number; backfillable: number; unresolved: number };
        continueCursor: string | null;
        isDone: boolean;
      } = await ctx.runQuery(internal.migrations.inventoryLegacyOwnership, {
        paginationOpts: { cursor: bookCursor, numItems: pageSize },
      });

      books.total += page.books.total;
      books.missingOwner += page.books.missingOwner;
      books.backfillable += page.books.backfillable;
      books.unresolved += page.books.unresolved;

      if (page.isDone) {
        break;
      }

      bookCursor = page.continueCursor;
    }

    let progressCursor: string | null = null;
    const progressEvents = { total: 0, missingOwner: 0, backfillable: 0, unresolved: 0 };

    while (true) {
      const page: {
        progressEvents: { total: number; missingOwner: number; backfillable: number; unresolved: number };
        continueCursor: string | null;
        isDone: boolean;
      } = await ctx.runQuery(internal.migrations.inventoryLegacyProgressOwnership, {
        paginationOpts: { cursor: progressCursor, numItems: pageSize },
      });

      progressEvents.total += page.progressEvents.total;
      progressEvents.missingOwner += page.progressEvents.missingOwner;
      progressEvents.backfillable += page.progressEvents.backfillable;
      progressEvents.unresolved += page.progressEvents.unresolved;

      if (page.isDone) {
        break;
      }

      progressCursor = page.continueCursor;
    }

    return { books, progressEvents };
  },
});

export const runLegacyOwnershipBackfill = internalAction({
  args: {
    pageSize: v.optional(v.number()),
    writeBatchSize: v.optional(v.number()),
  },
  returns: aggregatedBackfillValidator,
  handler: async (ctx, args) => {
    const pageSize = args.pageSize ?? DEFAULT_BATCH_SIZE;

    let bookCursor: string | null = null;
    let scannedBooks = 0;

    while (true) {
      const result: { scanned: number; updated: number; remainingCursor: string | null; isDone: boolean } =
        await ctx.runMutation(internal.migrations.backfillOwnedBooks, {
          paginationOpts: { cursor: bookCursor, numItems: pageSize },
        });

      scannedBooks += result.scanned;
      if (result.isDone) {
        break;
      }

      bookCursor = result.remainingCursor;
    }

    let progressCursor: string | null = null;
    let scannedProgressEvents = 0;
    let updatedProgressEvents = 0;

    while (true) {
      const result: { scanned: number; updated: number; remainingCursor: string | null; isDone: boolean } =
        await ctx.runMutation(internal.migrations.backfillOwnedProgressEvents, {
          batchSize: args.writeBatchSize,
          paginationOpts: { cursor: progressCursor, numItems: pageSize },
        });

      scannedProgressEvents += result.scanned;
      updatedProgressEvents += result.updated;
      if (result.isDone) {
        break;
      }

      progressCursor = result.remainingCursor;
    }

    return {
      books: {
        scanned: scannedBooks,
        updated: 0,
      },
      progressEvents: {
        scanned: scannedProgressEvents,
        updated: updatedProgressEvents,
      },
    };
  },
});
