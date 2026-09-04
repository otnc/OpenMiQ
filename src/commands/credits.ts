import {
  type APIEmbedField,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { t, type Translations } from "../i18n/index.js";
import { callerLocale } from "./scope.js";

const STRINGS = {
  description: {
    en: "Credits for this bot and the library it's built on",
    ja: "このBotと使用ライブラリのクレジット",
  },
  title: { en: "🙏 Credits", ja: "🙏 クレジット" },
  project: {
    en: "https://github.com/otnc\n\nBy **otoneko.**\nOpenMiQ — https://github.com/otnc/OpenMiQ",
    ja: "https://github.com/otnc\n\n作者: **otoneko.**\nOpenMiQ — https://github.com/otnc/OpenMiQ",
  },
  libraryTitle: { en: "makeitaquote", ja: "makeitaquote" },
  library: {
    en: "The library this bot renders images with.\nhttps://github.com/otnc/makeitaquote\nhttps://www.npmjs.com/package/makeitaquote",
    ja: "このBotが画像描画に使用しているライブラリです。\nhttps://github.com/otnc/makeitaquote\nhttps://www.npmjs.com/package/makeitaquote",
  },
  inspirationTitle: { en: "Inspired by", ja: "インスピレーション元" },
  inspiration: {
    en: "Make it a Quote (Twitter) — https://twitter.com/MakeItAQuote\nMake it a Quote (Discord/Misskey/Bluesky) — https://miq.moe/",
    ja: "Make it a Quote (Twitter) — https://twitter.com/MakeItAQuote\nMake it a Quote (Discord/Misskey/Bluesky) — https://miq.moe/",
  },
} satisfies Record<string, Translations>;

const EMBED_COLOR = 0x58_65_f2;

/**
 * The credits content, as embed fields — shared by `/credits` and the last
 * page of `/help` so the two never drift apart. `github.com/otnc` (the
 * author's own profile, distinct from the project's own repo URL right
 * below it) leads, per the additional terms' attribution requirement.
 */
export function creditsFields(locale: string): APIEmbedField[] {
  return [
    { name: t(STRINGS.title, locale), value: t(STRINGS.project, locale) },
    {
      name: t(STRINGS.libraryTitle, locale),
      value: t(STRINGS.library, locale),
    },
    {
      name: t(STRINGS.inspirationTitle, locale),
      value: t(STRINGS.inspiration, locale),
    },
  ];
}

export function buildCreditsCommand(): SlashCommandBuilder {
  return new SlashCommandBuilder()
    .setName("credits")
    .setDescription(STRINGS.description.en)
    .setDescriptionLocalizations({ ja: STRINGS.description.ja });
}

export async function runCreditsCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const locale = callerLocale(interaction);
  const embed = new EmbedBuilder()
    .setColor(EMBED_COLOR)
    .addFields(...creditsFields(locale));
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
