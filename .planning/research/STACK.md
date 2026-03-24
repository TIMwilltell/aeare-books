# Technology Stack: Design Spec for Professional UI Implementation

**Project:** AeAre Books — v1.1 Design Spec Creation
**Researched:** 2026-03-24
**Milestone:** Creating design spec to hand off to a designer
**Confidence:** HIGH

## Executive Summary

Creating a professional design spec for this SvelteKit book scanning PWA requires three layers:

1. **Design Tool** — Figma with Dev Mode for design-to-developer handoff
2. **Component Library** — Skeleton (primary) or Konsta UI (mobile-focus alternative) for SvelteKit-compatible UI components
3. **Specification Format** — Zero-ambiguity design documentation ensuring clear communication between designer and developer

For this mobile-first PWA where parents scan books with their phone cameras, mobile optimization is critical. Konsta UI is particularly well-suited for camera-based UX patterns, while Skeleton provides better design-handoff integration via its Figma UI Kit.

---

## 1. Design Tool Recommendation

### Primary: Figma (with Dev Mode)

| Aspect | Recommendation |
|--------|----------------|
| **Why Figma** | Industry-standard for design handoff; Dev Mode provides exact measurements, CSS export, and component property inspection |
| **Version** | Figma Professional (paid) — enables full Dev Mode features |
| **Alternative** | Figma Free tier (limited Dev Mode capabilities) |

**Dev Mode capabilities needed for this project:**

- Inspect panel for exact spacing, colors, typography values
- Code snippet generation (CSS, iOS Swift, Android XML)
- Component property inspection (variants, props)
- Version history comparison for design changes
- Design token sync (if using connected libraries)

**Why Figma over alternatives:**

- **Sketch**: Mac-only, less common in 2026, weaker developer handoff
- **Adobe XD**: Deprecated by Adobe, no longer actively developed
- **Penpot**: Open-source alternative but less mature handoff tooling

**Confidence:** HIGH — Figma with Dev Mode is the clear industry standard for design-dev handoff in 2026

---

## 2. Component Library for SvelteKit

### Recommendation: Skeleton (Primary) or Konsta UI (Mobile-Focus Alternative)

#### Option A: Skeleton (Recommended for Design Handoff)

| Aspect | Details |
|--------|---------|
| **Why Skeleton** | Full design system with official Figma UI Kit included; built specifically for Svelte and SvelteKit; Tailwind-based theming; comprehensive component coverage |
| **Components** | Buttons, cards, forms, inputs, modals, tables, accordions, breadcrumbs, steppers, toasts, tooltips, avatars, etc. |
| **Styling** | Tailwind CSS (v4 compatible) |
| **Svelte Version** | Svelte 4/5 compatible |
| **Figma Support** | Yes — official Figma UI Kit included |
| **License** | MIT (open source) |
| **Best for** | Projects needing strong design-dev handoff bridge |

**Why Skeleton fits this project:**
- Figma UI Kit directly maps to code components — designers can design in Figma using components that match the code
- Theme system handles color/spacing consistency across all screens
- Component coverage matches book tracking app needs:
  - **Cards** — Book entries in library view
  - **Forms** — Data entry for book metadata, AR scores
  - **Modals** — Confirmation dialogs, editing forms
  - **Badges** — AR level/points display
  - **Avatars** — Book cover thumbnails
  - **Toasts** — Success/error notifications
- Accessibility-first (WAI-ARIA compliant components)
- Dark mode support built-in

**Installation:**
```bash
npm install @skeletonlabs/skeleton @skeletonlabs/skeleton-themes
```

#### Option B: Konsta UI (Mobile-Focus Alternative)

| Aspect | Details |
|--------|---------|
| **Why Konsta UI** | Built specifically for mobile PWAs; pixel-perfect iOS and Material Design components; optimized for touch interactions |
| **Components** | Navbar, toolbar, cards, lists, modals, toast, sheet, actions, etc. — all mobile-optimized |
| **Styling** | Tailwind CSS |
| **Svelte Support** | Svelte 5 compatible |
| **Figma Support** | No official kit |
| **License** | MIT (open source) |
| **Best for** | Pure mobile-first PWA where native mobile feel is priority |

**Why Konsta UI fits this project:**
- Perfect for barcode scanning UX — camera viewport components, native mobile patterns
- iOS/Material Design themes match parent expectations on phone UIs
- Smaller bundle size than full design systems
- Optimized for touch targets (44px+ minimums)
- Sheet modals, action sheets, swipe gestures built-in

**When to choose Konsta over Skeleton:**
- If design will be purely mobile (no desktop variant needed)
- If native iOS/Material look is preferred over custom design system
- If barcode scanning UI needs custom camera viewport patterns

**Installation:**
```bash
npm install konsta
```

#### Other Svelte Libraries Considered and Rejected

| Library | Verdict | Reason |
|---------|---------|--------|
| **Flowbite-Svelte** | Strong alternative | 60+ components, Tailwind-based, but less design-system focused than Skeleton |
| **shadcn-svelte** | Good but code-first | Generates component code directly into project; less designer-oriented |
| **Bits UI** | Headless only | No pre-styles, requires building custom design system from scratch |
| **Lapikit** | Too limited | Only ~19 components, not enough for full app |
| **SvelteUI** | Older, less maintained | Not optimized for Svelte 5, documentation outdated |

**Confidence:** HIGH — Skeleton provides the best balance of component coverage + design-handoff tooling

---

## 3. Design Specification Format

### Professional Design Spec Structure

A zero-ambiguity design spec for this project should include these sections:

#### Section 1: Project Metadata
| Field | Value |
|-------|-------|
| Project Name | AeAre Books |
| Version | v1.1 Design Spec |
| Designer | [To be filled] |
| Developer | [To be filled] |
| Figma Link | [Link with Dev Mode enabled] |
| Target Implementation | Sprint/date |

#### Section 2: Design System Specifications

**Color Palette:**
- Primary color (app brand)
- Secondary/accent colors
- Semantic colors (success, error, warning, info)
- Light/dark mode variants
- Background colors (page, surface, elevated)
- Text colors (primary, secondary, disabled)

**Typography:**
- Font family (recommend: system fonts or Google Fonts)
- Type scale: h1, h2, h3, h4, h5, h6, body, small, caption
- Line heights
- Font weights

**Spacing System:**
- Base unit (recommend: 4px or 8px)
- Scale: 0, xs, sm, md, lg, xl, 2xl, 3xl
- Component padding standards

**Border Radius:**
- Scale: none, sm, md, lg, xl, full
- Usage: buttons, cards, inputs, modals

**Shadows:**
- Elevation levels: subtle, medium, high
- Usage: cards, modals, dropdowns

**Iconography:**
- Icon set (recommend: Phosphor Icons, Heroicons, or Lucide)
- Icon sizes: sm, md, lg
- Usage conventions

#### Section 3: Component Specifications

For each reusable component, document:

| Property | Description |
|----------|-------------|
| **Component Name** | e.g., BookCard, ScanButton |
| **Variants** | primary, secondary, ghost; small, medium, large |
| **States** | default, hover, active, disabled, loading, error |
| **Props/Parameters** | What data the component accepts |
| **Responsive Behavior** | How it adapts at breakpoints |
| **Accessibility** | ARIA attributes, keyboard interactions |

**Components needed for this app:**

| Component | Purpose |
|-----------|---------|
| **BookCard** | Display book in library grid/list |
| **BookCover** | Thumbnail with fallback for missing covers |
| **ARBadge** | Display AR level/points with fetch status indicator |
| **ScanButton** | Primary CTA for barcode scanner |
| **ManualEntryForm** | Fallback ISBN entry |
| **ProgressForm** | Mark as read, enter quiz score |
| **SearchBar** | Filter library |
| **EmptyState** | No books yet illustration |
| **LoadingState** | Skeleton loaders |
| **Toast** | Success/error notifications |
| **ConfirmDialog** | Delete confirmation |
| **OfflineIndicator** | Network status |

#### Section 4: Screen Specifications

For each screen in the app:

| Screen | Key Elements |
|--------|--------------|
| **Scan Screen** | Camera viewport, barcode overlay, manual entry toggle, loading states, permission denied state |
| **Book Detail Screen** | Cover image (sized), title/author/ISBN, AR data badges (fetched vs manual indicator), edit form, progress timeline |
| **Library Screen** | Grid/list toggle, search bar, filter chips (by child, by status), sort options, empty state |
| **Progress Entry Screen** | Read date picker, quiz score input (0-100), date picker, notes field |
| **Export Screen** | Format selection, preview, share button |

**Document for each screen:**
- All states (default, loading, empty, error)
- Responsive layout at mobile/tablet/desktop
- User flow interactions
- Edge cases

#### Section 5: Responsive Behavior

| Breakpoint | Width | Layout Changes |
|------------|-------|-----------------|
| Mobile (default) | < 640px | Single column, bottom navigation |
| Tablet | 640px - 1024px | Two columns for library |
| Desktop | > 1024px | Full grid, side navigation |

Document what components change at each breakpoint.

#### Section 6: Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| Color contrast | WCAG 2.1 AA (4.5:1 for text) |
| Focus indicators | Visible focus rings on all interactive elements |
| Touch targets | Minimum 44x44px on mobile |
| Screen reader | Proper ARIA labels, semantic HTML |
| Keyboard navigation | Full keyboard access |
| Reduced motion | Respect prefers-reduced-motion |

#### Section 7: Interaction Specifications

- Page transitions (recommend: fade or slide)
- Button press feedback
- Toggle animations
- Loading states (skeleton vs spinner)
- Error animations
- Empty state illustrations

---

## 4. Recommended Deliverables

### From Designer → Developer

1. **Figma file** with all screens and components
   - Dev Mode enabled
   - All variants and states included
   - Design tokens in shared library

2. **Design tokens** exported as:
   - JSON (for code integration)
   - Or linked via Figma variables

3. **Component inventory** — list of all components created with variants

4. **Interactive prototype** — for user flow validation

### Documentation Deliverable

Structured spec document (Notion, Confluence, or Google Docs) containing:

- Design system specifications (colors, typography, spacing)
- Component API (props, variants, states)
- Screen-by-screen requirements
- Accessibility checklist (completed)
- Responsive behavior documentation

### Meeting Deliverable

- **30-minute walkthrough** of most complex screens (likely scan screen + library)
- Q&A to clarify edge cases
- Confirmed acceptance criteria

---

## 5. Integration with Existing SvelteKit App

The existing AeAre Books app is built with:
- SvelteKit (Svelte 5)
- Tailwind CSS
- Dexie.js (IndexedDB)
- Quagga2 (barcode scanning)

**How component library integrates:**

| Existing Tech | Integration Point |
|--------------|-------------------|
| SvelteKit | Skeleton/Konsta both support SvelteKit SSR |
| Tailwind CSS | Both libraries built on Tailwind — extend existing config |
| Existing styles | Can coexist — use component library for new screens, keep existing for scan functionality |
| PWA | Both work with vite-plugin-pwa |

**Migration path:**
1. Install component library
2. Configure theme (colors, fonts) to match design spec
3. Build new screens with components
4. Keep Quagga2 scanner — wrap in component if needed
5. Test responsive behavior

---

## 6. Dependencies Summary

### Required for Design Spec Creation
| Tool | Purpose |
|------|---------|
| Figma Professional | Design + Dev Mode handoff |
| (Optional) Notion/Confluence | Design spec documentation |

### Required for Implementation
| Library | Version | Purpose |
|---------|---------|---------|
| **Skeleton** | Latest | Design system + components |
| **Tailwind CSS** | v4 | Styling foundation (already in project) |
| **@skeletonlabs/skeleton-themes** | Latest | Theme support |

### Alternative Stack (Mobile-First)
| Library | Version | Purpose |
|---------|---------|---------|
| **Konsta UI** | v5+ | Mobile-optimized components |
| **Tailwind CSS** | v4 | Styling foundation |

---

## 7. Implementation Path

### Phase 1: Design System Setup (Designer)
1. Define color palette with semantic mapping
2. Set typography (font family selection, type scale)
3. Create spacing/sizing scales
4. Design base components (buttons, inputs, cards)
5. Export Figma UI Kit to developer

### Phase 2: Screen Designs (Designer)
1. Scan screen — camera viewport, barcode overlay, manual entry
2. Book detail screen — metadata display, AR badges, edit form
3. Library screen — grid/list, search, filters, empty state
4. Progress screen — read date, quiz score, timeline
5. Export/settings screens

### Phase 3: Spec Documentation (Designer/Developer collaboration)
1. Document component props and variants
2. Specify responsive behavior
3. Write accessibility requirements
4. Create component inventory
5. Define acceptance criteria

### Phase 4: Implementation (Developer)
1. Install Skeleton or chosen component library
2. Map design tokens to component theme configuration
3. Build screens using components
4. Test responsive behavior across breakpoints
5. Verify accessibility compliance

---

## Sources

- Figma Dev Mode documentation (2026)
- Skeleton UI official docs (skeleton.dev)
- Konsta UI Svelte documentation (konstaui.com)
- Design handoff best practices (IdeaPlan design handoff template)
- "Zero-ambiguity specs" methodology (Simanta Parida blog)
- Svelte UI library comparison (UXPin, DEV Community)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Design Tool | HIGH | Figma + Dev Mode is industry standard |
| Component Library | HIGH | Skeleton best for design-handoff bridge |
| Mobile optimization | MEDIUM | May need Konsta UI supplement for camera UX |
| Spec format | HIGH | Zero-ambiguity methodology well-established |

## Gaps to Address in Design Spec

- **Barcode scanning UI**: Camera overlay patterns need specific design (not generic component library)
- **Offline indicator**: Visual design for connectivity status
- **AR data badges**: Visual distinction between fetched vs. manually entered data
- **Book cover placeholder**: Fallback design for missing covers

---

*Research for: AeAre Books - Design Spec Creation*
*Researched: 2026-03-24*
*Mode: Stack research for design handoff tools*