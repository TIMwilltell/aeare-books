---
status: awaiting_human_verify
trigger: "Svelte lifecycle_outside_component error - useConvexClient is being called in event handler (handleSave) instead of during component initialization. The error is in src/lib/db/index.ts:107 when addBook calls useConvexClient(). Need to refactor to get the Convex client during component initialization and pass it to the db functions, or use a different pattern."
created: 2026-03-24T00:00:00.000Z
updated: 2026-03-24T00:00:00.000Z
---

## Current Focus

hypothesis: "Fixed by using ConvexClient from convex/browser instead of useConvexClient(). The new approach creates a ConvexClient instance directly with new ConvexClient(url), avoiding the Svelte lifecycle issue entirely."
test: "Start dev server and verify no lifecycle_outside_component errors"
expecting: "No errors on page load or when adding a book"
next_action: "Test adding a book to confirm it works"

## Symptoms

expected: "Books should be written to Convex database tables"
actual: "Books were being stored in IndexedDB instead"
errors: []
reproduction: "When a book is added, it appears to go to IndexedDB rather than Convex"
started: "Unknown when this started"

## Eliminated

## Evidence

- timestamp: 2026-03-24
  checked: "src/lib/db/index.ts"
  found: "Uses Dexie (IndexedDB wrapper) to store books - addBook(), updateBook(), deleteBook(), getAllBooks() all write/read from IndexedDB"
  implication: "This was the root cause of the issue"

- timestamp: 2026-03-24
  checked: "src/convex/books.ts"
  found: "Convex mutations and queries already exist: add(), updateBook(), remove(), get(), getAll()"
  implication: "The Convex backend was already set up to handle books"

- timestamp: 2026-03-24
  checked: "src/routes/book/new/+page.svelte"
  found: "Calls addBook() from $lib/db which was writing to IndexedDB"
  implication: "Frontend was using wrong storage layer"

- timestamp: 2026-03-24
  checked: "src/lib/api/export.ts"
  found: "Shows how to use Convex client: import { useConvexClient } from 'convex-svelte'; import { api } from '../../convex/_generated/api';"
  implication: "Pattern for calling Convex was already established in the codebase"

- timestamp: 2026-03-24
  checked: "TypeScript errors"
  found: "Fixed all type errors in BookList.svelte, +page.svelte, book/[id]/+page.svelte, ProgressTimeline.svelte related to ID type change (number -> string)"
  implication: "All files now use string IDs from Convex"

- timestamp: 2026-03-24
  checked: "src/lib/db/index.ts lifecycle error"
  found: "useConvexClient() was being called inside getClient() which is called from async functions (addBook, etc.) - this violates Svelte lifecycle as useConvexClient() must be called at component initialization, not inside event handlers"
  implication: "Root cause of the lifecycle_outside_component error"

- timestamp: 2026-03-24
  checked: "src/lib/db/index.ts fix"
  found: "Changed import from 'convex-svelte' to 'convex/browser', replaced useConvexClient() with new ConvexClient(url). This creates a ConvexClient directly without requiring Svelte context."
  implication: "Fixes the lifecycle error by avoiding useConvexClient() entirely"

## Resolution

root_cause: "$lib/db/index.ts was using Dexie (IndexedDB wrapper) to store books instead of Convex. The Convex mutations (api.books.add, api.books.updateBook, etc.) and queries (api.books.get, api.books.getAll) already existed but were not being used."

fix: "1. Rewrote $lib/db/index.ts to use ConvexClient from 'convex/browser' instead of useConvexClient() from 'convex-svelte'. Created a createClient() function that instantiates new ConvexClient(url) directly. 2. Applied the same fix to $lib/api/export.ts. This avoids the Svelte lifecycle issue entirely - ConvexClient can be created at any time, not just during component initialization."

verification: "TypeScript compiles without errors (remaining errors are in unrelated Scanner.svelte file). Dev server starts without lifecycle_outside_component errors. User needs to verify adding a book works."

files_changed: ["src/lib/db/index.ts", "src/lib/components/BookList.svelte", "src/lib/components/ProgressTimeline.svelte", "src/routes/+page.svelte", "src/routes/book/[id]/+page.svelte"]