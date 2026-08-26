import type { ThemeInput } from "makeitaquote";

/**
 * Named background gradients for `theme=<alias>`, rendered by
 * makeitaquote's own `backgroundGradient` theme field (10.3.0+, with the
 * avatar-fade blending into it properly since 10.3.1) — no local image
 * generation needed.
 *
 * These colors are rough placeholder estimates from the palette names —
 * swap them out here once exact values are available. Everything else
 * (avatar, text, layout) still comes from the base `dark`/`light`/`portrait`
 * theme; only the background is overridden.
 */
export interface ColorTheme {
  key: string;
  label: string;
  gradient: readonly [from: string, to: string];
}

export const COLOR_THEMES: readonly ColorTheme[] = [
  { key: "sunset", label: "Sunset", gradient: ["#FF7E5F", "#6A3093"] },
  {
    key: "chroma_glow",
    label: "Chroma Glow",
    gradient: ["#8A2BE2", "#00C9A7"],
  },
  { key: "forest", label: "Forest", gradient: ["#0B3D24", "#3CAA6E"] },
  {
    key: "crimson_moon",
    label: "Crimson Moon",
    gradient: ["#3B0000", "#8B0020"],
  },
  {
    key: "midnight_blurple",
    label: "Midnight Blurple",
    gradient: ["#1C1B33", "#5865F2"],
  },
  { key: "mars", label: "Mars", gradient: ["#7A1E12", "#D9622B"] },
  { key: "dusk", label: "Dusk", gradient: ["#2C2A4A", "#916BBF"] },
  {
    key: "under_the_sea",
    label: "Under the Sea",
    gradient: ["#012A36", "#1CA9C9"],
  },
  {
    key: "retro_storm",
    label: "Retro Storm",
    gradient: ["#3A3D5C", "#7D8CA3"],
  },
  {
    key: "neon_nights",
    label: "Neon Nights",
    gradient: ["#FF00C8", "#00E5FF"],
  },
  {
    key: "strawberry_lemonade",
    label: "Strawberry Lemonade",
    gradient: ["#FF5F7E", "#FFE66D"],
  },
  { key: "aurora", label: "Aurora", gradient: ["#00C9A7", "#845EC2"] },
  { key: "sepia", label: "Sepia", gradient: ["#D8C3A5", "#6B4226"] },
  { key: "mint_apple", label: "Mint Apple", gradient: ["#B6F2C5", "#4CAF7D"] },
  {
    key: "citrus_sherbert",
    label: "Citrus Sherbert",
    gradient: ["#FFB88C", "#FFEAA7"],
  },
  {
    key: "retro_raincloud",
    label: "Retro Raincloud",
    gradient: ["#A0AEC0", "#CBD5E0"],
  },
  { key: "hanami", label: "Hanami", gradient: ["#FADCE8", "#F7A8C4"] },
  { key: "sunrise", label: "Sunrise", gradient: ["#FFB347", "#FFD97D"] },
  {
    key: "cotton_candy",
    label: "Cotton Candy",
    gradient: ["#FBC2EB", "#A6C1EE"],
  },
  { key: "lofi_vibes", label: "LoFi Vibes", gradient: ["#2E2E52", "#7A6FA3"] },
  {
    key: "desert_khaki",
    label: "Desert Khaki",
    gradient: ["#C9A66B", "#8C6D3F"],
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
