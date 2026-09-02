import type { Client, Message } from "discord.js";

/**
 * The message `message` is a reply to, or `null` when it isn't a reply, the
 * reply's channel isn't text-based, or fetching it fails (deleted, no
 * access, …). Shared by the mention handler (what the mention itself replies
 * to) and chain building (what a quoted message itself replies to).
 */
export async function fetchReferencedMessage(
  client: Client,
  message: Message,
): Promise<Message | null> {
  const reference = message.reference;
  if (!reference?.messageId) return null;

  try {
    if (reference.channelId && reference.channelId !== message.channelId) {
      const channel = await client.channels.fetch(reference.channelId);
      if (channel?.isTextBased()) {
        return await channel.messages.fetch(reference.messageId);
      }
      return null;
    }
    return await message.channel.messages.fetch(reference.messageId);
  } catch {
    return null;
  }
}
