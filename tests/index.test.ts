import { defineTheme } from "makeitaquote";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  buildTheme,
  parseOptions,
} from "../src/quoteOptions.js";

describe("parseOptions", () => {
  it("returns an empty patch for empty input", () => {
    expect(parseOptions("")).toEqual({
      settings: {},
      unknownFont: null,
      unknownTheme: null,
    });
  });

  it("parses color, bold, light and new (portrait), which clears flip", () => {
    const { settings } = parseOptions("color bold light flip new");
    expect(settings).toEqual({
      color: true,
      bold: true,
      light: true,
      flip: false,
      layout: "portrait",
    });
  });

  it("a flip after new overrides new's automatic reset back to true", () => {
    expect(parseOptions("new flip").settings.flip).toBe(true);
  });

  it("parses font=<alias>", () => {
    const { settings } = parseOptions("font=pop");
    expect(settings.font).toBe("Hachi Maru Pop");
  });

  it("parses a quoted exact family name", () => {
    const { settings } = parseOptions(`font="M PLUS Rounded 1c"`);
    expect(settings.font).toBe("M PLUS Rounded 1c");
  });

  it("parses a quoted exact family name with an alias-looking word in it", () => {
    const { settings } = parseOptions(`font="Hachi Maru Pop"`);
    expect(settings.font).toBe("Hachi Maru Pop");
  });

  it("parses font: as an alias prefix", () => {
    const { settings } = parseOptions("font:dot");
    expect(settings.font).toBe("DotGothic16");
  });

  it("combines options with a font", () => {
    const { settings } = parseOptions("color flip font=serif");
    expect(settings.color).toBe(true);
    expect(settings.flip).toBe(true);
    expect(settings.font).toBe("Zen Old Mincho");
  });

  it("reports an unresolved font token instead of setting one", () => {
    const { settings, unknownFont } = parseOptions("font=notareal font");
    expect(settings.font).toBeUndefined();
    expect(unknownFont).toBe("notareal font");
  });

  it("parses the opposite of each toggle explicitly false", () => {
    const { settings } = parseOptions("mono regular dark unflip side");
    expect(settings).toEqual({
      color: false,
      bold: false,
      light: false,
      flip: false,
      layout: "side",
    });
  });

  it("classic is a synonym for side", () => {
    expect(parseOptions("classic").settings.layout).toBe("side");
  });

  it("portrait is a synonym for new", () => {
    expect(parseOptions("portrait").settings.layout).toBe("portrait");
  });

  it("right and left are no longer recognized (flip/unflip are the only keywords)", () => {
    expect(parseOptions("right").settings).toEqual({});
    expect(parseOptions("left").settings).toEqual({});
  });

  it("accepts a one-letter shortcut for every toggle", () => {
    const { settings } = parseOptions("c b l n f");
    expect(settings).toEqual({
      color: true,
      bold: true,
      light: true,
      flip: true,
      layout: "portrait",
    });
  });

  it("accepts a one-letter shortcut for every opposite", () => {
    const { settings } = parseOptions("m r d u s");
    expect(settings).toEqual({
      color: false,
      bold: false,
      light: false,
      flip: false,
      layout: "side",
    });
  });

  it("one-letter shortcuts are case insensitive", () => {
    expect(parseOptions("C").settings.color).toBe(true);
  });

  it("theme= and font= have no one-letter shortcut", () => {
    expect(parseOptions("t").settings).toEqual({});
  });

  it("a later token overrides an earlier opposite one", () => {
    expect(parseOptions("color mono").settings.color).toBe(false);
    expect(parseOptions("mono color").settings.color).toBe(true);
    expect(parseOptions("new side").settings.layout).toBe("side");
    expect(parseOptions("side new").settings.layout).toBe("portrait");
  });

  it("parses theme=<alias>", () => {
    const { settings } = parseOptions("theme=sunset");
    expect(settings.colorTheme).toBe("sunset");
  });

  it("theme= doesn't swallow tokens after it, unlike font=", () => {
    const { settings } = parseOptions("theme=sunset color");
    expect(settings.colorTheme).toBe("sunset");
    expect(settings.color).toBe(true);
  });

  it("reports an unresolved theme token instead of setting one", () => {
    const { settings, unknownTheme } = parseOptions("theme=not-a-theme");
    expect(settings.colorTheme).toBeUndefined();
    expect(unknownTheme).toBe("not-a-theme");
  });

  it("theme=default clears a saved color theme back to none", () => {
    const { settings, unknownTheme } = parseOptions("theme=default");
    expect(settings).toEqual({ colorTheme: null });
    expect(unknownTheme).toBeNull();
  });

  it("theme=default is case insensitive", () => {
    expect(parseOptions("theme=DEFAULT").settings.colorTheme).toBeNull();
  });

  it("ignores unknown tokens", () => {
    const { settings } = parseOptions("hello world");
    expect(settings).toEqual({});
  });
});

describe("buildTheme", () => {
  it("defaults to the dark theme with a grayscale avatar on the left", () => {
    const theme = buildTheme(DEFAULT_SETTINGS);
    expect(theme.extends).toBe("dark");
    expect(theme.avatar).toEqual({ grayscale: true, position: "left" });
  });

  it("combines color, light and flip on the side layout", () => {
    const theme = buildTheme({
      color: true,
      light: true,
      flip: true,
      bold: false,
      layout: "side",
      font: null,
      colorTheme: null,
    });
    expect(theme.extends).toBe("light");
    expect(theme.avatar).toEqual({ grayscale: false, position: "right" });
  });

  it("uses the portrait preset and omits avatar position when layout is portrait", () => {
    const theme = buildTheme({
      color: false,
      light: false,
      flip: true,
      bold: false,
      layout: "portrait",
      font: null,
      colorTheme: null,
    });
    expect(theme.extends).toBe("portrait");
    expect(theme.avatar).toEqual({ grayscale: true });
  });

  it("resolves to portrait's own 630x790 canvas, not the 1200x630 default", () => {
    const theme = buildTheme({ ...DEFAULT_SETTINGS, layout: "portrait" });
    const resolved = defineTheme(theme);
    expect(resolved.width).toBe(630);
    expect(resolved.height).toBe(790);
  });

  it("uses portrait-light when portrait and light combine", () => {
    const theme = buildTheme({
      color: false,
      light: true,
      flip: false,
      bold: false,
      layout: "portrait",
      font: null,
      colorTheme: null,
    });
    expect(theme.extends).toBe("portrait-light");
  });

  it("defaults to mplus, and sets the text font when a different one is chosen", () => {
    expect(DEFAULT_SETTINGS.font).toBe("M PLUS Rounded 1c");
    expect(buildTheme(DEFAULT_SETTINGS).text).toEqual({
      font: "M PLUS Rounded 1c",
    });
    expect(
      buildTheme({ ...DEFAULT_SETTINGS, font: "DotGothic16" }).text,
    ).toEqual({ font: "DotGothic16" });
  });

  it("omits the text font when explicitly null", () => {
    expect(
      buildTheme({ ...DEFAULT_SETTINGS, font: null }).text,
    ).toBeUndefined();
  });

  it("sets a bold weight only when bold is chosen", () => {
    expect(buildTheme(DEFAULT_SETTINGS).text?.weight).toBeUndefined();
    expect(buildTheme({ ...DEFAULT_SETTINGS, bold: true }).text?.weight).toBe(
      "bold",
    );
  });

  it("sets text even without a font when only bold is chosen", () => {
    const theme = buildTheme({ ...DEFAULT_SETTINGS, font: null, bold: true });
    expect(theme.text).toEqual({ weight: "bold" });
  });

  it("sets a background gradient only when a color theme is chosen", () => {
    expect(buildTheme(DEFAULT_SETTINGS).backgroundGradient).toBeUndefined();
    const theme = buildTheme({ ...DEFAULT_SETTINGS, colorTheme: "sunset" });
    expect(theme.backgroundGradient?.type).toBe("linear");
    expect(theme.backgroundGradient?.stops).toHaveLength(2);
    expect(theme.extends).toBe("dark");
  });

  it("a color theme's own text palette overrides settings.light", () => {
    // "hanami" needs light/black text even though settings.light is false.
    const theme = buildTheme({
      ...DEFAULT_SETTINGS,
      light: false,
      colorTheme: "hanami",
    });
    expect(theme.extends).toBe("light");
  });

  it("a color theme's text palette still applies under the portrait layout", () => {
    const theme = buildTheme({
      ...DEFAULT_SETTINGS,
      light: false,
      layout: "portrait",
      colorTheme: "hanami",
    });
    expect(theme.extends).toBe("portrait-light");
  });
});
