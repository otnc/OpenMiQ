import { describe, expect, it } from "vitest";
import { FONT_ALIASES, resolveFontAlias } from "../src/fonts.js";

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
