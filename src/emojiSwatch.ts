import { PNG } from "pngjs";
import type { ColorTheme } from "./colorThemes.js";

const SIZE = 64;

function hexToRgb(hex: string): [r: number, g: number, b: number] {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function lerp(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t);
}

/**
 * A small square PNG previewing a color theme's diagonal gradient — used as
 * the theme's application emoji in the color-theme select menu, since the
 * theme names alone (e.g. "Midnight Blurple") don't convey what they look
 * like. Drawn by hand with pngjs rather than a canvas library: a flat
 * two-stop diagonal gradient is one loop over the pixels, and this avoids
 * reintroducing the native `@napi-rs/canvas` dependency dropped in favor of
 * makeitaquote's own `backgroundGradient` (see colorThemes.ts).
 */
export function renderSwatchPng(theme: ColorTheme): Buffer {
  const [r0, g0, b0] = hexToRgb(theme.gradient[0]);
  const [r1, g1, b1] = hexToRgb(theme.gradient[1]);
  const png = new PNG({ width: SIZE, height: SIZE });

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const t = (x + y) / (2 * (SIZE - 1));
      const i = (SIZE * y + x) << 2;
      png.data[i] = lerp(r0, r1, t);
      png.data[i + 1] = lerp(g0, g1, t);
      png.data[i + 2] = lerp(b0, b1, t);
      png.data[i + 3] = 255;
    }
  }

  return PNG.sync.write(png);
}
