import type { ThemeInput } from "makeitaquote";

/**
 * Named background gradients for `theme=<alias>`, rendered by
 * makeitaquote's own `backgroundGradient` theme field (10.3.0+, with the
 * avatar-fade blending into it properly since 10.3.1) — no local image
 * generation needed.
 *
 * These colors are sampled from reference preview renders of each theme
 * (2026-08-26), not hand-picked guesses — `mars` and `under_the_sea` are
 * genuinely near-flat in the reference, not a sampling error. Everything
 * else (avatar, text, layout) still comes from the base
 * `dark`/`light`/`portrait` theme; only the background is overridden.
 */
export interface ColorTheme {
  key: string;
  label: string;
  gradient: readonly [from: string, to: string];
}

/**
 * `key` currently doubles as `theme=`'s full alias — there's no shorter form
 * yet. If one is added later, mirror `fonts.ts`'s `aliasForFamily()` /
 * components.ts's `fontOption()`: show it as "label (alias)" in the
 * color-theme select menu, the same way the font one already does.
 */

export const COLOR_THEMES: readonly ColorTheme[] = [
  { key: "sunset", label: "Sunset", gradient: ["#483B72", "#C67B43"] },
  {
    key: "chroma_glow",
    label: "Chroma Glow",
    gradient: ["#3188A8", "#AA3139"],
  },
  { key: "forest", label: "Forest", gradient: ["#31974B", "#AE8B0C"] },
  {
    key: "crimson_moon",
    label: "Crimson Moon",
    gradient: ["#940000", "#200000"],
  },
  {
    key: "midnight_blurple",
    label: "Midnight Blurple",
    gradient: ["#4550BD", "#151738"],
  },
  { key: "mars", label: "Mars", gradient: ["#623800", "#623800"] },
  { key: "dusk", label: "Dusk", gradient: ["#59606E", "#102A5C"] },
  {
    key: "under_the_sea",
    label: "Under the Sea",
    gradient: ["#005243", "#005243"],
  },
  {
    key: "retro_storm",
    label: "Retro Storm",
    gradient: ["#15809A", "#4D169E"],
  },
  {
    key: "neon_nights",
    label: "Neon Nights",
    gradient: ["#299978", "#912D70"],
  },
  {
    key: "strawberry_lemonade",
    label: "Strawberry Lemonade",
    gradient: ["#CA29A5", "#CBA826"],
  },
  { key: "aurora", label: "Aurora", gradient: ["#002DA5", "#00943D"] },
  { key: "sepia", label: "Sepia", gradient: ["#C37811", "#8B5E0D"] },
  { key: "mint_apple", label: "Mint Apple", gradient: ["#C8FFBF", "#EFFFBD"] },
  {
    key: "citrus_sherbert",
    label: "Citrus Sherbert",
    gradient: ["#FFEC8A", "#FFC4AA"],
  },
  {
    key: "retro_raincloud",
    label: "Retro Raincloud",
    gradient: ["#C0F3E9", "#F4D1C6"],
  },
  { key: "hanami", label: "Hanami", gradient: ["#F7D2D7", "#E6EFD9"] },
  { key: "sunrise", label: "Sunrise", gradient: ["#D9ACA3", "#C1DDAC"] },
  {
    key: "cotton_candy",
    label: "Cotton Candy",
    gradient: ["#EEDBE2", "#B9D6F7"],
  },
  { key: "lofi_vibes", label: "LoFi Vibes", gradient: ["#C4F4DE", "#9EC5F9"] },
  {
    key: "desert_khaki",
    label: "Desert Khaki",
    gradient: ["#FCFBD1", "#F1F1EF"],
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
