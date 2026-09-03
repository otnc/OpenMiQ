import {
  MiQ,
  MiQChain,
  stripDiscordMarkdown,
  type QuoteData,
} from "makeitaquote";
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
 * (as returned by `new MiQ().setFromMessage(message, { markdown: "raw" }).setWatermark(...).getData()`),
 * and — if `SAVE_IMAGES_DIR` is set — saves a copy locally.
 *
 * Left at makeitaquote's own default `watermark.size` rather than bumping
 * it up for an image watermark (via the dedicated `watermark.imageSize`) —
 * a bigger logo collides with the quote text over the `new` layout's
 * full-bleed avatar, which has much less clear space at that corner than
 * the `side` layout's plain background does.
 *
 * `data`/`chainTop` are expected to still carry the *unstripped* message
 * text (`markdown: "raw"`, not `stripDiscordMarkdown: true`/`markdown:
 * false`) — `applyMarkdownSetting()` below decides at render time, from
 * `settings.markdown`, whether to show it verbatim, real Discord
 * formatting rendered, or (the default) stripped back to plain text. Only
 * `false` throws away the original markup for good (see makeitaquote's own
 * `resolveQuoteText()`), so keeping the source at `"raw"` is what lets the
 * markdown button re-render the same quote either way.
 */
export async function renderQuote(
  data: QuoteData,
  settings: QuoteSettings,
  options?: RenderQuoteOptions,
): Promise<Buffer> {
  const theme = buildTheme(settings, { fake: options?.fake });
  const chainTop = options?.chainTop;
  const renderData = applyMarkdownSetting(data, settings.markdown);
  const renderChainTop = chainTop
    ? applyMarkdownSetting(chainTop, settings.markdown)
    : null;

  const png = renderChainTop
    ? await new MiQChain(
        new MiQ().setFromObject(renderChainTop).setTheme(theme),
        new MiQ().setFromObject(renderData).setTheme(theme),
        { flip: settings.flip },
      ).toBuffer("png")
    : await new MiQ().setFromObject(renderData).setTheme(theme).toBuffer("png");

  await saveImageLocally(png);
  return png;
}

/**
 * `on` renders real Discord markdown formatting; off (the default) strips
 * it back to plain text with `stripDiscordMarkdown()` — the same visible
 * result `stripDiscordMarkdown: true` used to bake in at creation time,
 * just computed fresh from the preserved raw text on every render instead.
 */
function applyMarkdownSetting(data: QuoteData, on: boolean): QuoteData {
  return on
    ? { ...data, markdown: "discord" }
    : { ...data, text: stripDiscordMarkdown(data.text), markdown: "raw" };
}
