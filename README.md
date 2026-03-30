# AeAre Books

AeAre Books is a mobile-first PWA for scanning book barcodes, looking up metadata, scraping AR level/points, and tracking reading progress for children.

## What it does

- Scan ISBN barcodes with the phone camera
- Look up title, author, and cover art from Open Library
- Scrape AR level and points through the Cloudflare browser-rendering endpoint
- Track read status, quiz scores, dates, and notes in Convex
- Export the library as JSON

## Stack

- SvelteKit + Svelte 5
- Convex
- Open Library API
- `@cloudflare/puppeteer` with Cloudflare Browser Rendering
- Quagga for barcode scanning
- `vite-plugin-pwa`
- Bun

## Key routes

- `/` library
- `/scan` scanner
- `/book/new` add book
- `/book/[id]` book detail and progress
- `/api/books` metadata lookup
- `/api/ar` AR lookup

## Setup

1. `bun install`
2. Set `VITE_CONVEX_URL` if you are not using the default deployment
3. `bunx convex dev` to connect Convex locally
4. `bun run dev`

The dev server uses HTTPS for camera access. Run `bun run build` before deploying with Wrangler.

## Notes

- Convex is the source of truth for books and progress events.
- There is no IndexedDB/Dexie primary store, no Google Sheets sync, and no Google Books integration.
- The AR scrape is fragile by nature and should fail gracefully.
