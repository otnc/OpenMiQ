import type { ChatInputCommandInteraction } from "discord.js";
import { isAdmin } from "../config/env.js";
import type { Translations } from "../i18n/index.js";
import {
  botScope,
  buildScopeCommand,
  reply,
  runScopeCommand,
  SCOPE_ERRORS,
} from "./scope.js";

const DESCRIPTIONS = {
  command: {
    en: "The bot's own default quote options and language (bot admins only)",
    ja: "Bot自体の引用オプションと言語のデフォルト (Bot管理者のみ)",
  },
  view: {
    en: "Show the bot's saved defaults",
    ja: "Botの保存済みデフォルトを表示",
  },
  set: { en: "Save the bot's defaults", ja: "Botのデフォルトを保存" },
  reset: {
    en: "Clear the bot's saved defaults",
    ja: "Botの保存済みデフォルトを削除",
  },
} satisfies Record<string, Translations>;

export function buildAdminCommand() {
  return buildScopeCommand("admin", DESCRIPTIONS, "bot");
}

export async function runAdminCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!isAdmin(interaction.user.id)) {
    await reply(interaction, SCOPE_ERRORS.adminOnly);
    return;
  }
  await runScopeCommand(interaction, botScope());
}
