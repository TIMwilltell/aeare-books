# Project Research Summary

**Project:** AeAre Books — Mobile PWA Book Tracking App
**Domain:** Book scanning/library tracking PWA for AR reading progress
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

AeAre Books is a mobile-first PWA that enables parents to scan books using their phone cameras, automatically fetch metadata from Google Books, lookup AR (Accelerated Reader) levels, and track reading progress. Research strongly recommends using Figma with Dev Mode as the design tool paired with Skeleton UI component library for SvelteKit to achieve professional design handoff. The core architecture follows an offline-first pattern with IndexedDB as the source of truth, Service Worker for PWA capabilities, and a BFF proxy for AR scraping. The primary risks are iOS barcode scanner reliability, Google Books API missing some books, AR scrape breakage when Renaissance changes their site, and IndexedDB corruption on Safari. All core functionality exists — this research focuses on creating a professional design spec to hand off to a designer for v1.1 UI implementation.

## Key Findings

### Recommended Stack

**Design Tool:** Figma with Dev Mode — Industry standard for design-to-developer handoff, provides exact measurements, CSS export, and component property inspection.

**Component Library:** Skeleton (primary) — Full design system with official Figma UI Kit included, built specifically for Svelte/SvelteKit, Tailwind-based theming, comprehensive component coverage. Konsta UI is a mobile-focus alternative better suited for camera-based UX patterns.

**Target Platform:** SvelteKit mobile-first PWA with offline capability

**Core technologies:**
- **Figma Dev Mode:** Design handoff tool with inspect panel, code snippets, component properties
- **Skeleton UI:** Svelte component library with Figma UI Kit bridge
- **Tailwind CSS v4:** Styling foundation (already in project)
- **Dexie.js:** IndexedDB wrapper handling Safari quirks
- **@zxing/library:** Barcode scanning (primary on iOS, not native BarcodeDetector)

### Expected Features

**Must have (table stakes):**
- Barcode scanning with camera — Core user flow
- Google Books metadata fetch — Auto-populate book details
- AR level/points lookup — Via arbookfind.com scraping
- Library view (grid/list) — Display scanned books
- Mark as read with quiz score — Progress tracking
- Offline-first operation — Works without network

**Should have (competitive):**
- PWA installability — Home screen installation
- Custom offline indicator — Visual feedback when offline
- Sync status indicator — "Saved locally" → "Synced" progression
- Search/filter library — Find books quickly

**Defer (v2+):**
- Multiple child profiles — Single user for v1
- Cloud backup beyond Google Sheets — Manual export sufficient
- Advanced analytics — Basic stats only

### Architecture Approach

The architecture follows an offline-first PWA pattern with IndexedDB as the source of truth. All reads come from local IndexedDB; sync to Google Sheets happens in background via a sync queue. Service Worker with Workbox handles caching with Network First for HTML and Cache First for static assets.

**Major components:**
1. **Scanner UI** — Camera access, barcode detection via @zxing/library, manual ISBN entry fallback
2. **Library UI** — Book grid/list with search/filter, powered by IndexedDB
3. **State Management** — Zustand for connectivity/UI state, IndexedDB for persistence
4. **BFF Proxy** — Edge function for AR scraping (hides secrets, avoids CORS)
5. **SyncService** — Background sync queue with retry logic

### Critical Pitfalls

1. **iOS Barcode Scanner Unreliability** — Use @zxing/library (not native BarcodeDetector), configure iOS-friendly camera constraints, always provide manual ISBN entry fallback
2. **Google Books API Missing Books** — Try both ISBN-10 and ISBN-13 formats, include realistic User-Agent, fallback to Open Library API
3. **AR Scrape Breakage** — Design for failure (AR is optional), implement graceful degradation, cache successful lookups, show "AR unavailable" with manual entry option
4. **IndexedDB Safari Corruption** — Use Dexie.js wrapper (handles Safari quirks), wrap writes in transactions, implement storage quota monitoring
5. **PWA Stale HTML Caching** — Never use Cache First for HTML, use Network First with cache fallback, show "Update available" prompt
6. **Offline Writes Disappear** — Implement outbound queue pattern, use Background Sync API, show sync status indicator
7. **Design Spec Missing PWA Install Requirements** — Specify icons (192x192, 512x512, maskable), theme color, display mode, start URL

## Implications for Roadmap

Based on research, this is not a new build — the core functionality exists. The roadmap is for creating a professional design spec (v1.1) to hand off to a designer, then implementing the refined UI.

### Phase 1: Design System Foundation
**Rationale:** Establishes the foundation before any screen design — colors, typography, spacing, icons all need to be defined first to ensure consistency across the app.

**Delivers:** Design tokens (color palette, typography, spacing scale, shadows), icon set selection, Figma variables setup

**Addresses:** STACK.md design tool setup, FEATURES.md design system foundation

**Avoids:** Designer-developer language mismatch — use CSS property names in specs

### Phase 2: Component Specifications
**Rationale:** Components are reusable across all screens — build these first so screen designs can reference them.

**Delivers:** All reusable components with states documented (buttons, inputs, cards, modals, toasts, badges, loading states, empty states)

**Addresses:** FEATURES.md component specifications, PITFALLS.md missing component states pitfall

**Avoids:** Implementing only default states — document hover, focus, disabled, loading, error states

### Phase 3: Screen Designs
**Rationale:** With design system and components ready, create full mockups for each screen.

**Delivers:** Library view, scan flow, book detail, progress entry, settings screens with all states (default, loading, empty, error)

**Addresses:** FEATURES.md screen-level design requirements

**Avoids:** Undefined responsive behavior — specify mobile-first breakpoints, safe areas, 44x44px touch targets

### Phase 4: PWA & Accessibility Refinement
**Rationale:** PWA installability and accessibility must be designed explicitly — these are often afterthoughts.

**Delivers:** PWA manifest specifications (icons, theme color, display mode), accessibility checklist (WCAG AA), offline state designs

**Addresses:** STACK.md PWA integration, PITFALLS.md PWA stale HTML and offline state pitfalls

**Avoids:** Missing PWA install requirements — include icon specs, install prompt design

### Phase 5: Design Handoff & Implementation
**Rationale:** The final phase — professional handoff to developers with all specifications documented.

**Delivers:** Design walkthrough meeting, component inventory, responsive specs, animation specifications, review checkpoints

**Addresses:** ARCHITECTURE.md design spec structure

**Avoids:** Handoff without shared understanding — schedule walkthrough, establish Q&A channel

### Phase Ordering Rationale

- Design system first because all downstream work depends on consistent tokens
- Components before screens because screens reuse components
- PWA/Accessibility in middle because they're easily overlooked
- Handoff last because it requires all preceding work complete

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (Screen Designs):** Camera UI overlay patterns need specific design not available in component library — may need custom design exploration

Phases with standard patterns (skip research-phase):
- **Phase 1 (Design System):** Well-established design token methodology
- **Phase 2 (Components):** Standard component state patterns from Skeleton
- **Phase 4 (PWA/A11y):** WCAG and PWA installability well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Figma Dev Mode + Skeleton is established industry pattern |
| Features | HIGH | All functionality exists — design spec is about UI documentation |
| Architecture | HIGH | Offline-first PWA pattern well-established with extensive sources |
| Pitfalls | MEDIUM-HIGH | Some AR scrape risks are inherent to scraping, hard to fully predict |

**Overall confidence:** HIGH

### Gaps to Address

- **AR scrape resilience:** Renaissance changes site structure — need monitoring system in place to detect when scraping breaks
- **Camera UI custom design:** Barcode scanning overlay patterns aren't available in component libraries — may need design exploration
- **Real device testing:** All research is documentation-based — actual iOS testing needed for scanner reliability

## Sources

### Primary (HIGH confidence)
- Figma Dev Mode documentation (2026)
- Skeleton UI official docs (skeleton.dev)
- Dexie.js IndexedDB wrapper documentation
- WCAG 2.1 Accessibility Guidelines

### Secondary (MEDIUM confidence)
- PITFALLS.md iOS scanner issues — Stack Overflow and barcode detection guides
- ARCHITECTURE.md PWA patterns — MDN, Workbox documentation

### Tertiary (LOW confidence)
- AR scrape anti-detection — Modern bot detection is evolving rapidly; needs monitoring

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*