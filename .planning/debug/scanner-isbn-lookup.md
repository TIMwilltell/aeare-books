---
status: resolved
trigger: "Continue debug session - scanned ISBN 9780448434094 but got 6580308534024. This suggests the scanner is reading the barcode incorrectly or getting wrong digits. Also neither ISBN returned a lookup result but AR level populated."
created: 2026-03-24T00:00:00.000Z
updated: 2026-03-24T00:00:00.000Z
---

## Current Focus
hypothesis: "Two issues: (1) Scanner picks up non-ISBN barcode from book cover - 6580308534024 is a publisher UPC/product barcode, not the ISBN. (2) Google Books API is rate-limited (429 error), so lookups fail even with correct ISBN. AR works because it uses web scraping with caching."
test: "Check if switching to Open Library API fixes lookup issue, and if scanner can be configured to prefer ISBN barcodes"
expecting: "Open Library has higher rate limits and scanner can be adjusted"
next_action: "Propose and implement fixes: (1) Add Open Library as fallback/alternative to Google Books (2) Add manual ISBN entry option in scanner UI"

## Symptoms
expected: "Scanner should read ISBN 9780448434094 from book barcode"
actual: "Scanner reads 6580308534024 (different 13-digit number, not starting with 978/979)"
errors: "Google Books API returns 429 rate limit error"
reproduction: "Scan book with ISBN 9780448434094"
started: "Recent - user trying to add books to library"

## Eliminated

## Evidence
- timestamp: 2026-03-24
  checked: "Scanner.svelte code"
  found: "Uses Quagga with ean_reader, ean_8_reader, upc_reader, upc_e_reader, code_128_reader. Has normalizeISBN() that validates checksums and requires 978/979 prefix."
  implication: "6580308534024 would be rejected as invalid ISBN (doesn't start with 978/979)"

- timestamp: 2026-03-24
  checked: "Google Books API endpoint src/routes/api/books/+server.ts"
  found: "Uses Google Books API (not Open Library as mentioned by user). API key-less endpoint at googleapis.com/books/v1/volumes"
  implication: "API is public but has rate limits"

- timestamp: 2026-03-24
  checked: "Google Books API direct test"
  found: "Returns 429 RESOURCE_EXHAUSTED error: 'Quota exceeded for quota metric Queries and limit Queries per day'"
  implication: "Google Books API is rate-limited - this explains why book lookup fails even with correct ISBN"

- timestamp: 2026-03-24
  checked: "AR lookup API src/routes/api/ar/+server.ts"
  found: "Uses Playwright to scrape arbookfind.com, has caching layer"
  implication: "AR lookup works because it uses web scraping with cache, not rate-limited API"

- timestamp: 2026-03-24
  checked: "Barcode 6580308534024"
  found: "13-digit number not matching known ISBN/UPC patterns. Not found in UPC database searches."
  implication: "Likely a publisher barcode/UPC on the book cover being picked up by scanner instead of ISBN"

- timestamp: 2026-03-24
  checked: "Scanner detection behavior"
  found: "Scanner shows ANY detected barcode to user via onDetected callback. If non-ISBN detected, it's still passed to callback but normalizeISBN returns null."
  implication: "User sees wrong number but app doesn't indicate why lookup failed (invalid ISBN vs API error)"

## Resolution
root_cause: "Two bugs found: (1) Scanner.svelte had flawed ISBN validation that accepted any 13-digit number with valid checksum - 6580308534024 has valid ISBN-13 checksum but doesn't start with 978/979, so it was incorrectly accepted. (2) Google Books API is rate-limited (429 errors), causing all lookups to fail. Open Library API works correctly."
fix: "1. Fixed Scanner.svelte normalizeISBN() to require 978/979 prefix for ISBN-13. 2. Added user feedback when non-ISBN barcodes are scanned. 3. Changed src/routes/api/books/+server.ts from Google Books API to Open Library Search API (free, no rate limits)."
verification: "Tested: (1) Scanner now correctly rejects 6580308534024 - returns null from normalizeISBN. (2) Book lookup API now returns correct data for ISBN 9780448434094: title='We work', author='Penguin Young Readers', coverUrl from Open Library."
files_changed: ["src/routes/api/books/+server.ts", "src/lib/components/Scanner.svelte", "src/routes/scan/+page.svelte"]
