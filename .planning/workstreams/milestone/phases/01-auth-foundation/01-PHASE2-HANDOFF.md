# Phase 2 Handoff: Identity Contract and Access Helpers

Phase 1 established the identity/access primitives that Phase 2 route/data protection must consume.

## Canonical identity contract

- Source of truth for authorization: resolve the authenticated caller server-side inside Convex functions.
- Current live helper: `getAuthUserId(ctx)` from `@convex-dev/auth/server`.
- Canonical ownership key for app data: Convex Auth `users._id`.
- Current user reader: `api.users.getCurrentUser` returns the authenticated user document or `null`.

## Important correction

Earlier planning notes referenced a custom `tokenIdentifier` mapping flow. That is no longer the live implementation.

Phase 2 must follow the code that exists now:

- `src/convex/schema.ts` includes Convex Auth tables via `authTables`
- `src/convex/users.ts` uses `getAuthUserId(ctx)`
- ownership should be stored against `users._id`, not a client-provided or separately looked up key

## Required helper usage

- `getAuthUserId(ctx)`
  - Purpose: resolve authenticated caller inside protected Convex functions.
  - Behavior: returns the authenticated `users._id` or `null`.

- `api.users.getCurrentUser`
  - Purpose: read currently authenticated internal user document for UI bootstrap.
  - Behavior: returns `null` when no authenticated user is present.

- `api.users.ensureCurrentUser`
  - Purpose: assert authentication before protected flows that require a user document.
  - Behavior: throws `Not authenticated` when no authenticated user is present.

## Phase 2 implementation rules

1. Never accept `userId` from client input for authorization decisions.
2. Resolve the authenticated caller server-side in each protected query/mutation.
3. Scope every protected read/write to the resolved `users._id` ownership key.
4. Reject writes to records not owned by the caller.
5. Preserve explicit error messages (`Not authenticated`, `Unauthorized`).

## Route/data protection dependency notes

- Protected route redirects (AUTH-04) should align with shell auth states from `src/routes/+layout.svelte`.
- Current auth architecture is browser-established, so initial Phase 2 route guards should be client-side.
- DATA-02 ownership changes should reference `users._id` produced by Convex Auth.
