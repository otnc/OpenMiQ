import { DEFAULT_LOCALE } from "./env.js";
import { JsonStore } from "./store.js";
import { DEFAULT_SETTINGS, type QuoteSettings } from "../quoteOptions.js";

export interface ScopeSettings {
  language?: string;
  quoteDefaults?: Partial<QuoteSettings>;
  /**
   * `/fakequote` is blocked here. Meaning depends on scope: for a user it
   * means "don't let others put words in my mouth"; for a guild or the bot
   * it disables the command outright.
   */
  fakeQuoteDisabled?: boolean;
  /**
   * Hides the "(fake) @username" marker `/fakequote` normally adds. Scope
   * is bot, guild, or the *invoker* (not the impersonated author, unlike
   * `fakeQuoteDisabled` above) — see fakeQuoteLabelHidden().
   */
  fakeQuoteLabelDisabled?: boolean;
  /** Hides the delete button under posted quotes — guild/bot scope only. */
  deleteButtonDisabled?: boolean;
}

const BOT_KEY = "bot";

const userStore = new JsonStore<ScopeSettings>("users.json");
const guildStore = new JsonStore<ScopeSettings>("guilds.json");
const botStore = new JsonStore<ScopeSettings>("bot.json");

/** Loads all three stores from disk. Call once at startup, before login. */
export function loadSettingsStores(): void {
  userStore.load();
  guildStore.load();
  botStore.load();
}

function mergeScope(
  current: ScopeSettings,
  patch: ScopeSettings,
): ScopeSettings {
  const quoteDefaults = { ...current.quoteDefaults, ...patch.quoteDefaults };
  return {
    language: patch.language ?? current.language,
    quoteDefaults: Object.keys(quoteDefaults).length
      ? quoteDefaults
      : undefined,
    fakeQuoteDisabled: patch.fakeQuoteDisabled ?? current.fakeQuoteDisabled,
    fakeQuoteLabelDisabled:
      patch.fakeQuoteLabelDisabled ?? current.fakeQuoteLabelDisabled,
    deleteButtonDisabled:
      patch.deleteButtonDisabled ?? current.deleteButtonDisabled,
  };
}

export function getUserSettings(userId: string): ScopeSettings {
  return userStore.get(userId) ?? {};
}
export async function setUserSettings(
  userId: string,
  patch: ScopeSettings,
): Promise<void> {
  await userStore.set(userId, mergeScope(getUserSettings(userId), patch));
}
export async function resetUserSettings(userId: string): Promise<void> {
  await userStore.delete(userId);
}

export function getGuildSettings(guildId: string): ScopeSettings {
  return guildStore.get(guildId) ?? {};
}
export async function setGuildSettings(
  guildId: string,
  patch: ScopeSettings,
): Promise<void> {
  await guildStore.set(guildId, mergeScope(getGuildSettings(guildId), patch));
}
export async function resetGuildSettings(guildId: string): Promise<void> {
  await guildStore.delete(guildId);
}

export function getBotDefaults(): ScopeSettings {
  return botStore.get(BOT_KEY) ?? {};
}
export async function setBotDefaults(patch: ScopeSettings): Promise<void> {
  await botStore.set(BOT_KEY, mergeScope(getBotDefaults(), patch));
}
export async function resetBotDefaults(): Promise<void> {
  await botStore.delete(BOT_KEY);
}

/**
 * Merges saved quote-option defaults with what a mention actually asked
 * for: bot-wide < guild < user < inline (this invocation's own options).
 */
export function resolveQuoteSettings(params: {
  userId: string;
  guildId: string | null;
  inline: Partial<QuoteSettings>;
}): QuoteSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...getBotDefaults().quoteDefaults,
    ...(params.guildId
      ? getGuildSettings(params.guildId).quoteDefaults
      : undefined),
    ...getUserSettings(params.userId).quoteDefaults,
    ...params.inline,
  };
}

/** Same precedence as {@link resolveQuoteSettings}, for the reply's language. */
export function resolveLocale(params: {
  userId: string;
  guildId: string | null;
}): string {
  return (
    getUserSettings(params.userId).language ??
    (params.guildId ? getGuildSettings(params.guildId).language : undefined) ??
    getBotDefaults().language ??
    DEFAULT_LOCALE
  );
}

/**
 * Why `/fakequote` is blocked for this author, checked in the same
 * precedence as everything else — bot, then guild, then the author's own
 * opt-out — or `null` if it isn't blocked.
 */
export function fakeQuoteBlockReason(params: {
  authorId: string;
  guildId: string | null;
}): "bot" | "guild" | "user" | null {
  if (getBotDefaults().fakeQuoteDisabled) return "bot";
  if (params.guildId && getGuildSettings(params.guildId).fakeQuoteDisabled) {
    return "guild";
  }
  if (getUserSettings(params.authorId).fakeQuoteDisabled) return "user";
  return null;
}

/**
 * Whether the delete button should appear under a posted quote — bot-wide,
 * then guild, can turn it off; on by default. No user-level override, since
 * this is a moderation setting rather than a personal preference.
 */
export function deleteButtonEnabled(guildId: string | null): boolean {
  if (getBotDefaults().deleteButtonDisabled) return false;
  if (guildId && getGuildSettings(guildId).deleteButtonDisabled) return false;
  return true;
}

/**
 * Whether `/fakequote`'s "(fake) @username" marker should be hidden for
 * this invocation — bot, guild, or the *invoker themselves* can opt out
 * (on by default). This is about the invoker's own fakequotes, not the
 * impersonated author's — see fakeQuoteBlockReason() for that one.
 */
export function fakeQuoteLabelHidden(params: {
  invokerId: string;
  guildId: string | null;
}): boolean {
  if (getBotDefaults().fakeQuoteLabelDisabled) return true;
  if (
    params.guildId &&
    getGuildSettings(params.guildId).fakeQuoteLabelDisabled
  ) {
    return true;
  }
  return Boolean(getUserSettings(params.invokerId).fakeQuoteLabelDisabled);
}
