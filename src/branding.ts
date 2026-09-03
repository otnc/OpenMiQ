import { readFileSync } from "node:fs";
import { LOGO_PATH } from "./config/env.js";

/** What `.setWatermark()` accepts: the bot's tag as text, or the logo image. */
export type Watermark = string | Buffer;

let logo: Buffer | null | undefined;

/**
 * The logo image at `LOGO_PATH`, read once and cached — drawn as the quote
 * watermark in place of the bot's tag. `undefined` when `LOGO_PATH` isn't
 * set, or when the file it names can't be read, so callers fall back to
 * text.
 */
export function watermarkLogo(): Buffer | undefined {
  if (logo === undefined) {
    try {
      logo = LOGO_PATH ? readFileSync(LOGO_PATH) : null;
    } catch {
      logo = null;
    }
  }
  return logo ?? undefined;
}
