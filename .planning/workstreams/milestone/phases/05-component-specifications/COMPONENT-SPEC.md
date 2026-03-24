# AeAre Component Specification

> **Phase:** 05-Component Specifications  
> **Generated:** 2026-03-24  
> **Design System:** Literary Horizon (Stitch Project 3676387148203023923)

---

## Table of Contents

1. [Design Tokens](#design-tokens)
2. [Component Gap Analysis](#component-gap-analysis)
3. [Component Specifications](#component-specifications)
   - [COMP-01: Primary Button](#comp-01-primary-button)
   - [COMP-02: Secondary/Ghost Button](#comp-02-secondaryghost-button)
   - [COMP-03: Text Input](#comp-03-text-input)
   - [COMP-04: Book Card](#comp-04-book-card)
   - [COMP-05: Modal/Dialog](#comp-05-modaldialog)
   - [COMP-06: Toast/Notification](#comp-06-toastnotification)
   - [COMP-07: Badge](#comp-07-badge)
   - [COMP-08: Loading Spinner/Skeleton](#comp-08-loading-spinnerskeleton)
   - [COMP-09: Empty State](#comp-09-empty-state)
   - [COMP-10: FAB (Floating Action Button)](#comp-10-fab-floating-action-button)

---

## Design Tokens

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `primary` | #005ba4 | Primary actions, FAB, active states |
| `primary-container` | #0c74cc | Primary gradient endpoint, hover states |
| `secondary` | #3b6189 | Secondary actions, supporting elements |
| `secondary-container` | #add2ff | Secondary backgrounds, chips |
| `tertiary` | #755500 | Achievement indicators, points |
| `tertiary-container` | #946c00 | Tertiary backgrounds, achievement badges |
| `surface` | #fbf9f8 | Main canvas, page background |
| `surface-container` | #efeded | Cards, elevated content |
| `surface-container-low` | #f5f3f3 | Secondary content areas |
| `surface-container-lowest` | #ffffff | Hero cards, book details |
| `surface-container-highest` | #e4e2e2 | Input field backgrounds |
| `on-surface` | #1b1c1c | Primary text |
| `on-surface-variant` | #414752 | Secondary text, labels |
| `error` | #ba1a1a | Error states, destructive actions |
| `outline-variant` | #c1c7d4 | Ghost borders at 15% opacity |
| `primary-fixed` | #d3e4ff | Primary button pressed state |
| `secondary-fixed` | #d1e4ff | Secondary button pressed state |

### Typography

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Display | Noto Serif | 700 | Hero book titles, achievement milestones |
| Headline | Noto Serif | 600 | Section titles, modal headings |
| Title | Inter | 600 | Component labels, card titles |
| Body | Inter | 400 | Descriptions, content text |
| Label | Inter | 500 | Buttons, form labels, metadata |
| Label-SM | Inter | 500 | AR metadata, footnote text |

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| 2 | 0.5rem | Tight spacing, icon gaps |
| 4 | 1rem | Standard spacing |
| 6 | 1.5rem | Section spacing |
| 8 | 2rem | Large gaps, list spacing |
| 10 | 2.5rem | Hero spacing |

### Corner Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.25rem | Badges, chips |
| DEFAULT | 0.5rem | Standard components |
| md | 0.75rem | Book thumbnails, FAB |
| lg | 1rem | Cards, dialogs |
| xl | 1.5rem | Large surfaces |
| full | 9999px | Pills, buttons |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| Ambient | `0 12px 32px rgba(27, 28, 28, 0.06)` | FAB, modal, floating elements |
| Elevated | `0 4px 12px rgba(74, 144, 217, 0.3)` | Cards on hover |

### Glassmorphism (Sticky Headers/Nav)

- Background: `surface` at 80% opacity
- Backdrop blur: 20px

---

## Component Gap Analysis

### FAB.svelte (src/lib/components/FAB.svelte)

| Aspect | Current Implementation | Design Spec | Gap |
|--------|----------------------|-------------|-----|
| Color | `#4A90D9` hardcoded | `primary` (#005ba4) | ❌ Uses different blue |
| Gradient | None | Primary to primary_container | ❌ Missing gradient |
| Corner Radius | 50% (pill) | `md` (0.75rem) | ⚠️ Too rounded |
| Shadow | `rgba(74, 144, 217, 0.4)` | Ambient shadow | ❌ Wrong color/opacity |

**Recommendation:** Update to use primary color with gradient, md corner radius, and tinted ambient shadow.

### LoadingSpinner.svelte (src/lib/components/LoadingSpinner.svelte)

| Aspect | Current Implementation | Design Spec | Gap |
|--------|----------------------|-------------|-----|
| Default Color | `#4A90D9` hardcoded | `primary` (#005ba4) | ❌ Hardcoded |
| Track Color | `#e5e5e5` hardcoded | `surface-container-highest` | ❌ No design token |
| Sizes | small/medium/large | Match scale | ✅ OK |

**Recommendation:** Default to primary color token, use surface_container_highest for track.

### DeleteDialog.svelte (src/lib/components/DeleteDialog.svelte)

| Aspect | Current Implementation | Design Spec | Gap |
|--------|----------------------|-------------|-----|
| Background | `white` hardcoded | `surface-container-lowest` (#ffffff) | ✅ OK |
| Text Color | `#333` hardcoded | `on-surface` (#1b1c1c) | ❌ Hardcoded |
| Secondary Text | `#888` hardcoded | `on-surface-variant` (#414752) | ❌ Hardcoded |
| Cancel Button | `#e5e5e5` hardcoded | Ghost border style | ❌ Not following ghost pattern |
| Delete Button | `#fee2e2` / `#dc2626` | Error color | ⚠️ Different error styling |

**Recommendation:** Use design tokens for all text, implement ghost border pattern for cancel, use error token for delete.

---

## Component Specifications

---

### COMP-01: Primary Button

**Description:** The primary call-to-action button with gradient fill and pill-shaped roundedness.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | Linear gradient 135° from primary to primary_container | `primary` → `primary_container` |
| Text Color | #ffffff | `on-primary` |
| Typography | Label size, Inter 500 weight | `label`, `bodyFont` |
| Corner Radius | full (9999px) | `corner-radius.full` |
| Padding | 12px vertical, 24px horizontal | Spacing scale |
| Min Width | 64px | - |

#### States

| State | Style |
|-------|-------|
| Default | Gradient fill as specified |
| Hover | Slight brightness increase, subtle scale(1.02) |
| Active/Pressed | `primary-fixed` (#d3e4ff) background, scale(0.98) |
| Disabled | 38% opacity, no pointer events |
| Loading | Replace text with spinner, disabled interaction |

#### Props

```typescript
interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  fullWidth?: boolean;
}
```

#### Usage

- Primary navigation actions (Save, Submit, Confirm)
- Only ONE primary button per screen section
- Never use for destructive actions (use COMP-05 Modal instead)

#### Implementation Notes

- Use CSS custom properties for gradient: `--gradient-primary: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);`
- Ensure sufficient contrast for accessibility
- Match the "Glass & Gradient Rule" from design system

---

### COMP-02: Secondary/Ghost Button

**Description:** Secondary action button with ghost border pattern and no fill.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | Transparent | - |
| Border | 15% opacity outline_variant | `outline-variant` at 15% |
| Text Color | #345a82 | `on-secondary-container` |
| Typography | Label size, Inter 500 weight | `label`, `bodyFont` |
| Corner Radius | full (9999px) | `corner-radius.full` |
| Padding | 12px vertical, 24px horizontal | Spacing scale |

#### States

| State | Style |
|-------|-------|
| Default | Ghost border, on-secondary-container text |
| Hover | Background: `secondary-fixed` (#d1e4ff), border visible |
| Active/Pressed | Background: `secondary-fixed-dim` (#a4caf7), border visible |
| Disabled | 38% opacity, no pointer events |

#### Props

```typescript
interface SecondaryButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}
```

#### Usage

- Secondary actions (Cancel, Back, Skip)
- Multiple secondary buttons allowed per screen
- Used when action is supportive, not primary

#### Implementation Notes

- Border must use `outline-variant` token at exactly 15% opacity
- Follow "The Ghost Border Fallback" rule from design system
- Never use for primary actions or destructive actions

---

### COMP-03: Text Input

**Description:** Form input field with recessed appearance using surface container highest background.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #e4e2e2 | `surface-container-highest` |
| Border | None | - |
| Text Color | #1b1c1c | `on-surface` |
| Placeholder Color | #414752 | `on-surface-variant` |
| Typography | Body size, Inter 400 | `body`, `bodyFont` |
| Corner Radius | DEFAULT (0.5rem) | `corner-radius.DEFAULT` |
| Padding | 12px vertical, 16px horizontal | - |
| Min Height | 48px | - |

#### States

| State | Style |
|-------|-------|
| Default | surface-container-highest background |
| Focus | Add subtle primary border (2px), increased shadow |
| Error | Border: error color (#ba1a1a), error message below |
| Disabled | 38% opacity, no interaction |
| Filled | Normal styling, placeholder hidden |

#### Props

```typescript
interface TextInputProps {
  label: string;
  placeholder?: string;
  value?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  type?: 'text' | 'email' | 'password';
  onChange?: (value: string) => void;
}
```

#### Usage

- User text entry (book titles, author names)
- Search fields
- Any form requiring user input

#### Implementation Notes

- "Recessed" look achieved by using surface_container_highest as background
- Label should be above the input field using on-surface-variant color
- Error messages appear below with error color
- Follow "No-Line Rule" - no borders unless for focus/error

---

### COMP-04: Book Card

**Description:** Display card showing book thumbnail, title, author, and AR badges.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #ffffff | `surface-container-lowest` |
| Shadow | Elevated shadow on hover | Ambient/elevated shadows |
| Corner Radius | md (0.75rem) | `corner-radius.md` |
| Thumbnail Radius | md (0.75rem) | `corner-radius.md` |
| Title Font | Noto Serif | `headlineFont` |
| Title Size | Title-lg (1.125rem) | - |
| Title Color | #1b1c1c | `on-surface` |
| Author Font | Inter | `bodyFont` |
| Author Size | Body-md (1rem) | - |
| Author Color | #414752 | `on-surface-variant` |
| Padding | 16px | Spacing scale |
| Gap (title to author) | 4px | Spacing 2 |
| Gap (content to badges) | 12px | Spacing 4 |

#### States

| State | Style |
|-------|-------|
| Default | surface-container-lowest, subtle shadow |
| Hover | Elevated shadow, slight scale(1.01) |
| Pressed | scale(0.99), deeper shadow |
| Loading | Skeleton placeholder |

#### Props

```typescript
interface BookCardProps {
  title: string;
  author: string;
  thumbnailUrl?: string;
  arStatus?: 'fetched' | 'manual' | 'pending';
  arPoints?: number;
  onClick?: () => void;
}
```

#### Usage

- Library book list display
- Search results
- Book detail navigation

#### Implementation Notes

- Use COMP-07 Badge for AR status indicators
- Thumbnail uses md (0.75rem) radius as specified
- Title uses Noto Serif for the "Refined Library" feel
- Author uses Inter for legibility
- Gap between items uses spacing scale, NOT dividers (No-Line Rule)
- Placeholder background for missing thumbnails: surface-container-low (#f5f3f3)

---

### COMP-05: Modal/Dialog

**Description:** Floating dialog for confirmations, alerts, and focused interactions.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #ffffff | `surface-container-lowest` |
| Shadow | Ambient shadow | `shadow.ambient` |
| Backdrop | rgba(0, 0, 0, 0.5) with optional blur | - |
| Corner Radius | lg (1rem) | `corner-radius.lg` |
| Heading Font | Noto Serif | `headlineFont` |
| Heading Size | Headline-sm (1.5rem) | - |
| Heading Color | #1b1c1c | `on-surface` |
| Body Font | Inter | `bodyFont` |
| Body Color | #414752 | `on-surface-variant` |
| Max Width | 320px mobile, 400px desktop | - |
| Padding | 24px | Spacing 6 |

#### States

| State | Style |
|-------|-------|
| Default | Centered, backdrop visible |
| Entering | Fade in + scale up animation |
| Exiting | Fade out + scale down animation |

#### Props

```typescript
interface ModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  showCancel?: boolean;
  showConfirm?: boolean;
  confirmLabel?: string;
  onConfirm?: () => void;
  destructive?: boolean;
}
```

#### Usage

- Delete confirmations
- Error alerts
- Focused interactions requiring user attention

#### Implementation Notes

- Delete action uses error color (#ba1a1a) for confirm button
- Cancel uses ghost border pattern (COMP-02)
- Escape key closes modal
- Click outside closes modal (unless explicitly disabled)
- Use backdrop blur for "floating" feel
- Follow "No-Line Rule" for internal sectioning

---

### COMP-06: Toast/Notification

**Description:** Slide-in notification for feedback and system messages.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #ffffff | `surface-container-lowest` |
| Border Left | 4px solid (color varies by type) | - |
| Shadow | Subtle elevated shadow | `shadow.elevated` |
| Corner Radius | DEFAULT (0.5rem) | `corner-radius.DEFAULT` |
| Text Color | #1b1c1c | `on-surface` |
| Typography | Body size | `bodyFont` |
| Padding | 12px 16px | - |
| Max Width | 320px | - |

#### Types & Colors

| Type | Border Color | Usage |
|------|--------------|-------|
| Success | #006a35 (tertiary) | Successful actions |
| Error | #ba1a1a (error) | Error messages |
| Info | #3b6189 (secondary) | Informational |
| Warning | #755500 (tertiary) | Warnings |

#### States

| State | Style |
|-------|-------|
| Entering | Slide in from top/bottom, fade in (300ms) |
| Visible | Fixed position, auto-dismiss timer |
| Exiting | Slide out, fade out (200ms) |

#### Props

```typescript
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // ms, default 4000
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

#### Usage

- Form submission feedback
- Save confirmation
- Error notifications
- System messages

#### Implementation Notes

- Default duration: 4000ms
- Position: top (mobile), top-right (desktop)
- Stack multiple toasts vertically
- Dismissible via X button or swipe
- Optional action button for quick navigation

---

### COMP-07: Badge

**Description:** Small indicator badge for AR status and metadata.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | #d1e4ff | `secondary-fixed` |
| Text Color | #21496f | `on-secondary-fixed-variant` |
| Font | Inter | `bodyFont` |
| Font Size | Label-SM (0.6875rem) | - |
| Letter Spacing | 0.05rem | - |
| Corner Radius | sm (0.25rem) | `corner-radius.sm` |
| Padding | 4px 8px | Spacing 2 |

#### AR Status Variants

| Status | Background | Text | Display |
|--------|------------|------|---------|
| Fetched | `secondary-fixed` (#d1e4ff) | `on-secondary-fixed-variant` (#21496f) | "AR" |
| Manual | `tertiary-fixed` (#ffdea3) | `on-tertiary-fixed-variant` (#5d4200) | "Manual" |
| Pending | `outline-variant` (#c1c7d4) | `on-surface-variant` (#414752) | "Pending" |

#### Props

```typescript
interface BadgeProps {
  label: string;
  variant?: 'ar-fetched' | 'ar-manual' | 'ar-pending' | 'custom';
  size?: 'sm' | 'md';
}
```

#### Usage

- AR status on book cards
- Achievement indicators
- Metadata tags

#### Implementation Notes

- Use sm (0.25rem) radius to differentiate from rounded UI
- Use secondary_fixed for AR badges as per design system
- Consistent with "Chips" section in design system documentation

---

### COMP-08: Loading Spinner/Skeleton

**Description:** Loading indicator and skeleton placeholder states.

#### Visual Spec (Spinner)

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Color | #005ba4 | `primary` |
| Track Color | #e4e2e2 | `surface-container-highest` |
| Border Width | 3px | - |
| Animation | 0.8s linear infinite | - |

#### Spinner Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| Small | 20px | Inline loading, badges |
| Medium | 32px | Standard loading |
| Large | 48px | Full-page loading |

#### Visual Spec (Skeleton)

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | Linear gradient shimmer | - |
| Base Color | #e4e2e2 | `surface-container-highest` |
| Highlight Color | #f5f3f3 | `surface-container-low` |
| Animation | 1.5s ease-in-out infinite | - |
| Corner Radius | Matches component | - |

#### Skeleton Variants

| Variant | Dimensions | Usage |
|---------|------------|-------|
| Text | Full width, 16px height | Loading text |
| Title | Full width, 24px height | Loading titles |
| Thumbnail | 80x120px | Book cover placeholder |
| Card | Full card size | Full card placeholder |

#### Props

```typescript
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

interface SkeletonProps {
  variant: 'text' | 'title' | 'thumbnail' | 'card';
  width?: string;
  height?: string;
}
```

#### Usage

- Page loading states
- Card loading placeholders
- Inline loading indicators
- Form submission feedback

#### Implementation Notes

- Default to primary color, not hardcoded #4A90D9
- Track uses surface-container-highest, not hardcoded #e5e5e5
- Skeleton shimmer follows "No-Line Rule" - background shift animation
- Spinner uses CSS custom properties for color and track

---

### COMP-09: Empty State

**Description:** Illustrated placeholder for empty library and lists.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | Transparent | - |
| Icon/Illustration | 120px, muted primary color | `primary` at 60% |
| Heading Font | Noto Serif | `headlineFont` |
| Heading Size | Headline-sm (1.5rem) | - |
| Heading Color | #1b1c1c | `on-surface` |
| Body Font | Inter | `bodyFont` |
| Body Size | Body-md (1rem) | - |
| Body Color | #414752 | `on-surface-variant` |
| Padding | 48px vertical, 24px horizontal | - |
| CTA Button | Primary button (COMP-01) | - |

#### Props

```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

#### Usage

- Empty library
- No search results
- No achievements
- No reading history

#### Implementation Notes

- Icon uses primary at reduced opacity (60%) for softer appearance
- Heading uses Noto Serif for literary feel
- Body provides context and guidance
- CTA button helps users take action (add first book, retry search)
- Illustration placeholder can be a simple SVG or illustration component

---

### COMP-10: FAB (Floating Action Button)

**Description:** Floating action button for primary scan action, bottom-right positioned.

#### Visual Spec

| Property | Value | Token Reference |
|----------|-------|-----------------|
| Background | Linear gradient 135° primary to primary_container | `primary` → `primary-container` |
| Icon Color | #ffffff | `on-primary` |
| Size | 56px diameter | - |
| Corner Radius | md (0.75rem) | `corner-radius.md` (NOT full/circle) |
| Shadow | `0 12px 32px rgba(27, 28, 28, 0.06)` | Ambient shadow |
| Position | Fixed bottom-right | - |
| Position Offset | 24px from edges | - |

#### States

| State | Style |
|-------|-------|
| Default | Gradient background, ambient shadow |
| Hover | Scale 1.05, enhanced shadow |
| Pressed | Scale 0.95, primary-fixed background |
| Scroll | Elevate on scroll (optional) |

#### Props

```typescript
interface FABProps {
  icon: 'scan' | 'add' | 'custom';
  onClick: () => void;
  label?: string;
  position?: 'bottom-right' | 'bottom-center';
}
```

#### Usage

- Primary scan action (camera icon)
- Add new book action (plus icon)
- Primary user action per screen

#### Implementation Notes

- Current implementation (FAB.svelte) uses hardcoded #4A90D9 and circular shape - NEEDS UPDATE
- Use gradient as per "Glass & Gradient Rule"
- Corner radius should be md (0.75rem), NOT full circle
- Shadow must use on-surface color tint, not black
- Icon: Use scan icon for primary library action
- Position: Fixed bottom-right with 24px offset

---

## Appendix: Implementation Checklist

- [ ] Update FAB.svelte to use design tokens (#005ba4), gradient, md radius
- [ ] Update LoadingSpinner.svelte to default to primary, use surface-container-highest for track
- [ ] Update DeleteDialog.svelte to use design tokens throughout
- [ ] Create Button.svelte component with Primary/Secondary variants
- [ ] Create TextInput.svelte component with all states
- [ ] Create BookCard.svelte component with thumbnail, badges
- [ ] Create Modal.svelte component with backdrop blur
- [ ] Create Toast.svelte component with auto-dismiss
- [ ] Create Badge.svelte component with AR variants
- [ ] Update Skeleton components with proper animation

---

*Document generated from Stitch design system "Literary Horizon" (Project 3676387148203023923)*