---
phase: 05
slug: route-and-ownership-completion
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-04-08
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + convex-test + playwright |
| **Config file** | `package.json`, `src/convex/test.setup.ts`, `playwright.config.ts` |
| **Quick run command** | `bun run test:convex` |
| **Full suite command** | `bun run check && bun run test:convex && bunx playwright test tests/e2e/auth-route-guards.spec.ts tests/e2e/route-and-ownership.spec.ts` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `bun run test:convex` for backend tasks or `bun run check` for frontend/export tasks.
- **After every plan wave:** Run `bun run check && bun run test:convex && bunx playwright test tests/e2e/auth-route-guards.spec.ts tests/e2e/route-and-ownership.spec.ts`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | ACL-01, ACL-02, DATA-02 | T-05-01 / T-05-02 | Unauthenticated and foreign-account reads/writes are rejected; owned book creation also creates owned progress | unit | `bun run test:convex` | ✅ | ⬜ pending |
| 05-02-01 | 02 | 2 | AUTH-04, ACL-02, DATA-02 | T-05-03 / T-05-04 | Book detail and export show only current-user progress data | static + e2e | `bun run check && bunx playwright test tests/e2e/route-and-ownership.spec.ts` | ✅ | ⬜ pending |
| 05-03-01 | 03 | 3 | AUTH-04, ACL-01, ACL-02, DATA-02 | T-05-05 | Verification artifact records rerunnable evidence without exposing secrets | docs | `bun run check && bun run test:convex && bunx playwright test tests/e2e/auth-route-guards.spec.ts tests/e2e/route-and-ownership.spec.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
