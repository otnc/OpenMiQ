import type { ChatInputCommandInteraction } from "discord.js";
import type { Translations } from "../i18n/index.js";
import { buildScopeCommand, runScopeCommand, userScope } from "./scope.js";

const DESCRIPTIONS = {
  command: {
    en: "Your own default quote options and language",
    ja: "あなた自身の引用オプションと言語のデフォルト",
  },
  view: { en: "Show your saved defaults", ja: "保存済みのデフォルトを表示" },
  set: { en: "Save your defaults", ja: "デフォルトを保存" },
  reset: { en: "Clear your saved defaults", ja: "保存済みのデフォルトを削除" },
} satisfies Record<string, Translations>;

export function buildSettingsCommand() {
  return buildScopeCommand("settings", DESCRIPTIONS, "user");
}

export async function runSettingsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await runScopeCommand(interaction, userScope(interaction));
}
