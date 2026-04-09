---
id: SEED-001
status: dormant
planted: 2026-04-09T04:54:14Z
planted_during: v1.0 / Phase 5 Route And Ownership Completion
trigger_when: After auth/account ownership is stable and the app is ready to expand from single-user ownership to household collaboration
scope: Large
---

# SEED-001: Family collaboration households

## Why This Matters

The current app protects one authenticated user's private library, but the product value is really a shared family bookshelf with progress tracked per child. This seed captures the larger household model: multiple parents should be able to collaborate on the same library, parents should be able to invite another parent by email into the same account association, and each household should be able to manage multiple non-user reader profiles.

Each reader needs separate read state, quiz score, and notes while still sharing the same book collection. That implies the current single-reader fields on the book record are not enough and the ownership model needs to expand from single-user data access to household membership plus per-reader progress.

## When to Surface

**Trigger:** After auth/account ownership is stable and the app is ready to expand from single-user ownership to household collaboration.

This seed should be presented during `/gsd-new-milestone` when the milestone scope matches any of these conditions:
- Auth, ownership, and account-scoped data flows are considered stable enough to build on.
- The milestone introduces family accounts, invitations, shared libraries, or role management.
- The milestone needs per-child progress tracking instead of a single set of book-level reading fields.

## Scope Estimate

**Large** — This is a full milestone, not a quick follow-up. It spans data-model changes, parent invitation UX, shared-account membership rules, reader-profile management, and migration of book/progress structures away from single-reader fields.

## Breadcrumbs

Related code and decisions found in the current codebase:

- `.planning/REQUIREMENTS.md:39` explicitly defers team/family role management until single-account auth is stable.
- `.planning/STATE.md:23-25` defines the current core value around private family-library access and shows Phase 5 is still finishing ownership work.
- `src/convex/schema.ts:8-41` shows the current data model is centered on one authenticated `userId` owner plus single-reader fields like `notes`, `quizScore`, and `readDate` on `books`.
- `src/convex/books.ts:26-75` stamps each book with the current authenticated `userId`, reinforcing the single-owner model.
- `src/convex/progress.ts:5-49` stores progress events by authenticated user ownership, not by child/reader profile.
- `README.md:3-12` already describes the app as tracking reading progress and AR quiz scores for children, which makes household and per-reader modeling a natural product expansion.

## Notes

- Invitation design detail from this session: entering another parent's email should add that person to the same account association so their magic-link sign-in lands in the shared household context.
- Reader profiles are intentionally non-user accounts, but each reader still needs independent read state, quiz score history, and notes while sharing one library.
- The likely pressure point is that book-level `isRead`, `readDate`, `notes`, and `quizScore` fields currently represent one reader's state, so future work may need either nested reader state on books or a separate per-reader progress model.
