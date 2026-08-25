import { describe, expect, it } from "vitest";
import {
  COLOR_THEMES,
  colorThemeBackgroundImage,
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

describe("colorThemeBackgroundImage", () => {
  it("returns a PNG buffer for a known key", () => {
    const image = colorThemeBackgroundImage("sunset");
    expect(image).toBeInstanceOf(Buffer);
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    expect(image?.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  });

  it("caches the rendered image across calls", () => {
    expect(colorThemeBackgroundImage("forest")).toBe(
      colorThemeBackgroundImage("forest"),
    );
  });

  it("returns undefined for an unknown key", () => {
    expect(colorThemeBackgroundImage("not-a-theme")).toBeUndefined();
  });
});
