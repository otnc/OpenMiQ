import { REST, Routes } from "discord.js";
import { buildAdminCommand } from "./commands/admin.js";
import { buildFakequoteCommand } from "./commands/fakequote.js";
import { buildHelpCommand } from "./commands/help.js";
import { buildQuoteContextMenuCommand } from "./commands/quote.js";
import { buildServerSettingsCommand } from "./commands/serverSettings.js";
import { buildSettingsCommand } from "./commands/settings.js";

/** Registers the bot's commands. Run with `pnpm run deploy-commands`. */
async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!token) throw new Error("DISCORD_TOKEN is not set.");
  if (!clientId) throw new Error("DISCORD_CLIENT_ID is not set.");

  const rest = new REST().setToken(token);
  const body = [
    buildSettingsCommand().toJSON(),
    buildServerSettingsCommand().toJSON(),
    buildAdminCommand().toJSON(),
    buildHelpCommand().toJSON(),
    buildFakequoteCommand().toJSON(),
    buildQuoteContextMenuCommand().toJSON(),
  ];

  await rest.put(Routes.applicationCommands(clientId), { body });
  console.log(`Registered ${body.length} command(s).`);
}

void main();
