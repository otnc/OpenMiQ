import {
  ApplicationCommandType,
  AttachmentBuilder,
  ContextMenuCommandBuilder,
  type MessageContextMenuCommandInteraction,
} from "discord.js";
import { MiQ } from "makeitaquote";
import { buildComponents } from "../components.js";
import {
  deleteButtonEnabled,
  resolveLocale,
  resolveQuoteSettings,
} from "../config/settings.js";
import { t } from "../i18n/index.js";
import { findChainTop } from "../quoteChain.js";
import { QUOTE_MESSAGES } from "../quoteMessages.js";
import { renderQuote } from "../render.js";
import { saveQuoteState } from "../state.js";

/**
 * The "Quote" message context-menu command — the right-click alternative to
 * mentioning the bot in a reply. Since there's nowhere to type options, it
 * always renders with the invoking user's own saved defaults (falling back
 * to the guild's, then the bot's), same as a plain `@MiQ` with nothing after
 * it would.
 */
export function buildQuoteContextMenuCommand(): ContextMenuCommandBuilder {
  return new ContextMenuCommandBuilder()
    .setName("Quote")
    .setType(ApplicationCommandType.Message)
    .setNameLocalizations({ ja: "引用画像を作成" });
}

export async function runQuoteContextMenuCommand(
  interaction: MessageContextMenuCommandInteraction,
): Promise<void> {
  const locale = resolveLocale({
    userId: interaction.user.id,
    guildId: interaction.guildId,
  });

  const target = interaction.targetMessage;
  if (!target.content.trim()) {
    await interaction.reply({
      content: t(QUOTE_MESSAGES.noText, locale),
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  const settings = resolveQuoteSettings({
    userId: interaction.user.id,
    guildId: interaction.guildId,
    inline: {},
  });

  const watermark = interaction.client.user.tag;
  const data = new MiQ()
    .setFromMessage(target, { stripDiscordMarkdown: true })
    .setWatermark(watermark)
    .getData();
  const chainTop = await findChainTop(
    interaction.client,
    target,
    settings,
    watermark,
  );
  const png = await renderQuote(data, settings, { chainTop });

  const sent = await interaction.editReply({
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(
      settings,
      locale,
      deleteButtonEnabled(interaction.guildId),
    ),
  });

  saveQuoteState(sent.id, {
    data,
    chainTop,
    settings,
    locale,
    guildId: interaction.guildId,
    generatorId: interaction.user.id,
    targetId: target.author.id,
    fake: false,
  });
}
