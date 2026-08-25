import type { QuoteData } from "makeitaquote";
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
 * Oldest entries are evicted first; state does not survive a restart.
 */
const store = new Map<string, QuoteState>();

const MAX_ENTRIES = 500;

export function saveQuoteState(messageId: string, state: QuoteState): void {
  store.delete(messageId);
  store.set(messageId, state);
  while (store.size > MAX_ENTRIES) {
    const oldest = store.keys().next();
    if (oldest.done) break;
    store.delete(oldest.value);
  }
}

export function getQuoteState(messageId: string): QuoteState | undefined {
  return store.get(messageId);
}
