import type { Client, Message } from "discord.js";
import { MiQ, type QuoteData } from "makeitaquote";
import type { Watermark } from "./branding.js";
import { fetchReferencedMessage } from "./messageRefs.js";
import type { QuoteSettings } from "./quoteOptions.js";

/**
 * When `settings.chain` asked for it and `target` (the message being
 * quoted) is itself a reply, reads off the message it's replying to the
 * same way `target` itself gets read — for `render.ts`'s `RenderQuoteOptions.chainTop`.
 *
 * `null` when chaining wasn't requested, `target` isn't a reply, the reply
 * source has no text, or it couldn't be fetched (deleted, no access, …) —
 * callers fall back to a single quote in every one of those cases, same as
 * if `chain` had never been asked for.
 */
export async function findChainTop(
  client: Client,
  target: Message,
  settings: QuoteSettings,
  watermark: Watermark,
): Promise<QuoteData | null> {
  if (!settings.chain) return null;

  const replySource = await fetchReferencedMessage(client, target);
  if (!replySource || !replySource.content.trim()) return null;

  return new MiQ()
    .setFromMessage(replySource, { markdown: "raw" })
    .setWatermark(watermark)
    .getData();
}
