# Roadmap: AeAre Books

**Project:** AeAre Books - Book Scanning PWA
**Created:** 2026-03-23
**Granularity:** standard (5-8 phases)
**Parallelization:** enabled

## Core Value

Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

## Phases

- [x] **Phase 1: Foundation & Core Flow** - PWA shell, barcode scanning, library management ✅
- [x] **Phase 2: API Integrations** - Google Books metadata, AR lookup with BFF proxy (completed 2026-03-24)
- [x] **Phase 3: Progress Tracking** - Reading status, quiz scores, notes (completed 2026-03-24)
- [x] **Phase 4: Cloud Sync & Export** - Convex sync, offline handling, JSON export (completed 2026-03-24)

## Phase Details

### Phase 1: Foundation & Core Flow

**Goal:** Users can scan books and manage their library offline

**Depends on:** Nothing (first phase)

**Requirements:** SCAN-01, SCAN-02, SCAN-03, SCAN-04, LIB-01, LIB-02, LIB-03, LIB-04, PWA-03 ✅

**Success Criteria** (what must be TRUE):
1. ✅ User can scan a book barcode using phone camera on iOS Safari
2. ✅ User can scan a book barcode using phone camera on Android Chrome
3. ✅ User can manually enter ISBN when camera is unavailable
4. ✅ User can view list of all scanned books in library
5. ✅ User can search/filter library by title or author
6. ✅ User can view individual book details
7. ✅ User can delete a book from library
8. ✅ User can install app to phone home screen

**Plans:** 2 plans ✅

**Plan list:**
- [x] 01-01-PLAN.md — SvelteKit + PWA Shell Setup (f474f46)
- [x] 01-02-PLAN.md — Scanner + Library Management (f2e1ef2)

**UI hint:** yes

---

### Phase 2: API Integrations

**Goal:** Books are auto-populated with metadata from Google Books and AR data from arbookfind.com

**Depends on:** Phase 1

**Requirements:** META-01, META-02, META-03, META-04, META-05, AR-01, AR-02, AR-03, AR-04, AR-05

**Success Criteria** (what must be TRUE):
1. App auto-populates book title from Google Books after scanning ISBN
2. App auto-populates book author from Google Books
3. App auto-populates book cover thumbnail from Google Books
4. App gracefully handles Google Books lookup failures with error message
5. App attempts ISBN-10 fallback when ISBN-13 lookup fails
6. App attempts to fetch AR level via backend proxy from arbookfind.com
7. App attempts to fetch AR points via backend proxy
8. User can manually enter AR level when auto-fetch fails
9. App clearly indicates whether AR data was fetched or manually entered
10. App caches successful AR lookups to avoid repeated scrapes

**Plans:** 3/3 plans complete

**Plan list:**
- [x] 02-01-PLAN.md — Google Books API + AR Cache Setup
- [x] 02-02-PLAN.md — Playwright AR Lookup Endpoint
- [x] 02-03-PLAN.md — UI Integration (Lookup button, covers, AR fields)

**UI hint:** yes

---

### Phase 3: Progress Tracking

**Goal:** Users can track reading progress and quiz scores with dates

**Depends on:** Phase 1

**Requirements:** READ-01, READ-02, READ-03, READ-04, READ-05, READ-06

**Success Criteria** (what must be TRUE):
1. User can mark a book as read
2. User can record the date when book was completed
3. User can enter AR quiz score (0-100)
4. User can record the date of AR quiz attempt
5. User can add notes to a book entry
6. User can view chronological sequence of all progress events (scan, read, quiz dates)

**Plans:** 2/2 plans complete

**Plan list:**
- [x] 03-01-PLAN.md — Database Schema Updates
- [x] 03-02-PLAN.md — Detail Page Progress UI

**UI hint:** yes

---

### Phase 4: Cloud Sync & Export

**Goal:** Data syncs to Convex cloud and users can export their library to JSON

**Depends on:** Phase 2, Phase 3

**Requirements:** PWA-01, PWA-02, PWA-04, EXPT-01, EXPT-02

**Success Criteria** (what must be TRUE):
1. App works offline (can scan, view library, enter data without network)
2. App syncs data to Convex cloud when connection is restored
3. App shows clear indicator when offline vs online
4. User can export library data to JSON file
5. Export includes all book fields (title, author, AR data) and progress data (read dates, quiz scores)

**Plans:** 3/3 plans complete

**Plan list:**
- [x] 04-01-PLAN.md — Convex Setup + Backend Functions
- [x] 04-02-PLAN.md — Frontend Integration + Sync UI
- [x] 04-03-PLAN.md — JSON Export + Offline Testing

**UI hint:** yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Flow | 2/2 | Complete | 2026-03-24 |
| 2. API Integrations | 3/3 | Complete   | 2026-03-24 |
| 3. Progress Tracking | 2/2 | Complete   | 2026-03-24 |
| 4. Cloud Sync & Export | 3/3 | Complete   | 2026-03-24 |

## Coverage

- **v1 requirements:** 30 total
- **Mapped to phases:** 30
- **Unmapped:** 0 ✓

### Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCAN-01 | Phase 1 | Complete |
| SCAN-02 | Phase 1 | Complete |
| SCAN-03 | Phase 1 | Complete |
| SCAN-04 | Phase 1 | Complete |
| META-01 | Phase 2 | Complete |
| META-02 | Phase 2 | Complete |
| META-03 | Phase 2 | Complete |
| META-04 | Phase 2 | Complete |
| META-05 | Phase 2 | Complete |
| AR-01 | Phase 2 | Complete |
| AR-02 | Phase 2 | Complete |
| AR-03 | Phase 2 | Complete |
| AR-04 | Phase 2 | Complete |
| AR-05 | Phase 2 | Complete |
| LIB-01 | Phase 1 | Complete |
| LIB-02 | Phase 1 | Complete |
| LIB-03 | Phase 1 | Complete |
| LIB-04 | Phase 1 | Complete |
| READ-01 | Phase 3 | Complete |
| READ-02 | Phase 3 | Complete |
| READ-03 | Phase 3 | Complete |
| READ-04 | Phase 3 | Complete |
| READ-05 | Phase 3 | Complete |
| READ-06 | Phase 3 | Complete |
| PWA-01 | Phase 4 | Complete |
| PWA-02 | Phase 4 | Complete |
| PWA-03 | Phase 1 | Complete |
| PWA-04 | Phase 4 | Complete |
| EXPT-01 | Phase 4 | Complete |
| EXPT-02 | Phase 4 | Complete |

---

*Roadmap created: 2026-03-23*
