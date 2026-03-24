# Feature Research

**Domain:** Book scanning/library tracking PWA with AR reading progress
**Researched:** 2026-03-23
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Barcode/ISBN scanning | Core use case — must work quickly and reliably | MEDIUM | Requires camera permission, offline fallback needed |
| Auto-populated book metadata | Users won't manually type titles/authors | LOW | Google Books API is reliable and free |
| View library/collection | Basic inventory management | LOW | List and grid views |
| Export/share library data | Parents need to share with schools/teachers | LOW | Google Sheets integration already planned |
| Book details display | Verify correct book was scanned | LOW | Title, author, cover, ISBN |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable for this specific niche.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AR level/points auto-fetch | Parents' core pain point — avoiding manual lookup on arbookfind.com | MEDIUM | Fragile scrape, requires graceful degradation |
| AR BookFinder search | Find books by AR level/points before reading | MEDIUM | Enhances before-you-read workflow |
| Multi-child profile support | Families with 2+ kids in AR programs | LOW | Separate goals, scores, libraries |
| Quiz score tracking | Track AR comprehension quiz results | LOW | Manual entry with date |
| Reading date tracking | Show reading history timeline | LOW | Mark book as read with date |
| AR goal progress visualization | Gamification — see progress toward goals | MEDIUM | Points earned vs. target |
| Offline scan queue | Catalog books without connectivity | MEDIUM | PWA offline capability |
| AR book recommendations | Suggest books at child's reading level | HIGH | Complex to implement well |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time sync across devices | "My data should be on all my devices" | Complexity explosion — auth, conflict resolution, storage | Single-device local-first with manual export |
| Social features/sharing | Goodreads-style reviews, friends | Scope creep, moderation burden, not core value | Keep focus on catalog + AR tracking |
| School integration (direct) | Teachers want automatic AR sync | Renaissance doesn't offer public API, privacy concerns, school-by-school config | Parents manually record what schools report |
| Book recommendations engine | "Tell me what to read next" | Hard to do well, needs ML/recommendation system | Basic filtering by AR level instead |
| In-app AR quizzing | Take quizzes in the app | Requires Renaissance partnership, large quiz database | Keep as out-of-scope; kids quiz at school |
| Automatic reading time detection | Track reading without manual entry | Privacy concerns, unreliable, requires constant monitoring | Manual "mark as read" with timer suggestion |

## Feature Dependencies

```
[Barcode Scanning]
       └──requires──> [Book Metadata Lookup]
                              └──optional──> [AR Data Fetch]
                                               └──requires──> [AR Scrape Backend]

[Book Details Display] ──enhances──> [Barcode Scanning]

[Multi-Child Profiles]
       └──contains──> [Child Goals]
       └──contains──> [Quiz Score History]
       └──contains──> [Read History]

[Library Export] ──enhances──> [Library View]

[Offline Queue] ──conflicts──> [Real-time Sync] (choose one)
```

### Dependency Notes

- **Barcode scanning requires book metadata lookup:** Can't show a book without first looking it up
- **AR data fetch requires backend:** Browser CORS prevents direct scraping; backend proxy needed
- **Multi-child profiles contains multiple sub-features:** Each child needs separate goals, scores, and history
- **Offline queue conflicts with real-time sync:** Different architecture approaches; AeAre chooses offline-first

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Barcode scanning — core use case must work
- [ ] Google Books auto-populate — avoid manual typing
- [ ] AR level/points fetch with graceful fallback — the key differentiator
- [ ] Basic library view — see what you've cataloged
- [ ] Mark book as read with date — basic progress tracking
- [ ] Quiz score entry with date — record AR quiz results
- [ ] Library export to Google Sheets — share with schools

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Multi-child profiles — families with 2+ kids
- [ ] AR goal tracking with visual progress — gamification
- [ ] Offline scan queue — scan books without connection
- [ ] AR-level filtering when searching — find books at right level

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] AR book recommendations based on level — complex ML/recommendations
- [ ] Reading streaks/gamification badges — engagement features
- [ ] Batch scanning mode — scan multiple books quickly
- [ ] Barcode-to-AR lookup without Google Books — faster for AR-only users

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Barcode scanning | HIGH | MEDIUM | P1 |
| Google Books auto-populate | HIGH | LOW | P1 |
| AR level/points fetch | HIGH | MEDIUM | P1 |
| Graceful AR fallback (manual) | HIGH | LOW | P1 |
| Mark book as read (date) | HIGH | LOW | P1 |
| Quiz score entry (date) | HIGH | LOW | P1 |
| Library view | HIGH | LOW | P1 |
| Export to Google Sheets | HIGH | MEDIUM | P1 |
| Multi-child profiles | MEDIUM | LOW | P2 |
| Offline scan queue | MEDIUM | MEDIUM | P2 |
| AR goal progress visualization | MEDIUM | MEDIUM | P2 |
| AR-level filtering/search | LOW | MEDIUM | P3 |
| Book recommendations | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | AR Book Assistant | BookJar | Beanstack | Our Approach |
|---------|------------------|---------|-----------|---------------|
| Barcode scanning | Yes | No | Yes | Yes — core flow |
| Google Books lookup | Implicit | No | No | Yes — for metadata |
| AR level/points | Yes (scraped) | Yes | Via integration | Yes (scraped) + fallback |
| Quiz score tracking | Yes | No | Yes | Yes — manual entry |
| Multi-child profiles | Yes (up to 4) | Yes | Yes | Yes |
| Goal tracking | Yes | Yes | Yes | Yes |
| Offline capability | No info | No info | Yes | Yes — PWA |
| Export/share | No info | No | Yes | Yes — Google Sheets |
| Reading date tracking | Yes | Yes | Yes | Yes |
| School integration | No | No | Yes (Epic) | No — out of scope |

### Key Insights from Competitors

1. **AR Book Assistant (iOS, launched 2024)** is the closest competitor — barcode + AR lookup + quiz tracking + multi-child. Our advantage: PWA (works in any browser, no install), Google Sheets export.

2. **BookJar** simplified to AR goal lists only — no quiz tracking, no scanning. Our advantage: faster cataloging with barcode scan.

3. **Beanstack** is school-focused with heavy admin features — overkill for parent use. Our advantage: simpler, focused on individual/family use.

4. **No competitor offers Google Sheets export** — this is a differentiator for parents who need to share data with schools.

## Sources

- Competitor analysis: AR Book Assistant (App Store), BookJar (Medium blog 2019), Beanstack (website), LibraryThing (App Store/Play Store), Libib (Play Store)
- Book catalog app comparison: makeheadway.com (2026), isbndb.com blog (2025), tidymalism.com (2026), booktrack.app (2025)
- AR program information: Renaissance Learning (official), Twinkl parent guide (2025), AR BookFinder (arbookfind.com)
- PWA best practices: MDN Web Docs (2025), Scanbot SDK tutorials

---
*Feature research for: AeAre Books PWA*
*Researched: 2026-03-23*
