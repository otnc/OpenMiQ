/**
 * Loads the env file a deploy script's token/client ID come from — exactly
 * one of the two, never both: `.env.local` when run with `--dev`, `.env`
 * otherwise. Throws (same as any other missing required config) if that
 * file doesn't exist.
 */
export function loadDeployEnv(): void {
  const file = process.argv.includes("--dev") ? ".env.local" : ".env";
  process.loadEnvFile(file);
}
