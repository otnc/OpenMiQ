import type { QuoteData } from "makeitaquote";
import QuickLRU from "quick-lru";
import type { QuoteSettings } from "./quoteOptions.js";

/** Everything needed to re-render a posted quote when its buttons are used. */
export interface QuoteState {
  data: QuoteData;
  settings: QuoteSettings;
  /** The locale resolved when the quote was first posted; reused on every re-render. */
  locale: string;
}

/**
 * In-memory store of posted quotes, keyed by the bot's reply message ID.
 * Least-recently-used entries are evicted first once the cache grows past
 * `maxSize` (quick-lru's dual-cache design keeps up to 2× that many entries
 * resident at once, trading a bit of extra memory for O(1) eviction); state
 * does not survive a restart.
 */
const store = new QuickLRU<string, QuoteState>({ maxSize: 500 });

export function saveQuoteState(messageId: string, state: QuoteState): void {
  store.set(messageId, state);
}

export function getQuoteState(messageId: string): QuoteState | undefined {
  return store.get(messageId);
}
