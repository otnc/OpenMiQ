import { fileURLToPath } from "node:url";
import path from "node:path";
import { writeFileSync } from "node:fs";
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

/**
 * Regenerates the two brand assets in this directory — the bot icon (a
 * quote-mark mark) and the "OpenMiQ" wordmark — from code, using
 * @napi-rs/canvas (the same Skia-backed renderer makeitaquote itself uses)
 * instead of hand-authored image files. Run with `npx tsx
 * .github/assets/generate-icon-logo.ts` whenever the design needs to
 * change; nothing at runtime depends on these files existing.
 *
 * FONTS_DIR points at `.private/fonts/`, which is gitignored and not part
 * of this repository — the fonts below are free downloads / Google Fonts
 * releases with their own licenses (see README.md's Fonts credits), not
 * ours to redistribute. That means this script is readable but not
 * runnable straight out of a clone; get your own copies of the two font
 * files named below and drop them in `.private/fonts/` to reproduce it.
 * See ADDITIONAL_TERMS.md §4 for what the *output* of this script may and
 * may not be used for.
 *
 * Two fonts, on purpose:
 *  - MAIN_FONT (あかずきんポップ / Akazukin POP by flopdesign, free download
 *    at https://flopdesign.booth.pm/items/1748058) draws "OpenMiQ" itself.
 *  - QUOTE_FONT (M PLUS Rounded 1c Bold — the same font makeitaquote
 *    downloads as its own default) draws the quote-mark accent. Akazukin
 *    POP's own `"` is a plain straight bar; M PLUS Rounded's curly closing
 *    quote (”, U+201D) is a soft, slightly slanted mark that reads much
 *    closer to the official Make it a Quote bot's own icon (a rounded
 *    white ” on a solid background).
 */

const REPO_ROOT = path.resolve(
  fileURLToPath(new URL(".", import.meta.url)),
  "..",
  "..",
);
const ASSETS_DIR = path.resolve(fileURLToPath(new URL(".", import.meta.url)));
const FONTS_DIR = path.join(REPO_ROOT, ".private", "fonts");

const MAIN_FONT_PATH = path.join(FONTS_DIR, "AkazukiPOP.otf");
const MAIN_FONT = "OpenMiQ Branding Main";

const QUOTE_FONT_PATH = path.join(FONTS_DIR, "MPLUSRounded1c-Bold.ttf");
const QUOTE_FONT = "OpenMiQ Branding Quote";

/** Closing curly double quote — matches the real bot icon's mark, unlike a plain straight `"`. */
const QUOTE_CHAR = "”";

// The project's brand gradient: teal to red, sampled from the very first
// hand-authored icon this project shipped with.
const GRADIENT_FROM = "#3188A8";
const GRADIENT_TO = "#AA3139";

/** Quoted so a filename-derived family (a period in it, say) still parses as one CSS token. */
function fontString(px: number, family: string): string {
  return `${px}px "${family}"`;
}

function loadFonts(): void {
  for (const [path_, family] of [
    [MAIN_FONT_PATH, MAIN_FONT],
    [QUOTE_FONT_PATH, QUOTE_FONT],
  ] as const) {
    const ok = GlobalFonts.registerFromPath(path_, family);
    if (!ok) throw new Error(`Failed to register font from ${path_}`);
  }
}

function generateIcon(): Buffer {
  const size = 512;
  const quoteFontSize = 280;
  // How far below vertical-center the mark's baseline sits — tuned per
  // font, since where a glyph falls within its own em box varies a lot.
  const baselineOffset = 100;

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, GRADIENT_FROM);
  bg.addColorStop(1, GRADIENT_TO);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#ffffff";
  ctx.font = fontString(quoteFontSize, QUOTE_FONT);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillText(QUOTE_CHAR, size / 2, size / 2 + baselineOffset);

  return canvas.toBuffer("image/png");
}

function generateLogo(): Buffer {
  const fontSize = 130;
  const height = 160;
  const padX = 16;
  const outlineWidth = 10; // keeps the wordmark legible over any background
  const decorSize = fontSize * 0.55; // a small quote mark, echoing the icon
  const decorGap = 6;

  const measure = createCanvas(10, 10).getContext("2d");
  measure.font = fontString(fontSize, MAIN_FONT);
  const textMetrics = measure.measureText("OpenMiQ");
  measure.font = fontString(decorSize, QUOTE_FONT);
  const decorMetrics = measure.measureText(QUOTE_CHAR);

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
  const decorBaseline = textBaseline - (fontSize - decorSize) * 0.6;

  ctx.font = fontString(decorSize, QUOTE_FONT);
  ctx.lineWidth = outlineWidth * 0.7;
  ctx.strokeText(QUOTE_CHAR, padX, decorBaseline);
  ctx.fillText(QUOTE_CHAR, padX, decorBaseline);

  ctx.font = fontString(fontSize, MAIN_FONT);
  ctx.lineWidth = outlineWidth;
  ctx.strokeText("OpenMiQ", padX + decorWidth + decorGap, textBaseline);
  ctx.fillText("OpenMiQ", padX + decorWidth + decorGap, textBaseline);

  return canvas.toBuffer("image/png");
}

function main(): void {
  loadFonts();
  writeFileSync(path.join(ASSETS_DIR, "icon.png"), generateIcon());
  writeFileSync(path.join(ASSETS_DIR, "logo.png"), generateLogo());
  console.log(`Wrote icon.png and logo.png to ${ASSETS_DIR}`);
}

main();
