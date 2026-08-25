import { MiQ, type QuoteData } from "makeitaquote";
import { buildTheme, type QuoteSettings } from "./quoteOptions.js";

/**
 * Renders a quote image from data already read off a message
 * (as returned by `new MiQ().setFromMessage(message).getData()`).
 */
export async function renderQuote(
  data: QuoteData,
  settings: QuoteSettings,
): Promise<Buffer> {
  return new MiQ()
    .setFromObject(data)
    .setTheme(buildTheme(settings))
    .toBuffer("png");
}
