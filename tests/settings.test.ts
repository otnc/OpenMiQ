import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// DATA_DIR is read once at module load, so it must be set before the first
// (dynamic) import of src/config/*, ahead of every static import in this
// project — hence importing the module under test at runtime, not statically.
describe("settings resolution", () => {
  let settingsMod: typeof import("../src/config/settings.js");
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = mkdtempSync(path.join(os.tmpdir(), "miq-bot-test-"));
    process.env.DATA_DIR = tmpDir;
    settingsMod = await import("../src/config/settings.js");
    settingsMod.loadSettingsStores();
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("falls back to hardcoded defaults with nothing saved", () => {
    const settings = settingsMod.resolveQuoteSettings({
      userId: "u1",
      guildId: null,
      inline: {},
    });
    expect(settings).toEqual({
      color: false,
      light: false,
      flip: false,
      bold: false,
      layout: "side",
      font: "M PLUS Rounded 1c",
      colorTheme: null,
    });
  });

  it("merges quote-option defaults as bot < guild < user < inline", async () => {
    await settingsMod.setBotDefaults({
      quoteDefaults: { color: true, layout: "new" },
    });
    await settingsMod.setGuildSettings("g1", {
      quoteDefaults: { color: false },
    });
    await settingsMod.setUserSettings("u1", {
      quoteDefaults: { layout: "side" },
    });

    const settings = settingsMod.resolveQuoteSettings({
      userId: "u1",
      guildId: "g1",
      inline: { flip: true },
    });
    expect(settings.color).toBe(false); // guild overrides bot
    expect(settings.layout).toBe("side"); // user overrides bot
    expect(settings.flip).toBe(true); // inline overrides everything
  });

  it("resolves locale with the same precedence", async () => {
    await settingsMod.setBotDefaults({ language: "en" });
    expect(settingsMod.resolveLocale({ userId: "u2", guildId: null })).toBe(
      "en",
    );

    await settingsMod.setGuildSettings("g2", { language: "ja" });
    expect(settingsMod.resolveLocale({ userId: "u2", guildId: "g2" })).toBe(
      "ja",
    );

    await settingsMod.setUserSettings("u2", { language: "en" });
    expect(settingsMod.resolveLocale({ userId: "u2", guildId: "g2" })).toBe(
      "en",
    );
  });

  it("reset clears a scope back to nothing saved", async () => {
    await settingsMod.setUserSettings("u3", { quoteDefaults: { color: true } });
    await settingsMod.resetUserSettings("u3");
    expect(settingsMod.getUserSettings("u3")).toEqual({});
  });

  it("a second set() merges into, rather than replaces, saved quote defaults", async () => {
    await settingsMod.setUserSettings("u4", { quoteDefaults: { color: true } });
    await settingsMod.setUserSettings("u4", { quoteDefaults: { flip: true } });
    expect(settingsMod.getUserSettings("u4").quoteDefaults).toEqual({
      color: true,
      flip: true,
    });
  });

  it("fakeQuoteBlockReason is null when nothing blocks it", () => {
    expect(
      settingsMod.fakeQuoteBlockReason({ authorId: "u5", guildId: "g5" }),
    ).toBeNull();
  });

  it("fakeQuoteBlockReason checks bot, then guild, then the author themselves", async () => {
    await settingsMod.setUserSettings("u6", { fakeQuoteDisabled: true });
    expect(
      settingsMod.fakeQuoteBlockReason({ authorId: "u6", guildId: null }),
    ).toBe("user");

    await settingsMod.setGuildSettings("g6", { fakeQuoteDisabled: true });
    expect(
      settingsMod.fakeQuoteBlockReason({ authorId: "u7", guildId: "g6" }),
    ).toBe("guild");

    await settingsMod.setBotDefaults({ fakeQuoteDisabled: true });
    expect(
      settingsMod.fakeQuoteBlockReason({ authorId: "u8", guildId: "g8" }),
    ).toBe("bot");
  });

  it("deleteButtonEnabled is true by default", () => {
    expect(settingsMod.deleteButtonEnabled("g9")).toBe(true);
    expect(settingsMod.deleteButtonEnabled(null)).toBe(true);
  });

  it("deleteButtonEnabled respects a guild override", async () => {
    await settingsMod.setGuildSettings("g10", { deleteButtonDisabled: true });
    expect(settingsMod.deleteButtonEnabled("g10")).toBe(false);
    expect(settingsMod.deleteButtonEnabled("g11")).toBe(true);
  });

  it("deleteButtonEnabled respects a bot-wide override", async () => {
    await settingsMod.setBotDefaults({ deleteButtonDisabled: true });
    expect(settingsMod.deleteButtonEnabled("g12")).toBe(false);
    expect(settingsMod.deleteButtonEnabled(null)).toBe(false);
  });

  it("fakeQuoteLabelHidden is false by default", () => {
    expect(
      settingsMod.fakeQuoteLabelHidden({ invokerId: "u13", guildId: "g13" }),
    ).toBe(false);
  });

  it("fakeQuoteLabelHidden checks bot, then guild, then the invoker themselves", async () => {
    await settingsMod.setUserSettings("u14", { fakeQuoteLabelDisabled: true });
    expect(
      settingsMod.fakeQuoteLabelHidden({ invokerId: "u14", guildId: null }),
    ).toBe(true);
    expect(
      settingsMod.fakeQuoteLabelHidden({ invokerId: "u15", guildId: null }),
    ).toBe(false);

    await settingsMod.setGuildSettings("g14", { fakeQuoteLabelDisabled: true });
    expect(
      settingsMod.fakeQuoteLabelHidden({ invokerId: "u15", guildId: "g14" }),
    ).toBe(true);

    await settingsMod.setBotDefaults({ fakeQuoteLabelDisabled: true });
    expect(
      settingsMod.fakeQuoteLabelHidden({ invokerId: "u16", guildId: "g16" }),
    ).toBe(true);
  });
});
