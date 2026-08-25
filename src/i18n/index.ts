import { readdirSync } from "node:fs";
import path from "node:path";
import i18next, { type TOptions } from "i18next";
import FsBackend from "i18next-fs-backend";

export const FALLBACK_LOCALE = "en";

/**
 * Locale files live outside `dist`, at `<project root>/locales/<code>.json`,
 * so a self-hoster can add a new language by dropping in a file — no
 * rebuild needed. Resolved from the working directory rather than this
 * module's own path, since bundling collapses `src/i18n/` into a single
 * `dist/index.js` at a different depth than the source tree.
 */
const LOCALES_DIR = path.resolve(process.cwd(), "locales");

function discoverLocales(): string[] {
  return readdirSync(LOCALES_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => file.slice(0, -".json".length));
}

let availableLocales: string[] = [];

export async function initI18n(): Promise<void> {
  availableLocales = discoverLocales();
  if (!availableLocales.includes(FALLBACK_LOCALE)) {
    throw new Error(
      `locales/${FALLBACK_LOCALE}.json is required as the fallback locale.`,
    );
  }

  await i18next.use(FsBackend).init({
    initAsync: false,
    fallbackLng: FALLBACK_LOCALE,
    preload: availableLocales,
    supportedLngs: availableLocales,
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: path.join(LOCALES_DIR, "{{lng}}.json"),
    },
    interpolation: { escapeValue: false },
  });
}

/** The locale codes discovered under `locales/` at startup. */
export function getAvailableLocales(): readonly string[] {
  return availableLocales;
}

export function isSupportedLocale(locale: string): boolean {
  return availableLocales.includes(locale);
}

/**
 * Maps an arbitrary locale string (e.g. Discord's `interaction.locale`,
 * which uses tags like `en-US`) to one of our supported locale codes,
 * falling back to {@link FALLBACK_LOCALE}.
 */
export function normalizeLocale(locale: string | null | undefined): string {
  if (!locale) return FALLBACK_LOCALE;
  if (isSupportedLocale(locale)) return locale;
  const primary = locale.split("-")[0]?.toLowerCase();
  if (primary && isSupportedLocale(primary)) return primary;
  return FALLBACK_LOCALE;
}

/**
 * Translates `key` in `locale`, falling back to {@link FALLBACK_LOCALE}.
 * `lng` is passed per-call (not via `changeLanguage`) so concurrent
 * requests for different users/guilds never race on global state.
 */
export function t(key: string, locale: string, options?: TOptions): string {
  return i18next.t(key, { ...options, lng: locale }) as string;
}
