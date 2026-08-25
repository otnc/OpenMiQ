import { AttachmentBuilder, type Message } from "discord.js";
import { MiQ } from "makeitaquote";
import { buildComponents } from "../components.js";
import { COLOR_THEME_LIST } from "../colorThemes.js";
import { resolveLocale, resolveQuoteSettings } from "../config/settings.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t } from "../i18n/index.js";
import { parseOptions } from "../quoteOptions.js";
import { renderQuote } from "../render.js";
import { saveQuoteState } from "../state.js";

/** Handles a message that mentions the bot. */
export async function onMessageCreate(message: Message): Promise<void> {
  if (message.author.bot) return;
  const botId = message.client.user?.id;
  if (!botId) return;

  const mentionRe = new RegExp(`<@!?${botId}>`);
  if (!mentionRe.test(message.content)) return;

  const locale = resolveLocale({
    userId: message.author.id,
    guildId: message.guildId,
  });

  const {
    settings: inline,
    unknownFont,
    unknownTheme,
  } = parseOptions(message.content.replace(mentionRe, " "));

  if (unknownFont) {
    await message.reply({
      content: t("quote.unknownFont", locale, {
        token: unknownFont,
        aliases: FONT_ALIAS_LIST,
      }),
      allowedMentions: { repliedUser: true },
    });
    return;
  }

  if (unknownTheme) {
    await message.reply({
      content: t("quote.unknownTheme", locale, {
        token: unknownTheme,
        themes: COLOR_THEME_LIST,
      }),
      allowedMentions: { repliedUser: true },
    });
    return;
  }

  const target = await fetchReferenced(message);

  if (!target || !target.content.trim()) {
    const reply = await message.reply({
      content: t("quote.usage", locale),
      allowedMentions: { repliedUser: true },
    });
    setTimeout(() => void reply.delete().catch(() => {}), 15_000);
    return;
  }

  if ("sendTyping" in message.channel) {
    await message.channel.sendTyping().catch(() => {});
  }

  const settings = resolveQuoteSettings({
    userId: message.author.id,
    guildId: message.guildId,
    inline,
  });

  const data = new MiQ().setFromMessage(target).getData();
  const png = await renderQuote(data, settings);

  const sent = await message.reply({
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(settings, locale),
    allowedMentions: { repliedUser: false },
  });

  saveQuoteState(sent.id, { data, settings, locale });
}

/** The message a reply points at, or `null` when there is none. */
async function fetchReferenced(message: Message): Promise<Message | null> {
  const reference = message.reference;
  if (!reference?.messageId) return null;

  try {
    if (reference.channelId && reference.channelId !== message.channelId) {
      const channel = await message.client.channels.fetch(reference.channelId);
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
