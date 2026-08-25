import type { ThemeInput, ThemeName } from "makeitaquote";
import { colorThemeBackground, resolveColorTheme } from "./colorThemes.js";
import { resolveFontAlias } from "./fonts.js";

/**
 * A quote's render settings — everything the buttons, the select menu, and
 * the options after the mention can change.
 */
export interface QuoteSettings {
  /** Keep the avatar in color instead of grayscale. */
  color: boolean;
  /** Light theme instead of dark. */
  light: boolean;
  /** Avatar on the right instead of the left. Ignored when `layout` is `portrait`. */
  flip: boolean;
  /**
   * `side` is the original left/right layout; `portrait` fills the canvas
   * with the avatar and puts the quote over the bottom (makeitaquote's
   * `portrait`/`portrait-light` theme).
   */
  layout: "side" | "portrait";
  /** Font family for the quote text, or `null` for the default. */
  font: string | null;
  /** A named background color preset (see `colorThemes.ts`), or `null` for the base theme's own background. */
  colorTheme: string | null;
}

export const DEFAULT_SETTINGS: QuoteSettings = {
  color: false,
  light: false,
  flip: false,
  layout: "side",
  font: null,
  colorTheme: null,
};

/** What a mention (or `/fakequote`'s `options` string) asked for. */
export interface ParsedInvocation {
  /** Only the fields the message actually named — callers merge this over saved defaults. */
  settings: Partial<QuoteSettings>;
  /** The raw `font=` token, when it didn't resolve to a known alias or family name. */
  unknownFont: string | null;
  /** The raw `theme=` token, when it didn't resolve to a known color theme. */
  unknownTheme: string | null;
}

const FONT_PREFIX_RE = /^font[=:](.*)$/i;
const THEME_PREFIX_RE = /^theme[=:](.*)$/i;

/**
 * Parses the options written after the bot mention (or passed to
 * `/fakequote`'s `options` string). Each of these has an opposite, so a
 * saved default can be overridden back for one message even when it's
 * `true`/portrait/etc.: `color`/`mono`, `light`/`dark`, `flip` (or
 * `right`)/`unflip` (or `left`), `new` (or `portrait`)/`classic` (or
 * `side`). Plus `theme=alias` (a named background color preset) and
 * `font=alias` (the alias may be quoted, and runs to the end of the string
 * — put it last).
 */
export function parseOptions(text: string): ParsedInvocation {
  const settings: Partial<QuoteSettings> = {};
  let unknownFont: string | null = null;
  let unknownTheme: string | null = null;

  const tokens = text.trim().split(/\s+/).filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] as string;
    const lower = token.toLowerCase();

    if (lower === "color") {
      settings.color = true;
    } else if (lower === "mono") {
      settings.color = false;
    } else if (lower === "light") {
      settings.light = true;
    } else if (lower === "dark") {
      settings.light = false;
    } else if (lower === "flip" || lower === "right") {
      settings.flip = true;
    } else if (lower === "unflip" || lower === "left") {
      settings.flip = false;
    } else if (lower === "new" || lower === "portrait") {
      settings.layout = "portrait";
    } else if (lower === "classic" || lower === "side") {
      settings.layout = "side";
    } else {
      const themeMatch = THEME_PREFIX_RE.exec(token);
      if (themeMatch) {
        const raw = themeMatch[1] ?? "";
        const resolved = raw ? resolveColorTheme(raw) : null;
        if (resolved) {
          settings.colorTheme = resolved;
        } else if (raw) {
          unknownTheme = raw;
        }
        continue;
      }

      const fontMatch = FONT_PREFIX_RE.exec(token);
      if (fontMatch) {
        const rest = [fontMatch[1] ?? "", ...tokens.slice(i + 1)]
          .join(" ")
          .trim();
        const raw = unquote(rest);
        const resolved = raw ? resolveFontAlias(raw) : null;
        if (resolved) {
          settings.font = resolved;
        } else if (raw) {
          unknownFont = raw;
        }
        break; // the font token takes everything that follows
      }
    }
  }

  return { settings, unknownFont, unknownTheme };
}

function unquote(value: string): string {
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Builds the makeitaquote theme for the current settings.
 *
 * `color` and `light` combine freely with either layout. `flip` only
 * applies to the `side` layout — makeitaquote ignores `avatar.position`
 * once the layout is `stacked` (portrait), so `new` and `flip` can't
 * meaningfully combine.
 */
export function buildTheme(settings: QuoteSettings): ThemeInput {
  const portrait = settings.layout === "portrait";
  const extendsPreset: ThemeName = portrait
    ? settings.light
      ? "portrait-light"
      : "portrait"
    : settings.light
      ? "light"
      : "dark";

  const theme: ThemeInput = {
    extends: extendsPreset,
    avatar: {
      grayscale: !settings.color,
      ...(portrait ? {} : { position: settings.flip ? "right" : "left" }),
    },
  };
  if (settings.font) {
    theme.text = { font: settings.font };
  }
  if (settings.colorTheme) {
    const background = colorThemeBackground(settings.colorTheme);
    if (background) {
      theme.background = background;
    }
  }
  return theme;
}
