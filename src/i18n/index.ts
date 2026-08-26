/**
 * Locales this bot ships translations for. Adding a new one means adding its
 * code here and filling in the matching entry in every `Translations` object
 * across the codebase — each user-facing string lives next to the code that
 * uses it, rather than in a separate per-locale file.
 */
export const SUPPORTED_LOCALES = ["en", "ja"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const FALLBACK_LOCALE: Locale = "en";

/** One string, translated into every {@link SUPPORTED_LOCALES} entry. */
export type Translations = Record<Locale, string>;

/** The bot's supported locale codes. */
export function getAvailableLocales(): readonly Locale[] {
  return SUPPORTED_LOCALES;
}

export function isSupportedLocale(locale: string): locale is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(locale);
}

/**
 * Maps an arbitrary locale string (e.g. Discord's `interaction.locale`,
 * which uses tags like `en-US`, or an unvalidated env var) to one of our
 * supported locale codes, falling back to {@link FALLBACK_LOCALE}.
 */
export function normalizeLocale(locale: string | null | undefined): Locale {
  if (!locale) return FALLBACK_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  const primary = locale.split("-")[0]?.toLowerCase();
  if (primary && isSupportedLocale(primary)) return primary;
  return FALLBACK_LOCALE;
}

/**
 * Picks `locale` out of `entry`, falling back to {@link FALLBACK_LOCALE} for
 * an unrecognized one, and interpolating `{{var}}` placeholders from `vars`.
 */
export function t(
  entry: Translations,
  locale: string,
  vars?: Record<string, string>,
): string {
  const template = entry[locale as Locale] ?? entry[FALLBACK_LOCALE];
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in vars ? vars[key]! : match,
  );
}
