import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/deployCommandsCli.ts",
    "src/deployImagesCli.ts",
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
