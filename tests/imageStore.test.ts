import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { saveImageLocally } from "../src/imageStore.js";

describe("saveImageLocally", () => {
  afterEach(() => {
    delete process.env.SAVE_IMAGES_DIR;
  });

  it("does nothing when SAVE_IMAGES_DIR is unset", async () => {
    await expect(
      saveImageLocally(Buffer.from("fake png")),
    ).resolves.toBeUndefined();
  });

  it("writes a PNG file into the configured directory when set", async () => {
    const tmpDir = mkdtempSync(path.join(os.tmpdir(), "miq-bot-images-"));
    process.env.SAVE_IMAGES_DIR = tmpDir;

    // SAVE_IMAGES_DIR is read once at module load, so reset the module
    // registry to pick up the env var set just above.
    vi.resetModules();
    const { saveImageLocally: save } = await import("../src/imageStore.js");
    await save(Buffer.from("fake png data"));

    const files = readdirSync(tmpDir);
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(
      /^quote-\d+-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/,
    );

    rmSync(tmpDir, { recursive: true, force: true });
  });
});
