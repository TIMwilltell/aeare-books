---
id: SEED-003
status: dormant
planted: 2026-04-09T04:54:14Z
planted_during: v1.0 / Phase 5 Route And Ownership Completion
trigger_when: With search improvements, especially when improving add-book lookup latency or decoupling metadata load from AR enrichment
scope: Small
---

# SEED-003: Async AR lookup after metadata

## Why This Matters

The current add-book lookup waits on metadata lookup and then waits again on AR lookup inside the same action. That means users do not get the faster metadata win unless the slower AR fetch also completes. AR enrichment should run asynchronously from the external book metadata call so title, author, and cover can appear quickly while AR data resolves independently.

This is a focused latency and UX improvement: keep the core add-book flow responsive even when AR scraping is slower or fails.

## When to Surface

**Trigger:** With search improvements, especially when improving add-book lookup latency or decoupling metadata load from AR enrichment.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- The milestone is already touching add-book lookup flow or search UX.
- Lookup latency, responsiveness, or progressive-loading behavior becomes a priority.
- Metadata fetch and AR enrichment are being refactored into separate states or requests.

## Scope Estimate

**Small** — This is likely a focused implementation inside the existing add-book flow: separate loading states, concurrent or staged requests, and non-blocking UI updates for AR fields.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/routes/book/new/+page.svelte:22-49` runs `lookupBook(isbn.trim())` and only afterward awaits `lookupAr(isbn.trim())`, with one shared `lookupLoading` state.
- `src/routes/api/books/+server.ts:15-42` and `src/routes/api/ar/+server.ts:6-42` are already separate endpoints, which makes staged or concurrent client behavior feasible.
- `src/routes/api/ar/+server.ts:29-42` and `src/routes/api/ar/+server.ts:50-103` perform the Bookroo lookup + details parsing that can be slower or fail independently of metadata lookup.
- `README.md:9-12` already documents graceful fallback when AR lookup fails, which aligns with treating AR as enrichment rather than a blocker.

## Notes

- Intent from this session: AR lookup should not block the book metadata result from the external catalog.
- This likely pairs naturally with the title-search seed because both touch the same add-book discovery flow.
- If implemented alongside richer search, make sure the AR request uses the resolved ISBN from the chosen result rather than forcing the user back through ISBN-only entry.
