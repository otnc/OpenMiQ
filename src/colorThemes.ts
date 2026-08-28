import {
  ALL_COLOR_THEME_CATALOGUE,
  COLOR_THEME_CATALOGUE,
  CUSTOM_COLOR_THEME_CATALOGUE,
  colorThemeGradient as libraryColorThemeGradient,
  colorThemeTextBase as libraryColorThemeTextBase,
  resolveColorTheme as libraryResolveColorTheme,
  type CataloguedColorTheme,
} from "makeitaquote";

/**
 * The 21 named background themes mirroring the official Make it a Quote
 * bot's own list, plus makeitaquote's own 18 original ones — as of
 * makeitaquote 11.0.0/11.2.0 this (and the functions below) is the
 * library's own `COLOR_THEME_CATALOGUE`/`CUSTOM_COLOR_THEME_CATALOGUE`/
 * `resolveColorTheme`/etc. — filed as
 * https://github.com/otnc/makeitaquote/issues/58, since we no longer need
 * to maintain a local copy.
 *
 * The two catalogues get their own select menu in components.ts rather
 * than one combined list — 21 + 18 doesn't fit a single Discord select
 * menu's 25-option limit.
 */
export type ColorTheme = CataloguedColorTheme;
export const COLOR_THEMES: readonly ColorTheme[] = COLOR_THEME_CATALOGUE;
export const CUSTOM_COLOR_THEMES: readonly ColorTheme[] =
  CUSTOM_COLOR_THEME_CATALOGUE;

const BY_KEY = new Map(
  ALL_COLOR_THEME_CATALOGUE.map((theme) => [theme.key, theme]),
);
const CUSTOM_KEYS = new Set(CUSTOM_COLOR_THEMES.map((theme) => theme.key));

/** Every official theme key, sorted, for the `/help` color-themes field. */
export const COLOR_THEME_LIST = COLOR_THEMES.map((theme) => theme.key)
  .sort()
  .join(", ");
/** Every custom theme key, sorted, for the `/help` custom-color-themes field. */
export const CUSTOM_COLOR_THEME_LIST = CUSTOM_COLOR_THEMES.map(
  (theme) => theme.key,
)
  .sort()
  .join(", ");
/** Every theme key across both catalogues, sorted, for error messages. */
export const ALL_COLOR_THEME_LIST = [...BY_KEY.keys()].sort().join(", ");

/**
 * Resolves a `theme=` token to a known theme key, or `null`. Accepts the
 * full key (`mint_apple`), the same key with its underscores dropped
 * (`mintapple`), or the official bot's short alias (`ma`) where it has one
 * — checks both catalogues transparently.
 */
export function resolveColorTheme(token: string): string | null {
  return libraryResolveColorTheme(token) ?? null;
}

/** Whether a resolved theme key belongs to the custom (non-official) catalogue. */
export function isCustomColorTheme(key: string): boolean {
  return CUSTOM_KEYS.has(key);
}

/** The official short alias for a theme key, if it has one. */
export function aliasForColorTheme(key: string): string | undefined {
  return BY_KEY.get(key)?.alias ?? undefined;
}

/** The fixed text palette a resolved theme key needs, or `undefined` for an unknown key. */
export function colorThemeTextBase(key: string): "dark" | "light" | undefined {
  return libraryColorThemeTextBase(key);
}

/** The `backgroundGradient` theme value for a resolved theme key. */
export function colorThemeGradient(
  key: string,
): ReturnType<typeof libraryColorThemeGradient> {
  return libraryColorThemeGradient(key);
}
