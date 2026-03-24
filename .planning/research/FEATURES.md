# Design Specification Research

**Domain:** Mobile PWA Book Tracking App Design Specification
**Researched:** 2026-03-24
**Confidence:** HIGH

## Purpose

This document identifies design specification categories needed for professional UI implementation of AeAre Books PWA. All core functionality is already built; this research focuses on what the designer needs to document for implementation.

---

## Design Spec Categories

### 1. Design System Foundation

Core visual identity ensuring consistency across the app.

| Design Element | Specification Need | Complexity | Notes |
|----------------|-------------------|------------|-------|
| **Color Palette** | Primary, secondary, accent colors with semantic meaning (success, error, warning, info) | LOW | Must work in both light and dark modes; test contrast ratios for accessibility (WCAG AA minimum 4.5:1 for body text) |
| **Typography** | Font families, sizes, weights, line heights for all text levels (h1-h6, body, caption, button) | LOW | Use relative units (rem) for accessibility; support Dynamic Type scaling on iOS |
| **Spacing System** | Consistent spacing scale (4pt, 8pt, 12pt, 16pt, 24pt, 32pt, 48pt) | LOW | Follow 8pt grid system for alignment |
| **Border Radius** | Consistent corner radius for cards, buttons, inputs | LOW | 8-12px typical for mobile; 16px for large cards |
| **Shadows** | Elevation levels for cards, modals, floating elements | LOW | Subtle shadows improve depth perception on mobile |
| **Iconography** | Icon set with consistent stroke/fill style | MEDIUM | Icons needed: scan, search, add, delete, edit, export, settings, offline/online status, filter, sort, checkmark, close |

### 2. UI Component Specifications

Reusable component definitions with all states and behaviors.

| Component | States Needed | Complexity | Design Notes |
|-----------|---------------|------------|---------------|
| **Primary Button** | default, hover, active, disabled, loading | LOW | Min touch target 44x44pt per iOS HIG; include loading spinner state |
| **Secondary Button** | default, hover, active, disabled | LOW | Outline or ghost style; clear visual hierarchy below primary |
| **Text Input** | default, focused, error, disabled, with/without helper text | MEDIUM | Clear labels, error messages below field; 48pt minimum height |
| **Book Card** | default, pressed, selected (for batch ops) | MEDIUM | Cover image, title, author, AR level badge; tap for details |
| **Modal/Dialog** | standard, confirmation, bottom sheet | HIGH | Centered modals for critical actions; bottom sheets for options on mobile |
| **Toast/Notification** | success, error, warning, info | LOW | Auto-dismiss after 3-5 seconds; position top or bottom |
| **Empty State** | no books, no search results, offline | LOW | Friendly illustration + action button |
| **Loading State** | skeleton screens, spinners | MEDIUM | Skeleton preferred for content loading; spinners for actions |
| **Search Bar** | default, focused, with/without results | MEDIUM | Real-time filtering; clear button when populated |
| **Bottom Navigation** | active, inactive, badge indicator | LOW | 5 tabs max; persistent across screens |
| **AR Level Badge** | fetched (green), manual (gray), not available | LOW | Color-coded for quick visual identification |
| **Offline Indicator** | online, offline, syncing states | LOW | Already in requirements (PWA-04); needs design refinement |

### 3. Screen-Level Design Requirements

Detailed layout and content specifications for each screen.

| Screen | Key Elements | Complexity | Design Dependencies |
|--------|---------------|------------|---------------------|
| **Home/Library** | Book grid/list view, search bar, filter/sort, FAB for adding | MEDIUM | Toggle between grid (cover-focused) and list (details-focused); sort by title, author, date added, AR level |
| **Scan Flow** | Camera view, scan result feedback, manual entry link | HIGH | Full-screen camera with overlay guide; haptic + audio feedback on scan success; graceful fallback to manual ISBN entry |
| **Book Detail** | Cover image, metadata (title, author, ISBN), AR data, progress timeline, actions (edit, delete) | MEDIUM | Scrollable content; AR quiz score entry prominent; progress events in chronological order |
| **Add/Edit Book** | Form fields for all metadata, AR data source indicator | MEDIUM | Pre-populated from scan; clear indication of auto-fetched vs. manual fields |
| **Export** | Export format selection, progress indicator, share sheet integration | LOW | JSON export already built; design share sheet integration |
| **Settings** | App info, about, offline status indicator | LOW | Simple list view; PWA install prompt if not installed |

### 4. Responsive Design Specifications

How the app adapts across devices and orientations.

| Aspect | Mobile Portrait | Mobile Landscape | Tablet | Notes |
|--------|-----------------|------------------|--------|-------|
| **Layout** | Single column, bottom nav | Adaptive card width | Multi-column for library | Consider max-width on tablet (600px optimal reading) |
| **Touch Targets** | Min 44pt | Min 44pt | Min 44pt | iOS Human Interface Guidelines compliance |
| **Navigation** | Bottom tabs | Bottom tabs | Side rail or bottom tabs | Consistent across form factors |
| **Book Grid** | 2 columns | 3-4 columns | 4-6 columns | Adjust based on screen width |
| **Safe Areas** | Respect notch/home indicator | Full screen with system UI | Standard margins | Use env(safe-area-inset-*) |

**PWA-Specific Considerations:**
- `display: standalone` mode removes browser chrome
- Handle `display-mode: standalone` media query for installed app context
- App icon and splash screen specifications (multiple sizes for various devices)

### 5. Accessibility Requirements

Ensuring the app works for all users.

| Requirement | Specification | Priority |
|-------------|--------------|----------|
| **Color Contrast** | 4.5:1 for body text, 3:1 for large text and UI components (WCAG AA) | Required |
| **Touch Targets** | Minimum 44x44pt, 8pt minimum spacing between targets | Required |
| **Keyboard Navigation** | Logical tab order, visible focus indicators | Required |
| **Screen Reader Support** | Proper ARIA labels, semantic HTML, alt text for images | Required |
| **Dynamic Type** | Support iOS Dynamic Type scaling (50%-200%) | Recommended |
| **Reduced Motion** | Respect prefers-reduced-motion for animations | Recommended |
| **Focus Management** | Focus moves to new content in modals, trap focus appropriately | Required |

### 6. PWA-Specific Design Elements

Unique considerations for PWA implementation.

| Element | Specification Need | Notes |
|---------|-------------------|-------|
| **Install Prompt** | Custom "Add to Home Screen" button or banner | Browser beforeinstallprompt event handling |
| **Splash Screen** | Theme color background, app icon centered | Specified in web app manifest |
| **App Icons** | Multiple sizes (72, 96, 128, 144, 152, 192, 384, 512px) | Maskable icons for Android adaptive icons |
| **Theme Color** | `<meta name="theme-color">` matching brand | Shows in status bar when installed |

---

## Existing Features → Design Mapping

All features are already built. Design spec must implement the UI for each:

| Built Feature | Design Component Need | Complexity |
|---------------|----------------------|------------|
| Barcode scanning | Camera UI with scan overlay, result feedback | HIGH |
| Google Books metadata | Book card with cover, title, author from API | MEDIUM |
| AR lookup | AR badge component with source indicator (fetched vs. manual) | LOW |
| Reading progress | Progress timeline component, quiz score entry | MEDIUM |
| Convex sync | Sync status indicator, offline state | MEDIUM |
| JSON export | Export flow with share sheet integration | LOW |
| Offline capability | Offline indicator banner, offline-friendly UI | MEDIUM |

---

## Design Spec Deliverables Recommended

For a professional handoff to developers:

1. **Style Guide / Design Tokens** — Colors, typography, spacing as reusable values
2. **Component Library** — All reusable components with states documented
3. **Screen Designs** — Full mockups for each screen (Figma/Sketch)
4. **Responsive Breakpoints** — Mobile, tablet specifications
5. **Accessibility Checklist** — Specific implementations for WCAG compliance
6. **PWA Assets** — Icons, splash screen, manifest specifications

---

## Sources

- Apple Human Interface Guidelines (HIG)
- Google Material Design 3
- Web.dev PWA Best Practices
- WCAG 2.1 Accessibility Guidelines
- PWA display-mode specifications (MDN Web Docs)
- Competitor UI analysis: Bookology, BookShelf, BookWorm apps

---

*Design specification research for AeAre Books v1.1*
*Researched: 2026-03-24*