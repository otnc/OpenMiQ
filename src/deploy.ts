import { deployCommands } from "./deployCommands.js";
import { deployImages } from "./deployImages.js";

/**
 * Runs deployCommands() then deployImages() in one process, so `--dev`
 * (see loadDeployEnv.ts) applies to both instead of only whichever one a
 * shell happens to append a trailing CLI arg to. Run with `pnpm run deploy`.
 */
async function main(): Promise<void> {
  await deployCommands();
  await deployImages();
}

void main();
