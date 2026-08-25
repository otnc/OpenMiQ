import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SAVE_IMAGES_DIR } from "./config/env.js";

/**
 * Saves a copy of a rendered quote image to `SAVE_IMAGES_DIR`, if set.
 * Best-effort: a failure here is logged, never thrown, so it can't break
 * the actual Discord reply.
 */
export async function saveImageLocally(png: Buffer): Promise<void> {
  if (!SAVE_IMAGES_DIR) return;
  try {
    await mkdir(SAVE_IMAGES_DIR, { recursive: true });
    const fileName = `quote-${Date.now()}-${randomUUID()}.png`;
    await writeFile(path.join(SAVE_IMAGES_DIR, fileName), png);
  } catch (error) {
    console.error("Failed to save generated image locally:", error);
  }
}
