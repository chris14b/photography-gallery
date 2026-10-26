# Agent notes

[README.md](README.md) covers the stack, scripts, layout and the rules for album.json and collection.json. Follow it rather than restating it; this file only adds what it doesn't.

- Run `npm run check` before finishing (type check, lint, format check, tests and a list of photos without captions). Fix failures with `npm run format` where that's all it is. The caption list is a reminder, not a failure.
- Use Node 22.23.4 or later (`.nvmrc`). The default shell Node is older and Astro refuses to run on it, so run `nvm use` first, or put `~/.nvm/versions/node/v22.23.4/bin` at the front of `PATH` in shells that don't load nvm.
- Worktrees under `.claude/worktrees/` sit inside the main checkout and resolve some packages from its `node_modules`. After pulling, run `npm ci` in the main checkout as well as the worktree. "Tsconfig not found astro/tsconfigs/strict" means the main checkout's packages are out of date.
- The scripts in `scripts/` are TypeScript, which Node runs directly by stripping the types. Use only syntax it can erase (no enums, namespaces or parameter properties; `erasableSyntaxOnly` in `tsconfig.json` checks this), import local files with their `.ts` extension, and import nothing from `astro:`, including through `src/lib/folders.ts`.
