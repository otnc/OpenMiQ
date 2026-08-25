import {
  PermissionFlagsBits,
  type ChatInputCommandInteraction,
} from "discord.js";
import {
  buildScopeCommand,
  guildScope,
  reply,
  runScopeCommand,
} from "./scope.js";

export function buildServerSettingsCommand() {
  return buildScopeCommand(
    "server-settings",
    "commands.serverSettings",
    "guild",
  );
}

export async function runServerSettingsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inGuild() || !interaction.guildId) {
    await reply(interaction, "settings.errors.guildOnly");
    return;
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await reply(interaction, "settings.errors.permissionDenied");
    return;
  }
  await runScopeCommand(interaction, guildScope(interaction.guildId));
}
