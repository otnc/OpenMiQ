import { MiQ, MiQChain, type QuoteData } from "makeitaquote";
import type { Watermark } from "./branding.js";
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
 * makeitaquote's default `watermark.size` (a fraction of canvas height) is
 * tuned for a short, faint text tag. A wordmark logo reads as intentional
 * branding rather than a stamp, so it gets drawn noticeably larger.
 */
const LOGO_WATERMARK_SIZE = 0.03;

/**
 * Renders a quote image from data already read off a message
 * (as returned by `new MiQ().setFromMessage(message).getData()`), and — if
 * `SAVE_IMAGES_DIR` is set — saves a copy locally.
 *
 * `watermark` is applied here rather than trusted to already be on `data` —
 * makeitaquote's `setFromObject()` (which `data` is fed through below) only
 * reads its unified `watermark` field, not the separate `watermarkImage`
 * `getData()` puts an image watermark under, so an image watermark baked
 * into `data` earlier would otherwise be silently dropped on the way
 * through here.
 */
export async function renderQuote(
  data: QuoteData,
  watermark: Watermark,
  settings: QuoteSettings,
  options?: RenderQuoteOptions,
): Promise<Buffer> {
  const theme = buildTheme(settings, { fake: options?.fake });
  if (typeof watermark !== "string") {
    theme.watermark = { ...theme.watermark, size: LOGO_WATERMARK_SIZE };
  }
  const chainTop = options?.chainTop;

  const png = chainTop
    ? await new MiQChain(
        new MiQ()
          .setFromObject(chainTop)
          .setTheme(theme)
          .setWatermark(watermark),
        new MiQ().setFromObject(data).setTheme(theme).setWatermark(watermark),
        { flip: settings.flip },
      ).toBuffer("png")
    : await new MiQ()
        .setFromObject(data)
        .setTheme(theme)
        .setWatermark(watermark)
        .toBuffer("png");

  await saveImageLocally(png);
  return png;
}
