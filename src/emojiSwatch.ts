import { parseColor } from "makeitaquote";
import { PNG } from "pngjs";
import type { ColorTheme } from "./colorThemes.js";
import { applyRoundedCorners } from "./roundedCorners.js";

const SIZE = 64;
const CORNER_RADIUS = SIZE * 0.2;

function lerp(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t);
}

/**
 * A small rounded-square PNG previewing a color theme's diagonal gradient —
 * used as the theme's application emoji in the color-theme select menu,
 * since the theme names alone (e.g. "Midnight Blurple") don't convey what
 * they look like. Drawn by hand with pngjs rather than a canvas library: a
 * flat two-stop diagonal gradient is one loop over the pixels, and this
 * avoids reintroducing the native `@napi-rs/canvas` dependency dropped in
 * favor of makeitaquote's own `backgroundGradient` (see colorThemes.ts).
 */
export function renderSwatchPng(theme: ColorTheme): Buffer {
  const from = parseColor(theme.gradient[0]);
  const to = parseColor(theme.gradient[1]);
  const png = new PNG({ width: SIZE, height: SIZE });

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = (x + y) / (2 * (SIZE - 1));
      const i = (SIZE * y + x) << 2;
      png.data[i] = lerp(from.r, to.r, t);
      png.data[i + 1] = lerp(from.g, to.g, t);
      png.data[i + 2] = lerp(from.b, to.b, t);
      png.data[i + 3] = 255;
    }
  }
  applyRoundedCorners(png.data, SIZE, CORNER_RADIUS);

  return PNG.sync.write(png);
}
