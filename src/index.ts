import { pathToFileURL } from "node:url";
import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type ClientEvents,
} from "discord.js";
import { loadColorThemeEmojis } from "./colorThemeEmojis.js";
import { loadSettingsStores } from "./config/settings.js";
import { onInteractionCreate } from "./handlers/interactionCreate.js";
import { onMessageCreate } from "./handlers/messageCreate.js";

export async function main(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    throw new Error(
      "DISCORD_TOKEN is not set. Put it in .env or the environment.",
    );
  }

  loadSettingsStores();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    void loadColorThemeEmojis(c).catch((error) =>
      console.error("Failed to load color-theme emojis:", error),
    );
  });

  client.on(Events.MessageCreate, ((message) => {
    void onMessageCreate(message).catch((error) =>
      console.error("MessageCreate handler failed:", error),
    );
  }) satisfies (...args: ClientEvents[Events.MessageCreate]) => void);

  client.on(Events.InteractionCreate, ((interaction) => {
    void onInteractionCreate(interaction).catch((error) =>
      console.error("InteractionCreate handler failed:", error),
    );
  }) satisfies (...args: ClientEvents[Events.InteractionCreate]) => void);

  await client.login(token);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  void main();
}
