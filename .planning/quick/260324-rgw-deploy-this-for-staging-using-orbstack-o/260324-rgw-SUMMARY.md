---
phase: quick
plan: "01"
subsystem: devops
tags: [https, vite, orbstack, staging]
dependency_graph:
  requires: []
  provides: [ssl-localhost]
  affects: [vite.config.ts]
tech_stack:
  added: [openssl, vite-https]
  patterns: [self-signed-cert]
key_files:
  created:
    - ./ssl/localhost.crt
    - ./ssl/localhost.key
  modified:
    - ./vite.config.ts
decisions: []
metrics:
  duration: ~1 minute
  completed: "2026-03-24T19:50:00Z"
---

# Quick Task 260324-rgw: HTTPS for Local Network Access

**One-liner:** Enabled HTTPS dev server on local network for phone testing via OrbStack

## Completed Tasks

| Task | Name | Commit | Status |
|------|------|--------|--------|
| 1 | Generate self-signed SSL certificate | 132e0f1 | Done |
| 2 | Configure Vite for HTTPS | 132e0f1 | Done |
| 3 | Start dev server and verify | 132e0f1 | Done |
| 4 | Get local IP address | N/A | Done |

## Artifacts Created

- `./ssl/localhost.crt` — Self-signed SSL certificate (365 days)
- `./ssl/localhost.key` — Private key

## Configuration Changes

Modified `vite.config.ts` to add:
```typescript
server: {
  https: {
    key: './ssl/localhost.key',
    cert: './ssl/localhost.crt'
  },
  host: '0.0.0.0',
  port: 5173
}
```

## Access Details

- **Local access:** https://localhost:5173
- **Network access:** https://192.168.1.97:5173

**Note:** On first access from phone, users will need to accept/trust the self-signed certificate.

## Deviations

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] SSL certificate files exist: ssl/localhost.crt, ssl/localhost.key
- [x] vite.config.ts modified with HTTPS config
- [x] HTTPS server accessible at https://localhost:5173
- [x] Commit created: 132e0f1

---

*Quick task completed: 260324-rgw*
