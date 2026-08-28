import type { Client } from "discord.js";
import { COLOR_THEMES, CUSTOM_COLOR_THEMES } from "./colorThemes.js";
import { FONT_ALIASES } from "./fonts.js";

export interface AppEmoji {
  id: string;
  name: string;
  animated: boolean;
}

const THEME_KEYS = new Set(
  [...COLOR_THEMES, ...CUSTOM_COLOR_THEMES].map((theme) => theme.key),
);
const FONT_ALIAS_KEYS = new Set(Object.keys(FONT_ALIASES));

/** The name `deploy:images` gives the loading spinner's application emoji. */
export const LOADING_EMOJI_NAME = "loading";

let colorThemeEmojis = new Map<string, AppEmoji>();
let fontEmojis = new Map<string, AppEmoji>();
let loadingEmoji: AppEmoji | undefined;

/**
 * Populates the application-emoji caches (color-theme swatches, font
 * samples, the loading spinner) from the bot's own application emojis, in
 * one fetch. Call once, after login — `pnpm run deploy:images` is what
 * actually creates them; this just picks up whatever already exists, so a
 * self-hoster who hasn't run it yet gets plain fallbacks instead of an
 * error.
 */
export async function loadAppEmojis(client: Client): Promise<void> {
  if (!client.application) return;
  const emojis = await client.application.emojis.fetch();

  const themeMap = new Map<string, AppEmoji>();
  const fontMap = new Map<string, AppEmoji>();
  let loading: AppEmoji | undefined;
  for (const emoji of emojis.values()) {
    if (!emoji.id || !emoji.name) continue;
    const entry: AppEmoji = {
      id: emoji.id,
      name: emoji.name,
      animated: emoji.animated ?? false,
    };
    if (THEME_KEYS.has(emoji.name)) {
      themeMap.set(emoji.name, entry);
    } else if (FONT_ALIAS_KEYS.has(emoji.name)) {
      fontMap.set(emoji.name, entry);
    } else if (emoji.name === LOADING_EMOJI_NAME) {
      loading = entry;
    }
  }
  colorThemeEmojis = themeMap;
  fontEmojis = fontMap;
  loadingEmoji = loading;
}

/** The application emoji previewing a color theme's gradient, if one exists. */
export function colorThemeEmoji(key: string): AppEmoji | undefined {
  return colorThemeEmojis.get(key);
}

/** The application emoji previewing a font's "Aa" sample, if one exists. Keyed by its short alias. */
export function fontEmoji(alias: string): AppEmoji | undefined {
  return fontEmojis.get(alias);
}

/** `<a:loading:123…>` once `deploy:images` has created it, else a plain fallback. */
export function loadingEmojiMarkup(): string {
  if (!loadingEmoji) return "⏳";
  return `<${loadingEmoji.animated ? "a" : ""}:${loadingEmoji.name}:${loadingEmoji.id}>`;
}
