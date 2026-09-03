import { deployImages } from "./deployImages.js";

/**
 * The actual `pnpm run deploy:images` entrypoint — see
 * deployCommandsCli.ts for why this lives in its own file rather than a
 * self-check at the bottom of deployImages.ts.
 */
void deployImages();
