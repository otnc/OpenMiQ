import type { ThemeInput, ThemePalette } from "makeitaquote";
import {
  colorThemeGradient,
  colorThemeTextBase,
  resolveColorTheme,
} from "./colorThemes.js";
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
  /** Avatar on the right instead of the left. Ignored when `layout` is `new`. */
  flip: boolean;
  /** Bold quote text instead of the font's regular weight. */
  bold: boolean;
  /**
   * `side` is the original left/right layout; `new` fills the canvas with
   * the avatar and puts the quote over the bottom — same names as
   * makeitaquote's own `LayoutMode`. Ignored (forced to `side`) while
   * `chain` is on — see `chain` below and `buildTheme()`.
   */
  layout: "side" | "new";
  /** Font family for the quote text, or `null` to let the base theme choose. */
  font: string | null;
  /** A named background color preset (see `colorThemes.ts`), or `null` for the base theme's own background. */
  colorTheme: string | null;
  /**
   * When the message being quoted is itself a reply, stack it with the
   * message it's replying to into one `MiQChain` image instead of a single
   * quote. Has no effect when there's no reply to chain onto. Takes
   * priority over `layout: "new"` rather than the other way round —
   * makeitaquote's full-bleed layout has no left/right avatar box for
   * `MiQChain` to pair, so `buildTheme()` forces the effective layout back
   * to `side` while this is on, leaving the stored `layout` value itself
   * untouched (same idea as `flip` being ignored-not-reset once `new` is
   * on).
   */
  chain: boolean;
  /**
   * Renders actual Discord markdown formatting (bold/italic/underline/
   * strikethrough) in the quote text instead of showing it as plain,
   * unformatted characters. Forces `bold` off for as long as it's on — a
   * font weight applied to every character would erase the distinction
   * real markdown bold vs. regular text is supposed to show — see
   * `buildTheme()` below and components.ts's bold button, same idea as
   * `chain` forcing the effective layout back to `side`.
   */
  markdown: boolean;
}

/** The bot's own default font — resolved from the `mplus` alias, not hardcoded. */
export const DEFAULT_FONT = resolveFontAlias("mplus") ?? "M PLUS Rounded 1c";

export const DEFAULT_SETTINGS: QuoteSettings = {
  color: false,
  light: false,
  flip: false,
  bold: false,
  layout: "side",
  font: DEFAULT_FONT,
  colorTheme: null,
  chain: false,
  markdown: false,
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
/** The official bot's own spellings for "no color theme". */
const DEFAULT_THEME_TOKENS = new Set(["default", "def", "b", "w"]);

/**
 * Parses the options written after the bot mention (or `/fakequote`'s
 * `options` string), separated by whitespace and/or commas. Each toggle has
 * an opposite and a one-letter shortcut: `color`/`c` vs `mono`/`m`,
 * `bold`/`b` vs `regular`/`r`, `light`/`l` vs `dark`/`d`, `flip`/`f` vs
 * `unflip`/`u`, `new`/`n` vs `side`/`s` — `new` also clears `flip`, which
 * has no effect once the layout is `new`. Plus `chain` vs `unchain` (no
 * one-letter shortcut — stacks the quoted message with the message it's
 * replying to, see `QuoteSettings.chain`), `theme=alias`
 * (`theme=default`/`def`/`b`/`w` clear a saved theme back to none — see
 * `resolveColorTheme()`) and `font=alias` (quoted or not, runs to the end
 * of the string — put it last); neither of the latter two has a one-letter
 * shortcut either.
 */
export function parseOptions(text: string): ParsedInvocation {
  const settings: Partial<QuoteSettings> = {};
  let unknownFont: string | null = null;
  let unknownTheme: string | null = null;

  const tokens = text
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] as string;
    const lower = token.toLowerCase();

    if (lower === "color" || lower === "c") {
      settings.color = true;
    } else if (lower === "mono" || lower === "m") {
      settings.color = false;
    } else if (lower === "bold" || lower === "b") {
      settings.bold = true;
    } else if (lower === "regular" || lower === "r") {
      settings.bold = false;
    } else if (lower === "light" || lower === "l") {
      settings.light = true;
    } else if (lower === "dark" || lower === "d") {
      settings.light = false;
    } else if (lower === "flip" || lower === "f") {
      settings.flip = true;
    } else if (lower === "unflip" || lower === "u") {
      settings.flip = false;
    } else if (lower === "new" || lower === "n") {
      settings.layout = "new";
      // flip has no effect once the layout is new (see buildTheme() below)
      // — clear it too, so a saved flip default doesn't silently reappear
      // the next time the layout switches back to side.
      settings.flip = false;
    } else if (lower === "side" || lower === "s") {
      settings.layout = "side";
    } else if (lower === "chain") {
      settings.chain = true;
    } else if (lower === "unchain") {
      settings.chain = false;
    } else {
      const themeMatch = THEME_PREFIX_RE.exec(token);
      if (themeMatch) {
        const raw = themeMatch[1] ?? "";
        // "b"/"w"/"def" are the official bot's own aliases for clearing
        // back to its un-colored theme — its black/white looks come from
        // the light/dark toggle, not from theme=, so all four are synonyms.
        if (DEFAULT_THEME_TOKENS.has(raw.trim().toLowerCase())) {
          settings.colorTheme = null;
        } else {
          const resolved = raw ? resolveColorTheme(raw) : null;
          if (resolved) {
            settings.colorTheme = resolved;
          } else if (raw) {
            unknownTheme = raw;
          }
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
 * once the layout is `new`, so `new` and `flip` can't meaningfully
 * combine. `chain` and `layout: "new"` can't combine either — `MiQChain`
 * has no full-bleed support — but here `chain` wins: the effective layout
 * falls back to `side` rather than chaining being dropped, so it stays
 * disabled for as long as `chain` is on rather than needing to be
 * reselected every time it turns off (see components.ts's layout button).
 * A color theme fixes its own `light`/`dark` text palette the same way
 * (see colorThemes.ts's `textBase`), overriding `settings.light` — the
 * light button reflects and disables this in components.ts.
 *
 * `fake` marks a `/fakequote` render: "(fake) @username" instead of the
 * usual "@username", so a fabricated quote can't be mistaken for a real
 * one at a glance.
 */
export function buildTheme(
  settings: QuoteSettings,
  options?: { fake?: boolean },
): ThemeInput {
  const isNew = settings.layout === "new" && !settings.chain;
  const light = settings.colorTheme
    ? colorThemeTextBase(settings.colorTheme) === "light"
    : settings.light;
  const palette: ThemePalette = light ? "light" : "dark";
  // markdown wins over bold — see QuoteSettings.markdown's own doc comment.
  const bold = settings.bold && !settings.markdown;

  const theme: ThemeInput = {
    extends: palette,
    // Coerced rather than passed through raw: a settings file saved before
    // the "portrait" keyword was dropped may still have that value on disk.
    layout: isNew ? "new" : "side",
    avatar: {
      grayscale: !settings.color,
      ...(isNew ? {} : { position: settings.flip ? "right" : "left" }),
    },
  };
  if (settings.font || bold) {
    theme.text = {
      ...(settings.font ? { font: settings.font } : {}),
      ...(bold ? { weight: "bold" } : {}),
    };
  }
  if (settings.colorTheme) {
    const gradient = colorThemeGradient(settings.colorTheme);
    if (gradient) {
      theme.backgroundGradient = gradient;
    }
  }
  if (options?.fake) {
    theme.username = { prefix: "(fake) @" };
  }
  return theme;
}
