# Pitfalls Research

**Domain:** Book scanning/library tracking PWA for AR reading progress
**Researched:** 2026-03-23
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### Pitfall 1: iOS Barcode Scanner Unreliability

**What goes wrong:**
Barcode scanning works great on Android but fails completely or reads wrong barcodes on iOS Safari. Users scan a book and get wrong ISBN, or camera never detects barcode.

**Why it happens:**
- iOS Safari has inconsistent BarcodeDetector API support
- iOS camera focus issues with small barcode symbols
- Camera constraints (resolution, facing mode) not properly configured for iOS
- Some iOS versions have permission handling bugs

**How to avoid:**
1. Use `@zxing/library` as primary scanner (not native BarcodeDetector) on iOS
2. Configure camera with specific iOS-friendly constraints:
   ```javascript
   {
     facingMode: 'environment',
     width: { ideal: 1280, min: 640 },
     height: { ideal: 720, min: 480 }
   }
   ```
3. Throttle scan loop (don't scan every frame)
4. Add visual feedback (scanning indicator, detected region highlight)
5. Always provide manual ISBN entry fallback

**Warning signs:**
- Users on iOS report "camera not working" or "can't scan"
- Wrong books appearing after scan
- Scan succeeds on Android but fails on iPhone

**Phase to address:** Phase 1 (MVP) — barcode scanning is core functionality

---

### Pitfall 2: Google Books API Missing Books

**What goes wrong:**
ISBN search returns zero results even though book exists on Google Books website. Users scan a barcode and get "book not found" despite valid book.

**Why it happens:**
- Google Books database is incomplete for some ISBNs
- ISBN-10 vs ISBN-13 conversion issues
- API requires specific User-Agent header or returns empty results
- Books exist on website but not indexed in API

**How to avoid:**
1. Try both ISBN-10 and ISBN-13 search formats
2. Include realistic User-Agent header (not "python-requests/X")
3. Fall back to general search (just ISBN number without "isbn:" prefix) if prefix search fails
4. Have manual entry ready for books not found
5. Consider Open Library API as backup: `https://openlibrary.org/isbn/{isbn}.json`

**Warning signs:**
- Users with older books report "not found" errors
- Specific publishers' books missing
- Inconsistent results between ISBN-10 and ISBN-13

**Phase to address:** Phase 1 — API integration core feature

---

### Pitfall 3: AR BookFinder Scrape Breakage

**What goes wrong:**
AR level/points suddenly stop fetching. Users see blank AR data for books that should have it. Backend returns errors or empty results.

**Why it happens:**
- Renaissance (owner of arbookfind.com) changes HTML structure
- Anti-bot protection (Cloudflare, CAPTCHA) blocks requests
- IP rate limiting after too many requests
- Backend CORS issues if not properly configured

**How to avoid:**
1. **Design for failure** — AR data is always optional, never block book adding
2. Implement graceful degradation: show "AR data unavailable" with manual entry option
3. Add monitoring for scrape failure rates
4. Version your scraper: detect HTML structure changes, alert on breakage
5. Use residential proxies if scraping at scale (but this adds cost/complexity)
6. Consider caching successful lookups — same book won't need re-scrape
7. Include proper User-Agent and request headers to appear more human

**Warning signs:**
- Error logs showing parse failures on arbookfind.com
- Sudden spike in "manual AR entry" user selections
- 403/CAPTCHA responses from scrape endpoint

**Phase to address:** Phase 2 — AR integration enhancement

---

### Pitfall 4: PWA Service Worker Caching Stale HTML

**What goes wrong:**
Users install PWA, then a week later see old content. New features don't appear. Data looks wrong because they're seeing cached version.

**Why it happens:**
- Service Worker uses "Cache First" strategy for HTML pages
- Browser serves cached HTML without checking server for updates
- Static assets (JS/CSS) may update but HTML references old versions
- Users never see "update available" prompt

**How to avoid:**
1. **Never use Cache First for HTML** — use Network First with cache fallback
2. Use `skipWaiting()` and `clientsClaim()` for immediate updates
3. Show "Update available" prompt when new service worker activates
4. Cache static assets (JS, CSS, fonts) with Cache First — this is fine
5. Test service worker updates before shipping

```javascript
// Service Worker - CORRECT approach for HTML
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    // Network first for HTML, fallback to cache
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});
```

**Warning signs:**
- Users reporting "old version" or "features not appearing"
- Analytics showing stale behavior after deploy
- Complaints about "broken" features that were actually fixed

**Phase to address:** Phase 1 — PWA setup

---

### Pitfall 5: IndexedDB Safari Corruption

**What goes wrong:**
Data gets corrupted or silently fails on Safari iOS. Users lose reading history. App works fine on Chrome but loses data on iPhone.

**Why it happens:**
- Safari has critical IndexedDB bugs: WAL file grows unbounded
- Safari can silently fail to persist data without throwing errors
- Multiple browser tabs writing simultaneously causes corruption
- Storage quota exceeded but not caught gracefully

**How to avoid:**
1. Use **Dexie.js** wrapper instead of raw IndexedDB — handles Safari quirks
2. Wrap writes in transactions with error handling
3. Implement storage quota monitoring:
   ```javascript
   if (navigator.storage && navigator.storage.estimate) {
     const quota = await navigator.storage.estimate();
     if (quota.usage / quota.quota > 0.9) {
       // Warn user or clean old data
     }
   }
   ```
4. Handle `QuotaExceededError` specifically
5. Avoid multiple-tab writes (use Web Locks API if supported)
6. Test on actual Safari iOS — not just Chrome

**Warning signs:**
- Data missing on iOS after refresh
- "Storage Full" errors on Safari only
- Corrupted book entries (half-written records)

**Phase to address:** Phase 1 — data storage layer

---

### Pitfall 6: Offline Writes Disappear

**What goes wrong:**
User adds books offline, sees confirmation, but data never syncs when they go online. Reading history vanishes.

**Why it happens:**
- No outbound queue for offline writes
- Writes happen locally but no sync mechanism when online
- Background Sync API not implemented or not working
- Network success assumed without verification

**How to avoid:**
1. Implement outbound queue pattern:
   ```javascript
   // On any write:
   await db.books.add(book);
   await syncQueue.add({ action: 'add', data: book, timestamp: Date.now() });
   
   // On reconnect:
   await processQueue(); // retry failed syncs
   ```
2. Use Background Sync API for reliable retry
3. Show sync status indicator (pending/synced/error)
4. Handle conflicts (same book edited on multiple sessions)
5. Implement "last write wins" or timestamp-based merge

**Warning signs:**
- Users complaining books disappear after going offline
- Duplicate entries when coming back online
- "Pending sync" items never syncing

**Phase to address:** Phase 1 — offline support

---

### Pitfall 7: Google Sheets Rate Limit Hits

**What goes wrong:**
App stops working when writing to Google Sheets. User gets errors, data not saved. Works for a while then suddenly breaks.

**Why it happens:**
- Google Sheets API has 100 requests per 100 seconds per user limit
- Batch operations not used — individual writes instead
- No retry logic with exponential backoff
- Multiple books added rapidly triggers rate limit

**How to avoid:**
1. **Always use batch writes** — group up to 500 operations per request
2. Implement queue with rate limiting:
   ```javascript
   class RateLimitedSheetsClient {
     async write(data) {
       await this.queue.add(data);
       // Process queue with 1 request per second
     }
   }
   ```
3. Add retry with exponential backoff (wait 2s, 4s, 8s on 429)
4. Cache locally and write in batches, not individual writes
5. Monitor quota usage in production

**Warning signs:**
- Intermittent "quota exceeded" errors
- First few books save, then subsequent ones fail
- Errors appear after bulk operations

**Phase to address:** Phase 2 — Google Sheets integration

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip AR graceful degradation | Faster initial build | App breaks when scrape fails; user trust lost | Never — AR scrape is inherently fragile |
| Use localStorage instead of IndexedDB | Simpler code | 5MB limit, JSON corruption on large data | Never for book library |
| No service worker versioning | Works immediately | Users see stale content forever | Never |
| Write directly to Google Sheets on each book add | Simple logic | Rate limits hit quickly | MVP only, refactor to batch before launch |
| Skip offline sync queue | "Works online" | Data lost when offline | Never |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Google Books API | Query `isbn:978...` fails for some books | Try both `isbn:{isbn}` and just `{isbn}` without prefix; try both ISBN-10 and ISBN-13 |
| Google Books API | No User-Agent header causes empty results | Include realistic browser User-Agent header |
| arbookfind.com | Sending bare requests triggers bot detection | Use headless browser (Puppeteer/Playwright) or residential proxies |
| arbookfind.com | No error handling when site changes | Wrap in try/catch, return null, show "AR unavailable" |
| Google Sheets API | Writing row-by-row | Batch writes (up to 500 rows per request) |
| Google Sheets API | Ignoring 429 rate limit | Exponential backoff, implement request queue |
| Barcode scanning | Relying on native BarcodeDetector | Use @zxing/library as primary, native as fallback |
| Camera API | Not requesting permissions properly | Use `getUserMedia` with clear user-facing permission explanation |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Large IndexedDB on mobile | App slow to load, storage warnings | Prune old quiz records, limit in-memory indices | 50+ books, Safari iOS |
| Unthrottled barcode scanning | High CPU, battery drain, overheating | Throttle to 100-200ms between scans | iOS devices, older phones |
| No sync batching | Google Sheets rate limits hit | Queue writes, batch every 5-10 books | More than 10 books added quickly |
| Aggressive caching | Old content served, "zombie" data | Network-first for HTML, cache-first for assets only | After any deploy |
| Multiple tab IndexedDB writes | Data corruption, lost writes | Web Locks API or restrict to single tab | Safari iOS |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing Google OAuth tokens in localStorage | Token theft if XSS occurs | Use httpOnly cookies or encrypted storage |
| Logging ISBNs/book titles to console in production | Privacy leak (reading habits exposed) | Strip sensitive data from logs in production |
| Not validating scanned ISBNs before API call | Invalid input to external API | Sanitize: strip non-numeric, validate length (10 or 13) |
| Scraping AR site without rate limiting | IP ban, legal issues | Respect robots.txt, add delays between requests |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No manual entry fallback | App useless when scan fails | Always show "Enter ISBN manually" option |
| AR scrape failure = error screen | User can't continue | Show "AR data unavailable — enter manually" with prefilled AR fields |
| No sync status indicator | User doesn't know if data saved | Show "Saved locally" → "Synced to Sheets" progression |
| Loading spinner for 10+ seconds | User thinks app is broken | Progress indication, "Looking up book..." with cancel option |
| No offline indicator | User adds books offline, thinks they're saved | Banner: "You're offline — books will sync when connected" |
| Not caching successful AR lookups | Same book re-scraped every time | Store AR data locally after first successful scrape |

---

## "Looks Done But Isn't" Checklist

- [ ] **Barcode Scanner:** Often missing iOS-specific camera constraints — verify works on iPhone 12+ Safari
- [ ] **Google Books:** Often missing ISBN-10/ISBN-13 fallback — verify books with only ISBN-10 work
- [ ] **AR Scrape:** Often has no error handling — verify shows user-friendly message when site is down
- [ ] **PWA:** Often caches HTML with Cache First — verify updates appear within 24 hours
- [ ] **IndexedDB:** Often uses raw API — verify data persists on Safari iOS after app restart
- [ ] **Offline:** Often has no sync queue — verify offline-added books appear in Google Sheets after reconnect
- [ ] **Google Sheets:** Often batch-writes incorrectly — verify adding 20 books doesn't hit rate limit

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| AR scrape broken | LOW | 1) Detect via error monitoring 2) Update scraper selector 3) Deploy within hours |
| iOS scan failure | MEDIUM | 1) Add @zxing/library fallback 2) Adjust camera constraints 3) Test on real iOS device |
| IndexedDB corruption | MEDIUM | 1) Detect via data validation 2) Export to Google Sheets as backup 3) Clear corrupt DB, re-sync from Sheets |
| Google Sheets rate limit | LOW | 1) Implement exponential backoff 2) Clear queue 3) Resume with batching |
| Service worker serving stale HTML | MEDIUM | 1) Push updated SW 2) Force skipWaiting 3) Users may need to clear site data |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| iOS Barcode Scanner | Phase 1 | Test on iPhone with various iOS versions |
| Google Books missing books | Phase 1 | Test with ISBN-10-only books, verify fallback works |
| AR scrape breakage | Phase 2 | Monitor error rate, test with multiple books |
| PWA stale HTML caching | Phase 1 | Deploy update, verify users see new content |
| IndexedDB Safari issues | Phase 1 | Test on Safari iOS, add/remove books, restart app |
| Offline writes disappear | Phase 1 | Go offline, add books, reconnect, verify in Sheets |
| Google Sheets rate limits | Phase 2 | Load test with 50+ rapid adds |

---

## Sources

- [iOS Barcode Scanner Issues - Stack Overflow](https://stackoverflow.com/questions/79685913/inaccurate-unreliable-barcode-scanning-on-ios-web-app) — iOS Safari specific problems
- [BarcodeDetector API Support - barcodefyi.com](https://barcodefyi.com/guide/barcode-scanning-pwa/) — Browser compatibility matrix
- [Google Books API Missing ISBNs - Stack Overflow](https://stackoverflow.com/questions/79574770/issues-retrieving-books-by-isbn-using-google-books-api) — ISBN search workaround
- [Web Scraping Anti-Detection 2026](https://use-apify.com/blog/web-scraping-anti-detection-2026) — Modern bot detection challenges
- [IndexedDB Safari Issues - GitHub Gist](https://gist.github.com/pesterhazy/4de96193af89a6dd5ce682ce2adff49a) — Known Safari IndexedDB bugs
- [8 PWA Integration Mistakes 2026](https://webscraft.org/blog/8-kritichnih-pomilok-pri-integratsiyi-pwa-stsenariyi-prichini-ta-rishennya-z-kodom?lang=en) — Service worker caching pitfalls
- [Google Sheets API Rate Limits](https://thecodersblog.com/fix-google-sheets-api-rate-limiting-permission-errors-2025/) — Quota management strategies
- [Dexie.js - IndexedDB wrapper](https://dexie.org/) — Recommended IndexedDB abstraction
- [Offline-First PWA Architecture](https://wild.codes/candidate-toolkit-question/how-would-you-architect-a-pwa-for-offline-first-and-real-time-sync) — Sync patterns
---

# Design Spec Creation Pitfalls (Designer Handoff)

**Domain:** Mobile PWA Design Spec Creation & Designer Handoff
**Researched:** 2026-03-24
**Confidence:** HIGH

## Critical Pitfalls for Design Specs

### Pitfall 1: Specifying Without PWA Install Requirements

**What goes wrong:**
The designed PWA fails to meet installability criteria, users cannot add the app to their home screen, or the installed app lacks proper branding (missing icons, wrong display mode, generic splash screen).

**Why it happens:**
Designers focus on screen layouts without understanding PWA installability requirements. Web App Manifest fields (icons, theme_color, display mode, start_url) require specific visual assets and configuration that designers rarely include in specs.

**How to avoid:**
Include a PWA Install Requirements section in the design spec:
- Icon specifications: 192x192 and 512x512 PNG, plus maskable variants
- Theme color and background color for splash screen
- Display mode (standalone, fullscreen, minimal-ui)
- Start URL and scope
- Custom install prompt UI (deferring browser defaults)

**Warning signs:**
- No icon specifications in the design spec
- No discussion of "add to home screen" experience
- Designer doesn't mention manifest or service worker

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 2: Missing Component States

**What goes wrong:**
Developers implement only default states, missing hover, focus, disabled, loading, and error states. The implemented UI feels incomplete and appears broken in edge cases.

**Why it happens:**
Designers create beautiful default states in Figma but assume other states are "obvious" or can be derived intuitively. Developers receive no guidance on these states and prioritize shipping the happy path.

**How to avoid:**
Document every interactive component's complete state matrix:
- Default, hover, focus, active, disabled states for buttons
- Empty, loading, error, and populated states for data components
- Network states: online, offline, slow connection, timeout

**Warning signs:**
- Spec shows only one version of each component
- No discussion of error states or validation feedback
- No loading/skeleton states specified for async content

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 3: Undefined Responsive Behavior for Mobile

**What goes wrong:**
Designs work on design tool viewports but break on actual mobile screens. Elements overlap, text becomes unreadable, touch targets are too small, or horizontal scrolling appears.

**Why it happens:**
Designers create desktop-first or single-viewport designs without explicitly specifying breakpoint behavior. Mobile PWA layouts require specific handling of safe areas, notch/Dynamic Island areas, and touch target sizing.

**How to avoid:**
Specify explicit responsive behavior:
- Mobile-first viewport strategy with defined breakpoints
- Safe area insets for notched devices (env() CSS)
- Minimum touch target size: 44x44 CSS pixels
- Content padding for various screen widths
- Bottom navigation behavior (fixed vs. scroll-aware)

**Warning signs:**
- Only one viewport size shown in designs
- No mention of mobile-specific gestures or behaviors
- No specification for landscape orientation (if supported)

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 4: No Offline State Design

**What goes wrong:**
The PWA lacks offline fallback designs. Users see generic browser error pages when offline, or the app crashes instead of gracefully degrading.

**Why it happens:**
Designers assume always-online connectivity and don't design for offline-first PWA behavior. Offline is treated as an edge case rather than a core design condition.

**How to avoid:**
Design explicit offline states for every screen:
- Offline indicator (banner or toast)
- Offline fallback page for navigation attempts
- Cached content indication (subtle "available offline" badges)
- Pending sync indicator for offline actions

**Warning signs:**
- No discussion of offline behavior in requirements
- No offline page or state designs included
- App flow assumes network availability

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 5: Designer-Developer Language Mismatch

**What goes wrong:**
Developers implement designs incorrectly because specs use design-tool terminology without translation. Measurements get misinterpreted, spacing is applied inconsistently, and design intent is lost.

**Why it happens:**
Designers use Figma/Sketch terminology (padding vs. margin vs. gap) without clear CSS translation. Developers guess at implementation, leading to subtle but noticeable differences from intended design.

**How to avoid:**
Provide developer-ready specifications:
- Use CSS property names (margin, padding, gap, border-radius)
- Specify exact pixel values for all measurements
- Include code snippets for complex behaviors
- Provide a glossary of design terms with CSS equivalents

**Warning signs:**
- Spec uses terms like "whitespace" without specifying where
- Measurements are described qualitatively ("a bit more space")
- No CSS-idiomatic specification provided

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 6: Ignoring Animation Implementation Complexity

**What goes wrong:**
Animations specified as "slide in" or "fade" get implemented with different easing, duration, or trigger conditions. Micro-interactions feel off, and transitions create visual glitches.

**Why it happens:**
Designers describe animations qualitatively without specifying timing functions, durations, curve types, or trigger conditions. Developers implement "best guess" animations that differ from intent.

**How to avoid:**
Document animations with technical specifications:
- Animation type (ease-in, ease-out, ease-in-out, cubic-bezier)
- Duration in milliseconds
- Trigger conditions (on mount, on hover, on click, on appear)
- Property being animated (transform, opacity, height)
- Entrance vs. exit variations

**Warning signs:**
- Animations described with onomatopoeia ("whoosh", "pop")
- No duration or easing specified
- Complex multi-step animations without breakdown

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 7: Missing Edge Case Content Design

**What goes wrong:**
Designs use ideal content (short titles, populated fields, success states) but real data breaks layouts. Long book titles overflow cards, empty libraries show no guidance, error messages are missing.

**Why it happens:**
Designers use Lorem ipsum or carefully crafted placeholder content that doesn't represent real-world extremes. Content variation isn't tested against design boundaries.

**How to avoid:**
Include content variation examples:
- Minimum, typical, and maximum content lengths
- Empty state designs for all data-dependent screens
- Error state designs for all user actions
- Loading skeleton designs for async content

**Warning signs:**
- All placeholder content is same length
- No empty state designs included
- No long-content overflow handling specified

**Phase to address:**
v1.1 Design Spec Creation

---

### Pitfall 8: Handoff Without Shared Understanding

**What goes wrong:**
Designer hands off files and walks away. Developers have questions but don't know where to ask. Issues accumulate, decisions get made without design input, and final product diverges from intent.

**Why it happens:**
Handoff is treated as a one-time transfer rather than a process. No established channel for questions exists, and designers don't proactively schedule review checkpoints.

**How to avoid:**
Establish handoff process:
- Schedule design walkthrough meeting before implementation starts
- Create dedicated Slack/channel for design questions
- Plan design review checkpoints at implementation milestones
- Provide async Loom/video explanations for complex interactions

**Warning signs:**
- No handoff meeting scheduled
- Designer unavailable for questions during implementation
- No agreed-upon process for design clarifications

**Phase to address:**
v1.1 Design Spec Creation

---

## Design Spec Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Barcode Scanner UI | Spec doesn't address camera permission flow | Design permission request, denied state, and fallback |
| Google Books API | No loading or error states for API failures | Design spinner, timeout, error, and retry states |
| AR BookFind Scraping | No indication that scrape is in progress | Design loading state with progress indication |
| Google Sheets Sync | No offline queue or sync status | Design pending sync indicator and conflict UI |
| PWA Installation | Rely on browser default prompt only | Design custom install prompt with context |

---

## Design Spec "Looks Done But Isn't" Checklist

- [ ] **PWA Install:** Icons specified at required sizes (192, 512, maskable)? Display mode specified? Theme colors defined?
- [ ] **Component States:** All interactive elements have hover, focus, disabled states? Loading states for all async content?
- [ ] **Mobile Responsive:** Touch targets minimum 44px? Safe areas handled? Bottom nav doesn't overlap content?
- [ ] **Offline Design:** Offline indicator? Cached content marked? Fallback for failed requests?
- [ ] **Error States:** API failure UI? Validation errors? Empty states for all lists?
- [ ] **Content Extremes:** Long title handling? Maximum text lengths specified? Overflow behavior designed?
- [ ] **Animation Specs:** Durations? Easing curves? Trigger conditions?
- [ ] **Handoff Process:** Walkthrough scheduled? Q&A channel established? Review checkpoints planned?

---

## Design Spec Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing component states | MEDIUM | Implement during development, requires designer review |
| Undefined responsive behavior | HIGH | Test on real devices, iterate on layouts, may require design changes |
| No offline design | HIGH | Add offline states after core is built, requires new designs |
| Wrong icon sizes | LOW | Generate correct sizes, update manifest |
| Handoff misunderstandings | MEDIUM | Schedule clarification meetings, document decisions |

---

## Design Spec Sources

- LogRocket Blog: "Why most design specs fail developers" (2026-01)
- Web Designer Depot: "Design Handoff Pitfalls" (2025-02)
- Website Design Thinking: "Common Communication Problems Between Designers and Developers" (2026-01)
- Nielsen Norman Group: "5 Common Mistakes When Creating Design Specs" (2025-05)
- Digital Applied: "Progressive Web Apps 2026: Complete Development Guide" (2026-01)
- MDN: "Best Practices for PWAs" (2025-06)
- MoldStud: "Common Mistakes to Avoid in PWA User Experience Design" (2025-05)

---

*Pitfalls research for: Book scanning/library tracking PWA*
*Researched: 2026-03-23 (core project) / 2026-03-24 (design spec creation)*
