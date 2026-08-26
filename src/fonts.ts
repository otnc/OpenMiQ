import {
  FONT_ALIASES as LIBRARY_FONT_ALIASES,
  resolveFontAlias as libraryResolveFontAlias,
} from "makeitaquote";

/**
 * Short aliases for the fonts in makeitaquote's `FONT_CATALOGUE`.
 *
 * As of makeitaquote 10.2.0 this (and `resolveFontAlias` below) is the
 * library's own `FONT_ALIASES`/`resolveFontAlias` — filed as
 * https://github.com/otnc/makeitaquote/issues/45 and
 * https://github.com/otnc/makeitaquote/issues/46, since we no longer need to
 * maintain a local copy. `castoro` (Castoro Titling) is included now that
 * the library carries it (issue #43); `jiyu` (Jiyu no Tsubasa) is still
 * absent — issue #44 is still open upstream.
 */
export const FONT_ALIASES: Readonly<Record<string, string>> =
  LIBRARY_FONT_ALIASES;

/** Every alias, sorted, for error messages and help text. */
export const FONT_ALIAS_LIST = Object.keys(FONT_ALIASES).sort().join(", ");

/**
 * Resolves a font token to a catalogued family name: alias first (case
 * insensitive), then an exact family name for anyone who prefers to type it
 * in full. Returns `null` when nothing matches.
 */
export function resolveFontAlias(token: string): string | null {
  return libraryResolveFontAlias(token) ?? null;
}

const ALIAS_BY_FAMILY = new Map(
  Object.entries(FONT_ALIASES).map(([alias, family]) => [family, alias]),
);

/** The short alias for a catalogued family name — also its application emoji's name. */
export function aliasForFamily(family: string): string | undefined {
  return ALIAS_BY_FAMILY.get(family);
}
