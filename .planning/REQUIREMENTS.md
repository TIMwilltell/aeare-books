# Requirements: AeAre Books

**Defined:** 2026-03-23
**Core Value:** Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

## v1 Requirements

### Barcode Scanning

- [ ] **SCAN-01**: User can scan a book barcode using phone camera
- [ ] **SCAN-02**: Camera barcode scanning works on iOS Safari
- [ ] **SCAN-03**: Camera barcode scanning works on Android Chrome
- [ ] **SCAN-04**: Manual ISBN entry fallback when camera unavailable

### Book Metadata

- [ ] **META-01**: App auto-populates title from Google Books API using scanned ISBN
- [ ] **META-02**: App auto-populates author from Google Books API
- [ ] **META-03**: App auto-populates cover thumbnail from Google Books API
- [ ] **META-04**: App handles Google Books API lookup failures gracefully
- [ ] **META-05**: App tries both ISBN-10 and ISBN-13 formats

### AR Data

- [ ] **AR-01**: App attempts to fetch AR level from arbookfind.com scrape via backend proxy
- [ ] **AR-02**: App attempts to fetch AR points from arbookfind.com
- [ ] **AR-03**: App includes manual AR level entry field as fallback
- [ ] **AR-04**: App indicates when AR data was fetched vs. manually entered
- [ ] **AR-05**: App caches successful AR lookups to reduce scrape frequency

### Library Management

- [ ] **LIB-01**: User can view list of all scanned books
- [ ] **LIB-02**: User can search/filter library by title or author
- [ ] **LIB-03**: User can view individual book details
- [ ] **LIB-04**: User can delete a book from library

### Reading Progress

- [ ] **READ-01**: User can mark a book as read
- [ ] **READ-02**: User can record date book was completed
- [ ] **READ-03**: User can enter AR quiz score (0-100)
- [ ] **READ-04**: User can record date of AR quiz attempt
- [ ] **READ-05**: App tracks sequence of all progress events (read date, quiz dates)
- [ ] **READ-06**: User can add notes to a book entry

### PWA & Offline

- [ ] **PWA-01**: App works offline (scan, view library, enter data)
- [ ] **PWA-02**: App syncs data when connection restored
- [ ] **PWA-03**: App can be installed to phone home screen
- [ ] **PWA-04**: App shows clear offline/online status indicator

### Data Export

- [ ] **EXPT-01**: User can export library data
- [ ] **EXPT-02**: Export includes all book fields and progress data

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
| SCAN-01 | Phase 1 | Pending |
| SCAN-02 | Phase 1 | Pending |
| SCAN-03 | Phase 1 | Pending |
| SCAN-04 | Phase 1 | Pending |
| META-01 | Phase 2 | Pending |
| META-02 | Phase 2 | Pending |
| META-03 | Phase 2 | Pending |
| META-04 | Phase 2 | Pending |
| META-05 | Phase 2 | Pending |
| AR-01 | Phase 2 | Pending |
| AR-02 | Phase 2 | Pending |
| AR-03 | Phase 2 | Pending |
| AR-04 | Phase 2 | Pending |
| AR-05 | Phase 2 | Pending |
| LIB-01 | Phase 1 | Pending |
| LIB-02 | Phase 1 | Pending |
| LIB-03 | Phase 1 | Pending |
| LIB-04 | Phase 1 | Pending |
| READ-01 | Phase 3 | Pending |
| READ-02 | Phase 3 | Pending |
| READ-03 | Phase 3 | Pending |
| READ-04 | Phase 3 | Pending |
| READ-05 | Phase 3 | Pending |
| READ-06 | Phase 3 | Pending |
| PWA-01 | Phase 1 | Pending |
| PWA-02 | Phase 4 | Pending |
| PWA-03 | Phase 1 | Pending |
| PWA-04 | Phase 4 | Pending |
| EXPT-01 | Phase 4 | Pending |
| EXPT-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-23*
*Last updated: 2026-03-23 after initial definition*
