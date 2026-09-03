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
 * makeitaquote's `watermark.size` (a fraction of canvas height) defaults to
 * ~0.024, tuned for a short, faint text tag — a logo drawn at that height
 * reads as barely-there noise rather than intentional branding, so an
 * image watermark gets its own, bigger `watermark.imageSize` instead.
 */
const LOGO_WATERMARK_SIZE = 0.06;

/**
 * Renders a quote image from data already read off a message
 * (as returned by `new MiQ().setFromMessage(message).setWatermark(...).getData()`),
 * and — if `SAVE_IMAGES_DIR` is set — saves a copy locally.
 */
export async function renderQuote(
  data: QuoteData,
  settings: QuoteSettings,
  options?: RenderQuoteOptions,
): Promise<Buffer> {
  const theme = buildTheme(settings, { fake: options?.fake });
  const chainTop = options?.chainTop;
  if (data.watermarkImage || chainTop?.watermarkImage) {
    theme.watermark = { ...theme.watermark, imageSize: LOGO_WATERMARK_SIZE };
  }

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
