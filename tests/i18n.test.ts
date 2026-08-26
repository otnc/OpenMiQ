import { describe, expect, it } from "vitest";
import {
  FALLBACK_LOCALE,
  getAvailableLocales,
  isSupportedLocale,
  normalizeLocale,
  t,
} from "../src/i18n/index.js";

const GREETING = { en: "Hello, {{name}}!", ja: "こんにちは、{{name}}さん!" };

describe("i18n", () => {
  it("supports en and ja", () => {
    const locales = getAvailableLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("ja");
  });

  it("translates a known entry per locale", () => {
    expect(t(GREETING, "en", { name: "A" })).toBe("Hello, A!");
    expect(t(GREETING, "ja", { name: "A" })).toBe("こんにちは、Aさん!");
  });

  it("falls back to the fallback locale for an unsupported one", () => {
    expect(t(GREETING, "fr", { name: "A" })).toBe(
      t(GREETING, FALLBACK_LOCALE, { name: "A" }),
    );
  });

  it("interpolates variables", () => {
    expect(t(GREETING, "en", { name: "world" })).toBe("Hello, world!");
  });

  it("renders a placeholder as empty when no matching var is given (Mustache's default)", () => {
    expect(t(GREETING, "en", {})).toBe("Hello, !");
  });

  it("doesn't HTML-escape interpolated values, since messages are plain text", () => {
    expect(t(GREETING, "en", { name: "Q&A <3" })).toBe("Hello, Q&A <3!");
  });

  it("normalizeLocale maps region-tagged codes to a supported base, else falls back", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("ja")).toBe("ja");
    expect(normalizeLocale("fr-FR")).toBe(FALLBACK_LOCALE);
    expect(normalizeLocale(undefined)).toBe(FALLBACK_LOCALE);
  });

  it("normalizeLocale falls back for a malformed tag instead of throwing", () => {
    expect(normalizeLocale("not a valid bcp47 tag!!")).toBe(FALLBACK_LOCALE);
  });

  it("isSupportedLocale reflects the supported set", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("xx")).toBe(false);
  });
});
