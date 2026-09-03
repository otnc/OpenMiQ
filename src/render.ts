import { MiQ, MiQChain, type QuoteData } from "makeitaquote";
import { saveImageLocally } from "./imageStore.js";
import { buildTheme, type QuoteSettings } from "./quoteOptions.js";

export interface RenderQuoteOptions {
  /** Marks a `/fakequote` render — see buildTheme(). */
  fake?: boolean;
  /**
   * The message `data` is replying to, when `settings.chain` asked for one
   * and one was found — see `findChainTop()`. Renders as a `MiQChain`
   * (`chainTop` on top, `data` on the bottom) instead of a single quote.
   * `buildTheme()` already forces the effective layout back to `side`
   * whenever `settings.chain` is on, so `theme` below is never `new` here —
   * no extra layout check needed.
   */
  chainTop?: QuoteData | null;
}

/**
 * Renders a quote image from data already read off a message
 * (as returned by `new MiQ().setFromMessage(message).setWatermark(...).getData()`),
 * and — if `SAVE_IMAGES_DIR` is set — saves a copy locally.
 *
 * Left at makeitaquote's own default `watermark.size` rather than bumping
 * it up for an image watermark (via the dedicated `watermark.imageSize`) —
 * a bigger logo collides with the quote text over the `new` layout's
 * full-bleed avatar, which has much less clear space at that corner than
 * the `side` layout's plain background does.
 */
export async function renderQuote(
  data: QuoteData,
  settings: QuoteSettings,
  options?: RenderQuoteOptions,
): Promise<Buffer> {
  const theme = buildTheme(settings, { fake: options?.fake });
  const chainTop = options?.chainTop;

  const png = chainTop
    ? await new MiQChain(
        new MiQ().setFromObject(chainTop).setTheme(theme),
        new MiQ().setFromObject(data).setTheme(theme),
        { flip: settings.flip },
      ).toBuffer("png")
    : await new MiQ().setFromObject(data).setTheme(theme).toBuffer("png");

  await saveImageLocally(png);
  return png;
}
