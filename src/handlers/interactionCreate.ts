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
  BOLD_BUTTON_ID,
  COLOR_BUTTON_ID,
  COLOR_THEME_SELECT_ID,
  DEFAULT_COLOR_THEME_VALUE,
  DEFAULT_FONT_VALUE,
  DELETE_BUTTON_ID,
  FLIP_BUTTON_ID,
  FONT_SELECT_ID,
  LAYOUT_BUTTON_ID,
  LIGHT_BUTTON_ID,
  buildComponents,
} from "../components.js";
import { deleteButtonEnabled } from "../config/settings.js";
import { normalizeLocale, t, type Translations } from "../i18n/index.js";
import { DEFAULT_FONT, type QuoteSettings } from "../quoteOptions.js";
import { QUOTE_MESSAGES } from "../quoteMessages.js";
import { renderQuote } from "../render.js";
import { deleteQuoteState, getQuoteState, type QuoteState } from "../state.js";

const STRINGS = {
  deleteNotAllowed: {
    en: "Only the person who made this quote, or the person it's about, can delete it.",
    ja: "この引用を削除できるのは、作成した本人か、引用対象になった本人だけです。",
  },
  deletedBy: {
    en: "[Deleted by {{user}}]",
    ja: "[{{user}} によって削除済み]",
  },
} satisfies Record<string, Translations>;

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
      content: t(QUOTE_MESSAGES.expired, normalizeLocale(interaction.locale)),
      ephemeral: true,
    });
    return;
  }

  if (interaction.isButton() && interaction.customId === DELETE_BUTTON_ID) {
    await handleDeleteButton(interaction, state);
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
    components: buildComponents(
      settings,
      state.locale,
      deleteButtonEnabled(state.guildId),
    ),
  });
}

/**
 * Soft-deletes a quote: only its generator or its subject may do this. The
 * message is edited, not actually deleted, so a `SAVE_IMAGES_DIR` copy of
 * the image (if any) is unaffected — it lives on disk, not in the message.
 */
async function handleDeleteButton(
  interaction: ButtonInteraction,
  state: QuoteState,
): Promise<void> {
  const authorized =
    interaction.user.id === state.generatorId ||
    interaction.user.id === state.targetId;
  if (!authorized) {
    await interaction.reply({
      content: t(STRINGS.deleteNotAllowed, normalizeLocale(interaction.locale)),
      ephemeral: true,
    });
    return;
  }

  await interaction.update({
    content: t(STRINGS.deletedBy, state.locale, {
      user: `<@${interaction.user.id}>`,
    }),
    embeds: [],
    attachments: [],
    components: [],
  });
  deleteQuoteState(interaction.message.id);
}

function applyButton(
  settings: QuoteSettings,
  interaction: ButtonInteraction,
): void {
  switch (interaction.customId) {
    case COLOR_BUTTON_ID:
      settings.color = !settings.color;
      break;
    case BOLD_BUTTON_ID:
      settings.bold = !settings.bold;
      break;
    case FLIP_BUTTON_ID:
      settings.flip = !settings.flip;
      break;
    case LIGHT_BUTTON_ID:
      settings.light = !settings.light;
      break;
    case LAYOUT_BUTTON_ID:
      settings.layout = settings.layout === "portrait" ? "side" : "portrait";
      if (settings.layout === "portrait") settings.flip = false;
      break;
  }
}

function applyFontSelect(
  settings: QuoteSettings,
  interaction: StringSelectMenuInteraction,
): void {
  const value = interaction.values[0];
  settings.font = !value || value === DEFAULT_FONT_VALUE ? DEFAULT_FONT : value;
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
