// pm2 config for running the built bot (`pnpm run build` first) as a long-lived process: `pm2 start ecosystem.config.cjs`.
//
// CommonJS (`.cjs`) on purpose — package.json sets `"type": "module"`, and pm2 loads config files with `require()`, which can't parse ESM.
try {
  // Node 20.6+ — this project already requires Node >=24. Optional: pm2 itself doesn't need the bot's env vars, only PM2_APP_NAME below, but `--env-file-if-exists` in `node_args` is what actually gets `.env` into the running bot process.
  process.loadEnvFile(".env");
} catch {
  // No .env next to this file — fine, real env vars may be set another way.
}

const appName = process.env.PM2_APP_NAME?.trim() || "openmiq";

module.exports = {
  apps: [
    {
      name: appName,
      script: "dist/index.js",
      cwd: __dirname,
      node_args: ["--env-file-if-exists=.env"],
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
    },
  ],
};
