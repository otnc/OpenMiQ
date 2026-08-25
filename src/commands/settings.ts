import type { ChatInputCommandInteraction } from "discord.js";
import { buildScopeCommand, runScopeCommand, userScope } from "./scope.js";

export function buildSettingsCommand() {
  return buildScopeCommand("settings", "commands.settings", "user");
}

export async function runSettingsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  await runScopeCommand(interaction, userScope(interaction));
}
