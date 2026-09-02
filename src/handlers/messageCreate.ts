import { AttachmentBuilder, type Message } from "discord.js";
import { MiQ } from "makeitaquote";
import { loadingEmojiMarkup } from "../appEmojis.js";
import { buildComponents } from "../components.js";
import { ALL_COLOR_THEME_LIST } from "../colorThemes.js";
import { buildHelpMessagePayload } from "../commands/help.js";
import {
  deleteButtonEnabled,
  resolveLocale,
  resolveQuoteSettings,
} from "../config/settings.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t, type Translations } from "../i18n/index.js";
import { fetchReferencedMessage } from "../messageRefs.js";
import { parseOptions } from "../quoteOptions.js";
import { findChainTop } from "../quoteChain.js";
import { QUOTE_MESSAGES } from "../quoteMessages.js";
import { renderQuote } from "../render.js";
import { saveQuoteState } from "../state.js";

const STRINGS = {
  generating: { en: "**Generating…**", ja: "**生成中…**" },
} satisfies Record<string, Translations>;

const HELP_REACTION_EMOJI = "❓";
const HELP_REACTION_TIMEOUT_MS = 60_000;

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
      content: t(QUOTE_MESSAGES.unknownFont, locale, {
        token: unknownFont,
        aliases: FONT_ALIAS_LIST,
      }),
      allowedMentions: { repliedUser: true },
    });
    return;
  }

  if (unknownTheme) {
    await message.reply({
      content: t(QUOTE_MESSAGES.unknownTheme, locale, {
        token: unknownTheme,
        themes: ALL_COLOR_THEME_LIST,
      }),
      allowedMentions: { repliedUser: true },
    });
    return;
  }

  const target = await fetchReferenced(message);

  if (!target || !target.content.trim()) {
    await offerHelpOnReaction(message, locale);
    return;
  }

  const settings = resolveQuoteSettings({
    userId: message.author.id,
    guildId: message.guildId,
    inline,
  });

  const placeholder = await message.reply({
    content: `${loadingEmojiMarkup()} ${t(STRINGS.generating, locale)}`,
    allowedMentions: { repliedUser: false },
  });

  const watermark = message.client.user?.tag ?? "";
  const data = new MiQ()
    .setFromMessage(target, { stripDiscordMarkdown: true })
    .setWatermark(watermark)
    .getData();
  const chainTop = await findChainTop(
    message.client,
    target,
    settings,
    watermark,
  );
  const png = await renderQuote(data, settings, { chainTop });

  await placeholder.edit({
    content: null,
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(
      settings,
      locale,
      deleteButtonEnabled(message.guildId),
    ),
  });

  saveQuoteState(placeholder.id, {
    data,
    chainTop,
    settings,
    locale,
    guildId: message.guildId,
    generatorId: message.author.id,
    targetId: target.author.id,
    fake: false,
  });
}

/**
 * No message to quote: rather than a reply that just gets deleted a moment
 * later, react with a question mark the mentioning user can press for help —
 * quieter for a channel that just wants the bot to stop talking to it.
 */
async function offerHelpOnReaction(
  message: Message,
  locale: string,
): Promise<void> {
  const reaction = await message.react(HELP_REACTION_EMOJI).catch(() => null);
  if (!reaction) return;

  const collector = message.createReactionCollector({
    filter: (r, user) =>
      r.emoji.name === HELP_REACTION_EMOJI && user.id === message.author.id,
    max: 1,
    time: HELP_REACTION_TIMEOUT_MS,
  });

  collector.on("collect", () => {
    void message
      .reply({
        ...buildHelpMessagePayload(locale, 0, message.author.id),
        allowedMentions: { repliedUser: true },
      })
      .catch(() => {});
  });

  collector.on("end", (collected) => {
    if (collected.size === 0) {
      const botId = message.client.user?.id;
      if (botId) void reaction.users.remove(botId).catch(() => {});
    }
  });
}

/** The message a reply points at, or `null` when there is none. */
function fetchReferenced(message: Message): Promise<Message | null> {
  return fetchReferencedMessage(message.client, message);
}
