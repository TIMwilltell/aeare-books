# Phase 1: Foundation & Core Flow - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can scan books using their phone camera and manage a local library of books. This is the offline-capable foundation — barcode scanning, library view with search, and home screen installation.
</domain>

<decisions>
## Implementation Decisions

### Library Layout
- **D-01:** Books displayed as compact **list view** (not grid)
- **D-02:** Each list row shows: **Title + Author + AR level/points** (when available)

### Scanner Flow
- **D-03:** After barcode scan → **full-screen form page** (navigates away from scanner)
- **D-04:** Form has **explicit Cancel button** (not back arrow) to return to library

### App Navigation
- **D-05:** **Floating action button (FAB)** for scan action — overlays library view
- **D-06:** **Top search bar** for library filtering (persistent at top)

### Empty State
- **D-07:** Empty library shows **friendly prompt with Scan button** (not just blank or illustrated)

### Delete Flow
- **D-08:** Delete shows **confirmation dialog** ("Delete [title]?" with Cancel/Delete buttons)

### the agent's Discretion
- Color scheme and typography choices
- Exact spacing/padding values
- Animation/transitions
- Error state messaging
- Loading indicators
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Core value: parents catalog books + track AR progress without manual entry
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: SCAN-01-04, LIB-01-04, PWA-03
- `.planning/ROADMAP.md` — Phase 1 goal: users can scan books and manage library offline
- `.planning/research/STACK.md` — Recommended: SvelteKit + Quagga2 + Dexie.js

### Out of Scope (from PROJECT.md)
- App store native app
- Real-time sync across devices
- User authentication
- Reading recommendations

No external specs — requirements fully captured in decisions above.
</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing code — greenfield project

### Established Patterns
- No established patterns yet — this phase establishes the foundation

### Integration Points
- Scanner → Form → Library flow
- FAB triggers scanner view
- Search bar filters library list
- Delete button in book detail or list row
</code_context>

<specifics>
## Specific Ideas

- No specific references or examples mentioned
- Open to standard approaches for unspecified UI details
</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.
</deferred>

---

*Phase: 01-foundation-core-flow*
*Context gathered: 2026-03-23*
