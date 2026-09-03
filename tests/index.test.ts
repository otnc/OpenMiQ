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

  it("parses color, bold, light and new, which clears flip", () => {
    const { settings } = parseOptions("color bold light flip new");
    expect(settings).toEqual({
      color: true,
      bold: true,
      light: true,
      flip: false,
      layout: "new",
    });
  });

  it("a flip after new overrides new's automatic reset back to true", () => {
    expect(parseOptions("new flip").settings.flip).toBe(true);
  });

  it("accepts commas as option separators, with or without spaces", () => {
    expect(parseOptions("c,n").settings).toEqual({
      color: true,
      layout: "new",
      flip: false,
    });
    expect(parseOptions("c flip, light").settings).toEqual({
      color: true,
      flip: true,
      light: true,
    });
    expect(parseOptions("c, ,n").settings).toEqual({
      color: true,
      layout: "new",
      flip: false,
    });
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

  it("right and left are no longer recognized (flip/unflip are the only keywords)", () => {
    expect(parseOptions("right").settings).toEqual({});
    expect(parseOptions("left").settings).toEqual({});
  });

  it("portrait and classic are no longer recognized (new/side are the only keywords)", () => {
    expect(parseOptions("portrait").settings).toEqual({});
    expect(parseOptions("classic").settings).toEqual({});
  });

  it("accepts a one-letter shortcut for every toggle", () => {
    const { settings } = parseOptions("c b l n f");
    expect(settings).toEqual({
      color: true,
      bold: true,
      light: true,
      flip: true,
      layout: "new",
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

  it("parses chain and unchain", () => {
    expect(parseOptions("chain").settings).toEqual({ chain: true });
    expect(parseOptions("unchain").settings).toEqual({ chain: false });
  });

  it("chain and new combine freely at parse time — buildTheme() resolves the conflict, not parseOptions", () => {
    expect(parseOptions("chain new").settings).toEqual({
      chain: true,
      layout: "new",
      flip: false,
    });
  });

  it("chain has no one-letter shortcut", () => {
    expect(parseOptions("c").settings).toEqual({ color: true });
  });

  it("a later chain token overrides an earlier one", () => {
    expect(parseOptions("chain unchain").settings.chain).toBe(false);
    expect(parseOptions("unchain chain").settings.chain).toBe(true);
  });

  it("a later token overrides an earlier opposite one", () => {
    expect(parseOptions("color mono").settings.color).toBe(false);
    expect(parseOptions("mono color").settings.color).toBe(true);
    expect(parseOptions("new side").settings.layout).toBe("side");
    expect(parseOptions("side new").settings.layout).toBe("new");
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

  it("parses theme=<official short alias>", () => {
    const { settings } = parseOptions("theme=ma");
    expect(settings.colorTheme).toBe("mint_apple");
  });

  it("theme=def, theme=b and theme=w are the official bot's own default aliases", () => {
    expect(parseOptions("theme=def").settings.colorTheme).toBeNull();
    expect(parseOptions("theme=b").settings.colorTheme).toBeNull();
    expect(parseOptions("theme=w").settings.colorTheme).toBeNull();
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
    expect(theme.layout).toBe("side");
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
      chain: false,
      markdown: false,
    });
    expect(theme.extends).toBe("light");
    expect(theme.layout).toBe("side");
    expect(theme.avatar).toEqual({ grayscale: false, position: "right" });
  });

  it("uses the new layout and omits avatar position", () => {
    const theme = buildTheme({
      color: false,
      light: false,
      flip: true,
      bold: false,
      layout: "new",
      font: null,
      colorTheme: null,
      chain: false,
      markdown: false,
    });
    expect(theme.extends).toBe("dark");
    expect(theme.layout).toBe("new");
    expect(theme.avatar).toEqual({ grayscale: true });
  });

  it("chain forces the layout back to side even when layout is new", () => {
    const theme = buildTheme({
      color: false,
      light: false,
      flip: true,
      bold: false,
      layout: "new",
      font: null,
      colorTheme: null,
      chain: true,
      markdown: false,
    });
    expect(theme.layout).toBe("side");
    expect(theme.avatar).toEqual({ grayscale: true, position: "right" });
  });

  it("resolves to the new layout's own 630x790 canvas, not the 1200x630 default", () => {
    const theme = buildTheme({ ...DEFAULT_SETTINGS, layout: "new" });
    const resolved = defineTheme(theme);
    expect(resolved.width).toBe(630);
    expect(resolved.height).toBe(790);
  });

  it("combines the light palette with the new layout", () => {
    const theme = buildTheme({
      color: false,
      light: true,
      flip: false,
      bold: false,
      layout: "new",
      font: null,
      colorTheme: null,
      chain: false,
      markdown: false,
    });
    expect(theme.extends).toBe("light");
    expect(theme.layout).toBe("new");
  });

  it("markdown forces bold off, even when bold is also on", () => {
    const theme = buildTheme({
      ...DEFAULT_SETTINGS,
      font: null,
      bold: true,
      markdown: true,
    });
    expect(theme.text).toBeUndefined();
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

  it("a color theme's text palette still applies under the new layout", () => {
    const theme = buildTheme({
      ...DEFAULT_SETTINGS,
      light: false,
      layout: "new",
      colorTheme: "hanami",
    });
    expect(theme.extends).toBe("light");
    expect(theme.layout).toBe("new");
  });

  it("leaves the username prefix alone by default", () => {
    expect(buildTheme(DEFAULT_SETTINGS).username).toBeUndefined();
  });

  it("marks the username as fake when options.fake is set", () => {
    const theme = buildTheme(DEFAULT_SETTINGS, { fake: true });
    expect(theme.username).toEqual({ prefix: "(fake) @" });
  });

  it("does not mark the username as fake when options.fake is false", () => {
    const theme = buildTheme(DEFAULT_SETTINGS, { fake: false });
    expect(theme.username).toBeUndefined();
  });
});
