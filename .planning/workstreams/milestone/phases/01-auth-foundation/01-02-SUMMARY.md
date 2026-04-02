---
phase: 01-auth-foundation
plan: 02
subsystem: auth
tags: [convex, auth0, identity-mapping, svelte]
requires:
  - phase: 01-auth-foundation-01
    provides: Auth0 session wiring and Convex auth config
provides:
  - Users table keyed by `tokenIdentifier` for internal identity mapping
  - `ensureCurrentUser` and `getCurrentUser` Convex helpers that derive identity from `ctx.auth`
  - Actionable UI retry/sign-out paths when auth bootstrap fails
affects: [phase-02-route-data-protection, auth-bootstrap, user-ownership]
tech-stack:
  added: []
  patterns:
    - Server-side identity derivation (never accept user identity from client args)
    - Post sign-in bootstrap mutation to guarantee durable user mapping
key-files:
  created:
    - src/convex/users.ts
  modified:
    - src/convex/schema.ts
    - src/lib/auth/auth0.ts
    - src/routes/+layout.svelte
    - src/convex/_generated/api.d.ts
key-decisions:
  - "Use identity.tokenIdentifier as the canonical lookup key in the users table"
  - "Run user bootstrap immediately after auth session restoration so failures surface early"
patterns-established:
  - "Auth-linked Convex helpers must reject unauthenticated calls with explicit errors"
  - "UI auth error states include concrete recovery actions (retry and sign-out)"
requirements-completed: [DATA-01, AUTH-03, UX-02]
duration: 4min
completed: 2026-04-02
---

# Phase 1 Plan 2: Identity Mapping and User Bootstrap Summary

**Auth identity now bootstraps into a durable Convex `users` record via tokenIdentifier and surfaces recovery-focused error messaging when bootstrap fails.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T03:59:16Z
- **Completed:** 2026-04-02T04:03:45Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Added a `users` schema with deterministic lookup indexes for auth identity mapping.
- Implemented authenticated `ensureCurrentUser`/`getCurrentUser` Convex functions that never trust client-provided user IDs.
- Added account-bootstrap failure handling in the shell with clear retry/sign-out actions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add users table and identity indexes** - `2a204d6` (feat)
2. **Task 2: Implement get-or-create user helper** - `a02aef8` (feat)
3. **Task 3: Add auth error messaging path** - `b11508d` (feat)

## Files Created/Modified
- `src/convex/schema.ts` - Added `users` table with auth identity and profile fields plus lookup indexes.
- `src/convex/users.ts` - Added `getCurrentUser` and `ensureCurrentUser` auth-aware user bootstrap helpers.
- `src/convex/_generated/api.d.ts` - Regenerated Convex API types to include `users` functions.
- `src/lib/auth/auth0.ts` - Added post-sign-in Convex bootstrap mutation and actionable bootstrap error messaging.
- `src/routes/+layout.svelte` - Added retry/sign-out recovery controls and clearer auth setup failure copy.

## Decisions Made
- Identity mapping uses `identity.tokenIdentifier` as the canonical stable external key.
- User bootstrap runs immediately after session initialization so first-use failures are visible and recoverable.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no new external service configuration required beyond existing Auth0/Convex setup.

## Next Phase Readiness
- Phase 2 can now attach ownership and access checks to a stable internal user record.
- Auth bootstrap errors are visible in the UI, reducing silent-failure risk during route/data protection rollout.

## Self-Check: PASSED
