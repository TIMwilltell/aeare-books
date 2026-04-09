# Phase 5 Route And Ownership Completion Verification

Date: 2026-04-09
Phase: 05-route-and-ownership-completion
Status: satisfied

## Commands Run

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Static/type check | `bun run check` | ✅ Pass | `svelte-check found 0 errors and 0 warnings` |
| Local Convex ownership regression | `bun run test:convex` | ✅ Pass | `src/convex/books.test.ts` and `src/convex/users.test.ts` passed 6 tests total |
| Auth route guard browser regression | `bunx playwright test tests/e2e/auth-route-guards.spec.ts` | ✅ Pass | Existing signed-out redirect and auth restore coverage passed across Chromium, Firefox, and WebKit |
| Dedicated Phase 5 route and ownership browser suite | `bunx playwright test tests/e2e/route-and-ownership.spec.ts` | ✅ Pass | Signed-out redirects plus two-user timeline/export isolation passed across Chromium, Firefox, and WebKit |

## Evidence By Requirement

| Requirement | Status | Evidence |
| --- | --- | --- |
| AUTH-04 | satisfied | `tests/e2e/auth-route-guards.spec.ts` continues to cover signed-out protection for `/scan`, `/book/new`, and `/book/[id]`, and `tests/e2e/route-and-ownership.spec.ts` re-proves the same redirect contract inside the dedicated Phase 5 artifact. |
| ACL-01 | satisfied | `src/convex/books.test.ts` proves `api.books.getAll` and `api.books.add` reject with `Not authenticated`, preserving the server-enforced authenticated boundary for library mutations and protected reads. |
| ACL-02 | satisfied | `src/convex/books.test.ts` proves user B cannot read, update, remove, or read progress for user A's book, while `tests/e2e/route-and-ownership.spec.ts` proves a second signed-in user cannot see user A's shelf, timeline, or export payload. |
| DATA-02 | satisfied | `src/convex/books.ts` now creates an owned `book_added` progress row alongside each authenticated book insert, `src/routes/book/[id]/+page.svelte` renders that progress on the protected detail page, and `src/lib/api/export.ts` exports account-scoped books plus progress events with ISO-normalized timestamps. |

## Evidence Added In This Session

- Added `src/convex/books.test.ts` with regression coverage for signed-out rejection, owned `book_added` progress creation, and foreign-account denial for books and progress.
- Updated `src/convex/books.ts` so authenticated book creation writes a matching owned `progressEvents` row in the same mutation.
- Updated `src/routes/book/[id]/+page.svelte` to show the existing `ProgressTimeline` with protected Convex data and a non-blocking section-level error state.
- Updated `src/lib/api/export.ts` to include scoped progress events in downloaded exports and normalize exported dates to ISO strings.
- Added `tests/e2e/route-and-ownership.spec.ts` covering signed-out redirects, owned timeline rendering, export contents, and two-user isolation.
- Updated `README.md` with the exact rerun commands and a pointer to this verification artifact.

## Conclusion

Phase 5 now has direct, rerunnable evidence for the remaining route and ownership gaps.

- Protected routes are still enforced for signed-out users in the live shell.
- Backend ownership rules are exercised directly through Convex tests instead of inferred from UI behavior.
- Progress ownership is now visible on protected detail pages and preserved in account-scoped export payloads.
- Browser automation proves that a second signed-in user cannot inherit another account's shelf, timeline, or exported records.
