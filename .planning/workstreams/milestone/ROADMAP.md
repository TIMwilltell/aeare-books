# Roadmap: User Accounts Authentication

**Project:** AeAre Books
**Created:** 2026-04-01
**Milestone slug:** user-accounts-authentication
**Granularity:** standard (3 phases)
**Parallelization:** enabled

## Core Value

Parents can securely access and manage only their own family library data.

## Phases

- [x] **Phase 1: Auth Foundation** - Provider setup, session plumbing, and base user identity mapping
- [x] **Phase 2: Route + Data Protection** - Protected routes and account-scoped Convex reads/writes
- [x] **Phase 3: Migration + Hardening** - Legacy data handling, error UX, and auth regression validation

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

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Auth Foundation | 3/3 | Complete | 2026-04-02 |
| 2. Route + Data Protection | 3/3 | Complete | 2026-04-05 |
| 3. Migration + Hardening | 3/3 | Complete | 2026-04-06 |

---
*Roadmap created: 2026-04-01*
