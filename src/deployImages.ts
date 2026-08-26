import { readFileSync } from "node:fs";
import path from "node:path";
import {
  REST,
  Routes,
  type RESTGetAPIApplicationEmojisResult,
} from "discord.js";
import { LOADING_EMOJI_NAME } from "./appEmojis.js";
import { COLOR_THEMES } from "./colorThemes.js";
import { renderSwatchPng } from "./emojiSwatch.js";

/**
 * Resolved from the working directory rather than this module's own path,
 * same reasoning as the old `locales/` lookup had: bundling collapses
 * `src/` into `dist/` at a different depth than the source tree.
 */
const LOADING_GIF_PATH = path.resolve(process.cwd(), "assets", "loading.gif");

/**
 * Creates the application emoji this bot needs and doesn't already have:
 * one per color theme (named after its key, e.g. `:sunset:`) previewing its
 * gradient for the color-theme select menu, plus the `:loading:` spinner
 * shown while a quote renders. Skips anything that already exists — safe to
 * re-run after adding a new theme. Run with `pnpm run deploy:images` (or
 * `pnpm run deploy` for this and `deploy:commands`).
 */
async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token) throw new Error("DISCORD_TOKEN is not set.");
  if (!clientId) throw new Error("DISCORD_CLIENT_ID is not set.");

  const rest = new REST().setToken(token);
  const { items: existing } = (await rest.get(
    Routes.applicationEmojis(clientId),
  )) as RESTGetAPIApplicationEmojisResult;
  const existingNames = new Set(existing.map((emoji) => emoji.name));

  let created = 0;

  for (const theme of COLOR_THEMES) {
    if (existingNames.has(theme.key)) continue;

    const png = renderSwatchPng(theme);
    await rest.post(Routes.applicationEmojis(clientId), {
      body: {
        name: theme.key,
        image: `data:image/png;base64,${png.toString("base64")}`,
      },
    });
    created++;
    console.log(`Created emoji :${theme.key}:`);
  }

  if (!existingNames.has(LOADING_EMOJI_NAME)) {
    const gif = readFileSync(LOADING_GIF_PATH);
    await rest.post(Routes.applicationEmojis(clientId), {
      body: {
        name: LOADING_EMOJI_NAME,
        image: `data:image/gif;base64,${gif.toString("base64")}`,
      },
    });
    created++;
    console.log(`Created emoji :${LOADING_EMOJI_NAME}:`);
  }

  console.log(
    created ? `Created ${created} emoji(s).` : "All emoji already exist.",
  );
}

void main();
