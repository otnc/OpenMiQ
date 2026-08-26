import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";
import { resolveGoogleFont } from "makeitaquote";
import * as pureimage from "pureimage";
import { applyRoundedCorners } from "./roundedCorners.js";

const SIZE = 64;
const CORNER_RADIUS = SIZE * 0.2;
const SAMPLE_TEXT = "Aa";

/**
 * A small rounded-square "Aa" sample PNG rendered in `family`, white
 * background / black text — used as the font's application emoji in the
 * font select menu, since a family name alone doesn't show what it looks
 * like. Needs real glyph rendering, which pngjs (used for the color-theme
 * swatches) can't do; pureimage adds that in pure JS (via opentype.js), so
 * this still avoids reintroducing the native `@napi-rs/canvas` dependency
 * dropped earlier. The font file itself comes from makeitaquote's own
 * `resolveGoogleFont()` — the same Google Fonts source it renders quotes
 * from — rather than reaching into its private on-disk font cache.
 */
export async function renderFontSwatchPng(family: string): Promise<Buffer> {
  const [face] = await resolveGoogleFont(family, { weights: [400] });
  if (!face) throw new Error(`No Google Font face found for "${family}"`);

  const response = await fetch(face.url);
  if (!response.ok) {
    throw new Error(`Failed to download font "${family}": ${response.status}`);
  }
  const fontBytes = Buffer.from(await response.arrayBuffer());

  const tmpDir = await mkdtemp(path.join(os.tmpdir(), "miq-font-"));
  const fontPath = path.join(tmpDir, `${randomUUID()}.ttf`);
  try {
    await writeFile(fontPath, fontBytes);
    const font = pureimage.registerFont(fontPath, family);
    await font.loadPromise();

    const bitmap = pureimage.make(SIZE, SIZE);
    const ctx = bitmap.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#000000";
    ctx.font = `${Math.round(SIZE * 0.5)}px ${family}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(SAMPLE_TEXT, SIZE / 2, SIZE / 2);

    applyRoundedCorners(bitmap.data, SIZE, CORNER_RADIUS);

    const stream = new PassThrough();
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    await pureimage.encodePNGToStream(bitmap, stream);
    return Buffer.concat(chunks);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}
