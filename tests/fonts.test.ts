import { describe, expect, it } from "vitest";
import {
  aliasForFamily,
  FONT_ALIASES,
  resolveFontAlias,
  SELECTABLE_FONTS,
} from "../src/fonts.js";

describe("resolveFontAlias", () => {
  it("resolves every documented alias to a catalogued family", () => {
    for (const [alias, family] of Object.entries(FONT_ALIASES)) {
      expect(resolveFontAlias(alias)).toBe(family);
    }
  });

  it("is case insensitive", () => {
    expect(resolveFontAlias("POP")).toBe("Hachi Maru Pop");
  });

  it("also accepts an exact catalogued family name", () => {
    expect(resolveFontAlias("DotGothic16")).toBe("DotGothic16");
    expect(resolveFontAlias("dotgothic16")).toBe("DotGothic16");
  });

  it("accepts either the alias or the exact family name for the same font", () => {
    expect(resolveFontAlias("pop")).toBe("Hachi Maru Pop");
    expect(resolveFontAlias("Hachi Maru Pop")).toBe("Hachi Maru Pop");
    expect(resolveFontAlias("hachi maru pop")).toBe("Hachi Maru Pop");
  });

  it("resolves castoro now that makeitaquote carries Castoro Titling", () => {
    expect(resolveFontAlias("castoro")).toBe("Castoro Titling");
  });

  it("returns null for tokens with no known alias or family, including jiyu (still unavailable upstream)", () => {
    expect(resolveFontAlias("jiyu")).toBeNull();
    expect(resolveFontAlias("not-a-font")).toBeNull();
    expect(resolveFontAlias("")).toBeNull();
  });
});

describe("aliasForFamily", () => {
  it("reverses every documented alias back to its own family", () => {
    for (const [alias, family] of Object.entries(FONT_ALIASES)) {
      expect(aliasForFamily(family)).toBe(alias);
    }
  });

  it("returns undefined for a family with no alias", () => {
    expect(aliasForFamily("Not A Real Family")).toBeUndefined();
  });
});

describe("SELECTABLE_FONTS", () => {
  it("has exactly one entry per alias", () => {
    expect(SELECTABLE_FONTS).toHaveLength(Object.keys(FONT_ALIASES).length);
  });

  it("excludes makeitaquote's script-fallback-only fonts", () => {
    expect(SELECTABLE_FONTS).not.toContain("Nanum Gothic");
    expect(SELECTABLE_FONTS).not.toContain("Noto Sans SC");
    expect(SELECTABLE_FONTS).not.toContain("IBM Plex Sans Arabic");
  });
});
