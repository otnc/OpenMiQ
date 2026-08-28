import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import { MiQ, type MessageLike } from "makeitaquote";
import { buildComponents } from "../components.js";
import { ALL_COLOR_THEME_LIST } from "../colorThemes.js";
import {
  deleteButtonEnabled,
  fakeQuoteBlockReason,
  fakeQuoteLabelHidden,
  resolveLocale,
  resolveQuoteSettings,
} from "../config/settings.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t, type Translations } from "../i18n/index.js";
import { parseOptions } from "../quoteOptions.js";
import { QUOTE_MESSAGES } from "../quoteMessages.js";
import { renderQuote } from "../render.js";
import { saveQuoteState } from "../state.js";

const STRINGS = {
  description: {
    en: "Make a quote image with someone else's name and avatar",
    ja: "指定したユーザーの名前とアイコンで引用画像を作成",
  },
  author: {
    en: "Whose name and avatar to use",
    ja: "名前とアイコンを使用するユーザー",
  },
  message: { en: "The (fake) quote text", ja: "(偽の)引用文" },
  options: {
    en: "Extra options, same as after a mention — see /help",
    ja: "追加オプション。メンション時と同じ形式 — /help を参照",
  },
  blockedByBot: {
    en: "The bot admins have disabled /fakequote.",
    ja: "Bot管理者により /fakequote は無効化されています。",
  },
  blockedByGuild: {
    en: "/fakequote is disabled in this server.",
    ja: "このサーバーでは /fakequote は無効化されています。",
  },
  blockedByUser: {
    en: "That user has blocked being used in /fakequote.",
    ja: "そのユーザーは /fakequote で名前を使われることをブロックしています。",
  },
} satisfies Record<string, Translations>;

export function buildFakequoteCommand(): SlashCommandOptionsOnlyBuilder {
  return new SlashCommandBuilder()
    .setName("fakequote")
    .setDescription(STRINGS.description.en)
    .setDescriptionLocalizations({ ja: STRINGS.description.ja })
    .addUserOption((opt) =>
      opt
        .setName("author")
        .setDescription(STRINGS.author.en)
        .setDescriptionLocalizations({ ja: STRINGS.author.ja })
        .setRequired(true),
    )
    .addStringOption((opt) =>
      opt
        .setName("message")
        .setDescription(STRINGS.message.en)
        .setDescriptionLocalizations({ ja: STRINGS.message.ja })
        .setRequired(true)
        .setMaxLength(1024),
    )
    .addStringOption((opt) =>
      opt
        .setName("options")
        .setDescription(STRINGS.options.en)
        .setDescriptionLocalizations({ ja: STRINGS.options.ja }),
    );
}

const BLOCK_MESSAGE: Record<"bot" | "guild" | "user", Translations> = {
  bot: STRINGS.blockedByBot,
  guild: STRINGS.blockedByGuild,
  user: STRINGS.blockedByUser,
};

const MENTION_TOKEN_RE = /<(@!?|@&|#)(\d+)>/g;

/**
 * `/fakequote`'s message is free-typed text, not a real Discord message, so
 * it has no `mentions` collection for `setFromMessage()` to resolve
 * `<@id>`/`<@&id>`/`<#id>` tokens against — build one by hand from whatever
 * IDs the text actually references.
 */
async function resolveInlineMentions(
  interaction: ChatInputCommandInteraction,
  text: string,
): Promise<NonNullable<MessageLike["mentions"]>> {
  const userIds = new Set<string>();
  const roleIds = new Set<string>();
  const channelIds = new Set<string>();
  for (const match of text.matchAll(MENTION_TOKEN_RE)) {
    const [, prefix, id] = match;
    if (!id) continue;
    if (prefix === "@&") roleIds.add(id);
    else if (prefix === "#") channelIds.add(id);
    else userIds.add(id);
  }

  const guild = interaction.guild;
  const users = new Map<string, { username?: string }>();
  const members = guild
    ? new Map<string, { displayName?: string; nickname?: string | null }>()
    : null;
  const roles = new Map<string, { name?: string }>();
  const channels = new Map<string, { name?: string | null }>();

  await Promise.all(
    [...userIds].map(async (id) => {
      const user = await interaction.client.users.fetch(id).catch(() => null);
      if (user) users.set(id, { username: user.username });
      const member = await guild?.members.fetch(id).catch(() => null);
      if (member) {
        members?.set(id, {
          displayName: member.displayName,
          nickname: member.nickname,
        });
      }
    }),
  );
  if (guild) {
    await Promise.all(
      [...roleIds].map(async (id) => {
        const role =
          guild.roles.cache.get(id) ??
          (await guild.roles.fetch(id).catch(() => null));
        if (role) roles.set(id, { name: role.name });
      }),
    );
    await Promise.all(
      [...channelIds].map(async (id) => {
        const channel =
          guild.channels.cache.get(id) ??
          (await guild.channels.fetch(id).catch(() => null));
        if (channel) channels.set(id, { name: channel.name });
      }),
    );
  }

  return { members, users, channels, roles };
}

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
      content: t(BLOCK_MESSAGE[blockReason], locale),
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
      content: t(QUOTE_MESSAGES.unknownFont, locale, {
        token: unknownFont,
        aliases: FONT_ALIAS_LIST,
      }),
      ephemeral: true,
    });
    return;
  }

  if (unknownTheme) {
    await interaction.reply({
      content: t(QUOTE_MESSAGES.unknownTheme, locale, {
        token: unknownTheme,
        themes: ALL_COLOR_THEME_LIST,
      }),
      ephemeral: true,
    });
    return;
  }

  const member = interaction.guild
    ? await interaction.guild.members.fetch(author.id).catch(() => null)
    : null;

  // `GuildMember#displayName`/`#displayAvatarURL()` already fall back to
  // the user's account-wide profile on their own, so this needs no extra
  // fallback chain of its own — mirrors makeitaquote's own setFromMessage.
  const displayName = (member ?? author).displayName;
  const avatar = (member ?? author).displayAvatarURL({
    extension: "png",
    size: 512,
  });

  const settings = resolveQuoteSettings({
    userId: interaction.user.id,
    guildId: interaction.guildId,
    inline,
  });

  const mentions = await resolveInlineMentions(interaction, messageText);
  const data = new MiQ()
    .setFromMessage(
      { content: messageText, author: { username: author.username }, mentions },
      { stripDiscordMarkdown: true },
    )
    .setAvatar(avatar)
    .setUsername(author.username)
    .setDisplayName(displayName)
    .setWatermark(interaction.client.user.tag)
    .getData();

  const fake = !fakeQuoteLabelHidden({
    invokerId: interaction.user.id,
    guildId: interaction.guildId,
  });
  const png = await renderQuote(data, settings, fake);

  await interaction.reply({
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(
      settings,
      locale,
      deleteButtonEnabled(interaction.guildId),
    ),
  });
  const sent = await interaction.fetchReply();

  saveQuoteState(sent.id, {
    data,
    settings,
    locale,
    guildId: interaction.guildId,
    generatorId: interaction.user.id,
    targetId: author.id,
    fake,
  });
}
