import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // settings.test.ts imports its module under test dynamically (see the
    // file for why); on a cold cache that first dynamic import can be slow.
    hookTimeout: 30_000,
  },
});
