import { describe, expect, it } from "vitest";
import {
  ALL_COLOR_THEME_LIST,
  aliasForColorTheme,
  COLOR_THEME_LIST,
  COLOR_THEMES,
  colorThemeGradient,
  colorThemeTextBase,
  CUSTOM_COLOR_THEME_LIST,
  CUSTOM_COLOR_THEMES,
  isCustomColorTheme,
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

  it("also resolves every custom theme's key, alias and underscore-free key", () => {
    for (const theme of CUSTOM_COLOR_THEMES) {
      expect(resolveColorTheme(theme.key)).toBe(theme.key);
      expect(resolveColorTheme(theme.key.replace(/_/g, ""))).toBe(theme.key);
      if (theme.alias) {
        expect(resolveColorTheme(theme.alias)).toBe(theme.key);
      }
    }
  });
});

describe("isCustomColorTheme", () => {
  it("is true for every key in the custom catalogue", () => {
    for (const theme of CUSTOM_COLOR_THEMES) {
      expect(isCustomColorTheme(theme.key)).toBe(true);
    }
  });

  it("is false for an official theme or an unknown key", () => {
    expect(isCustomColorTheme("sunset")).toBe(false);
    expect(isCustomColorTheme("not-a-theme")).toBe(false);
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

  it("also resolves a custom theme's alias", () => {
    expect(aliasForColorTheme("tokyo_night")).toBe("tokyo");
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

  it("returns dark or light for every custom theme too", () => {
    for (const theme of CUSTOM_COLOR_THEMES) {
      expect(colorThemeTextBase(theme.key)).toBe(theme.textBase);
    }
  });

  it("returns undefined for an unknown key", () => {
    expect(colorThemeTextBase("not-a-theme")).toBeUndefined();
  });
});

describe("theme lists", () => {
  it("has 21 official themes and 18 custom ones", () => {
    expect(COLOR_THEMES).toHaveLength(21);
    expect(CUSTOM_COLOR_THEMES).toHaveLength(18);
  });

  it("ALL_COLOR_THEME_LIST is the union of both lists", () => {
    for (const theme of [...COLOR_THEMES, ...CUSTOM_COLOR_THEMES]) {
      expect(ALL_COLOR_THEME_LIST).toContain(theme.key);
    }
  });

  it("COLOR_THEME_LIST and CUSTOM_COLOR_THEME_LIST don't cross-contaminate", () => {
    expect(COLOR_THEME_LIST).not.toContain("tokyo_night");
    expect(CUSTOM_COLOR_THEME_LIST).not.toContain("sunset");
  });
});
