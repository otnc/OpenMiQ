import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Translations } from "../i18n/index.js";
import {
  buildScopeCommand,
  guildScope,
  reply,
  runScopeCommand,
  SCOPE_ERRORS,
} from "./scope.js";

const DESCRIPTIONS = {
  command: {
    en: "This server's default quote options and language (Manage Server)",
    ja: "このサーバーの引用オプションと言語のデフォルト (サーバー管理権限が必要)",
  },
  view: {
    en: "Show this server's saved defaults",
    ja: "このサーバーの保存済みデフォルトを表示",
  },
  set: {
    en: "Save this server's defaults",
    ja: "このサーバーのデフォルトを保存",
  },
  reset: {
    en: "Clear this server's saved defaults",
    ja: "このサーバーの保存済みデフォルトを削除",
  },
} satisfies Record<string, Translations>;

export function buildServerSettingsCommand() {
  return buildScopeCommand("server-settings", DESCRIPTIONS, "guild");
}

export async function runServerSettingsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inGuild() || !interaction.guildId) {
    await reply(interaction, SCOPE_ERRORS.guildOnly);
    return;
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await reply(interaction, SCOPE_ERRORS.permissionDenied);
    return;
  }
  await runScopeCommand(interaction, guildScope(interaction.guildId));
}
