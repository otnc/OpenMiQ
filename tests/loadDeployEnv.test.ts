import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDeployEnv } from "../src/loadDeployEnv.js";

describe("loadDeployEnv", () => {
  let tmpDir: string;
  let cwd: string;
  let argv: string[];

  beforeEach(() => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "miq-bot-deploy-env-"));
    writeFileSync(path.join(tmpDir, ".env"), "DEPLOY_ENV_TEST=prod\n");
    writeFileSync(path.join(tmpDir, ".env.local"), "DEPLOY_ENV_TEST=dev\n");
    cwd = process.cwd();
    process.chdir(tmpDir);
    argv = process.argv;
    process.argv = [...argv];
  });

  afterEach(() => {
    process.chdir(cwd);
    process.argv = argv;
    delete process.env.DEPLOY_ENV_TEST;
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("loads .env by default", () => {
    loadDeployEnv();
    expect(process.env.DEPLOY_ENV_TEST).toBe("prod");
  });

  it("loads .env.local when --dev is passed", () => {
    process.argv.push("--dev");
    loadDeployEnv();
    expect(process.env.DEPLOY_ENV_TEST).toBe("dev");
  });

  it("throws when the target file doesn't exist", () => {
    rmSync(path.join(tmpDir, ".env"));
    expect(() => loadDeployEnv()).toThrow();
  });
});
