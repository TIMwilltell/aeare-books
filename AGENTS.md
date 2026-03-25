<!-- GSD start -->
This project uses **bun** as the package manager (migrated from npm). Always use:
- `bun install` instead of `npm install`
- `bun run <script>` instead of `npm run <script>`
- `bunx <package>` instead of `npx <package>`
<!-- GSD end -->

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `src/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
