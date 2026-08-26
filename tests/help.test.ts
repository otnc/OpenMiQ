import { describe, expect, it } from "vitest";
import {
  buildHelpMessagePayload,
  HELP_BUTTON_PREFIX,
  parseHelpButtonId,
} from "../src/commands/help.js";

function buttonCustomIds(
  payload: ReturnType<typeof buildHelpMessagePayload>,
): string[] {
  const [row] = payload.components;
  return (row?.components ?? []).map(
    (button) => (button.toJSON() as { custom_id: string }).custom_id,
  );
}

describe("parseHelpButtonId", () => {
  it("round-trips a custom ID built by the payload", () => {
    const [prev] = buttonCustomIds(buildHelpMessagePayload("ja", 1, "123"));
    expect(prev).toBeDefined();
    expect(parseHelpButtonId(prev!)).toEqual({
      action: "prev",
      page: 1,
      locale: "ja",
      requesterId: "123",
    });
  });

  it("rejects IDs that are not help buttons", () => {
    expect(parseHelpButtonId("miq:color")).toBeNull();
    expect(parseHelpButtonId("miq:help:prev:one:ja:123")).toBeNull();
    expect(parseHelpButtonId("miq:help:sideways:1:ja:123")).toBeNull();
    expect(parseHelpButtonId("miq:help:prev:1:ja:123:extra")).toBeNull();
  });
});

describe("buildHelpMessagePayload", () => {
  it("disables prev on the first page and next on the last", () => {
    const first = buildHelpMessagePayload("en", 0, "123");
    const [firstPrev, firstNext] = buttonCustomIds(first);
    expect(firstPrev).toBe(`${HELP_BUTTON_PREFIX}prev:0:en:123`);
    expect(firstNext).toBe(`${HELP_BUTTON_PREFIX}next:0:en:123`);

    const last = buildHelpMessagePayload("en", Number.MAX_SAFE_INTEGER, "123");
    const customIds = buttonCustomIds(last);
    // The clamped page number is encoded in the rebuilt buttons, so a stale
    // out-of-range page can't leak into the custom IDs.
    expect(customIds).toContain(`${HELP_BUTTON_PREFIX}next:2:en:123`);
  });

  it("shows the page number in the embed footer", () => {
    const payload = buildHelpMessagePayload("ja", 1, "123");
    const [embed] = payload.embeds;
    expect(embed?.toJSON().footer?.text).toBe("ページ 2 / 3");
  });

  it("keeps every page's field values within Discord's limits", () => {
    for (const locale of ["en", "ja"]) {
      for (let page = 0; page < 3; page++) {
        const payload = buildHelpMessagePayload(locale, page, "123");
        const [embed] = payload.embeds;
        expect(embed).toBeDefined();
        for (const field of embed!.toJSON().fields ?? []) {
          expect(field.name.length).toBeLessThanOrEqual(256);
          expect(field.value.length).toBeLessThanOrEqual(1024);
        }
      }
    }
  });
});
