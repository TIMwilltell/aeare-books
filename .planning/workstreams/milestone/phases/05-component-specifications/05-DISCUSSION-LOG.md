# Phase 5: Component Specifications - Discussion Log

**Phase:** 5 - Component Specifications  
**Started:** 2026-03-24  
**Status:** Discussing approach  

---

## Context

### Phase Goal
Design spec defines all reusable UI components with their states (default, hover, active, disabled, loading, error)

### Requirements (COMP-01 to COMP-10)
1. **COMP-01:** Primary button component (all states)
2. **COMP-02:** Secondary/ghost button component (all states)
3. **COMP-03:** Text input component (labels, placeholders, error states)
4. **COMP-04:** Book card component (thumbnail, title, author, AR badges)
5. **COMP-05:** Modal/dialog component (confirmations)
6. **COMP-06:** Toast/notification component
7. **COMP-07:** Badge component (AR fetched vs. manual indicators)
8. **COMP-08:** Loading spinner and skeleton states
9. **COMP-09:** Empty state component (library)
10. **COMP-10:** FAB (floating action button) for scan action

---

## Existing Resources

### Stitch Project: "AeAre Books PRD"
- **Project ID:** 3676387148203023923
- **Contains:** Comprehensive design system document with:
  - Color palette (Knowledge Blue #005ba4, tertiary gold #755500)
  - Typography (Noto Serif for headlines, Inter for body)
  - Surface hierarchy rules
  - Component guidelines (Cards, Buttons, Chips, Inputs)
  - "No-Line" rule for sectioning
  - Glassmorphism specs for floating elements

### Existing Svelte Components (src/lib/components/)
- Scanner.svelte
- ProgressTimeline.svelte
- BookList.svelte
- StatusBanner.svelte
- LoadingSpinner.svelte
- DeleteDialog.svelte
- FAB.svelte

---

## Discussion Points

### Q1: Output Format
**Question:** What format should the design spec documentation take?

**Options:**
1. **Markdown in .planning/** - Document all components in markdown with code snippets
2. **Stitch Screens** - Generate component mockups in Stitch
3. **Figma-style Spec** - Detailed specification document with measurements

**Recommendation:** Combine approach - Use Stitch for visual mockups of each component state, document specs in markdown.

---

### Q2: Component State Documentation Scope
**Question:** How detailed should state documentation be?

**Current Design System Already Specifies:**
- Primary: gradient fill, full roundedness
- Secondary: ghost border at 15% opacity
- Tertiary: achievement states with tertiary_container
- AR Badges: secondary_fixed with small roundedness

**Needed:**
- Interactive states (hover, active, disabled, loading, error)
- Responsive behavior per component
- Accessibility considerations

---

### Q3: Existing Components vs. New Spec
**Question:** Should we document existing components or create new specs?

**Observation:**
- 7 components already exist in codebase (FAB, LoadingSpinner, DeleteDialog, etc.)
- Design system already defines component patterns
- Need to verify existing components match design spec

**Recommendation:** 
- Audit existing components against design system
- Document gaps in 05-CONTEXT.md
- Phase output: Component specification document

---

### Q4: Phase Scope - Design vs. Implementation
**Question:** Is this phase about creating the design spec, or also implementing components?

**ROADMAP says:** "Design spec defines all reusable UI components"

**This is a documentation phase - NOT implementation.**

Deliverable: Design specification document (markdown + Stitch mockups)

---

## Open Questions

1. **Stitch integration:** Should we generate Stitch screens for each component state? (May be better for Phase 6: Screen Designs)
2. **Component library:** Should we consider using a component library (Tailwind, Skeleton) or continue custom?
3. **Accessibility:** How detailed should a11y specs be? (Requirement says "defer to implementation")

---

## Next Steps

1. [ ] Create 05-CONTEXT.md with locked decisions and discretion areas
2. [ ] Create 05-RESEARCH.md for component patterns and best practices
3. [ ] Create 05-PLAN.md for deliverables
4. [ ] Execute component spec documentation

---

*Discussion started: 2026-03-24*
