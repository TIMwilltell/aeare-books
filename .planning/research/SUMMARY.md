# Project Research Summary

**Project:** AeAre Books - Book Scanning PWA
**Domain:** Book scanning/library tracking PWA with AR reading progress
**Researched:** 2026-03-23
**Confidence:** HIGH (Stack), MEDIUM-HIGH (Architecture), MEDIUM (Features, Pitfalls)

## Executive Summary

AeAre is a family-focused PWA for tracking children's Accelerated Reader (AR) reading progress. The core workflow is: scan a book barcode → auto-populate book details (Google Books API) → fetch AR levels/points (scraped from arbookfind.com via backend proxy) → track quiz scores and reading progress → export to Google Sheets for school sharing.

Experts build this type of app using a local-first architecture with IndexedDB as the source of truth, syncing to cloud services in the background. For this specific use case, the recommended stack is **SvelteKit** for the frontend (smallest bundle, best PWA support), **Hono** for the backend proxy (multi-runtime, TypeScript-first), **Quagga2** for barcode scanning (actively maintained, excellent 1D support), and **Dexie.js** for IndexedDB (handles Safari quirks). Google APIs handle book metadata and Sheets export.

The key risks are: (1) iOS Safari barcode scanning unreliability, (2) AR BookFinder scrape breakage when Renaissance changes their site, (3) offline writes disappearing due to missing sync queue, and (4) Google Sheets rate limiting. Mitigate all of these through graceful degradation (manual fallbacks always available), proper sync queue implementation, and batch writes with rate limiting.

## Key Findings

### Recommended Stack

**Core technologies:**
- **SvelteKit 2.x (Svelte 5):** Frontend framework — smallest bundle (~15-30KB vs React's ~100-200KB), compiles to vanilla JS, excellent PWA support via vite-plugin-pwa, perfect for mobile-first PWAs
- **Hono 4.x:** Backend API server — ~14KB, TypeScript-first, multi-runtime (Node/Bun/Deno/Edge), fastest Node.js framework, ideal for AR scraping endpoint
- **vite-plugin-pwa 0.22.x:** PWA service worker — ~2M weekly downloads, zero-config Workbox integration, handles manifest and update prompts
- **Quagga2 2.x:** Barcode scanning — maintained fork of QuaggaJS, excellent 1D barcode support (ISBN, UPC-A), uses getUserMedia, actively maintained over html5-qrcode
- **Dexie.js 4.x:** IndexedDB wrapper — ~3M weekly downloads, ORM-like API, handles Safari IndexedDB quirks gracefully
- **googleapis + @google-cloud/local-auth:** Google Sheets API integration
- **cheerio 1.0.x:** HTML parsing for AR scrape results

**Note:** Architecture research mentioned ZXing but stack research recommends Quagga2 for 1D barcodes. Use Quagga2 as primary (better maintained for ISBN), with native BarcodeDetector as progressive enhancement on Chrome Android.

### Expected Features

**Must have (table stakes):**
- Barcode/ISBN scanning — core use case, must work quickly and reliably
- Auto-populated book metadata — Google Books API, users won't manually type titles
- View library/collection — basic inventory management
- Export/share library data — parents need to share with schools
- Book details display — verify correct book was scanned

**Should have (competitive differentiators):**
- AR level/points auto-fetch — parents' core pain point, avoids manual arbookfind.com lookup
- Mark book as read with date — basic progress tracking
- Quiz score entry with date — record AR quiz results
- Google Sheets export — share data with schools (no competitor offers this)

**Defer to v2+:**
- AR book recommendations — complex ML/recommendation system, hard to do well
- Reading streaks/gamification badges — engagement features after PMF established
- Batch scanning mode — scan multiple books quickly
- School direct integration — Renaissance doesn't offer public API

### Architecture Approach

The recommended architecture is **local-first with cloud sync**. IndexedDB (via Dexie.js) is the source of truth — all reads come from local DB, syncing happens in background. This enables offline operation which is critical for parents scanning books at home.

**Major components:**
1. **PWA Shell (SvelteKit + vite-plugin-pwa):** App shell with service worker for offline caching and background sync
2. **Scanner UI + BarcodeService (Quagga2):** Camera access, barcode detection, ISBN extraction
3. **IndexedDB (Dexie.js):** Local data persistence, sync queue for pending writes
4. **BFF Proxy (Hono):** Server-side scraping of arbookfind.com (CORS), Google Sheets API proxy
5. **API Services:** Google Books (book metadata), AR lookup (BFF proxy), Google Sheets (sync)

Key patterns: App Shell Architecture (precached minimal assets), Optimistic UI (immediate local update, background sync), BFF Proxy (AR scrape + Sheets proxy).

### Critical Pitfalls

1. **iOS Barcode Scanner Unreliability** — iOS Safari has inconsistent BarcodeDetector support and camera issues. Use Quagga2 as primary scanner, configure iOS-friendly camera constraints, always provide manual ISBN entry fallback.

2. **AR BookFinder Scrape Breakage** — Renaissance changes site structure frequently. Design for failure: AR data is always optional, never block book adding. Cache successful lookups, implement manual entry fallback.

3. **Offline Writes Disappearing** — User adds books offline but data never syncs. Implement outbound sync queue pattern: on any write, add to queue. On reconnect, process queue with retry.

4. **IndexedDB Safari Corruption** — Safari has critical IndexedDB bugs (WAL file grows unbounded, silent write failures). Use Dexie.js wrapper, wrap writes in transactions, implement storage quota monitoring.

5. **PWA Service Worker Caching Stale HTML** — Users see old content after deploy. Never use Cache First for HTML — use Network First with cache fallback. Implement update available prompt.

6. **Google Sheets Rate Limit Hits** — Individual row writes hit 100 req/100s limit. Always use batch writes (up to 500 operations), implement queue with rate limiting, exponential backoff on 429.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Core Flow
**Rationale:** The most important feature is scan → add book. Validate this first before adding complexity. Foundation enables everything else.

**Delivers:**
- PWA shell with service worker (vite-plugin-pwa)
- Barcode scanning with Quagga2 (iOS-friendly constraints)
- Manual book entry form (fallback)
- IndexedDB persistence via Dexie.js (books, syncQueue stores)
- Library view (list/grid)

**Avoids pitfalls:**
- iOS scanner unreliability (proper camera constraints)
- IndexedDB Safari corruption (Dexie.js wrapper)
- PWA stale HTML caching (Network First for pages)
- Offline writes disappearing (sync queue implementation)

---

### Phase 2: API Integrations
**Rationale:** Depends on scanner working. Adds value without changing data flow. AR lookup requires BFF proxy which adds infrastructure.

**Delivers:**
- Google Books API integration (book metadata, covers)
- BFF proxy (Hono) for AR scrape endpoint
- AR level/points auto-fetch with graceful degradation
- Manual AR entry fallback
- Open Library API as backup for missing books

**Avoids pitfalls:**
- Google Books missing books (ISBN-10/13 fallback, realistic User-Agent)
- AR scrape breakage (design for failure, cache successful lookups)

---

### Phase 3: Progress Tracking
**Rationale:** Depends on book storage working. Adds tracking value to existing books.

**Delivers:**
- Mark book as read with date
- Quiz score entry with date
- Reading history view
- Basic progress display/stats

---

### Phase 4: Cloud Sync & Export
**Rationale:** Final piece. Requires all data structures stable. Simplest to add last.

**Delivers:**
- Google Sheets API integration via BFF
- Background sync with rate limiting
- Batch writes (up to 500 operations)
- Sync status indicator (pending/synced/error)
- Export functionality

**Avoids pitfalls:**
- Google Sheets rate limits (batch writes, exponential backoff)

---

### Phase Ordering Rationale

1. **Foundation first:** Core flow (scan → add book) must work. All other features depend on books being stored.
2. **APIs second:** Google Books and AR lookup add value but don't change data flow. AR needs BFF proxy.
3. **Progress third:** Tracking features enhance existing books, don't require new infrastructure.
4. **Sync last:** All data structures stable, can design Sheets schema properly.

**Grouping rationale:** Features within phases share dependencies and can be tested together. Each phase produces a testable increment.

### Research Flags

**Needs deeper research during planning:**
- **Phase 2 (AR Lookup):** arbookfind.com scraping approach — need to verify current HTML structure and anti-bot measures. May need to research headless browser vs. simple fetch.
- **Phase 4 (Google Sheets):** Auth flow for family use — how to share access without complex OAuth for non-technical parents.

**Standard patterns (skip detailed research):**
- **Phase 1 (PWA Shell):** Well-documented via vite-plugin-pwa docs, MDN PWA guides
- **Phase 3 (Progress Tracking):** Simple CRUD with date fields, standard patterns
- **Phase 4 (Batch Writes):** Google Sheets API batch documentation is clear and stable

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified with official docs, npm stats, recent 2026 comparisons |
| Features | MEDIUM | Competitor analysis, AR domain knowledge; needs validation with actual users |
| Architecture | HIGH | Based on MDN PWA best practices, well-documented patterns (App Shell, Local-First) |
| Pitfalls | MEDIUM-HIGH | Based on community reports, Stack Overflow, GitHub issues; some are iOS/Safari-specific requiring real device testing |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **AR scrape implementation:** Research assumed BFF proxy with cheerio parsing, but current anti-bot measures may require headless browser (Puppeteer/Playwright). Verify during Phase 2 planning.
- **Multi-child profiles:** Not in MVP but mentioned in features. Define child data model early to avoid schema changes later.
- **User testing on iOS:** Several pitfalls are iOS-specific. Need real device testing before Phase 1 is considered complete.

## Sources

### Primary (HIGH confidence)
- [SvelteKit Documentation](https://svelte.dev/docs/kit) — Framework docs, routing, adapters
- [Hono Documentation](https://hono.dev/) — Official docs, TypeScript-first design
- [Dexie.js Documentation](https://dexie.org/) — IndexedDB wrapper, ORM features
- [MDN PWA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices) — HIGH
- [vite-plugin-pwa](https://vite-pwa.dev/) — PWA configuration
- [Quagga2 GitHub](https://github.com/ericblade/quagga2) — Active maintenance, 1D barcode focus
- [Google Sheets API Documentation](https://developers.google.com/workspace/sheets/api/guides/libraries) — HIGH

### Secondary (MEDIUM confidence)
- [Next.js vs SvelteKit vs Nuxt 2026](https://pkgpulse.com/blog/nextjs-vs-astro-vs-sveltekit-2026) — Framework comparison
- [SvelteKit vs Next.js 2026](https://pkgpulse.com/blog/sveltekit-vs-nextjs-2026-full-stack-comparison) — Bundle size analysis
- [Hono vs Express 2026](https://pkgpulse.com/blog/express-vs-hono-2026) — Backend framework comparison
- [PWA Offline-First Architecture Guide](https://needlecode.com/blog/pwa/complete-guide-to-offline-web-apps.html) — Architecture patterns
- [Dexie.js PWA Patterns](https://www.wellally.tech/blog/build-offline-pwa-react-dexie-workbox) — PWA patterns
- [Competitor analysis: AR Book Assistant, BookJar, Beanstack](https://apps.apple.com, https://play.google.com) — Feature landscape

### Tertiary (LOW confidence)
- [iOS Barcode Scanner Issues](https://stackoverflow.com/questions/79685913/inaccurate-unreliable-barcode-scanning-on-ios-web-app) — Anecdotal reports, needs real device testing
- [Google Books API Missing ISBNs](https://stackoverflow.com/questions/79574770/issues-retrieving-books-by-isbn-using-google-books-api) — Workarounds need validation

---
*Research completed: 2026-03-23*
*Ready for roadmap: yes*
