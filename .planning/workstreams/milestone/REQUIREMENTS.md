# Requirements: User Accounts Authentication

**Defined:** 2026-04-01
**Milestone:** user-accounts-authentication
**Core Value:** Parents can securely access and manage only their own family library data.

## Milestone Requirements

### Authentication

- [x] **AUTH-01**: User can sign in using the selected auth provider.
- [x] **AUTH-02**: User session persists across page reloads.
- [x] **AUTH-03**: User can sign out and clear authenticated session state.
- [ ] **AUTH-04**: Unauthenticated user is redirected from protected routes.

### Authorization

- [ ] **ACL-01**: Convex mutations that modify library data require authenticated identity.
- [ ] **ACL-02**: Convex queries return only records owned by the current user.
- [ ] **ACL-03**: Write attempts to another user's records are rejected.

### Data Model

- [x] **DATA-01**: Users table maps auth identity to internal user profile.
- [ ] **DATA-02**: Existing book/progress records support user ownership.
- [ ] **DATA-03**: Migration/backfill strategy is documented for existing unauthenticated data.

### UX

- [x] **UX-01**: Auth state (signed in/out/loading) is visible and consistent.
- [x] **UX-02**: Auth errors are presented with actionable messaging.
- [ ] **UX-03**: Returning users land on their last usable application state after auth checks.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social login expansion matrix | Start with one provider and prove end-to-end flow |
| Team/family role management | Defer until single-account auth is stable |
| Enterprise SSO | Not needed for current product scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 2 | Pending |
| ACL-01 | Phase 2 | Pending |
| ACL-02 | Phase 2 | Pending |
| ACL-03 | Phase 2 | Pending |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 2 | Pending |
| DATA-03 | Phase 3 | Pending |
| UX-01 | Phase 1 | Complete |
| UX-02 | Phase 1 | Complete |
| UX-03 | Phase 3 | Pending |

**Coverage:**
- Milestone requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-04-01*
