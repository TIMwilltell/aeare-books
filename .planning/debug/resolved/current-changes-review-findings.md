---
status: resolved
trigger: "Investigate issue: current-changes-review-findings"
created: 2026-04-05T00:00:00Z
updated: 2026-04-06T00:00:00Z
---

## Current Focus

hypothesis: confirmed resolved; user verified the hardened local magic-link/auth changes in the real workflow and requested final archival
test: archive the resolved session and record the known pattern in the debug knowledge base
expecting: resolved debug file moved under .planning/debug/resolved and knowledge base updated with this incident
next_action: move the resolved debug file, append the knowledge-base entry, and finalize the session

## Symptoms

expected: The app should fail closed when Convex env vars are missing, dev inbox email HTML should not execute active same-origin content, homepage search should handle transient backend/auth failures with recovery UI instead of unhandled rejections, and auth buttons should reliably re-enable after sign-in/sign-out flows that do not immediately navigate.
actual: Missing Convex env vars still boot the app against https://jovial-wildcat-461.convex.cloud in several files; the dev inbox injects captured email HTML into an iframe via srcdoc without sandbox; homepage handleSearch() awaits searchBooks(searchQuery) without try/catch; authActionPending in +layout.svelte is only cleared on failure, so some successful-but-non-navigating paths may leave controls disabled.
errors: No concrete runtime stack traces provided. Review findings reference these locations: src/routes/+layout.svelte:32 and 124-145, src/lib/auth/auth0.ts:135, src/lib/db/index.ts:56, src/lib/api/export.ts:13, src/routes/api/test/auth-email/+server.ts:7-15 and 23-52, src/routes/dev/inbox/+page.svelte:164-167, src/routes/+page.svelte:70-80.
reproduction: 1) Unset VITE_CONVEX_URL or server-side Convex env and boot local/test build; verify whether it connects to remote production backend. 2) Capture a test email containing active HTML/script content and open /dev/inbox; verify whether iframe srcdoc executes same-origin content. 3) Trigger a transient Convex/auth failure during signed-in homepage search and observe whether handleSearch causes an unhandled rejection and missing recovery UI. 4) Exercise signIn()/signOut() paths that resolve successfully without immediate navigation or auth-state rerender and observe whether auth buttons remain disabled.
started: Issues are reported against the current changes from review; not enough history to know whether they ever worked correctly before.

## Eliminated

## Evidence

- timestamp: 2026-04-05T00:05:00Z
  checked: .planning/debug/knowledge-base.md
  found: Only prior known pattern is lifecycle_outside_component from setupConvex module-scope initialization; no direct match for these review findings.
  implication: No reusable diagnosis beyond being careful with Convex client setup in Svelte lifecycle.

- timestamp: 2026-04-05T00:06:00Z
  checked: src/routes/+layout.svelte
  found: setupConvex() uses import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud' and handleSignIn/handleSignOut set authActionPending=true but only clear it in catch blocks.
  implication: Missing env vars fail open to a hard-coded remote backend, and successful auth flows can leave controls disabled unless some external rerender/navigation resets state.

- timestamp: 2026-04-05T00:07:00Z
  checked: src/lib/auth/auth0.ts, src/lib/db/index.ts, src/lib/api/export.ts, src/routes/api/test/auth-email/+server.ts
  found: Each file constructs a Convex client with the same hard-coded fallback URL or helper that returns it when env vars are absent.
  implication: The production-backend fallback is systemic rather than isolated to one entry point.

- timestamp: 2026-04-05T00:08:00Z
  checked: src/routes/dev/inbox/+page.svelte
  found: The dev inbox renders arbitrary captured email HTML into <iframe srcdoc={latest.html}> with no sandbox attribute.
  implication: Active email HTML can execute same-origin script/content in the app context.

- timestamp: 2026-04-05T00:09:00Z
  checked: src/routes/+page.svelte
  found: handleSearch() awaits searchBooks(searchQuery) without try/catch or error state, while loadBooks() already catches failures and empties results.
  implication: Transient backend/auth failures during interactive search can surface as unhandled promise rejections with no recovery UI.

- timestamp: 2026-04-05T00:11:00Z
  checked: src/lib/auth/auth0.ts lines 308-360
  found: signIn() can resolve successfully after sending a magic link while leaving authState as signed-out, and signOut() always resolves to signed-out without navigation; neither layout handler clears authActionPending on success.
  implication: The sticky-disabled auth button finding is directly reproducible from the code path, not just theoretical.

- timestamp: 2026-04-05T00:12:00Z
  checked: repository search for jovial-wildcat-461.convex.cloud
  found: Exactly five source locations hard-code the production Convex deployment URL and one server helper wraps it as FALLBACK_CONVEX_URL.
  implication: A centralized fail-closed URL helper is the smallest durable fix.

- timestamp: 2026-04-05T00:25:00Z
  checked: patched source files
  found: Added shared client/server Convex URL helpers that throw when env vars are missing, replaced all hard-coded URL defaults, sandboxed the inbox iframe, added libraryError retry UI for homepage load/search failures, and moved authActionPending cleanup into finally blocks.
  implication: Each reported review finding now has a direct targeted code fix.

- timestamp: 2026-04-05T00:27:00Z
  checked: Svelte autofixer for src/routes/+layout.svelte, src/routes/dev/inbox/+page.svelte, src/routes/+page.svelte
  found: No issues or suggestions returned.
  implication: The Svelte component changes are syntactically and idiomatically acceptable.

- timestamp: 2026-04-05T00:30:00Z
  checked: repository grep for fallback URL plus bun run check
  found: No remaining hard-coded production fallback references under src/, and svelte-check reported 0 errors and 0 warnings.
  implication: Static verification passed; remaining confidence gap is real workflow/runtime behavior.

- timestamp: 2026-04-05T00:38:00Z
  checked: checkpoint response plus src/lib/auth/auth0.ts and @convex-dev/auth signOut implementation
  found: User-reported runtime failure is a Convex OCC conflict inside auth:signOut touching authRefreshTokens. Local signOut() makes a single client.action(api.auth.signOut,{}) call, while the library's signOut mutation deletes the current session and all authRefreshTokens for that session in one transaction.
  implication: The new regression is in runtime interaction around logout rather than the earlier UI cleanup fix; another concurrent auth-related operation is likely mutating the same refresh-token records during sign-out.

- timestamp: 2026-04-05T00:49:00Z
  checked: src/routes/+layout.svelte, src/lib/auth/auth0.ts, src/lib/db/index.ts, src/lib/api/export.ts, convex-svelte client setup
  found: The app was running multiple independent auth-enabled ConvexClient instances: one from convex-svelte setup in the root layout, one singleton inside auth0.ts, a fresh client for db helpers, and another fresh client for export. Each instance pointed at the same localStorage-backed JWT/refresh tokens and could call fetchAccessToken()/auth actions independently.
  implication: Same-browser auth work was not coordinated, so refresh/sign-out operations could contend on the same authRefreshTokens rows and surface OCC failures during logout.

- timestamp: 2026-04-05T00:57:00Z
  checked: bun run check, Playwright auth-route-guards sign-in/export/sign-out flow, repeated Playwright sign-out stress script
  found: After switching browser auth usage to a shared Convex client and serializing auth actions, svelte-check still passed with 0 errors/warnings; the focused Playwright auth flow passed end-to-end including export and sign-out; and 10 repeated magic-link sign-in/sign-out runs completed with zero authRefreshTokens/OCC/server errors.
  implication: The fix addresses the observed logout contention and holds under repeated browser auth flows.

## Resolution

root_cause: Current changes hard-coded a production Convex deployment as a default when env vars are missing, rendered captured email HTML into an unsandboxed srcdoc iframe, left homepage search errors uncaught with no UI recovery path, only cleared layout authActionPending on failure even though signIn/signOut can succeed without navigation, and still allowed multiple auth-enabled Convex clients plus overlapping auth actions to mutate the same authRefreshTokens/session records during logout.
fix: Introduced fail-closed Convex URL helpers for client and server usage, replaced every hard-coded fallback URL, sandboxed the dev inbox HTML iframe, added homepage library error/retry handling around load and search flows, cleared authActionPending in finally blocks for sign-in/sign-out handlers, centralized browser Convex usage on a shared client, and serialized auth sign-in/refresh/sign-out actions so they cannot overlap against the same refresh-token state.
verification: bun run check passed with 0 errors and 0 warnings; Svelte autofixer returned no issues for the updated layout; bunx playwright test tests/e2e/auth-route-guards.spec.ts -g "local auth inbox completes a full magic-link sign-in flow" passed; and a Playwright script completed 10 repeated magic-link sign-in/sign-out runs with zero authRefreshTokens/OCC/server errors.
files_changed: [src/lib/convex/url.ts, src/lib/convex/serverUrl.ts, src/lib/convex/client.ts, src/routes/+layout.svelte, src/lib/auth/auth0.ts, src/lib/db/index.ts, src/lib/api/export.ts, src/routes/api/test/auth-email/+server.ts, src/routes/dev/inbox/+page.svelte, src/routes/+page.svelte]
