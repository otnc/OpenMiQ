// pm2 config for running the built bot (`pnpm run build` first) as a
// long-lived process: `pm2 start ecosystem.config.cjs`.
//
// CommonJS (`.cjs`) on purpose — package.json sets `"type": "module"`, and
// pm2 loads config files with `require()`, which can't parse ESM.
const fs = require("fs");
const path = require("path");

/**
 * Reads `.env` into a plain object, without ever calling
 * `process.loadEnvFile()` here — that would pollute *this* process's own
 * `process.env` (the pm2 CLI's), which then leaks into pm2's persisted
 * state the same way the values below do anyway (see note on `env`).
 *
 * A hand-rolled parser rather than a real one on purpose: this project's
 * own `.env.example` only ever uses plain `KEY=value` lines and `#`
 * comments, so that's all this needs to handle.
 */
function readDotEnv(filePath) {
  const env = {};
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return env; // no .env — fine, real env vars may be set another way
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const dotEnv = readDotEnv(path.join(__dirname, ".env"));
const appName =
  process.env.PM2_APP_NAME?.trim() || dotEnv.PM2_APP_NAME?.trim() || "openmiq";

module.exports = {
  apps: [
    {
      name: appName,
      script: "dist/index.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      // Handed to pm2's own `env` mechanism rather than a `--env-file`
      // node arg — this pm2 install doesn't actually apply `node_args`/
      // `interpreter_args` to the spawned process (verified directly:
      // the flag never shows up in the child's real argv), so that route
      // silently leaves the bot without its token. `env` is core,
      // reliably-applied pm2 behavior — the same way this host's other
      // Node apps hand themselves their own secrets.
      env: dotEnv,
    },
  ],
};
