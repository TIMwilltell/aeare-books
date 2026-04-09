---
id: SEED-002
status: dormant
planted: 2026-04-09T04:54:14Z
planted_during: v1.0 / Phase 5 Route And Ownership Completion
trigger_when: When improving book discovery/search so users can find books by title before resolving AR data by ISBN
scope: Medium
---

# SEED-002: Title search with ISBN-backed AR lookup

## Why This Matters

The add-book flow currently starts from ISBN entry, which is efficient for scanning but too limiting when a barcode is unavailable or metadata search needs to begin from title. Users should be able to search for a book by title first, then use the resolved ISBN from the catalog result to perform the AR lookup.

This keeps the user-facing discovery step flexible while preserving the more reliable AR resolution path that depends on ISBN. The important product rule is: discovery can start with title, but AR lookup should still pivot to ISBN once the external catalog result is known.

## When to Surface

**Trigger:** When improving book discovery/search so users can find books by title before resolving AR data by ISBN.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- The milestone expands the add-book flow beyond scan-or-ISBN entry.
- The milestone adds title-based discovery, richer search UX, or external catalog result selection.
- The milestone revisits external metadata providers and needs to chain metadata lookup into AR enrichment.

## Scope Estimate

**Medium** — This likely fits in one or two phases: new discovery UI, server/API support for title-based lookup, result selection, and a clean handoff from catalog result to ISBN-based AR lookup.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `src/routes/book/new/+page.svelte:20-39` shows the add-book flow currently starts from a single ISBN field and then runs metadata lookup plus AR lookup from that ISBN.
- `src/routes/api/books/+server.ts:15-42` exposes a metadata endpoint that only accepts `isbn`, so there is no title-based external discovery path yet.
- `src/routes/api/ar/+server.ts:6-42` requires `isbn` and is already structured around ISBN-backed AR resolution.
- `src/lib/db/index.ts:176-189` already supports local library filtering by title, author, and ISBN, which means this seed is specifically about external book discovery rather than the existing shelf search.
- `README.md:7-12` frames the current product around barcode-driven add flow with AR enrichment, which this seed would broaden without discarding the ISBN-based AR step.
- `src/routes/api/books/+server.ts:4-84` currently uses Open Library rather than Google Books, so any future title-search design should reconcile provider choice with the original goal of resolving ISBN before AR lookup.

## Notes

- Intent from this session: search by title should be possible even if AR lookup still depends on ISBN.
- The existing local shelf search already matches title/author/ISBN; the missing capability is upstream catalog search for adding a new book.
- If provider choice changes again, preserve the core behavior rather than the specific vendor: title search first, ISBN-backed AR resolution second.
