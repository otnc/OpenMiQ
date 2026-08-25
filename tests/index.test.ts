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

  it("parses color, light, flip and new (portrait)", () => {
    const { settings } = parseOptions("color light flip new");
    expect(settings).toEqual({
      color: true,
      light: true,
      flip: true,
      layout: "portrait",
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
    const { settings } = parseOptions("mono dark unflip side");
    expect(settings).toEqual({
      color: false,
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

  it("left is a synonym for unflip", () => {
    expect(parseOptions("left").settings.flip).toBe(false);
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
      layout: "portrait",
      font: null,
      colorTheme: null,
    });
    expect(theme.extends).toBe("portrait");
    expect(theme.avatar).toEqual({ grayscale: true });
  });

  it("uses portrait-light when portrait and light combine", () => {
    const theme = buildTheme({
      color: false,
      light: true,
      flip: false,
      layout: "portrait",
      font: null,
      colorTheme: null,
    });
    expect(theme.extends).toBe("portrait-light");
  });

  it("sets the text font when one is chosen", () => {
    expect(buildTheme(DEFAULT_SETTINGS).text).toBeUndefined();
    expect(
      buildTheme({ ...DEFAULT_SETTINGS, font: "DotGothic16" }).text,
    ).toEqual({ font: "DotGothic16" });
  });

  it("sets a background gradient only when a color theme is chosen", () => {
    expect(buildTheme(DEFAULT_SETTINGS).backgroundGradient).toBeUndefined();
    const theme = buildTheme({ ...DEFAULT_SETTINGS, colorTheme: "sunset" });
    expect(theme.backgroundGradient?.type).toBe("linear");
    expect(theme.backgroundGradient?.stops).toHaveLength(2);
    expect(theme.extends).toBe("dark");
  });
});
