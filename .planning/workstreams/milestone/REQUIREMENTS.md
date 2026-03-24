# Requirements: AeAre Books

**Defined:** 2026-03-23
**Core Value:** Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

## v1 Requirements

### Barcode Scanning

- [x] **SCAN-01**: User can scan a book barcode using phone camera
- [x] **SCAN-02**: Camera barcode scanning works on iOS Safari
- [x] **SCAN-03**: Camera barcode scanning works on Android Chrome
- [x] **SCAN-04**: Manual ISBN entry fallback when camera unavailable

### Book Metadata

- [x] **META-01**: App auto-populates title from Google Books API using scanned ISBN
- [x] **META-02**: App auto-populates author from Google Books API
- [x] **META-03**: App auto-populates cover thumbnail from Google Books API
- [x] **META-04**: App handles Google Books API lookup failures gracefully
- [x] **META-05**: App tries both ISBN-10 and ISBN-13 formats

### AR Data

- [x] **AR-01**: App attempts to fetch AR level from arbookfind.com scrape via backend proxy
- [x] **AR-02**: App attempts to fetch AR points from arbookfind.com
- [x] **AR-03**: App includes manual AR level entry field as fallback
- [x] **AR-04**: App indicates when AR data was fetched vs. manually entered
- [x] **AR-05**: App caches successful AR lookups to reduce scrape frequency

### Library Management

- [x] **LIB-01**: User can view list of all scanned books
- [x] **LIB-02**: User can search/filter library by title or author
- [x] **LIB-03**: User can view individual book details
- [x] **LIB-04**: User can delete a book from library

### Reading Progress

- [x] **READ-01**: User can mark a book as read
- [x] **READ-02**: User can record date book was completed
- [x] **READ-03**: User can enter AR quiz score (0-100)
- [x] **READ-04**: User can record date of AR quiz attempt
- [x] **READ-05**: App tracks sequence of all progress events (read date, quiz dates)
- [x] **READ-06**: User can add notes to a book entry

### PWA & Offline

- [x] **PWA-01**: App works offline (scan, view library, enter data)
- [x] **PWA-02**: App syncs data when connection restored
- [x] **PWA-03**: App can be installed to phone home screen
- [x] **PWA-04**: App shows clear offline/online status indicator

### Data Export

- [x] **EXPT-01**: User can export library data
- [x] **EXPT-02**: Export includes all book fields and progress data

## v2 Requirements

### Multi-Child Profiles

- **PROF-01**: User can create profiles for multiple children
- **PROF-02**: User can assign books to specific child profiles
- **PROF-03**: User can view reading progress per child

### Goal Tracking

- **GOAL-01**: User can set AR point goals per child
- **GOAL-02**: App shows progress toward goal

### Batch Operations

- **BATCH-01**: User can scan multiple books in succession without leaving scan mode
- **BATCH-02**: User can review and confirm all scanned books before saving

## Out of Scope

| Feature | Reason |
|---------|--------|
| App store native app | PWA works on all platforms, no app store required |
| User authentication | Single device/family use, no multi-user accounts needed |
| School integration | Would require API access Renaissance doesn't provide |
| Real-time sync across devices | Adds complexity without value for single-user use case |
| Reading recommendations | Outside core value prop |
| Barcode lookup history | Not needed for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

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
| PWA-01 | Phase 1 | Complete |
| PWA-02 | Phase 4 | Complete |
| PWA-03 | Phase 1 | Complete |
| PWA-04 | Phase 4 | Complete |
| EXPT-01 | Phase 4 | Complete |
| EXPT-02 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after roadmap creation*
