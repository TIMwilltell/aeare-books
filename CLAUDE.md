# AeAre Books

AeAre Books is a mobile-first SvelteKit PWA. The live app scans ISBN barcodes, looks up metadata from Open Library, scrapes AR level/points through Cloudflare Browser Rendering, and stores books and progress in Convex.

## Current stack

- SvelteKit 2 + Svelte 5 runes
- `@sveltejs/adapter-cloudflare`
- Convex backend in `src/convex/`
- Open Library metadata lookup in `src/routes/api/books/+server.ts`
- AR scraping in `src/routes/api/ar/+server.ts` with `@cloudflare/puppeteer`
- Quagga scanner in `src/lib/components/Scanner.svelte`
- `vite-plugin-pwa`
- Bun

## What is actually in use

- `ConvexClient` browser calls from `src/lib/db/index.ts` and `src/lib/api/export.ts`
- `convex-svelte` only in `src/routes/+layout.svelte`
- Barcode scanning with `quagga`
- PWA manifest and service worker via Vite

## What is not in use

- Google Books
- Dexie / IndexedDB as the primary data store
- Google Sheets sync
- Hono
- Next.js / Vercel stack
- `html5-qrcode`

## Key files

- `src/routes/+page.svelte`
- `src/routes/scan/+page.svelte`
- `src/routes/book/new/+page.svelte`
- `src/routes/book/[id]/+page.svelte`
- `src/routes/api/books/+server.ts`
- `src/routes/api/ar/+server.ts`
- `src/lib/db/index.ts`
- `src/convex/schema.ts`
- `src/convex/books.ts`
- `src/convex/progress.ts`

## Editing rule

Update the README and the active `.planning` docs when code changes alter the runtime stack or user flows.
