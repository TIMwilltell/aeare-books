---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: []
must_haves:
  truths:
    - "Project uses bun as package manager"
    - "bun.lockb file exists in project root"
    - "Dev server runs with bun"
  artifacts:
    - path: "bun.lockb"
      provides: "Bun lockfile"
    - path: "package.json"
      provides: "Updated scripts for bun"
  key_links: []
---

<objective>
Migrate this project from npm to bun package manager.

Purpose: Bun is significantly faster than npm for install and run, improving development experience.
Output: Project configured to use bun with bun.lockb generated.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
Current state:
- package.json exists with SvelteKit project dependencies
- package-lock.json exists (npm lockfile)
- No bun.lockb present
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install bun and migrate to bun package manager</name>
  <files>bun.lockb, package-lock.json</files>
  <action>
    1. If bun not installed, run: `curl -fsSL https://bun.sh/install | bash`
    2. Remove npm lockfile: `rm package-lock.json`
    3. Install with bun: `bun install`
    4. Verify bun.lockb was created
    5. Test dev server starts: `bun run dev` (start in background, verify it starts, then stop)
  </action>
  <verify>
    <automated>ls bun.lockb && bun run build</automated>
  </verify>
  <done>bun.lockb exists, build completes successfully with bun</done>
</task>

</tasks>

<verification>
- bun.lockb file exists in project root
- `bun run build` completes without errors
- No package-lock.json remains
</verification>

<success_criteria>
- Project uses bun as package manager
- All dependencies install correctly
- Build works with bun
</success_criteria>

<output>
After completion, create `.planning/quick/260324-icf-migrate-this-project-from-npm-to-bun/260324-icf-SUMMARY.md`
</output>
