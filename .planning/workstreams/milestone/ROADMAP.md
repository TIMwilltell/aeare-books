# Roadmap: User Accounts Authentication

**Project:** AeAre Books
**Created:** 2026-04-01
**Milestone slug:** user-accounts-authentication
**Granularity:** extended (7 phases)
**Parallelization:** enabled

## Core Value

Parents can securely access and manage only their own family library data.

## Phases

- [x] **Phase 1: Auth Foundation** - Provider setup, session plumbing, and base user identity mapping
- [x] **Phase 2: Route + Data Protection** - Protected routes and account-scoped Convex reads/writes
- [x] **Phase 3: Migration + Hardening** - Legacy data handling, error UX, and auth regression validation
- [x] **Phase 4: Auth Session Closure** - Completed 2026-04-09; verified in `04-VERIFICATION.md`
- [x] **Phase 5: Route And Ownership Completion** - Completed 2026-04-09; verified in `05-VERIFICATION.md`
- [ ] **Phase 6: Recovery UX Hardening** - Restore intended routes and surface rejection recovery states in the UI
- [ ] **Phase 7: Migration Backfill Workflow** - Make legacy ownership quarantine/backfill operational and verifiable

## Phase Details

### Phase 1: Auth Foundation

**Goal:** Users can authenticate and maintain a stable session.

**Depends on:** Nothing

**Requirements:** AUTH-01, AUTH-02, AUTH-03, DATA-01, UX-01, UX-02

**Success Criteria:**
1. Sign-in flow works in local and deployed environments.
2. Session restoration works after reload.
3. Sign-out fully clears user session context.
4. Auth identity maps to an internal user record.

---

### Phase 2: Route + Data Protection

**Goal:** Application behavior is account-scoped and protected by identity checks.

**Depends on:** Phase 1

**Requirements:** AUTH-04, ACL-01, ACL-02, ACL-03, DATA-02

**Success Criteria:**
1. Protected pages redirect unauthenticated users.
2. Convex write operations require auth identity.
3. Convex reads return only user-owned records.
4. Cross-account access attempts are denied.

---

### Phase 3: Migration + Hardening

**Goal:** Existing data and UX remain stable through auth rollout.

**Depends on:** Phase 2

**Requirements:** DATA-03, UX-03

**Success Criteria:**
1. Existing unauthenticated data handling strategy is implemented or explicitly gated, with unresolved legacy rows quarantined and inventoried instead of guessed.
2. Auth error states are visible and actionable.
3. Regression checklist passes for scan, library, detail, and the export action on `/` while signed in.

---

### Phase 4: Auth Session Closure

**Goal:** Auth entry, session lifecycle, and identity mapping are verified end-to-end under the audit gates.

**Depends on:** Phase 3

**Requirements:** AUTH-01, AUTH-02, AUTH-03, DATA-01

**Gap Closure:** Closes unsatisfied auth/session gaps from the milestone audit.

**Plans:** 2 plans

Plans:
- [ ] 04-01-PLAN.md — Close home-entry, reload, refresh-failure, and sign-out session lifecycle gaps.
- [ ] 04-02-PLAN.md — Verify stable internal user mapping and capture Phase 4 audit evidence.

**Success Criteria:**
1. Signing in from the home Scan CTA preserves and restores the intended `/scan` destination.
2. Refresh-token failures update shell auth state consistently with stored auth state.
3. Sign-in, reload/session restore, and sign-out are demonstrated in milestone verification.
4. First and repeat sign-in both map correctly to the internal user record.

---

### Phase 5: Route And Ownership Completion

**Goal:** Protected routes and account ownership behavior are fully integrated and verified in current milestone artifacts.

**Depends on:** Phase 4

**Requirements:** AUTH-04, ACL-01, ACL-02, DATA-02

**Gap Closure:** Closes orphaned route and ownership requirements plus scoped-data integration gaps from the milestone audit.

**Success Criteria:**
1. Protected routes redirect unauthenticated users based on the live shell auth state.
2. Authenticated mutations and queries enforce current-user ownership consistently.
3. Progress ownership is surfaced in user-facing flows and exports remain account-scoped.
4. Milestone summary and verification artifacts demonstrate route and ownership behavior end-to-end.

---

### Phase 6: Recovery UX Hardening

**Goal:** Users recover cleanly from auth and ownership failures without losing their intended task.

**Depends on:** Phase 5

**Requirements:** ACL-03, UX-03

**Gap Closure:** Closes broken route-restore and rejection-recovery flows from the milestone audit.

**Success Criteria:**
1. Auth entry points restore users to their last intended usable route after auth checks complete.
2. Book detail edit/delete rejection states are surfaced with actionable recovery UI.
3. Broken flows from the audit pass end-to-end verification.

---

### Phase 7: Migration Backfill Workflow

**Goal:** Legacy ownership quarantine and backfill logic can be executed and verified by an operator.

**Depends on:** Phase 6

**Requirements:** DATA-03

**Gap Closure:** Closes the migration/backfill operator-workflow gap from the milestone audit.

**Success Criteria:**
1. The live repo exposes a documented, executable path for migration or quarantine handling.
2. The workflow is captured in milestone summary and verification artifacts.
3. Legacy unauthenticated data handling is no longer strategy-only.

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth Foundation | 3/3 | Complete | 2026-04-02 |
| 2. Route + Data Protection | 3/3 | Complete | 2026-04-05 |
| 3. Migration + Hardening | 3/3 | Complete | 2026-04-06 |
| 4. Auth Session Closure | 2/2 | Complete | 2026-04-09 |
| 5. Route And Ownership Completion | 3/3 | Complete | 2026-04-09 |
| 6. Recovery UX Hardening | 0/0 | Pending | - |
| 7. Migration Backfill Workflow | 0/0 | Pending | - |

---
*Roadmap created: 2026-04-01*
