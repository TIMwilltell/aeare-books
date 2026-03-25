# Phase 6 Discussion Log

> **Phase:** 06 - Screen Designs  
> **Status:** Planning  
> **Started:** 2026-03-24

---

## Phase Overview

**Goal:** Design spec provides mockups for all app screens with responsive behavior

**Depends on:** Phase 5 (Component Specifications)

**Requirements:** SCRN-01, SCRN-02, SCRN-03, SCRN-04, SCRN-05, SCRN-06

---

## Screen Requirements

### SCRN-01: Library Screen
- List/grid view toggle
- Search bar
- Book cards showing thumbnail, title, author, AR badges
- Empty state when no books
- FAB for scan action

### SCRN-02: Scan Flow Screen
- Camera view with scan frame overlay
- Scan button (large, prominent)
- Manual ISBN entry option
- Loading state during scan
- Error handling for camera issues

### SCRN-03: Book Detail Screen
- Large cover image
- Metadata section (title, author, ISBN)
- AR level and points (with fetched vs. manual badge)
- Reading progress section
- Edit button
- Delete option

### SCRN-04: Add/Edit Progress Screen
- Read date picker
- Quiz score input (0-100)
- Quiz date picker
- Notes textarea
- Save/Cancel buttons

### SCRN-05: Settings/Export Screen
- Sync status indicator
- Last sync timestamp
- Manual sync button
- Export to JSON button
- Offline indicator
- App version info

### SCRN-06: Responsive Behavior
- Mobile (default): Single column, bottom nav
- Tablet: Two-column grid for library
- Desktop: Side navigation, three-column grid

---

## Discussion Topics

### 1. Design Approach
- Use Stitch for screen mockups (like phase 5)
- Coordinate with component specs from COMPONENT-SPEC.md
- Consider responsive breakpoints early

### 2. Screen Flow
- Navigation pattern: Bottom nav (mobile) vs sidebar (desktop)
- Tab structure: Library | Scan | Settings
- Modal vs full-page for detail views

### 3. Responsive Strategy
- Mobile-first approach
- Breakpoints: 600px (tablet), 1024px (desktop)
- Adaptive layouts for each screen

---

## Decisions Needed

1. **Screen flow structure:** How to handle navigation between screens
2. **Detail view presentation:** Modal or full-page?
3. **Responsive navigation:** Bottom tabs vs hamburger menu for mobile

---

## Notes

- Building on COMPONENT-SPEC.md from phase 5
- Design system: "Literary Horizon" (Stitch Project 3676387148203023923)
- Match the component specifications already defined

---

*Discussion started: 2026-03-24*
