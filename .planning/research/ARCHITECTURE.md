# Architecture Research

**Domain:** Book Scanning / Library Tracking PWA
**Researched:** 2026-03-23
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PWA Client (Browser)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Scanner UI  │  │  Library UI  │  │ Progress UI  │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                  │                  │                       │
├─────────┴──────────────────┴──────────────────┴──────────────────────┤
│                      State Management Layer                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Zustand Store (connectivity, UI state, sync status)         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  IndexedDB (via idb) - Local source of truth                 │   │
│  │  • books store        • quiz_scores store                    │   │
│  │  • sync_queue store   • settings store                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                         Service Layer                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │ BarcodeService  │  │ BookAPIService   │  │ SyncService     │    │
│  │ (ZXing/quagga) │  │ (Google Books)   │  │ (Background)   │    │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘    │
├───────────┴──────────────────────┴──────────────────────┴─────────────┤
│                       Service Worker Layer                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Workbox - Caching, Background Sync, Offline Fallback        │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   External APIs    │
                    ├───────────────────┤
                    │  Google Books API  │ (metadata, covers)
                    │  arbookfind.com    │ (scraped via BFF)
                    │  Google Sheets API │ (cloud sync)
                    └───────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │   BFF Proxy (Edge)│
                    ├───────────────────┤
                    │  /api/ar-lookup   │ (CORS proxy + scraping)
                    │  /api/sheets      │ (Sheets read/write)
                    └───────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Scanner UI | Camera access, barcode detection UI, result display | React component with ZXing hook |
| Library UI | Book list, search/filter, book details | React component with React Query |
| Progress UI | Reading status, quiz scores, stats | React component |
| Zustand Store | Connectivity state, UI state, sync status | Zustand with persistence |
| IndexedDB | Local data persistence, sync queue | idb wrapper, Dexie.js |
| BarcodeService | Camera stream processing, barcode decoding | @zxing/browser or react-zxing |
| BookAPIService | Google Books API calls, AR lookup calls | Fetch wrapper with caching |
| SyncService | Background sync, conflict resolution | Workbox Background Sync |
| Service Worker | Asset caching, offline handling | Workbox with precache + stale-while-revalidate |
| BFF Proxy | AR scrape proxy, Sheets API proxy | Edge function / serverless |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home/scanner page
│   ├── library/
│   │   └── page.tsx            # Book library view
│   ├── book/
│   │   └── [id]/page.tsx       # Book detail page
│   └── settings/
│       └── page.tsx            # Settings/export
│
├── components/                  # UI components
│   ├── scanner/
│   │   ├── BarcodeScanner.tsx  # Camera + ZXing hook wrapper
│   │   ├── ScanResult.tsx      # Result display/form
│   │   └── CameraSelector.tsx  # Multi-camera handling
│   ├── library/
│   │   ├── BookCard.tsx        # Book list item
│   │   ├── BookGrid.tsx        # Grid layout
│   │   └── BookFilters.tsx     # Filter controls
│   ├── progress/
│   │   ├── ReadingStatus.tsx   # Mark as read
│   │   ├── QuizScoreForm.tsx   # Enter quiz score
│   │   └── ProgressChart.tsx   # Stats visualization
│   └── ui/                    # Shared UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       └── OfflineBanner.tsx
│
├── services/                    # API and business logic
│   ├── google-books.ts         # Google Books API client
│   ├── ar-lookup.ts           # AR Finder lookup (BFF proxy)
│   ├── sheets.ts              # Google Sheets sync
│   └── barcode.ts             # ZXing wrapper
│
├── stores/                     # State management
│   ├── useLibraryStore.ts     # Books state
│   ├── useSyncStore.ts        # Sync state
│   └── useOnlineStore.ts      # Connectivity state
│
├── lib/                        # Utilities and DB
│   ├── db.ts                  # IndexedDB setup (idb)
│   ├── sync-queue.ts         # Background sync logic
│   └── utils.ts               # Helpers
│
├── hooks/                      # Custom React hooks
│   ├── useBook.ts            # Book CRUD operations
│   ├── useScanner.ts         # Scanner state machine
│   └── useBackgroundSync.ts  # Sync trigger
│
├── types/                      # TypeScript definitions
│   ├── book.ts               # Book interfaces
│   ├── ar.ts                # AR data interfaces
│   └── sync.ts              # Sync queue types
│
└── styles/                     # Global styles
    └── globals.css
```

### Structure Rationale

- **`app/`:** Uses Next.js App Router for PWA shell, routing, and optional SSR
- **`components/scanner/`:** Isolates camera-specific code that may need special handling
- **`services/`:** API calls isolated for easy mocking/testing and caching configuration
- **`stores/`:** Zustand stores for UI state, keeping React Query for server state
- **`lib/`:** Database setup and sync logic separated from components
- **`hooks/`:** Custom hooks abstract data access patterns for components
- **`types/`:** Centralized TypeScript interfaces for type safety across layers

## Architectural Patterns

### Pattern 1: App Shell Architecture

**What:** Pre-cache the minimal HTML, CSS, JS to render the UI instantly, then load data dynamically.

**When:** PWA needs to feel instant on repeat visits and work offline.

**Trade-offs:** Fast but requires careful cache management on updates.

**Example:**
```typescript
// service-worker.ts (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Precache app shell (generated by build)
precacheAndRoute(self.__WB_MANIFEST);

// Cache-first for static assets
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({ cacheName: 'images' })
);

// Network-first for pages, falling back to cache
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new StaleWhileRevalidate({ cacheName: 'pages' })
);
```

### Pattern 2: Local-First Data Architecture

**What:** IndexedDB is the source of truth. All reads come from local DB. Sync to cloud happens in background.

**When:** Offline capability required, single-user, data persistence critical.

**Trade-offs:** Simpler than full sync but requires conflict resolution strategy if cloud state diverges.

**Example:**
```typescript
// lib/db.ts
import { openDB, DBSchema } from 'idb';

interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  arLevel?: number;
  arPoints?: number;
  coverUrl?: string;
  readDate?: string;
  quizScore?: number;
  quizDate?: string;
  updatedAt: number;
  syncedAt?: number;
}

interface AeAreDB extends DBSchema {
  books: {
    key: string;
    value: Book;
    indexes: { 'by-isbn': string; 'by-updated': number };
  };
  syncQueue: {
    key: string;
    value: { id: string; action: 'create' | 'update' | 'delete'; data: Book; timestamp: number };
  };
}

export async function getDB() {
  return openDB<AeAreDB>('aeaare-db', 1, {
    upgrade(db) {
      const bookStore = db.createObjectStore('books', { keyPath: 'id' });
      bookStore.createIndex('by-isbn', 'isbn');
      bookStore.createIndex('by-updated', 'updatedAt');
      
      db.createObjectStore('syncQueue', { keyPath: 'id' });
    },
  });
}

// Optimistic write
export async function saveBook(book: Book): Promise<void> {
  const db = await getDB();
  book.updatedAt = Date.now();
  await db.put('books', book);
  await queueSync('update', book);
}
```

### Pattern 3: Backend-for-Frontend (BFF) Proxy

**What:** Lightweight server-side layer that proxies scraping and external API calls, hiding secrets and avoiding CORS.

**When:** Need to scrape arbookfind.com, or when external APIs have CORS restrictions.

**Trade-offs:** Adds infrastructure but required for scraping. Can be edge function or simple server.

**Example:**
```typescript
// app/api/ar-lookup/route.ts (Next.js route handler)
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { isbn } = await request.json();
  
  try {
    // Scrape arbookfind.com server-side (CORS not an issue)
    const response = await fetch(`https://www.arbookfind.com/Search?type=isbn&q=${isbn}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const html = await response.text();
    // Parse AR level/points from HTML
    const arData = parseARFromHTML(html);
    
    return NextResponse.json(arData);
  } catch (error) {
    return NextResponse.json({ error: 'AR lookup failed' }, { status: 500 });
  }
}

function parseARFromHTML(html: string): { level?: string; points?: string } {
  // Extract from HTML structure - will need maintenance if Renaissance changes site
  const levelMatch = html.match(/AR Level[^>]*>(\d+\.?\d*)/i);
  const pointsMatch = html.match(/AR Points[^>]*>(\d+\.?\d*)/i);
  
  return {
    level: levelMatch?.[1],
    points: pointsMatch?.[1],
  };
}
```

### Pattern 4: Optimistic UI with Background Sync

**What:** Update UI immediately, queue sync operation, retry later if offline.

**When:** Users expect instant feedback but network may be unreliable.

**Trade-offs:** Great UX but requires handling sync failures and conflicts gracefully.

**Example:**
```typescript
// components/progress/QuizScoreForm.tsx
export function QuizScoreForm({ bookId }: { bookId: string }) {
  const [score, setScore] = useState('');
  const { saveBook } = useBook();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Optimistic update
    await saveBook({
      id: bookId,
      quizScore: parseInt(score),
      quizDate: new Date().toISOString(),
    });
    
    setScore('');
    // UI updates immediately; sync happens in background
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="number" 
        value={score} 
        onChange={(e) => setScore(e.target.value)}
        placeholder="Quiz score %"
        min="0"
        max="100"
      />
      <button type="submit">Save Score</button>
    </form>
  );
}
```

### Pattern 5: Zustand + React Query Separation

**What:** Zustand manages connectivity/UI state; React Query manages server state with IndexedDB as cache.

**When:** Need both server data (React Query) and client-only state (Zustand).

**Trade-offs:** More complexity but clear separation of concerns.

**Example:**
```typescript
// stores/useOnlineStore.ts (Zustand)
import { create } from 'zustand';

interface OnlineStore {
  isOnline: boolean;
  setOnline: (v: boolean) => void;
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (v) => set({ isOnline: v }),
}));

// hooks/useBackgroundSync.ts
export function useBackgroundSync() {
  const isOnline = useOnlineStore((s) => s.isOnline);
  
  useEffect(() => {
    const handleOnline = () => useOnlineStore.getState().setOnline(true);
    const handleOffline = () => useOnlineStore.getState().setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Trigger sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncPendingChanges();
    }
  }, [isOnline]);
}
```

## Data Flow

### Request Flow: Scan Book

```
[User scans barcode]
    ↓
[BarcodeScanner component] → [ZXing decodes barcode]
    ↓
[BookAPIService] → [Google Books API: GET /volumes?q=isbn:{isbn}]
    ↓
[Parse response] → [Extract title, author, cover, ISBN]
    ↓
[Book saved to IndexedDB] → [Display result form]
    ↓
[User confirms/edits] → [Save complete book record]
    ↓
[SyncQueue] → [Background: POST to Google Sheets]
```

### Request Flow: AR Lookup

```
[Book saved with ISBN]
    ↓
[AR Lookup Service] → [POST /api/ar-lookup { isbn }]
    ↓
[BFF Proxy] → [GET arbookfind.com?isbn={isbn}]
    ↓
[Parse HTML] → [Extract AR level, AR points]
    ↓
[Update IndexedDB] → [Update UI if visible]
    ↓
[Sync to Google Sheets]
```

### Request Flow: Mark Book Read

```
[User taps "Mark as Read"]
    ↓
[Optimistic: Update IndexedDB immediately]
    ↓
[UI updates, toast shows success]
    ↓
[SyncQueue adds 'update' action]
    ↓
[If online: Background sync to Google Sheets]
    ↓
[If offline: Queue persists, syncs on reconnect]
```

### State Management

```
[IndexedDB (Source of Truth)]
    ↓ (reads)
[Components] ←→ [Zustand (UI State)] ←→ [React Query (Server Cache)]
    ↓               ↓                        ↓
[Sync Queue]    [Connectivity]           [Invalidation]
```

### Key Data Flows

1. **Book Creation Flow:** Scan → Google Books → Display Form → User Confirm → IndexedDB → Sync Queue → Background Sync → Google Sheets

2. **Offline Creation Flow:** Scan → IndexedDB → UI → Sync Queue (pending) → Network Restored → Background Sync → Google Sheets

3. **AR Enrichment Flow:** Book saved → AR Lookup → BFF Proxy → arbookfind.com → Parse → Update IndexedDB → UI reflects AR data

4. **Export Flow:** User triggers export → Read all from IndexedDB → Generate JSON/CSV → Download

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k books | Single IndexedDB store, simple sync queue, local-first works perfectly |
| 1k-10k books | Consider IndexedDB pagination, virtual scrolling for UI, batch sync operations |
| 10k+ books | Migrate to better IndexedDB wrapper (Dexie.js with indexes), consider Sheets as primary with local cache |

### Scaling Priorities

1. **First bottleneck: Sync queue growth** — If many offline changes accumulate, sync may timeout. Mitigation: Batch operations, exponential backoff.

2. **Second bottleneck: IndexedDB query performance** — Large book collections need proper indexes. Mitigation: Create indexes on isbn, updatedAt during DB setup.

## Anti-Patterns

### Anti-Pattern 1: Server-First with localStorage Fallback

**What people do:** Store data only on server, try to cache in localStorage when offline.

**Why it's wrong:** localStorage has 5MB limit, is synchronous (blocks UI), and has no query capabilities. Data can be lost on browser update.

**Do this instead:** Use IndexedDB as primary source, sync to server as secondary.

### Anti-Pattern 2: Direct API Calls from UI for Scraping

**What people do:** Call arbookfind.com directly from browser JavaScript.

**Why it's wrong:** CORS blocks it, IP can be blocked if scraping detected, secrets can't be hidden.

**Do this instead:** Use BFF proxy (edge function or serverless) to handle scraping server-side.

### Anti-Pattern 3: Sync on Every Write

**What people do:** Immediately try to sync each change to Google Sheets.

**Why it's wrong:** Poor UX when offline, rate limiting issues, many API calls.

**Do this instead:** Queue changes, sync in batches when online, use optimistic UI updates.

### Anti-Pattern 4: No AR Graceful Degradation

**What people do:** Fail completely if arbookfind.com scrape fails.

**Why it's wrong:** Renaissance changes site structure often, users get stuck.

**Do this instead:** Always allow manual AR entry as fallback, cache successful lookups, show clear "AR not found" state.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google Books API | Direct fetch from client | No API key for basic use. Rate limited but generous. Cache results in IndexedDB. |
| arbookfind.com | BFF proxy scraping | No API exists. HTML parsing fragile. Must degrade gracefully to manual entry. |
| Google Sheets API | Service account + BFF proxy | Write-only access recommended. Batch writes. Handle 429s with backoff. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Scanner UI ↔ ZXing | Hook (`useZxing`) | Returns barcode result, handles camera selection |
| Components ↔ IndexedDB | Custom hooks (`useBook`, `useLibrary`) | Abstracts DB operations, returns React Query responses |
| SyncService ↔ Service Worker | Workbox Background Sync API | Queues POST requests for retry |
| BFF ↔ PWA Client | Next.js route handlers | Proxies external calls, returns normalized data |

## Build Order Implications

Based on dependencies, recommended build sequence:

1. **Phase 1: PWA Shell + Scanner**
   - App shell with service worker
   - Barcode scanning with ZXing
   - Basic book form (manual entry)
   
   **Why first:** Core user flow is scan → add book. This validates the most important feature before adding complexity.

2. **Phase 2: Google Books Integration**
   - API service for book lookup
   - Auto-populate form fields
   - Cover image display
   
   **Why second:** Depends on scanner working. Adds value without changing data flow.

3. **Phase 3: IndexedDB Persistence**
   - Local book storage
   - Library view with list/grid
   - Offline operation
   
   **Why third:** Requires scanner and form working. Adds offline capability which is critical for this use case.

4. **Phase 4: AR Lookup + BFF**
   - Edge function for scraping
   - AR data enrichment
   - Manual AR fallback
   
   **Why fourth:** Requires book to be saved first. BFF adds infrastructure but is simple.

5. **Phase 5: Progress Tracking**
   - Mark as read
   - Quiz score entry
   - Progress display
   
   **Why fifth:** Depends on book storage. Adds tracking value to existing books.

6. **Phase 6: Google Sheets Sync**
   - Sheets API integration via BFF
   - Background sync
   - Export functionality
   
   **Why sixth:** Final piece. Requires all data structures stable. Simplest to add last.

## Sources

- [MDN PWA Best Practices](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Best_practices) - HIGH
- [PWA Offline-First Architecture Guide (NeedleCode, 2026)](https://needlecode.com/blog/pwa/complete-guide-to-offline-web-apps.html) - HIGH
- [Workbox Caching Strategies (BeeWebDev, 2026)](https://beeweb.dev/blog/post.php?lang=en&slug=building-progressive-web-apps-with-service-worker-caching-strategies-a-complete-2026-implementation-guide-for-offline-first-applications) - HIGH
- [ZXing Browser Library](https://github.com/digital-competence/zxing-browser) - HIGH
- [react-zxing npm package](https://www.npmjs.com/package/react-zxing) - HIGH
- [BFF Pattern with Next.js (Dev.to, 2025)](https://dev.to/oliverke/simplifying-api-communication-with-the-bff-pattern-in-nextjs-1flb) - MEDIUM
- [Offline-First PWA with IndexedDB + Supabase (Medium, 2026)](https://oluwadaprof.medium.com/building-an-offline-first-pwa-notes-app-with-next-js-indexeddb-and-supabase-f861aa3a06f9) - HIGH
- [Dexie.js PWA Patterns](https://www.wellally.tech/blog/build-offline-pwa-react-dexie-workbox) - HIGH
- [Google Sheets API Documentation](https://developers.google.com/workspace/sheets/api/guides/libraries) - HIGH
- [PWA Barcode Scanner Tutorial (Scanbot, 2025)](https://scanbot.io/techblog/progressive-web-app-barcode-scanner-tutorial) - MEDIUM

---
*Architecture research for: Book Scanning / Library Tracking PWA*
*Researched: 2026-03-23*
