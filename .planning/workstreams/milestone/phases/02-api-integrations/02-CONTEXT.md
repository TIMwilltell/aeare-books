# Phase 2: API Integrations — Context

**Created:** 2026-03-24
**Status:** Ready for planning

## User Decisions (Locked)

These decisions were made during the discuss phase and are NON-NEGOTIABLE:

| ID | Decision | Rationale |
|----|----------|-----------|
| D-01 | Button click for metadata lookup (not auto-fetch) | Avoids unnecessary API calls when entering ISBN manually |
| D-02 | Cover display included in Phase 2 | UX improvement, depends on Google Books API |
| D-03 | AR editing allowed on detail page | Graceful degradation when scrape fails |

## Goals

**Phase Goal:** Books are auto-populated with metadata from Google Books and AR data from arbookfind.com

### Must Achieve

1. **META-01/02/03:** Auto-populate title, author, cover thumbnail from Google Books
2. **META-04:** Graceful error handling when lookup fails
3. **META-05:** ISBN-10 fallback when ISBN-13 fails
4. **AR-01/02:** Fetch AR level and points via backend proxy
5. **AR-03:** Manual AR level entry as fallback
6. **AR-04:** Visual indicator for fetched vs. manual AR data
7. **AR-05:** Cache successful AR lookups

### Nice to Have (Not in Scope)

- Auto-fetch on ISBN entry (explicitly deferred per D-01)
- Batch scanning with auto-population (Phase 3+)

## Technical Decisions

### Stack

- **SvelteKit 2.x** with Svelte 5 runes
- **Google Books API** (free, no key required for basic use)
- **Playwright** for AR scraping (arbookfind.com uses ASP.NET postbacks)
- **Hono** not needed — SvelteKit server routes handle API proxy

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Book Form (UI)                        │
│  [ISBN Input] [Lookup Button]                           │
│  → title, author, cover (Google Books)                  │
│  → arLevel, arPoints (arbookfind.com)                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              SvelteKit Server Routes                    │
│  /api/books?isbn=XXX  → Google Books API               │
│  /api/ar?isbn=XXX     → Playwright → arbookfind.com    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Dexie.js (IndexedDB)                 │
│  • books table (CRUD)                                  │
│  • arCache table (AR lookup cache)                      │
│  • syncQueue table (future: Google Sheets sync)         │
└─────────────────────────────────────────────────────────┘
```

### AR Scrape Flow (arbookfind.com)

1. Navigate to UserType.aspx
2. Select Librarian radio → submit
3. Enter ISBN → search
4. Click book title → view details
5. Extract ATOS level and AR points

**Selectors:**
- `#radLibrarian` — user type radio
- `#btnSubmitUserType` — submit button
- `#ctl00_ContentPlaceHolder1_txtISBN` — ISBN input
- `#ctl00_ContentPlaceHolder1_btnDoIt` — search button
- `#ctl00_ContentPlaceHolder1_ucBookDetail_lblBookLevel` — AR level
- `#ctl00_ContentPlaceHolder1_ucBookDetail_lblPoints` — AR points

### Caching Strategy

- AR cache TTL: 7 days
- Check cache before scrape
- Cache key: ISBN (normalized)

## Files to Create/Modify

### Plan 02-01: Google Books API
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/types/book.ts` | Create | BookMetadata type |
| `src/routes/api/books/+server.ts` | Create | Google Books proxy |
| `src/lib/api/books.ts` | Create | Client lookup function |
| `src/lib/db/index.ts` | Update | Add AR cache table |

### Plan 02-02: AR Lookup
| File | Action | Purpose |
|------|--------|---------|
| `src/routes/api/ar/+server.ts` | Create | Playwright AR scraper |
| `src/lib/api/ar.ts` | Create | Client AR lookup function |

### Plan 02-03: UI Integration
| File | Action | Purpose |
|------|--------|---------|
| `src/lib/components/LoadingSpinner.svelte` | Create | Loading indicator |
| `src/routes/book/new/+page.svelte` | Update | Add lookup button, AR fields |
| `src/lib/components/BookList.svelte` | Update | Show cover thumbnails |
| `src/routes/book/[id]/+page.svelte` | Update | Cover display, AR editing |

## Dependencies

- Phase 1 (Foundation) must complete before Phase 2
- 02-01 → 02-02 → 02-03 (sequential waves)

## Known Risks

1. **Playwright in serverless:** Vercel has 10s timeout on free tier. Use Railway/Render for deployment.
2. **arbookfind.com changes:** ASPX selectors may change. Monitor and update selectors if scrape fails.
3. **Google Books rate limits:** Unlikely for personal use, but consider caching if issues arise.

## Deferred Ideas

These were discussed but deferred to future phases:

- Auto-fetch metadata when ISBN entered (per D-01, button click only)
- Batch scanning mode (Phase 3+)
- Dark mode (Phase 4+)
- Child profiles (v2)
