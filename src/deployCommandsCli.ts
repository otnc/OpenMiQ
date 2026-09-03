import { deployCommands } from "./deployCommands.js";

/**
 * The actual `pnpm run deploy:commands` entrypoint. Kept separate from
 * deployCommands.ts itself because `deployCommands` is also imported by
 * deploy.ts — bundling then pulls the two callers into the same shared
 * chunk, so a "was I run directly?" self-check
 * (`import.meta.url === pathToFileURL(process.argv[1]).href`) inside
 * deployCommands.ts would compare against whichever file the bundler
 * happened to put that code in, not the one actually named on the command
 * line, and can silently never fire. A dedicated entry file has nothing
 * to deduplicate against, so it always runs.
 */
void deployCommands();
