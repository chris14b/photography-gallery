import { defineConfig } from "vitest/config";

export default defineConfig({
  // Only this checkout's tests, not those of worktrees nested under .claude/worktrees.
  test: { include: ["src/**/*.test.ts"] },
});
