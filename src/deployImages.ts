import {
  REST,
  Routes,
  type RESTGetAPIApplicationEmojisResult,
} from "discord.js";
import { COLOR_THEMES } from "./colorThemes.js";
import { renderSwatchPng } from "./emojiSwatch.js";

/**
 * Creates one application emoji per color theme (named after its key, e.g.
 * `:sunset:`) previewing its gradient, so the color-theme select menu can
 * show it instead of just a name. Skips themes that already have one — safe
 * to re-run after adding a new theme. Run with `pnpm run deploy:images` (or
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

  console.log(
    created
      ? `Created ${created} color-theme emoji(s).`
      : "All color-theme emojis already exist.",
  );
}

void main();
