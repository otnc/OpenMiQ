import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/deployCommands.ts",
    "src/deployImages.ts",
    "src/deploy.ts",
  ],
  format: "esm",
  dts: false,
  platform: "node",
  target: "node24",
  clean: true,
  outDir: "dist",
  outExtensions: () => ({ js: ".js" }),
});
