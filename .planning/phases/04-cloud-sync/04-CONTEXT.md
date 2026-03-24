# Phase 4: Cloud Sync & Export — Context

## User Decisions (LOCKED)

| Decision ID | Decision | Rationale |
|-------------|-----------|-----------|
| D-01 | Use Convex for sync backend | Opensourced, generous free-tier, cross-device sync |
| D-02 | Export format: JSON | Preserves all fields, easier to re-import |
| D-03 | Sync: Auto + Manual | Auto-sync in background, "sync now" button, warning banner if unsynced |

## Requirements Addressed

- **PWA-01**: App works offline (scan, view library, enter data)
- **PWA-02**: App syncs data when connection restored
- **PWA-04**: App shows clear offline/online status indicator
- **EXPT-01**: User can export library data
- **EXPT-02**: Export includes all book fields and progress data

## Current State

- Dexie.js for local IndexedDB (already installed)
- Book and ProgressEvent tables already defined
- SyncQueue table exists but unused
- No Convex installed yet

## Reference

- Convex Svelte integration: `.planning/research/convex/svelte_quickstart.md`
- Current DB schema: `src/lib/db/index.ts`
- Current types: `src/lib/types/book.ts`

## Implementation Notes

- Keep Dexie.js for local-first offline capability
- Add Convex on top for cloud sync
- Use `useQuery` and `useMutation` from convex-svelte
- Convex provides automatic conflict resolution
- JSON export should include both books and progress events
