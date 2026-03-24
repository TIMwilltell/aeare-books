# Stack Research

**Domain:** Book scanning PWA with barcode detection, API integration, and offline data storage
**Researched:** 2026-03-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **SvelteKit** | 2.x (Svelte 5) | Frontend framework | Smallest bundle (~15-30KB vs React's ~100-200KB), best DX, compiles to vanilla JS, excellent PWA support via vite-plugin-pwa, perfect for mobile-first PWAs |
| **Hono** | 4.x | Backend API server | Multi-runtime (Node/Bun/Deno/Edge), ~14KB, TypeScript-first, fastest Node.js framework, perfect for AR scraping endpoint |
| **vite-plugin-pwa** | 0.22.x | PWA service worker | ~2M weekly downloads, zero-config setup with Workbox, works with SvelteKit via Vite, handles manifest and update prompts |
| **Quagga2** | 2.x | Barcode scanning | Maintained fork of QuaggaJS, excellent 1D barcode support (ISBN, UPC-A), uses getUserMedia, ~875 GitHub stars, actively maintained |
| **Dexie.js** | 4.x | IndexedDB wrapper | ~3M weekly downloads, ORM-like API with rich queries, React hooks support via useLiveQuery, handles migrations gracefully |
| **@google-cloud/local-auth** | 2.1.x | Google auth | Handles OAuth flow for Google Sheets API, works with googleapis |
| **googleapis** | 139.x | Google Sheets API | Official Google client library, handles API calls to Google Sheets |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **zod** | 3.x | Schema validation | Validate API responses, form data, environment variables |
| **cheerio** | 1.0.x | HTML parsing | Parse arbookfind.com scrape results in backend |
| **puppeteer** or **playwright** | latest | Headless browser | Only if cheerio insufficient for complex AR scrape (likely not needed) |
| **pwa-helpers** | - | PWA utilities | Optional: Use native browser APIs instead |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js** | Runtime | v18+ required for all packages |
| **Vite** | Bundler | Included with SvelteKit, handles HMR |
| **TypeScript** | Language | First-class in SvelteKit, strict mode recommended |
| **Vitest** | Testing | Works great with Vite-based projects |
| **@sveltejs/adapter-auto** | Deployment | Auto-detects deployment target (Vercel, Netlify, etc.) |

## Installation

```bash
# Core dependencies
npm create svelte@latest aeare -- --template skeleton --types typescript
cd aeare
npm install

# PWA support
npm install -D vite-plugin-pwa

# Barcode scanning
npm install @ericblade/quagga2

# Data storage
npm install dexie

# Backend (if separate server)
npm install hono @hono/node-server

# Google APIs
npm install googleapis @google-cloud/local-auth

# Validation
npm install zod

# HTML parsing (for AR scrape)
npm install cheerio

# Dev dependencies
npm install -D typescript vitest @sveltejs/adapter-auto
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    PWA (SvelteKit)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Scanner  │  │ Library  │  │ Book Detail / Quiz   │  │
│  │  View    │  │   View   │  │      Entry           │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │             │                    │               │
│       └─────────────┼────────────────────┘               │
│                     │                                    │
│  ┌──────────────────▼───────────────────────────────┐    │
│  │              Dexie.js (IndexedDB)                │    │
│  │    books, quizzes, syncQueue tables              │    │
│  └──────────────────┬───────────────────────────────┘    │
│                    │                                    │
│  ┌─────────────────▼───────────────────────────────┐    │
│  │           Service Worker (vite-plugin-pwa)       │    │
│  │   • Offline caching     • Background sync        │    │
│  └─────────────────┬───────────────────────────────┘    │
└────────────────────┼────────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
    ┌─────▼──────┐      ┌──────▼──────┐
    │ Google API │      │  Backend    │
    │ Google     │      │  (Hono)     │
    │ Books/     │      │  arbookfind │
    │ Sheets     │      │  scrape     │
    └────────────┘      └─────────────┘
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|------------------------|
| SvelteKit | Next.js | Team is React-fluent, needs React ecosystem libraries |
| SvelteKit | Nuxt | Team knows Vue, wants Vue ecosystem |
| Hono | Express | Legacy codebase, no TypeScript needed |
| Hono | Fastify | Node-only deployment, existing Fastify expertise |
| Quagga2 | html5-qrcode | Need 2D barcode support AND willing to use unmaintained library |
| Quagga2 | Native BarcodeDetector | Only targeting Chrome Android, progressive enhancement |
| Dexie.js | localForage | Only need simple key-value storage |
| Dexie.js | idb | Need minimal wrapper, will build own ORM |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **React** | Large bundle (~100-200KB), virtual DOM overhead, complex hooks | Svelte (compiles to vanilla JS) |
| **Next.js** | Over-engineered for this use case, Vercel-centric | SvelteKit (smaller, simpler) |
| **Express** | No TypeScript-first support, slower, legacy patterns | Hono (4x faster, TypeScript-native) |
| **html5-qrcode** | Unmaintained since 2023, issues with UPC barcode detection | Quagga2 (actively maintained) |
| **localStorage** | Synchronous (blocks main thread), 5MB limit, no transactions | IndexedDB via Dexie.js |
| **MongoDB/PostgreSQL** | Backend complexity for single-user local-first app | IndexedDB + Google Sheets |
| **PWA Wrappers (Capacitor)** | App store native app — explicitly out of scope | PWA only |
| **Firebase/Supabase** | Overkill for single-device family use case | Local IndexedDB + Google Sheets |

## Stack Patterns by Variant

**If deploying to Cloudflare Workers:**
- Use Hono (native CF Workers support)
- Use D1 for edge-compatible relational data if needed
- Adapter: `@hono/cloudflare-workers`

**If deploying to Vercel:**
- SvelteKit with `@sveltejs/adapter-vercel`
- Hono works on Vercel Edge Runtime
- Consider using Hono's RPC mode for type-safe client calls

**If deploying to Netlify:**
- SvelteKit with `@sveltejs/adapter-netlify`
- Hono works via Node.js serverless functions

**If need maximum offline capability:**
- Full Dexie.js schema with sync queue
- Service worker caches app shell
- Background Sync API for retry queue

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| SvelteKit 2.x | Svelte 5 | Use Svelte 5 runes syntax |
| vite-plugin-pwa 0.22.x | Vite 5.x | Check vite-plugin-pwa compatibility matrix |
| Dexie.js 4.x | All modern browsers | IE11 not supported (acceptable for PWA) |
| Quagga2 2.x | All browsers with getUserMedia | Safari iOS requires HTTPS |
| Hono 4.x | Node 18+, Bun, Deno, Cloudflare | Multi-runtime by design |
| googleapis 139.x | Node 18+ | Auth via @google-cloud/local-auth for dev |

## Key Technical Decisions

### 1. SvelteKit over Next.js
**Rationale:** This is a mobile-first PWA where bundle size directly impacts user experience. SvelteKit's compiler-based approach produces 30-50% smaller bundles than React-based frameworks. For a parent scanning books at home, fast load times on mobile data matter.

### 2. Hono over Express
**Rationale:** The backend only needs a few routes (AR scrape endpoint, potential Google Sheets proxy). Hono's ~14KB footprint vs Express's ~200KB is meaningful. TypeScript-first design prevents runtime type errors. Multi-runtime support means easy migration if deployment needs change.

### 3. Quagga2 over html5-qrcode
**Rationale:** Book barcodes are 1D (EAN-13/UPC-A). Quagga2 specializes in 1D barcodes and is actively maintained. html5-qrcode development stalled in 2023 and has known UPC detection issues. The native BarcodeDetector API can be used as progressive enhancement on Chrome Android.

### 4. Dexie.js over raw IndexedDB
**Rationale:** IndexedDB's callback-based API is unwieldy. Dexie provides:
- Promise-based async operations
- ORM-like schema management
- Automatic migration handling
- Live queries (useful for reactive UI)
- Rich query support (filtering, sorting)

### 5. Local IndexedDB + Google Sheets (not pure backend)
**Rationale:** Project requirements specify Google Sheets for easy viewing/editing. Using IndexedDB locally means:
- Fast offline reads/writes
- App works without network
- Syncs to Google Sheets when connected
- Users can still view/edit data in Sheets directly

## Sources

- [SvelteKit Documentation](https://svelte.dev/docs/kit) — Framework docs, routing, adapters
- [Next.js vs SvelteKit vs Nuxt 2026](https://pkgpulse.com/blog/nextjs-vs-astro-vs-sveltekit-2026) — Framework comparison, MEDIUM confidence
- [SvelteKit vs Next.js 2026](https://pkgpulse.com/blog/sveltekit-vs-nextjs-2026-full-stack-comparison) — Bundle size analysis, HIGH confidence
- [Quagga2 GitHub](https://github.com/ericblade/quagga2) — Active maintenance, 1D barcode focus
- [html5-qrcode vs Quagga2](https://scanbot.io/blog/quagga2-vs-html5-qrcode-scanner/) — Comparison, maintenance status
- [vite-plugin-pwa](https://vite-pwa.dev/) — PWA configuration
- [Workbox vs vite-pwa vs next-pwa](https://pkgpulse.com/blog/workbox-vs-vite-pwa-vs-next-pwa-service-workers-pwa-2026) — PWA tooling comparison
- [Hono vs Express 2026](https://pkgpulse.com/blog/express-vs-hono-2026) — Backend framework comparison
- [Hono Documentation](https://hono.dev/) — Official docs, TypeScript-first design
- [Dexie.js Documentation](https://dexie.org/) — IndexedDB wrapper, ORM features
- [IndexedDB Best Practices](https://web.dev/articles/indexeddb-best-practices-app-state) — Official guidance
- [Google Sheets API](https://developers.google.com/sheets/api) — Official API documentation
- [Barcode Detection API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) — Native browser API (progressive enhancement)

---
*Stack research for: AeAre Books - Book scanning PWA*
*Researched: 2026-03-23*
