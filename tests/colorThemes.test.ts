import { describe, expect, it } from "vitest";
import {
  aliasForColorTheme,
  COLOR_THEMES,
  colorThemeGradient,
  colorThemeTextBase,
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

  it("resolves every theme's official short alias, case insensitively", () => {
    for (const theme of COLOR_THEMES) {
      if (!theme.alias) continue;
      expect(resolveColorTheme(theme.alias)).toBe(theme.key);
      expect(resolveColorTheme(theme.alias.toUpperCase())).toBe(theme.key);
    }
  });

  it("resolves every theme key with its underscores dropped", () => {
    for (const theme of COLOR_THEMES) {
      expect(resolveColorTheme(theme.key.replace(/_/g, ""))).toBe(theme.key);
    }
  });
});

describe("aliasForColorTheme", () => {
  it("returns the official short alias for a themed key that has one", () => {
    expect(aliasForColorTheme("mint_apple")).toBe("ma");
  });

  it("returns undefined for a theme with no short alias", () => {
    expect(aliasForColorTheme("hanami")).toBeUndefined();
  });

  it("returns undefined for an unknown key", () => {
    expect(aliasForColorTheme("not-a-theme")).toBeUndefined();
  });
});

describe("colorThemeGradient", () => {
  it("returns a linear gradient descriptor for a known key", () => {
    const gradient = colorThemeGradient("sunset");
    expect(gradient).toEqual({
      type: "linear",
      direction: "diagonal",
      stops: [
        ["#483B72", 0],
        ["#C67B43", 1],
      ],
    });
  });

  it("returns undefined for an unknown key", () => {
    expect(colorThemeGradient("not-a-theme")).toBeUndefined();
  });
});

describe("colorThemeTextBase", () => {
  it("returns dark or light for every documented theme", () => {
    for (const theme of COLOR_THEMES) {
      expect(colorThemeTextBase(theme.key)).toBe(theme.textBase);
    }
  });

  it("returns undefined for an unknown key", () => {
    expect(colorThemeTextBase("not-a-theme")).toBeUndefined();
  });
});
