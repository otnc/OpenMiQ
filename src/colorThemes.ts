import {
  COLOR_THEME_CATALOGUE,
  colorThemeGradient as libraryColorThemeGradient,
  colorThemeTextBase as libraryColorThemeTextBase,
  resolveColorTheme as libraryResolveColorTheme,
  type CataloguedColorTheme,
} from "makeitaquote";

/**
 * The 21 named background themes mirroring the official Make it a Quote
 * bot's own list — as of makeitaquote 11.0.0 this (and the functions below)
 * is the library's own `COLOR_THEME_CATALOGUE`/`resolveColorTheme`/etc. —
 * filed as https://github.com/otnc/makeitaquote/issues/58, since we no
 * longer need to maintain a local copy.
 */
export type ColorTheme = CataloguedColorTheme;
export const COLOR_THEMES: readonly ColorTheme[] = COLOR_THEME_CATALOGUE;

const BY_KEY = new Map(COLOR_THEMES.map((theme) => [theme.key, theme]));

/** Every theme key, sorted, for error messages and help text. */
export const COLOR_THEME_LIST = [...BY_KEY.keys()].sort().join(", ");

/**
 * Resolves a `theme=` token to a known theme key, or `null`. Accepts the
 * full key (`mint_apple`), the same key with its underscores dropped
 * (`mintapple`), or the official bot's short alias (`ma`) where it has one.
 */
export function resolveColorTheme(token: string): string | null {
  return libraryResolveColorTheme(token) ?? null;
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
