import { beforeAll, describe, expect, it } from "vitest";
import {
  FALLBACK_LOCALE,
  getAvailableLocales,
  initI18n,
  isSupportedLocale,
  normalizeLocale,
  t,
} from "../src/i18n/index.js";

describe("i18n", () => {
  beforeAll(async () => {
    await initI18n();
  });

  it("discovers en and ja from locales/", () => {
    const locales = getAvailableLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("ja");
  });

  it("translates a known key per locale", () => {
    expect(t("components.flip", "en")).toBe("Flip");
    expect(t("components.flip", "ja")).toBe("反転");
  });

  it("falls back to the fallback locale for an unsupported one", () => {
    expect(t("components.flip", "fr")).toBe(
      t("components.flip", FALLBACK_LOCALE),
    );
  });

  it("interpolates variables", () => {
    expect(t("settings.setSuccess", "en", { scope: "your" })).toBe(
      "Saved your defaults.",
    );
  });

  it("normalizeLocale maps region-tagged codes to a supported base, else falls back", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("ja")).toBe("ja");
    expect(normalizeLocale("fr-FR")).toBe(FALLBACK_LOCALE);
    expect(normalizeLocale(undefined)).toBe(FALLBACK_LOCALE);
  });

  it("isSupportedLocale reflects the discovered set", () => {
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("xx")).toBe(false);
  });
});
