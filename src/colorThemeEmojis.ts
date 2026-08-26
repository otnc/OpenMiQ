import type { Client } from "discord.js";
import { COLOR_THEMES } from "./colorThemes.js";

export interface ThemeEmoji {
  id: string;
  name: string;
}

const THEME_KEYS = new Set(COLOR_THEMES.map((theme) => theme.key));

let emojiByKey = new Map<string, ThemeEmoji>();

/**
 * Populates the color-theme emoji cache from the bot's own application
 * emojis. Call once, after login — `pnpm run deploy:images` is what
 * actually creates them; this just picks up whatever already exists, so a
 * self-hoster who hasn't run it yet gets a plain select menu instead of an
 * error.
 */
export async function loadColorThemeEmojis(client: Client): Promise<void> {
  if (!client.application) return;
  const emojis = await client.application.emojis.fetch();
  const map = new Map<string, ThemeEmoji>();
  for (const emoji of emojis.values()) {
    if (emoji.id && emoji.name && THEME_KEYS.has(emoji.name)) {
      map.set(emoji.name, { id: emoji.id, name: emoji.name });
    }
  }
  emojiByKey = map;
}

/** The application emoji previewing a color theme's gradient, if one exists. */
export function colorThemeEmoji(key: string): ThemeEmoji | undefined {
  return emojiByKey.get(key);
}
