---
phase: 01-auth-foundation
plan: 02
subsystem: auth
tags: [convex, convex-auth, identity-mapping, svelte]
requires:
  - phase: 01-auth-foundation-01
    provides: Magic-link session wiring and Convex auth config
provides:
  - Users table records addressed by Convex Auth `users._id`
  - `ensureCurrentUser` and `getCurrentUser` Convex helpers that derive identity from `getAuthUserId(ctx)`
  - Actionable UI retry/sign-out paths when auth bootstrap fails
affects: [phase-02-route-data-protection, auth-bootstrap, user-ownership]
tech-stack:
  added: []
  patterns:
    - Server-side identity derivation (never accept user identity from client args)
    - Post sign-in bootstrap query to guarantee durable user lookup
key-files:
  created:
    - src/convex/users.ts
  modified:
    - src/convex/schema.ts
    - src/lib/auth/auth0.ts
    - src/routes/+layout.svelte
    - src/convex/_generated/api.d.ts
key-decisions:
  - "Use Convex Auth `users._id` from `getAuthUserId(ctx)` as the canonical server-side identity source"
  - "Run user lookup immediately after auth session restoration so failures surface early"
patterns-established:
  - "Auth-linked Convex helpers must reject unauthenticated calls with explicit errors"
  - "UI auth error states include concrete recovery actions (retry and sign-out)"
requirements-completed: [DATA-01, AUTH-03, UX-02]
duration: 4min
completed: 2026-04-02
---

# Phase 1 Plan 2: Identity Mapping and User Bootstrap Summary

**Superseded by the live Convex Auth ownership model: auth now resolves directly to Convex Auth `users._id` via `getAuthUserId(ctx)` and surfaces recovery-focused auth error messaging when bootstrap fails.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-02T03:59:16Z
- **Completed:** 2026-04-02T04:03:45Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Added a `users` schema used by Convex Auth for durable user records.
- Implemented authenticated `ensureCurrentUser`/`getCurrentUser` helpers that never trust client-provided user IDs and instead resolve identity with `getAuthUserId(ctx)`.
- Added account-bootstrap failure handling in the shell with clear retry/sign-out actions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add users table and identity indexes** - `2a204d6` (feat)
2. **Task 2: Implement get-or-create user helper** - `a02aef8` (feat)
3. **Task 3: Add auth error messaging path** - `b11508d` (feat)

## Files Created/Modified
- `src/convex/schema.ts` - Added `users` table used by Convex Auth.
- `src/convex/users.ts` - Added `getCurrentUser` and `ensureCurrentUser` auth-aware user bootstrap helpers.
- `src/convex/_generated/api.d.ts` - Regenerated Convex API types to include `users` functions.
- `src/lib/auth/auth0.ts` - Added post-sign-in Convex bootstrap lookup and actionable bootstrap error messaging.
- `src/routes/+layout.svelte` - Added retry/sign-out recovery controls and clearer auth setup failure copy.

## Decisions Made
- Identity mapping uses `getAuthUserId(ctx)` and the Convex Auth `users._id` as the canonical stable key.
- User bootstrap runs immediately after session initialization so first-use failures are visible and recoverable.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no new external service configuration required beyond the existing Convex Auth magic-link setup.

## Next Phase Readiness
- Phase 2 can now attach ownership and access checks directly to the authenticated Convex Auth user record.
- Auth bootstrap errors are visible in the UI, reducing silent-failure risk during route/data protection rollout.

## Self-Check: PASSED
