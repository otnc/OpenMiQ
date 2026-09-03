import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  REST,
  Routes,
  type RESTGetAPIApplicationEmojisResult,
} from "discord.js";
import { LOADING_EMOJI_NAME } from "./appEmojis.js";
import { COLOR_THEMES, CUSTOM_COLOR_THEMES } from "./colorThemes.js";
import { renderSwatchPng } from "./emojiSwatch.js";
import { FONT_ALIASES } from "./fonts.js";
import { renderFontSwatchPng } from "./fontSwatch.js";
import { loadDeployEnv } from "./loadDeployEnv.js";

/**
 * Resolved from the working directory rather than this module's own path,
 * same reasoning as the old `locales/` lookup had: bundling collapses
 * `src/` into `dist/` at a different depth than the source tree.
 */
const LOADING_GIF_PATH = path.resolve(process.cwd(), "assets", "loading.gif");

/**
 * Reads `ICON_PATH` the same way `config/env.ts`'s constant of the same
 * name would — but resolved here, after `loadDeployEnv()` has populated
 * `process.env`, since a deploy script runs before that module's top-level
 * `process.env` reads would otherwise see anything. `null` when unset —
 * icon syncing is opt-in, not a default.
 */
function resolveIconPath(): string | null {
  return process.env.ICON_PATH?.trim()
    ? path.resolve(process.env.ICON_PATH.trim())
    : null;
}

const ICON_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

/**
 * (Re)creates every application emoji this bot uses: one per color theme
 * (named after its key, e.g. `:sunset:`), one per font alias (an "Aa"
 * sample, e.g. `:pop:`), and the `:loading:` spinner. Existing ones are
 * deleted first — simpler than diffing, and guarantees the emoji always
 * match the current swatch-rendering code after a change. Also pushes
 * `ICON_PATH` up as the Discord application's icon, if that file exists.
 * Run with `pnpm run deploy:images` (or `pnpm run deploy` for this and
 * `deploy:commands`).
 */
export async function deployImages(): Promise<void> {
  loadDeployEnv();
  const token = process.env.DISCORD_TOKEN;
  const clientId: string = process.env.DISCORD_CLIENT_ID ?? "";
  if (!token) throw new Error("DISCORD_TOKEN is not set.");
  if (!clientId) throw new Error("DISCORD_CLIENT_ID is not set.");

  const rest = new REST().setToken(token);

  const iconPath = resolveIconPath();
  if (!iconPath) {
    console.log("ICON_PATH is not set — skipping application icon sync.");
  } else {
    const iconMime =
      ICON_MIME[path.extname(iconPath).toLowerCase()] ?? "image/png";
    let icon: Buffer | undefined;
    try {
      icon = readFileSync(iconPath);
    } catch {
      console.log(`Skipping application icon: no file at ${iconPath}`);
    }
    if (icon) {
      await rest.patch(Routes.currentApplication(), {
        body: { icon: `data:${iconMime};base64,${icon.toString("base64")}` },
      });
      console.log(`Synced application icon from ${iconPath}`);
    }
  }
  const managedNames = new Set<string>([
    ...COLOR_THEMES.map((theme) => theme.key),
    ...CUSTOM_COLOR_THEMES.map((theme) => theme.key),
    ...Object.keys(FONT_ALIASES),
    LOADING_EMOJI_NAME,
  ]);

  const { items: existing } = (await rest.get(
    Routes.applicationEmojis(clientId),
  )) as RESTGetAPIApplicationEmojisResult;

  for (const emoji of existing) {
    if (!emoji.id || !emoji.name || !managedNames.has(emoji.name)) continue;
    await rest.delete(Routes.applicationEmoji(clientId, emoji.id));
    console.log(`Deleted existing emoji :${emoji.name}:`);
  }

  async function create(
    name: string,
    image: Buffer,
    mime: "image/png" | "image/gif",
  ): Promise<void> {
    await rest.post(Routes.applicationEmojis(clientId), {
      body: {
        name,
        image: `data:${mime};base64,${image.toString("base64")}`,
      },
    });
    console.log(`Created emoji :${name}:`);
  }

  for (const theme of COLOR_THEMES) {
    await create(theme.key, renderSwatchPng(theme), "image/png");
  }
  for (const theme of CUSTOM_COLOR_THEMES) {
    await create(theme.key, renderSwatchPng(theme), "image/png");
  }
  for (const [alias, family] of Object.entries(FONT_ALIASES)) {
    await create(alias, await renderFontSwatchPng(family), "image/png");
  }
  await create(LOADING_EMOJI_NAME, readFileSync(LOADING_GIF_PATH), "image/gif");

  console.log(`Synced ${managedNames.size} emoji.`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void deployImages();
}
