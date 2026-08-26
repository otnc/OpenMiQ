import Mustache from "mustache";

// Discord messages are plain text, not HTML — Mustache's default `{{var}}`
// HTML-escapes interpolated values, which would corrupt values like font
// names or theme lists if they ever contained `&`, `<`, `>`, or quotes.
Mustache.escape = (text) => text;

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
 * supported locale codes, falling back to {@link FALLBACK_LOCALE}. Uses the
 * platform's own `Intl.Locale` to pull out the language subtag, rather than
 * hand-parsing the BCP 47 tag.
 */
export function normalizeLocale(locale: string | null | undefined): Locale {
  if (!locale) return FALLBACK_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  try {
    const language = new Intl.Locale(locale).language.toLowerCase();
    if (isSupportedLocale(language)) return language;
  } catch {
    // Malformed tag — fall through to the fallback below.
  }
  return FALLBACK_LOCALE;
}

/**
 * Picks `locale` out of `entry`, falling back to {@link FALLBACK_LOCALE} for
 * an unrecognized one, and interpolating `{{var}}` placeholders from `vars`
 * via Mustache.
 */
export function t(
  entry: Translations,
  locale: string,
  vars?: Record<string, string>,
): string {
  const template = entry[locale as Locale] ?? entry[FALLBACK_LOCALE];
  return vars ? Mustache.render(template, vars) : template;
}
