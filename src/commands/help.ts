import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { COLOR_THEME_LIST } from "../colorThemes.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t } from "../i18n/index.js";
import { callerLocale } from "./scope.js";

export function buildHelpCommand() {
  return new SlashCommandBuilder()
    .setName("help")
    .setDescription(t("commands.help.description", "en"))
    .setDescriptionLocalizations({
      ja: t("commands.help.description", "ja"),
    });
}

export async function runHelpCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const locale = callerLocale(interaction);
  const lines = [
    `**${t("help.title", locale)}**`,
    t("help.mention", locale),
    "",
    t("help.optionsTitle", locale),
    `- ${t("help.optionColor", locale)}`,
    `- ${t("help.optionBold", locale)}`,
    `- ${t("help.optionLight", locale)}`,
    `- ${t("help.optionFlip", locale)}`,
    `- ${t("help.optionNew", locale)}`,
    `- ${t("help.optionFont", locale)}`,
    `- ${t("help.optionTheme", locale)}`,
    "",
    `**${t("help.fontsTitle", locale)}**`,
    FONT_ALIAS_LIST,
    "",
    `**${t("help.colorThemesTitle", locale)}**`,
    COLOR_THEME_LIST,
    "",
    t("help.settingsHint", locale),
    t("help.fakequoteHint", locale),
    t("help.contextMenuHint", locale),
  ];
  await interaction.reply({ content: lines.join("\n"), ephemeral: true });
}
