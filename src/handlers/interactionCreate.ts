import {
  AttachmentBuilder,
  type ButtonInteraction,
  type Interaction,
  type StringSelectMenuInteraction,
} from "discord.js";
import { runAdminCommand } from "../commands/admin.js";
import { runFakequoteCommand } from "../commands/fakequote.js";
import { runHelpCommand } from "../commands/help.js";
import { runQuoteContextMenuCommand } from "../commands/quote.js";
import { runServerSettingsCommand } from "../commands/serverSettings.js";
import { runSettingsCommand } from "../commands/settings.js";
import {
  COLOR_BUTTON_ID,
  COLOR_THEME_SELECT_ID,
  DEFAULT_COLOR_THEME_VALUE,
  DEFAULT_FONT_VALUE,
  FLIP_BUTTON_ID,
  FONT_SELECT_ID,
  LAYOUT_BUTTON_ID,
  LIGHT_BUTTON_ID,
  buildComponents,
} from "../components.js";
import { normalizeLocale, t } from "../i18n/index.js";
import type { QuoteSettings } from "../quoteOptions.js";
import { renderQuote } from "../render.js";
import { getQuoteState } from "../state.js";

/** Handles slash commands, and the buttons/select menu under a posted quote. */
export async function onInteractionCreate(
  interaction: Interaction,
): Promise<void> {
  if (interaction.isChatInputCommand()) {
    switch (interaction.commandName) {
      case "settings":
        await runSettingsCommand(interaction);
        break;
      case "server-settings":
        await runServerSettingsCommand(interaction);
        break;
      case "admin":
        await runAdminCommand(interaction);
        break;
      case "help":
        await runHelpCommand(interaction);
        break;
      case "fakequote":
        await runFakequoteCommand(interaction);
        break;
    }
    return;
  }

  if (interaction.isMessageContextMenuCommand()) {
    if (interaction.commandName === "Quote") {
      await runQuoteContextMenuCommand(interaction);
    }
    return;
  }

  if (
    !(interaction.isButton() || interaction.isStringSelectMenu()) ||
    !interaction.customId.startsWith("miq:")
  ) {
    return;
  }

  const state = getQuoteState(interaction.message.id);
  if (!state) {
    await interaction.reply({
      content: t("quote.expired", normalizeLocale(interaction.locale)),
      ephemeral: true,
    });
    return;
  }

  const settings: QuoteSettings = { ...state.settings };

  if (interaction.isButton()) {
    applyButton(settings, interaction);
  } else if (interaction.customId === FONT_SELECT_ID) {
    applyFontSelect(settings, interaction);
  } else {
    applyColorThemeSelect(settings, interaction);
  }

  await interaction.deferUpdate();

  const png = await renderQuote(state.data, settings);
  state.settings = settings;

  await interaction.editReply({
    attachments: [],
    files: [new AttachmentBuilder(png, { name: "quote.png" })],
    components: buildComponents(settings, state.locale),
  });
}

function applyButton(
  settings: QuoteSettings,
  interaction: ButtonInteraction,
): void {
  switch (interaction.customId) {
    case COLOR_BUTTON_ID:
      settings.color = !settings.color;
      break;
    case FLIP_BUTTON_ID:
      settings.flip = !settings.flip;
      break;
    case LIGHT_BUTTON_ID:
      settings.light = !settings.light;
      break;
    case LAYOUT_BUTTON_ID:
      settings.layout = settings.layout === "portrait" ? "side" : "portrait";
      break;
  }
}

function applyFontSelect(
  settings: QuoteSettings,
  interaction: StringSelectMenuInteraction,
): void {
  const value = interaction.values[0];
  settings.font = !value || value === DEFAULT_FONT_VALUE ? null : value;
}

function applyColorThemeSelect(
  settings: QuoteSettings,
  interaction: StringSelectMenuInteraction,
): void {
  if (interaction.customId !== COLOR_THEME_SELECT_ID) return;
  const value = interaction.values[0];
  settings.colorTheme =
    !value || value === DEFAULT_COLOR_THEME_VALUE ? null : value;
}
