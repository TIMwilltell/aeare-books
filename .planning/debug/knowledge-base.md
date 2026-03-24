# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## 500-error-lifecycle — lifecycle_outside_component error on page load
- **Date:** 2026-03-24
- **Error patterns:** lifecycle_outside_component, 500 error, page load
- **Root cause:** setupConvex() called in src/lib/convex-client.ts at module scope. This runs BEFORE any component mounts, causing the 'lifecycle_outside_component' error. The function must be called inside a component's script block.
- **Fix:** Moved setupConvex() call from src/lib/convex-client.ts (module-level) into +layout.svelte's script block (component-level). Deleted convex-client.ts as it's no longer needed.
- **Files changed:** src/routes/+layout.svelte, src/lib/convex-client.ts (deleted)