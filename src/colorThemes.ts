import type { ThemeInput } from "makeitaquote";

/**
 * Named background gradients for `theme=<alias>`, rendered by
 * makeitaquote's own `backgroundGradient` theme field (10.3.0+, with the
 * avatar-fade blending into it properly since 10.3.1) — no local image
 * generation needed.
 *
 * `mars` and `under_the_sea` are intentionally near-flat — not a mistake.
 * Everything else (avatar, text, layout) still comes from the base
 * `dark`/`light`/`portrait` theme; only the background is overridden.
 */
export interface ColorTheme {
  key: string;
  label: string;
  gradient: readonly [from: string, to: string];
  /**
   * Which text/avatar-fallback/watermark palette this background needs for
   * contrast — `"light"` for the paler gradients (black text), `"dark"` for
   * the richer ones (white text). Fixed per theme rather than left to the
   * `light`/`dark` toggle, same as `flip` has no effect once the layout is
   * portrait: see buildTheme() in quoteOptions.ts and the light button's
   * disabled state in components.ts.
   */
  textBase: "dark" | "light";
}

/**
 * `key` currently doubles as `theme=`'s full alias — there's no shorter form
 * yet. If one is added later, mirror `fonts.ts`'s `aliasForFamily()` /
 * components.ts's `fontOption()`: show it as "label (alias)" in the
 * color-theme select menu, the same way the font one already does.
 */

export const COLOR_THEMES: readonly ColorTheme[] = [
  {
    key: "sunset",
    label: "Sunset",
    gradient: ["#483B72", "#C67B43"],
    textBase: "dark",
  },
  {
    key: "chroma_glow",
    label: "Chroma Glow",
    gradient: ["#3188A8", "#AA3139"],
    textBase: "dark",
  },
  {
    key: "forest",
    label: "Forest",
    gradient: ["#31974B", "#AE8B0C"],
    textBase: "dark",
  },
  {
    key: "crimson_moon",
    label: "Crimson Moon",
    gradient: ["#940000", "#200000"],
    textBase: "dark",
  },
  {
    key: "midnight_blurple",
    label: "Midnight Blurple",
    gradient: ["#4550BD", "#151738"],
    textBase: "dark",
  },
  {
    key: "mars",
    label: "Mars",
    gradient: ["#623800", "#623800"],
    textBase: "dark",
  },
  {
    key: "dusk",
    label: "Dusk",
    gradient: ["#59606E", "#102A5C"],
    textBase: "dark",
  },
  {
    key: "under_the_sea",
    label: "Under the Sea",
    gradient: ["#005243", "#005243"],
    textBase: "dark",
  },
  {
    key: "retro_storm",
    label: "Retro Storm",
    gradient: ["#15809A", "#4D169E"],
    textBase: "dark",
  },
  {
    key: "neon_nights",
    label: "Neon Nights",
    gradient: ["#299978", "#912D70"],
    textBase: "dark",
  },
  {
    key: "strawberry_lemonade",
    label: "Strawberry Lemonade",
    gradient: ["#CA29A5", "#CBA826"],
    textBase: "dark",
  },
  {
    key: "aurora",
    label: "Aurora",
    gradient: ["#002DA5", "#00943D"],
    textBase: "dark",
  },
  {
    key: "sepia",
    label: "Sepia",
    gradient: ["#C37811", "#8B5E0D"],
    textBase: "dark",
  },
  {
    key: "mint_apple",
    label: "Mint Apple",
    gradient: ["#C8FFBF", "#EFFFBD"],
    textBase: "light",
  },
  {
    key: "citrus_sherbert",
    label: "Citrus Sherbert",
    gradient: ["#FFEC8A", "#FFC4AA"],
    textBase: "light",
  },
  {
    key: "retro_raincloud",
    label: "Retro Raincloud",
    gradient: ["#C0F3E9", "#F4D1C6"],
    textBase: "light",
  },
  {
    key: "hanami",
    label: "Hanami",
    gradient: ["#F7D2D7", "#E6EFD9"],
    textBase: "light",
  },
  {
    key: "sunrise",
    label: "Sunrise",
    gradient: ["#D9ACA3", "#C1DDAC"],
    textBase: "light",
  },
  {
    key: "cotton_candy",
    label: "Cotton Candy",
    gradient: ["#EEDBE2", "#B9D6F7"],
    textBase: "light",
  },
  {
    key: "lofi_vibes",
    label: "LoFi Vibes",
    gradient: ["#C4F4DE", "#9EC5F9"],
    textBase: "light",
  },
  {
    key: "desert_khaki",
    label: "Desert Khaki",
    gradient: ["#FCFBD1", "#F1F1EF"],
    textBase: "light",
  },
];

const BY_KEY = new Map(COLOR_THEMES.map((theme) => [theme.key, theme]));

/** Every theme key, sorted, for error messages and help text. */
export const COLOR_THEME_LIST = [...BY_KEY.keys()].sort().join(", ");

/** Resolves a `theme=` token to a known theme key, or `null`. */
export function resolveColorTheme(token: string): string | null {
  const key = token.trim().toLowerCase();
  return BY_KEY.has(key) ? key : null;
}

/** The fixed text palette a resolved theme key needs, or `undefined` for an unknown key. */
export function colorThemeTextBase(key: string): "dark" | "light" | undefined {
  return BY_KEY.get(key)?.textBase;
}

type BackgroundGradient = NonNullable<ThemeInput["backgroundGradient"]>;

/** The `backgroundGradient` theme value for a resolved theme key. */
export function colorThemeGradient(
  key: string,
): BackgroundGradient | undefined {
  const theme = BY_KEY.get(key);
  if (!theme) return undefined;

  return {
    type: "linear",
    direction: "diagonal",
    stops: [
      [theme.gradient[0], 0],
      [theme.gradient[1], 1],
    ],
  };
}
