import type { ChatInputCommandInteraction } from "discord.js";
import { isAdmin } from "../config/env.js";
import {
  botScope,
  buildScopeCommand,
  reply,
  runScopeCommand,
} from "./scope.js";

export function buildAdminCommand() {
  return buildScopeCommand("admin", "commands.admin", "bot");
}

export async function runAdminCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!isAdmin(interaction.user.id)) {
    await reply(interaction, "settings.errors.adminOnly");
    return;
  }
  await runScopeCommand(interaction, botScope());
}
