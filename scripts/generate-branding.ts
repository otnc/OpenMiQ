import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

/**
 * Regenerates the two brand assets under `.github/assets/` — the bot icon
 * (a quote-mark mark) and the "OpenMiQ" wordmark — from code, using
 * @napi-rs/canvas (the same Skia-backed renderer makeitaquote itself uses)
 * instead of hand-authored image files. Run with `pnpm run
 * generate:branding` whenever the design needs to change; nothing at
 * runtime depends on these files existing.
 */

const REPO_ROOT = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
);
const ASSETS_DIR = path.join(REPO_ROOT, ".github", "assets");

const FONT_PATH = path.join(
  REPO_ROOT,
  "node_modules",
  "@fontsource",
  "baloo-2",
  "files",
  "baloo-2-latin-800-normal.woff2",
);
const FONT_FAMILY = "OpenMiQ Branding";

// The project's brand gradient: teal to red.
const GRADIENT_FROM = "#3188A8";
const GRADIENT_TO = "#AA3139";

function loadFont(): void {
  const ok = GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY);
  if (!ok) throw new Error(`Failed to register font from ${FONT_PATH}`);
}

function generateIcon(): Buffer {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, GRADIENT_FROM);
  bg.addColorStop(1, GRADIENT_TO);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#ffffff";
  ctx.font = `440px ${FONT_FAMILY}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillText('"', size / 2 + 8, size / 2 + 155);

  return canvas.toBuffer("image/png");
}

function generateLogo(): Buffer {
  const fontSize = 130;
  const height = 160;
  const padX = 16;
  const outlineWidth = 10; // keeps the wordmark legible over any background
  const decorSize = fontSize * 0.6; // a small quote mark, echoing the icon
  const decorGap = 4;

  const measure = createCanvas(10, 10).getContext("2d");
  measure.font = `${fontSize}px ${FONT_FAMILY}`;
  const textMetrics = measure.measureText("OpenMiQ");
  measure.font = `${decorSize}px ${FONT_FAMILY}`;
  const decorMetrics = measure.measureText('"');

  const textWidth = Math.ceil(textMetrics.width);
  const decorWidth = Math.ceil(decorMetrics.width);
  const width = padX * 2 + decorWidth + decorGap + textWidth;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const fg = ctx.createLinearGradient(0, 0, width, 0);
  fg.addColorStop(0, GRADIENT_FROM);
  fg.addColorStop(1, GRADIENT_TO);

  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.fillStyle = fg;

  const textBaseline =
    height / 2 +
    (textMetrics.actualBoundingBoxAscent -
      textMetrics.actualBoundingBoxDescent) /
      2;
  // A real opening quote sits high, near cap-height, not on the baseline —
  // lifted so it reads as a mark next to the word, not a stray character.
  const decorBaseline = textBaseline - (fontSize - decorSize) * 0.72;

  ctx.font = `${decorSize}px ${FONT_FAMILY}`;
  ctx.lineWidth = outlineWidth * 0.7;
  ctx.strokeText('"', padX, decorBaseline);
  ctx.fillText('"', padX, decorBaseline);

  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.lineWidth = outlineWidth;
  ctx.strokeText("OpenMiQ", padX + decorWidth + decorGap, textBaseline);
  ctx.fillText("OpenMiQ", padX + decorWidth + decorGap, textBaseline);

  return canvas.toBuffer("image/png");
}

function main(): void {
  loadFont();
  writeFileSync(path.join(ASSETS_DIR, "icon.png"), generateIcon());
  writeFileSync(path.join(ASSETS_DIR, "logo.png"), generateLogo());
  console.log(`Wrote icon.png and logo.png to ${ASSETS_DIR}`);
}

main();
