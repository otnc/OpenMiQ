import type { Client } from "discord.js";
import { describe, expect, it } from "vitest";
import {
  colorThemeEmoji,
  loadColorThemeEmojis,
} from "../src/colorThemeEmojis.js";
import { COLOR_THEMES } from "../src/colorThemes.js";

function fakeClient(emojis: Array<{ id: string; name: string }>): Client {
  return {
    application: {
      emojis: {
        fetch: () =>
          Promise.resolve(new Map(emojis.map((emoji) => [emoji.id, emoji]))),
      },
    },
  } as unknown as Client;
}

describe("colorThemeEmojis", () => {
  it("returns undefined for a key that was never loaded", () => {
    expect(colorThemeEmoji("never-loaded-key")).toBeUndefined();
  });

  it("caches a known theme's emoji by name after loading", async () => {
    const key = COLOR_THEMES[0]!.key;
    await loadColorThemeEmojis(fakeClient([{ id: "123", name: key }]));
    expect(colorThemeEmoji(key)).toEqual({ id: "123", name: key });
  });

  it("ignores emojis that aren't a known theme key", async () => {
    await loadColorThemeEmojis(
      fakeClient([{ id: "999", name: "not-a-theme" }]),
    );
    expect(colorThemeEmoji("not-a-theme")).toBeUndefined();
  });

  it("is a no-op when the client has no application yet", async () => {
    const key = COLOR_THEMES[1]!.key;
    await loadColorThemeEmojis(fakeClient([{ id: "456", name: key }]));
    await loadColorThemeEmojis({ application: null } as unknown as Client);
    expect(colorThemeEmoji(key)).toEqual({ id: "456", name: key });
  });
});
