/**
 * Named background-color presets for `theme=<alias>`.
 *
 * These hex values are rough placeholder estimates from the palette names —
 * swap them out here once exact values are available. Everything else
 * (avatar, text, layout) still comes from the base `dark`/`light`/`portrait`
 * theme; only the background is overridden.
 */
export interface ColorTheme {
  key: string;
  label: string;
  background: string;
}

export const COLOR_THEMES: readonly ColorTheme[] = [
  { key: "sunset", label: "Sunset", background: "#FF6B4A" },
  { key: "chroma_glow", label: "Chroma Glow", background: "#8A2BE2" },
  { key: "forest", label: "Forest", background: "#1B4332" },
  { key: "crimson_moon", label: "Crimson Moon", background: "#6E0D25" },
  { key: "midnight_blurple", label: "Midnight Blurple", background: "#2C2F5A" },
  { key: "mars", label: "Mars", background: "#B33A2E" },
  { key: "dusk", label: "Dusk", background: "#363062" },
  { key: "under_the_sea", label: "Under the Sea", background: "#0B4F6C" },
  { key: "retro_storm", label: "Retro Storm", background: "#52616B" },
  { key: "neon_nights", label: "Neon Nights", background: "#C724B1" },
  {
    key: "strawberry_lemonade",
    label: "Strawberry Lemonade",
    background: "#F94F6A",
  },
  { key: "aurora", label: "Aurora", background: "#1D9A6C" },
  { key: "sepia", label: "Sepia", background: "#6F4518" },
  { key: "mint_apple", label: "Mint Apple", background: "#7FCB9E" },
  { key: "citrus_sherbert", label: "Citrus Sherbert", background: "#FFA552" },
  { key: "retro_raincloud", label: "Retro Raincloud", background: "#7A8DA6" },
  { key: "hanami", label: "Hanami", background: "#F2AFC4" },
  { key: "sunrise", label: "Sunrise", background: "#F4A63D" },
  { key: "cotton_candy", label: "Cotton Candy", background: "#F6A9D0" },
  { key: "lofi_vibes", label: "LoFi Vibes", background: "#5B4B8A" },
  { key: "desert_khaki", label: "Desert Khaki", background: "#C2A570" },
];

const BY_KEY = new Map(COLOR_THEMES.map((theme) => [theme.key, theme]));

/** Every theme key, sorted, for error messages and help text. */
export const COLOR_THEME_LIST = [...BY_KEY.keys()].sort().join(", ");

/** Resolves a `theme=` token to a known theme key, or `null`. */
export function resolveColorTheme(token: string): string | null {
  const key = token.trim().toLowerCase();
  return BY_KEY.has(key) ? key : null;
}

/** The background color a resolved theme key maps to. */
export function colorThemeBackground(key: string): string | undefined {
  return BY_KEY.get(key)?.background;
}
