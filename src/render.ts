import { defineTheme, MiQ, type QuoteData } from "makeitaquote";
import { saveImageLocally } from "./imageStore.js";
import { buildTheme, type QuoteSettings } from "./quoteOptions.js";

/**
 * Renders a quote image from data already read off a message
 * (as returned by `new MiQ().setFromMessage(message).getData()`), and — if
 * `SAVE_IMAGES_DIR` is set — saves a copy locally.
 */
export async function renderQuote(
  data: QuoteData,
  settings: QuoteSettings,
): Promise<Buffer> {
  // MiQ#setTheme() carries over the *previous* instance's width/height
  // whenever the new theme object doesn't set them explicitly (meant to
  // preserve a caller's own custom size across later setTheme() calls) — but
  // that also fires for a plain `extends: "portrait"` switch, silently
  // keeping the default 1200x630 "dark" canvas shape instead of portrait's
  // own 630x790. Resolving through defineTheme() first fills in width/height
  // explicitly, so that fallback never triggers.
  // https://github.com/otnc/makeitaquote/issues/53
  const png = await new MiQ()
    .setFromObject(data)
    .setTheme(defineTheme(buildTheme(settings)))
    .toBuffer("png");
  await saveImageLocally(png);
  return png;
}
