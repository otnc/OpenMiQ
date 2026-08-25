import { describe, expect, it } from "vitest";
import {
  COLOR_THEMES,
  colorThemeBackground,
  resolveColorTheme,
} from "../src/colorThemes.js";

describe("resolveColorTheme", () => {
  it("resolves every documented theme key to itself", () => {
    for (const theme of COLOR_THEMES) {
      expect(resolveColorTheme(theme.key)).toBe(theme.key);
    }
  });

  it("is case insensitive", () => {
    expect(resolveColorTheme("SUNSET")).toBe("sunset");
  });

  it("returns null for an unknown key", () => {
    expect(resolveColorTheme("not-a-theme")).toBeNull();
    expect(resolveColorTheme("")).toBeNull();
  });
});

describe("colorThemeBackground", () => {
  it("returns the background color for a known key", () => {
    expect(colorThemeBackground("sunset")).toBe("#FF6B4A");
  });

  it("returns undefined for an unknown key", () => {
    expect(colorThemeBackground("not-a-theme")).toBeUndefined();
  });
});
