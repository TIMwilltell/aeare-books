# AeAre Books

## What This Is

A progressive web app that lets parents scan a book barcode with their phone, auto-populates book metadata (title, author, ISBN) via a public books API, attempts to fetch AR level/points via scraping arbookfind.com, and tracks reading progress and AR quiz scores for children.

## Core Value

Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

## Requirements

### Validated

- [x] User can scan book barcode with phone camera
- [x] App auto-populates title, author, ISBN from book metadata API
- [x] App attempts to fetch AR level/points from arbookfind.com scrape
- [x] AR data degrades gracefully to manual entry if scrape fails
- [x] User can mark book as read with date
- [x] User can enter AR quiz score with date
- [x] User can view library of books
- [x] User can export/share library data

### Active

- [ ] Verify AR scrape resilience after upstream HTML changes
- [ ] Decide whether true local IndexedDB persistence is still required
- [ ] Decide whether export payload should include progress event history

### Out of Scope

- App store native app — PWA only, works in mobile browser
- Real-time sync across devices — single-user local-first
- Authentication/user accounts — single device/family use
- Reading recommendations or book suggestions
- Integration with school AR systems directly

## Context

- Product is already implemented in `src/` and currently usable as a mobile-first PWA.
- Backend is Convex, with AR scraping routed through Cloudflare Browser Rendering + Puppeteer.
- Metadata lookup is currently based on Open Library in the running implementation.
- Planning docs were reduced during `context-cleanup`; code + top-level docs are the active truth.
- Primary operational risk remains external AR HTML changes, which can break scrape reliability.

## Constraints

- **PWA Architecture**: Must run in mobile browser, installable to home screen, no app store
- **AR Data Reliability**: AR scrape is fragile — must degrade gracefully
- **Offline Capability**: Should work partially offline (scan, form, submit when connected)
- **Backend Required**: Small backend needed for AR scrape (avoids CORS)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native app | Works on any smartphone, no app store, easy updates | Implemented |
| Convex for backend/data | Simple hosted backend with realtime capabilities | Implemented |
| Metadata lookup via public book API | Minimize manual entry effort | Implemented (Open Library in current code) |
| arbookfind.com scrape for AR | No official API exists | Implemented with graceful fallback expectations |
| Graceful degradation for AR | Scrape may fail; manual fallback needed | Implemented principle; ongoing reliability verification |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

## Current Milestone: none (last completed: context-cleanup)

**Latest completed milestone:** Context Cleanup

**Outcome:**
- Historical planning materials archived under `.planning/phases/`
- Live project truth centered on `src/`, `README.md`, and `CLAUDE.md`
- `.planning/ROADMAP.md` retained as historical context only

**Next milestone candidate:** Reliability hardening for scanner + AR scrape

---
*Last updated: 2026-04-01 after `/gsd-complete-milestone` review*
