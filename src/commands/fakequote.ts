import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { MiQ } from "makeitaquote";
import { buildComponents } from "../components.js";
import { COLOR_THEME_LIST } from "../colorThemes.js";
import {
  fakeQuoteBlockReason,
  resolveLocale,
  resolveQuoteSettings,
} from "../config/settings.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t } from "../i18n/index.js";
import { parseOptions } from "../quoteOptions.js";
import { renderQuote } from "../render.js";
import { saveQuoteState } from "../state.js";

const EN = "en";

export function buildFakequoteCommand(): SlashCommandOptionsOnlyBuilder {
  return new SlashCommandBuilder()
    .setName("fakequote")
    .setDescription(t("commands.fakequote.description", EN))
    .setDescriptionLocalizations({
      ja: t("commands.fakequote.description", "ja"),
    })
    .addUserOption((opt) =>
      opt
        .setName("author")
        .setDescription(t("commands.fakequote.options.author", EN))
        .setDescriptionLocalizations({
          ja: t("commands.fakequote.options.author", "ja"),
        })
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription(t("commands.fakequote.options.message", EN))
        .setDescriptionLocalizations({
          ja: t("commands.fakequote.options.message", "ja"),
        })
        .setRequired(true)
        .setMaxLength(1024),
    )
    .addStringOption((opt) =>
      opt
        .setName("options")
        .setDescription(t("commands.fakequote.options.options", EN))
        .setDescriptionLocalizations({
          ja: t("commands.fakequote.options.options", "ja"),
        }),
    );
}

const BLOCK_MESSAGE_KEY = {
  bot: "fakequote.blockedByBot",
  guild: "fakequote.blockedByGuild",
  user: "fakequote.blockedByUser",
} as const;

export async function runFakequoteCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const locale = resolveLocale({
    userId: interaction.user.id,
    guildId: interaction.guildId,
  });

  const author = interaction.options.getUser("author", true);
  const messageText = interaction.options.getString("message", true);
  const optionsText = interaction.options.getString("options") ?? "";

  const blockReason = fakeQuoteBlockReason({
    authorId: author.id,
    guildId: interaction.guildId,
  });
  if (blockReason) {
    await interaction.reply({
      content: t(BLOCK_MESSAGE_KEY[blockReason], locale),
      ephemeral: true,
    });
    return;
  }

  const {
    settings: inline,
    unknownFont,
    unknownTheme,
  } = parseOptions(optionsText);
  if (unknownFont) {
    await interaction.reply({
      content: t("quote.unknownFont", locale, {
        token: unknownFont,
        aliases: FONT_ALIAS_LIST,
      }),
      ephemeral: true,
    });
    return;
  }

  if (unknownTheme) {
    await interaction.reply({
      content: t("quote.unknownTheme", locale, {
        token: unknownTheme,
        themes: COLOR_THEME_LIST,
      }),
      ephemeral: true,
    });
    return;
  }

  const member = interaction.guild
    ? await interaction.guild.members.fetch(author.id).catch(() => null)
    : null;

  // Mirrors makeitaquote's own setFromMessage: prefer the guild nickname and
  // guild avatar, falling back to the account-wide profile.
  const displayName =
    member?.nickname ||
    member?.displayName ||
    author.globalName ||
    author.username;
  const avatar =
    member?.displayAvatarURL({ extension: "png", size: 512 }) ??
    author.displayAvatarURL({ extension: "png", size: 512 });

  const settings = resolveQuoteSettings({
    userId: interaction.user.id,
    guildId: interaction.guildId,
    inline,
  });

  const data = new MiQ()
    .setText(messageText)
    .setAvatar(avatar)
    .setUsername(author.username)
    .setDisplayName(displayName)
    .getData();

  const png = await renderQuote(data, settings);

  await interaction.reply({
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(settings, locale),
  });
  const sent = await interaction.fetchReply();

  saveQuoteState(sent.id, { data, settings, locale });
}
