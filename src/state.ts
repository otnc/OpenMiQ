import type { QuoteData } from "makeitaquote";
import QuickLRU from "quick-lru";
import type { QuoteSettings } from "./quoteOptions.js";

/** Everything needed to re-render a posted quote when its buttons are used. */
export interface QuoteState {
  data: QuoteData;
  /**
   * The message `data` replies to, when this was rendered as a chain — see
   * `render.ts`'s `RenderQuoteOptions.chainTop`. Kept alongside `data` so a
   * button re-render (color/bold/flip/…) can rebuild the same chain instead
   * of collapsing it back to a single quote.
   */
  chainTop: QuoteData | null;
  settings: QuoteSettings;
  /** The locale resolved when the quote was first posted; reused on every re-render. */
  locale: string;
  /** The guild it was posted in, or `null` for a DM — resolves the delete button's visibility. */
  guildId: string | null;
  /** Who ran the command/sent the mention that generated this quote. */
  generatorId: string;
  /** Whose name/avatar (or quoted message) this quote is about — may be the same person as `generatorId`. */
  targetId: string;
  /** Whether this is a `/fakequote` — shows "(fake) @username" instead of "@username" on re-render too. */
  fake: boolean;
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

/** Drops a quote's state once it's been soft-deleted — nothing left to re-render. */
export function deleteQuoteState(messageId: string): void {
  store.delete(messageId);
}
