# Phase 2 Handoff: Identity Contract and Access Helpers

Phase 1 established the canonical identity mapping that Phase 2 route/data protection must consume.

## Canonical identity contract

- Source of truth: `ctx.auth.getUserIdentity()` inside Convex functions.
- Canonical external key: `identity.tokenIdentifier` (not `identity.subject`).
- Internal mapping table: `users` in `src/convex/schema.ts`.
- Required lookup index: `by_tokenIdentifier`.

## Required helper usage

- `api.users.getCurrentUser`
  - Purpose: Read currently authenticated internal user.
  - Behavior: throws `Not authenticated` when no identity.

- `api.users.ensureCurrentUser`
  - Purpose: Upsert and return user profile for authenticated caller.
  - Behavior: idempotent by `tokenIdentifier`; updates profile metadata/`lastSeenAt`.

## Phase 2 implementation rules

1. Never accept `userId` from client input for authorization decisions.
2. Resolve identity server-side in each protected query/mutation.
3. Translate auth identity -> internal user through `tokenIdentifier` lookup.
4. Scope every protected read/write to the resolved internal user ownership key.
5. Preserve explicit error messages (`Not authenticated`, `Unauthorized`).

## Route/data protection dependency notes

- Protected route redirects (AUTH-04) should align with shell auth states from `src/routes/+layout.svelte`.
- ACL enforcement (ACL-01/02/03) should rely on existing helper contract, not redefine identity strategy.
- DATA-02 ownership changes should reference internal user IDs generated from the `users` table mapping.
