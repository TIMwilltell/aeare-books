---
id: SEED-004
status: dormant
planted: 2026-04-09T05:50:49Z
planted_during: v1.0 / Phase 5 Route And Ownership Completion
trigger_when: When polishing UX
scope: Medium
---

# SEED-004: Proper sign-in page

## Why This Matters

The current sign-in experience depends on a browser prompt for collecting the user's email before starting the magic-link flow. That is functional, but it limits the product's UX quality and makes it hard to control branding, explanatory copy, validation states, and recovery messaging.

A dedicated sign-in page would give the app a proper place for branded entry, clearer guidance, inline validation, provider-specific messaging, and better handling for common auth failures or expired-link recovery.

## When to Surface

**Trigger:** When polishing UX.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- The milestone is focused on UX polish, visual refinement, or branded product presentation.
- Auth flows need better inline messaging, error handling, or recovery guidance.
- The current browser-prompt sign-in entry is good enough functionally but no longer acceptable for the desired product quality bar.

## Scope Estimate

**Medium** — This is likely a focused phase or two rather than a full milestone. It should cover route/UI design for a dedicated sign-in screen, wiring the existing magic-link submission flow into form-based UX, preserving return-path behavior, and updating auth regression coverage for the new entry experience.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `.planning/STATE.md:24-31` shows the project is currently finishing Phase 5 while auth and ownership flows are still active work, so this is better captured as a follow-on UX seed than mixed into the current milestone.
- `.planning/REQUIREMENTS.md:28-32` already treats auth UX as a tracked requirement area, with return-to-task behavior still explicitly pending under `UX-03`.
- `src/lib/auth/auth0.ts:362-403` implements `signIn()` with `window.prompt('Enter your email for a magic sign-in link:')`, which is the browser-popup behavior this seed is intended to replace.
- `src/routes/+layout.svelte:185-245` contains the current signed-out/auth-error shell messaging and actions, which would likely need to route into or coordinate with a dedicated sign-in screen.
- `src/routes/+page.svelte:116-124` and `src/routes/+page.svelte:177-180` show the public home CTA currently starts sign-in directly instead of navigating to a first-class auth page.
- `tests/e2e/auth-route-guards.spec.ts:55-111` already covers return-to-route behavior after sign-in, so this future work should preserve those contracts while changing the entry UX.

## Notes

- The key product change is not the auth provider itself; it is replacing the prompt-based email capture with a proper app-controlled sign-in surface.
- Preserve the existing redirect intent behavior so protected-route entry still returns users to the task they were trying to access.
- A dedicated sign-in page creates room for branded copy, inline validation, support text, and clearer handling for invalid email entry, magic-link resend guidance, and expired or failed auth attempts.
