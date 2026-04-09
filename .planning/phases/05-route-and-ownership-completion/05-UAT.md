---
status: complete
phase: 05-route-and-ownership-completion
source:
  - 05-01-SUMMARY.md
  - 05-02-SUMMARY.md
  - 05-03-SUMMARY.md
started: 2026-04-09T05:38:20Z
updated: 2026-04-09T06:25:42Z
---

## Current Test

[testing complete]

## Tests

### 1. Signed-Out Route Guard
expected: When you open a protected page such as `/book/new` or a book detail route while signed out, you should be redirected to the sign-in flow instead of seeing protected content.
result: pass

### 2. Owned Timeline Entry On Book Detail
expected: After signing in and creating or opening your own book, the book detail page should show a timeline/activity section containing a `Book added to library` entry for that book.
result: pass

### 3. Export Includes Owned Progress Data
expected: Exporting your library while signed in should download JSON containing only your account's records, including both books and progress events, with date fields formatted as ISO strings.
result: pass

### 4. Second Account Cannot See First Account Data
expected: When you sign in as a different user, that account should not see the first user's shelf items, book timeline entries, or exported records.
result: skipped
reason: Covered by existing Phase 5 browser verification in `05-VERIFICATION.md` (`bunx playwright test tests/e2e/route-and-ownership.spec.ts`); no separate manual second-account UAT was run in this session.

## Summary

total: 4
passed: 3
issues: 0
pending: 0
skipped: 1
blocked: 0

## Gaps

[none yet]
