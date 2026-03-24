# AeAre Books

## What This Is

A progressive web app that lets parents scan a book barcode with their phone, auto-populates book metadata (title, author, ISBN) via Google Books API, attempts to fetch AR level/points via scraping arbookfind.com, and tracks reading progress and AR quiz scores for children.

## Core Value

Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can scan book barcode with phone camera
- [ ] App auto-populates title, author, ISBN from Google Books API
- [ ] App attempts to fetch AR level/points from arbookfind.com scrape
- [ ] AR data degrades gracefully to manual entry if scrape fails
- [ ] User can mark book as read with date
- [ ] User can enter AR quiz score with date
- [ ] All dates are tracked in sequence
- [ ] User can view library of books
- [ ] User can export/share library data

### Out of Scope

- App store native app — PWA only, works in mobile browser
- Real-time sync across devices — single-user local-first
- Authentication/user accounts — single device/family use
- Reading recommendations or book suggestions
- Integration with school AR systems directly

## Context

- Parent wanting to track children's AR reading progress
- AR BookFinder (arbookfind.com) has no public API — requires scraping
- Renaissance may change HTML structure at any time, breaking scrapes
- Google Books API is free, no API key required for basic use
- Plan to store data in Google Sheets for easy viewing/editing/export

## Constraints

- **PWA Architecture**: Must run in mobile browser, installable to home screen, no app store
- **AR Data Reliability**: AR scrape is fragile — must degrade gracefully
- **Offline Capability**: Should work partially offline (scan, form, submit when connected)
- **Backend Required**: Small backend needed for AR scrape (avoids CORS)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| PWA over native app | Works on any smartphone, no app store, easy updates | — Pending |
| Google Books API for metadata | Free, no key, reliable | — Pending |
| arbookfind.com scrape for AR | No official API exists | — Pending |
| Google Sheets for storage | Easy to view/edit/export/share | — Pending |
| Graceful degradation for AR | Scrape may fail; manual fallback needed | — Pending |

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

## Current Milestone: v1.1 Design Spec

**Goal:** Create a comprehensive design spec document to give to a designer so we can implement real designs.

**Target features:**
- Design system specification (colors, typography, spacing)
- UI component specifications (buttons, cards, forms, modals)
- Screen-level design requirements
- Responsive design specifications
- Accessibility requirements

---
*Last updated: 2026-03-24 after milestone v1.1 started*
