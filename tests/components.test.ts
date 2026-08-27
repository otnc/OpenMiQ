import { describe, expect, it } from "vitest";
import {
  buildComponents,
  COLOR_BUTTON_ID,
  COLOR_THEME_SELECT_ID,
  FLIP_BUTTON_ID,
  FONT_SELECT_ID,
  LIGHT_BUTTON_ID,
} from "../src/components.js";
import { DEFAULT_SETTINGS } from "../src/quoteOptions.js";

function findButton(
  buttons: ReturnType<typeof buildComponents>[0],
  customId: string,
) {
  const button = buttons.components.find(
    (b) => (b.toJSON() as { custom_id?: string }).custom_id === customId,
  );
  return button!.toJSON() as {
    disabled?: boolean;
    emoji?: { name?: string };
  };
}

describe("buildComponents", () => {
  it('labels the font select\'s options as "family (alias)"', () => {
    const [, selectRow] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const fontSelect = selectRow!.components[0]!.toJSON() as {
      custom_id: string;
      options: { label: string; value: string }[];
    };
    expect(fontSelect.custom_id).toBe(FONT_SELECT_ID);
    const mplus = fontSelect.options.find(
      (o) => o.value === "M PLUS Rounded 1c",
    );
    expect(mplus?.label).toBe("M PLUS Rounded 1c (mplus)");
  });

  it('labels a color theme with an official alias as "label(key, alias)"', () => {
    const [, , colorThemeRow] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const themeSelect = colorThemeRow!.components[0]!.toJSON() as {
      custom_id: string;
      options: { label: string; value: string }[];
    };
    expect(themeSelect.custom_id).toBe(COLOR_THEME_SELECT_ID);
    const mintApple = themeSelect.options.find((o) => o.value === "mint_apple");
    expect(mintApple?.label).toBe("Mint Apple(mint_apple, ma)");
  });

  it('labels a color theme with no official alias as "label(key)"', () => {
    const [, , colorThemeRow] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const themeSelect = colorThemeRow!.components[0]!.toJSON() as {
      options: { label: string; value: string }[];
    };
    const hanami = themeSelect.options.find((o) => o.value === "hanami");
    expect(hanami?.label).toBe("Hanami(hanami)");
  });

  it("gives the toggle buttons an emoji only, no text label", () => {
    const [buttons] = buildComponents(DEFAULT_SETTINGS, "en", false);
    for (const button of buttons!.components) {
      expect(button.toJSON()).not.toHaveProperty("label");
    }
  });

  it("uses a left-right arrow for flip instead of the old refresh icon", () => {
    const [buttons] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const flip = buttons!.components.find(
      (b) =>
        (b.toJSON() as { custom_id?: string }).custom_id === FLIP_BUTTON_ID,
    );
    expect((flip!.toJSON() as { emoji?: { name?: string } }).emoji?.name).toBe(
      "↔️",
    );
  });

  it("still shows an emoji on the color button", () => {
    const [buttons] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const color = buttons!.components.find(
      (b) =>
        (b.toJSON() as { custom_id?: string }).custom_id === COLOR_BUTTON_ID,
    );
    expect((color!.toJSON() as { emoji?: { name?: string } }).emoji?.name).toBe(
      "🎨",
    );
  });

  it("disables the light button and reflects the color theme's own text palette", () => {
    const [buttons] = buildComponents(
      { ...DEFAULT_SETTINGS, light: false, colorTheme: "hanami" },
      "en",
      false,
    );
    const light = findButton(buttons!, LIGHT_BUTTON_ID);
    expect(light.disabled).toBe(true);
    // hanami needs the light/black-text palette, so the button shows what
    // pressing it to go dark would look like — the moon icon — even though
    // settings.light itself is false and the button can't be pressed.
    expect(light.emoji?.name).toBe("🌙");
  });

  it("leaves the light button enabled and settings-driven with no color theme", () => {
    const [buttons] = buildComponents(DEFAULT_SETTINGS, "en", false);
    const light = findButton(buttons!, LIGHT_BUTTON_ID);
    expect(light.disabled).toBeFalsy();
    expect(light.emoji?.name).toBe("☀️");
  });
});
