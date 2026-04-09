<!-- GSD:project-start source:PROJECT.md -->
## Project

**AeAre Books**

A progressive web app for parents to scan book barcodes, auto-populate metadata (title, author, ISBN) from Open Library, attempt AR level/points lookup from Bookroo, and track reading progress and AR quiz scores for children.

**Core Value:** Parents can quickly catalog their children's books and track AR reading progress without manual data entry.

### Constraints

- **PWA Architecture**: Must run in mobile browser, installable to home screen, no app store
- **AR Data Reliability**: External AR metadata is incomplete — must degrade gracefully
- **Offline Capability**: Should work partially offline (scan, form, submit when connected)
- **Backend Required**: Small backend needed for server-side AR metadata lookup (avoids CORS)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Implemented Stack (Current)

### App + Runtime
- **Frontend:** SvelteKit + Svelte 5
- **Package Manager:** Bun
- **Build Tooling:** Vite
- **Backend:** Convex

### Core Product Integrations
- **Barcode Scanning:** Quagga
- **Book Metadata:** Open Library
- **AR Lookup:** Bookroo-backed server lookup with graceful manual fallback

### Data + Sync Posture
- **Primary persistence:** Convex backend state
- **Offline behavior:** Degraded flow support is expected; true local IndexedDB persistence is not currently treated as completed and remains under verification

### Known Operational Risks
- External AR coverage can be incomplete for some ISBNs
- A few client helpers still rely on hardcoded fallback Convex URL paths
- Offline persistence expectations need explicit verification and contract clarity

### Source of Truth
- Runtime implementation in `src/`
- Product and usage framing in `README.md`
- Planning state in `.planning/STATE.md` and `.planning/PROJECT.md`

This section intentionally reflects what is implemented now, not historical recommendation research.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `src/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `bunx convex ai-files install`.
<!-- convex-ai-end -->
