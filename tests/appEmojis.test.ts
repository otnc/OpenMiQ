import type { Client } from "discord.js";
import { describe, expect, it } from "vitest";
import {
  colorThemeEmoji,
  loadAppEmojis,
  loadingEmojiMarkup,
  LOADING_EMOJI_NAME,
} from "../src/appEmojis.js";
import { COLOR_THEMES } from "../src/colorThemes.js";

function fakeClient(
  emojis: Array<{ id: string; name: string; animated?: boolean }>,
): Client {
  return {
    application: {
      emojis: {
        fetch: () =>
          Promise.resolve(new Map(emojis.map((emoji) => [emoji.id, emoji]))),
      },
    },
  } as unknown as Client;
}

describe("appEmojis", () => {
  it("returns undefined for a color-theme key that was never loaded", () => {
    expect(colorThemeEmoji("never-loaded-key")).toBeUndefined();
  });

  it("falls back to a plain emoji before the loading spinner is loaded", async () => {
    await loadAppEmojis(fakeClient([]));
    expect(loadingEmojiMarkup()).toBe("⏳");
  });

  it("caches a known theme's emoji by name after loading", async () => {
    const key = COLOR_THEMES[0]!.key;
    await loadAppEmojis(fakeClient([{ id: "123", name: key }]));
    expect(colorThemeEmoji(key)).toEqual({
      id: "123",
      name: key,
      animated: false,
    });
  });

  it("ignores emojis that aren't a known theme key or the loading spinner", async () => {
    await loadAppEmojis(fakeClient([{ id: "999", name: "not-a-theme" }]));
    expect(colorThemeEmoji("not-a-theme")).toBeUndefined();
  });

  it("builds animated markup for the loading spinner once loaded", async () => {
    await loadAppEmojis(
      fakeClient([{ id: "456", name: LOADING_EMOJI_NAME, animated: true }]),
    );
    expect(loadingEmojiMarkup()).toBe(`<a:${LOADING_EMOJI_NAME}:456>`);
  });

  it("is a no-op when the client has no application yet", async () => {
    const key = COLOR_THEMES[1]!.key;
    await loadAppEmojis(fakeClient([{ id: "789", name: key }]));
    await loadAppEmojis({ application: null } as unknown as Client);
    expect(colorThemeEmoji(key)).toEqual({
      id: "789",
      name: key,
      animated: false,
    });
  });
});
