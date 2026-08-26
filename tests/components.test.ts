import { describe, expect, it } from "vitest";
import {
  buildComponents,
  COLOR_BUTTON_ID,
  FLIP_BUTTON_ID,
  FONT_SELECT_ID,
} from "../src/components.js";
import { DEFAULT_SETTINGS } from "../src/quoteOptions.js";

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
});
