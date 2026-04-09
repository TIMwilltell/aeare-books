# Phase 5 Research — Route And Ownership Completion

**Date:** 2026-04-08
**Phase:** 05-route-and-ownership-completion
**Research mode:** codebase audit + milestone audit synthesis

## Question

What do we need to know to plan Phase 5 well so AUTH-04, ACL-01, ACL-02, and DATA-02 are fully implemented and evidenced in current milestone artifacts?

## Current State

- Route protection already exists in the shell via `src/lib/auth/auth0.ts` and `src/routes/+layout.svelte`.
- Server-side ownership helpers already exist in `src/convex/lib/ownership.ts` and are used by `src/convex/books.ts` and `src/convex/progress.ts`.
- `books` and `progressEvents` both store `userId` in `src/convex/schema.ts`, but those fields are still optional because legacy rows remain quarantined for Phase 7 migration work.
- The home export flow in `src/lib/api/export.ts` is account-scoped for books because it calls `api.books.getAll`, but it currently hardcodes `progressEvents: []`.
- A user-facing progress component already exists at `src/lib/components/ProgressTimeline.svelte`, but no route currently loads protected progress events and renders it.
- Existing browser regression coverage proves signed-out route redirects and sign-in restore flows in `tests/e2e/auth-route-guards.spec.ts`, but there is no Phase 5 artifact that ties those checks to the current milestone requirements.

## Locked Constraints From Prior Phases

- Authorization must resolve the caller server-side with `getAuthUserId(ctx)` and never trust a client-supplied user id.
- Ownership keys for protected app data remain Convex Auth `users._id` values.
- `/` stays public; protected routes remain `/scan`, `/book/new`, and `/book/[id]`.
- Legacy unowned books/progress rows stay quarantined until the later migration workflow; Phase 5 should not guess ownership or build a claim flow.
- Error strings should remain explicit (`Not authenticated`, `Book not found or not accessible`) instead of generic failures.

## Gaps That Phase 5 Must Close

1. **Requirement evidence gap:** AUTH-04, ACL-01, ACL-02, and DATA-02 are mapped in roadmap/requirements but still orphaned in the milestone audit because there is no Phase 5 summary or verification evidence.
2. **Progress integration gap:** protected progress data exists in Convex, but there is no visible protected flow that proves it belongs to the signed-in account.
3. **Export completeness gap:** export payloads omit progress events entirely, so account-scoped ownership is only partially represented in user-visible output.
4. **Regression coverage gap:** current tests prove route guards but do not yet prove that protected progress and export data stay isolated between two different signed-in users.

## Recommended Technical Direction

### 1. Keep route protection where it already lives

Do not redesign route guards. Reuse the current shell-level `authState` + protected-intent flow from Phase 4 and capture fresh evidence for it in Phase 5 artifacts/tests.

### 2. Make progress ownership visible through an existing user flow

Use the existing `ProgressTimeline.svelte` component on the protected book-detail page and back it with `getProgressEventsByBook`. This is the smallest path that turns current protected progress data into a visible user-facing ownership surface.

### 3. Create at least one protected progress event through a normal app flow

The cleanest low-scope option is to have `api.books.add` also write a `progressEvents` row with `eventType: "book_added"` under the same authenticated `userId`. That gives every signed-in add-book flow a visible, owned timeline entry without inventing a separate progress editor in this phase.

### 4. Extend export to include protected progress data

Use `api.progress.getAll` from the existing authenticated browser Convex client and serialize those rows alongside books. This preserves current account scoping because the backing query already filters by authenticated `userId`.

### 5. Prove scoping with two-user browser coverage

Add a dedicated Phase 5 Playwright suite that:
- signs in as user A
- adds a book
- verifies the book detail timeline shows the owned `book_added` progress event
- exports the library and confirms both books and progress events are present
- signs in as user B and confirms user A's records do not appear in the shelf, timeline, or export payload

## Files Most Likely In Scope

### Backend
- `src/convex/books.ts`
- `src/convex/progress.ts`
- `src/convex/lib/ownership.ts`
- `src/convex/schema.ts` (read for context; schema change not required if using existing fields)
- `src/convex/test.setup.ts`
- new Convex tests under `src/convex/`

### Frontend
- `src/lib/db/index.ts`
- `src/lib/api/export.ts`
- `src/routes/book/[id]/+page.svelte`
- `src/lib/components/ProgressTimeline.svelte`
- `tests/e2e/auth-route-guards.spec.ts`
- new/updated route-and-ownership Playwright suite under `tests/e2e/`

### Planning / Verification
- `.planning/phases/05-route-and-ownership-completion/05-VERIFICATION.md`
- `README.md`

## Risks / Pitfalls

- **Do not scope-creep into rejection recovery UI.** The audit also found detail-page rejection UX gaps, but roadmap assigns that to Phase 6 (ACL-03, UX-03).
- **Do not unquarantine legacy rows.** Phase 5 should work only with authenticated, already-owned records.
- **Do not add client-provided ownership args.** All ownership proof must stay server-derived.
- **Avoid new external dependencies.** Current code and test infrastructure are sufficient.

## Plan Shape Recommendation

### Plan 01 — Backend ownership contract and regression coverage
- Add Convex tests for authenticated-only access, owned-only reads/writes, and owned progress creation.
- Update backend code so `books.add` creates an owned `book_added` progress row and ownership errors remain explicit.

### Plan 02 — Protected progress UX and export scoping
- Load/render progress timeline on the protected detail page using existing protected queries.
- Include progress events in export payloads and add end-to-end browser coverage for two-user account isolation.

### Plan 03 — Phase 5 verification artifact
- Record rerunnable commands and requirement-by-requirement evidence.
- Update README with the exact Phase 5 rerun path.

## Validation Architecture

### Existing infrastructure

- **Static/type:** `bun run check`
- **Convex tests:** `bun run test:convex`
- **Browser tests:** `bunx playwright test tests/e2e/auth-route-guards.spec.ts` and a new Phase 5 route/ownership suite

### Recommended sampling

- After backend task commits: `bun run test:convex`
- After frontend/export task commits: `bun run check`
- After Phase 5 wave completion: `bun run check && bun run test:convex && bunx playwright test tests/e2e/auth-route-guards.spec.ts tests/e2e/route-and-ownership.spec.ts`

### Wave 0 need

No new framework install is needed. Existing Vitest + convex-test + Playwright infrastructure is already present.

## Confidence

High. The phase can close its requirement gap by reusing current auth and ownership primitives, wiring already-existing progress concepts into live UI/export flows, and producing explicit Phase 5 verification evidence.
