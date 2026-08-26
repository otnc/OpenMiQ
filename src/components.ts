import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type MessageActionRowComponentBuilder,
} from "discord.js";
import { FONT_CATALOGUE } from "makeitaquote";
import { COLOR_THEMES, type ColorTheme } from "./colorThemes.js";
import { t, type Translations } from "./i18n/index.js";
import type { QuoteSettings } from "./quoteOptions.js";

const STRINGS = {
  colorEnable: { en: "Color", ja: "カラー" },
  colorDisable: { en: "Grayscale", ja: "モノクロ" },
  bold: { en: "Bold", ja: "太字" },
  flip: { en: "Flip", ja: "反転" },
  toLight: { en: "Light", ja: "ライト" },
  toDark: { en: "Dark", ja: "ダーク" },
  fontPlaceholder: { en: "Choose a font", ja: "フォントを選択" },
  fontDefault: { en: "Default", ja: "デフォルト" },
  colorThemePlaceholder: {
    en: "Choose a color theme",
    ja: "カラーテーマを選択",
  },
  colorThemeDefault: { en: "Default", ja: "デフォルト" },
} satisfies Record<string, Translations>;

/**
 * The side/portrait layout labels, also reused by `/settings|/server-settings|/admin
 * set layout:`'s choice names in `scope.ts` — same wording either way.
 */
export const LAYOUT_LABELS = {
  toSide: { en: "Side", ja: "横画像" },
  toPortrait: { en: "Portrait", ja: "縦画像" },
} satisfies Record<string, Translations>;

export const COLOR_BUTTON_ID = "miq:color";
export const BOLD_BUTTON_ID = "miq:bold";
export const FLIP_BUTTON_ID = "miq:flip";
export const LIGHT_BUTTON_ID = "miq:light";
export const LAYOUT_BUTTON_ID = "miq:layout";
export const FONT_SELECT_ID = "miq:font";
export const COLOR_THEME_SELECT_ID = "miq:colorTheme";

/** Sentinel select value meaning "back to the default font". */
export const DEFAULT_FONT_VALUE = "miq:default-font";
/** Sentinel select value meaning "no color theme, use the base theme's background". */
export const DEFAULT_COLOR_THEME_VALUE = "miq:default-theme";

/** The buttons and the font/color-theme select menus shown under a posted quote. */
export function buildComponents(
  settings: QuoteSettings,
  locale: string,
): ActionRowBuilder<MessageActionRowComponentBuilder>[] {
  const portrait = settings.layout === "portrait";

  const buttons =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(COLOR_BUTTON_ID)
        .setLabel(
          settings.color
            ? t(STRINGS.colorDisable, locale)
            : t(STRINGS.colorEnable, locale),
        )
        .setEmoji("🎨")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(BOLD_BUTTON_ID)
        .setLabel(t(STRINGS.bold, locale))
        .setEmoji("🅱️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(FLIP_BUTTON_ID)
        .setLabel(t(STRINGS.flip, locale))
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(portrait),
      new ButtonBuilder()
        .setCustomId(LIGHT_BUTTON_ID)
        .setLabel(
          settings.light
            ? t(STRINGS.toDark, locale)
            : t(STRINGS.toLight, locale),
        )
        .setEmoji(settings.light ? "🌙" : "☀️")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(LAYOUT_BUTTON_ID)
        .setLabel(
          portrait
            ? t(LAYOUT_LABELS.toSide, locale)
            : t(LAYOUT_LABELS.toPortrait, locale),
        )
        .setEmoji(portrait ? "🖥️" : "📱")
        .setStyle(ButtonStyle.Secondary),
    );

  const fontSelect = new StringSelectMenuBuilder()
    .setCustomId(FONT_SELECT_ID)
    .setPlaceholder(t(STRINGS.fontPlaceholder, locale))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t(STRINGS.fontDefault, locale))
        .setValue(DEFAULT_FONT_VALUE),
      ...FONT_CATALOGUE.map((family) => fontOption(family, settings)),
    );

  const colorThemeSelect = new StringSelectMenuBuilder()
    .setCustomId(COLOR_THEME_SELECT_ID)
    .setPlaceholder(t(STRINGS.colorThemePlaceholder, locale))
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel(t(STRINGS.colorThemeDefault, locale))
        .setValue(DEFAULT_COLOR_THEME_VALUE)
        .setDefault(settings.colorTheme === null),
      ...COLOR_THEMES.map((theme) => colorThemeOption(theme, settings)),
    );

  const selectRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      fontSelect,
    );
  const colorThemeRow =
    new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
      colorThemeSelect,
    );

  return [buttons, selectRow, colorThemeRow];
}

function fontOption(
  family: string,
  settings: QuoteSettings,
): StringSelectMenuOptionBuilder {
  return new StringSelectMenuOptionBuilder()
    .setLabel(family)
    .setValue(family)
    .setDefault(settings.font === family);
}

function colorThemeOption(
  theme: ColorTheme,
  settings: QuoteSettings,
): StringSelectMenuOptionBuilder {
  return new StringSelectMenuOptionBuilder()
    .setLabel(theme.label)
    .setValue(theme.key)
    .setDefault(settings.colorTheme === theme.key);
}
