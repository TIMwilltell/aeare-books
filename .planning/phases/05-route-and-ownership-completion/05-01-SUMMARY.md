---
phase: 05-route-and-ownership-completion
plan: 01
subsystem: backend-ownership-contract
tags: [convex, auth, authorization, regression-tests]
requirements-completed: [ACL-01, ACL-02, DATA-02]
completed: 2026-04-09
---

# Phase 5 Plan 1 Summary

## Outcome

Locked the backend ownership contract so authenticated book creation now produces owned progress data and automated tests prove account-scoped access.

## Delivered

- Updated `src/convex/books.ts` so `books.add` inserts the new book and an owned `book_added` progress event with the same authenticated `userId` and timestamp.
- Added `src/convex/books.test.ts` covering signed-out rejection, owned `book_added` progress creation, and cross-account denial for book and progress access.
- Preserved server-derived authorization by continuing to use `requireCurrentUserId(ctx)` and `requireOwnedBook(...)` without any client-supplied ownership arguments.

## Key Files

- `src/convex/books.ts`
- `src/convex/books.test.ts`

## Verification

- `bun run test:convex`

## Notes

- Cross-account reads remain split by intent: `books.get` returns `null` for a foreign book, while protected mutations and `progress.getByBook` keep the explicit `Book not found or not accessible` error.
