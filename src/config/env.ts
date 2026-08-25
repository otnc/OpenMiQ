import path from "node:path";

/** Discord user IDs allowed to run `/admin` commands. */
export const ADMIN_IDS: ReadonlySet<string> = new Set(
  (process.env.ADMIN_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean),
);

export function isAdmin(userId: string): boolean {
  return ADMIN_IDS.has(userId);
}

/** Where per-user/guild/bot settings are persisted as JSON. */
export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "data");

/** Locale used when nothing else (user, guild, bot default) sets one. */
export const DEFAULT_LOCALE = process.env.DEFAULT_LOCALE?.trim() || "en";

/** Directory to also save a copy of every generated image to. Disabled (`null`) by default. */
export const SAVE_IMAGES_DIR = process.env.SAVE_IMAGES_DIR?.trim()
  ? path.resolve(process.env.SAVE_IMAGES_DIR.trim())
  : null;
