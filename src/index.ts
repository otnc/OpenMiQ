import {
  Client,
  Events,
  GatewayIntentBits,
  Partials,
  type ClientEvents,
} from "discord.js";
import { loadAppEmojis } from "./appEmojis.js";
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
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`Logged in as ${c.user.tag}`);
    void loadAppEmojis(c).catch((error) =>
      console.error("Failed to load application emojis:", error),
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

// Unlike deployCommands.ts/deployImages.ts (imported by deploy.ts, so they
// guard against running twice), nothing imports this module — it's only
// ever run directly as the process entrypoint — so it just runs. An
// import.meta.url/argv[1] entrypoint check doesn't hold up under process
// managers like pm2 that fork the script through their own wrapper rather
// than exec'ing `node index.js` directly, which left main() never called.
void main();
