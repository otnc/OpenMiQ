import { MiQ, type QuoteData } from "makeitaquote";
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
  const png = await new MiQ()
    .setFromObject(data)
    .setTheme(buildTheme(settings))
    .toBuffer("png");
  await saveImageLocally(png);
  return png;
}
