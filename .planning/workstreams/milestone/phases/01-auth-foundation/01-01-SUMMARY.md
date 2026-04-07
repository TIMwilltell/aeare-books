---
phase: 01-auth-foundation
plan: 01
subsystem: auth
tags: [convex-auth, magic-link, convex, sveltekit, session]
requires: []
provides:
  - Magic-link auth bootstrap in app shell
  - Convex Auth email provider wiring for local inbox and Resend delivery
  - Signed-in, signed-out, loading auth UI states with sign-in/sign-out actions
affects: [01-02, 01-03, 02-route-and-acl]
tech-stack:
  added: [@convex-dev/auth, @auth/core]
  patterns: [auth state module with token fetcher, Convex client setAuth wiring, env-driven magic-link provider configuration]
key-files:
  created: [src/convex/auth.config.ts, src/convex/auth.ts, src/routes/api/test/auth-email/+server.ts]
  modified: [package.json, bun.lock, README.md, src/lib/auth/auth0.ts, src/routes/+layout.svelte, src/routes/dev/inbox/+page.svelte]
key-decisions:
  - "Use Convex Auth email magic links so the app shell, Convex session state, and user bootstrap share one auth stack."
  - "Support both local inbox delivery and Resend-backed delivery through env-validated provider configuration."
patterns-established:
  - "Magic-link session bootstrap lives in src/lib/auth/auth0.ts and is consumed by the global layout UI."
  - "Local inbox debugging flows through src/routes/api/test/auth-email/+server.ts and src/routes/dev/inbox/+page.svelte when `AEARE_AUTH_EMAIL_MODE=local`."
requirements-completed: [AUTH-01, AUTH-02, UX-01]
duration: 34m
completed: 2026-04-02
---

# Phase 01 Plan 01: Provider and Session Plumbing Summary

**Superseded by the live Convex Auth magic-link stack: browser session bootstrap, local inbox testing, and Resend-backed delivery now drive shell-level signed-in/out/loading UX states.**

## Performance

- **Duration:** 34m
- **Started:** 2026-04-02T03:20:55Z
- **Completed:** 2026-04-02T03:55:07Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added Convex Auth email-provider wiring and documented the local inbox + Resend env contract in `README.md`.
- Added `src/convex/auth.ts` magic-link provider logic for local inbox capture and Resend delivery.
- Wired `src/routes/+layout.svelte` with loading/signed-out/signed-in states plus sign-in/sign-out actions, backed by `src/lib/auth/auth0.ts` and Convex `setAuth` wiring.

## Task Commits

1. **Task 1: Add auth dependencies and env contract** - `7b7afaa` (chore)
2. **Task 2: Add Convex auth configuration** - `814999c` (feat)
3. **Task 3: Wire app shell session states** - `08f682a` (feat)

## Files Created/Modified

- `package.json` / `bun.lock` - adds Convex Auth runtime dependencies.
- `README.md` - documents `SITE_URL`, `AEARE_AUTH_EMAIL_MODE`, `AUTH_EMAIL_FROM`, and `AUTH_RESEND_KEY`.
- `src/convex/auth.ts` - configures the email magic-link provider and delivery behavior.
- `src/lib/auth/auth0.ts` - auth bootstrap, magic-link exchange, token fetcher, and auth store.
- `src/routes/api/test/auth-email/+server.ts` - local inbox API for E2E and manual debugging.
- `src/routes/dev/inbox/+page.svelte` - local inbox viewer for inspecting captured magic-link emails.
- `src/routes/+layout.svelte` - global auth state UI and controls.

## Decisions Made

- Use Convex Auth email magic links as the single auth stack for session bootstrap, protected-route restore, and user bootstrap.
- Keep provider-specific delivery details inside `src/convex/auth.ts` so local inbox and Resend modes share the same flow.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Convex codegen blocked by missing auth env variables**
- **Found during:** Task 2
- **Issue:** `bunx convex codegen` and runtime auth flows require the magic-link env contract to be present (`SITE_URL`, plus delivery-specific values).
- **Fix:** Set the required Convex env vars so auth config validation and sign-in routing could proceed.
- **Files modified:** none (deployment env only)
- **Verification:** `bunx convex codegen` completed successfully after env setup.
- **Committed in:** `814999c` (task scope)

**2. [Rule 1 - Bug] Browser auth bootstrap issues caused type-check failures**
- **Found during:** Task 3
- **Issue:** browser-side auth bootstrap and token handling needed explicit runtime validation to keep sign-in and reload flows stable.
- **Fix:** tightened runtime checks in the auth bootstrap module and aligned layout wiring with the live magic-link flow.
- **Files modified:** `src/lib/auth/auth0.ts`
- **Verification:** `bun run check` passed with 0 errors.
- **Committed in:** `08f682a`

---

**Total deviations:** 2 auto-fixed (1 Rule 3, 1 Rule 1)
**Impact on plan:** Both fixes were required to complete validation and keep implementation correct.

## Issues Encountered

- Local inbox and Resend delivery use different env requirements, so auth validation must cover both modes clearly.

## User Setup Required

Manual auth setup still required before real sign-in testing:

- Set `SITE_URL` to the active local origin used for magic-link redirects.
- For local inbox testing, set `AEARE_AUTH_EMAIL_MODE=local` in Convex env and use `src/routes/dev/inbox/+page.svelte` or `src/routes/api/test/auth-email/+server.ts` to inspect captured emails.
- For real email delivery, set `AUTH_RESEND_KEY` and optional `AUTH_EMAIL_FROM` in Convex env.

## Next Phase Readiness

- Ready for Phase 01-02 ownership mapping and auth error path hardening.
- Route/data protection can now build on authenticated identity from Convex Auth user records.

## Self-Check: PASSED

- Verified files exist: `src/convex/auth.config.ts`, `src/lib/auth/auth0.ts`, `.planning/workstreams/milestone/phases/01-auth-foundation/01-01-SUMMARY.md`
- Verified task commits exist: `7b7afaa`, `814999c`, `08f682a`
