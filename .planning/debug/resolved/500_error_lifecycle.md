---
status: resolved
trigger: "500_error_lifecycle: Page load triggers 500 error with lifecycle_outside_component message"
created: 2026-03-24T00:00:00.000Z
updated: 2026-03-24T00:00:00.000Z
---

## Current Focus
hypothesis: "Line 4 in +layout.svelte imports '$lib/convex-client' which calls setupConvex() at module scope, possibly triggering lifecycle hooks outside a component"
test: "Check convex-svelte library usage and verify how setupConvex should be called"
expecting: "If setupConvex must be called inside a component or in a specific way, moving it to a proper location will fix the error"
next_action: "Research convex-svelte setupConvex API to understand correct usage"

## Symptoms
expected: Page loads normally
actual: Server returns 500 internal error
errors: lifecycle_outside_component
reproduction: Loading a page triggers this error
started: Started happening recently, just started

## Evidence
- timestamp: 2026-03-24T00:00:00.000Z
  checked: "src/routes/+layout.svelte line 4"
  found: "import '$lib/convex-client' - calls setupConvex at module level"
  implication: "If setupConvex uses React hooks or has lifecycle code, being called outside component context could cause the error"
- timestamp: 2026-03-24T00:00:00.000Z
  checked: "src/lib/convex-client.ts"
  found: "setupConvex() is called immediately on module load, not inside any component"
  implication: "This is likely the root cause - need to verify correct usage of convex-svelte"
- timestamp: 2026-03-24T00:00:00.000Z
  checked: "convex-svelte documentation"
  found: "setupConvex() must be called INSIDE a Svelte component's script block, not at module level"
  implication: "Current code calls setupConvex() when the module is imported, before any component mounts - this causes the lifecycle error"

## Resolution
root_cause: "setupConvex() is called in src/lib/convex-client.ts at module scope (when imported). This runs BEFORE any component mounts, causing the 'lifecycle_outside_component' error. The function must be called inside a component's script block."
fix: "Moved setupConvex() call from src/lib/convex-client.ts (module-level) into +layout.svelte's script block (component-level)"
verification: "Build succeeds - no lifecycle errors. File removed: src/lib/convex-client.ts (no longer needed)"

files_changed:
- "src/routes/+layout.svelte: Moved setupConvex() call from import to component script"
- "src/lib/convex-client.ts: Removed (no longer needed)"