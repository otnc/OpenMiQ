import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { COLOR_THEME_LIST } from "../colorThemes.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t, type Translations } from "../i18n/index.js";
import { callerLocale } from "./scope.js";

const STRINGS = {
  description: { en: "Show how to use the bot", ja: "Botの使い方を表示" },
  title: { en: "MiQ Bot help", ja: "MiQ Bot ヘルプ" },
  mention: {
    en: 'Reply to a message and mention the bot to turn it into a quote image, or use the "Quote" entry in a message\'s right-click (or ⋯) menu.',
    ja: "メッセージにリプライした状態でこのBotをメンションすると、そのメッセージが引用画像になります。メッセージの右クリック(または長押し、⋯メニュー)から「引用画像を作成」を選んでも同じことができます。",
  },
  optionsTitle: {
    en: "Options (combine freely after the mention, e.g. `@MiQ color new font=pop`) — each has an opposite and a one-letter shortcut (except `font=`/`theme=`), to override a saved default back for one message",
    ja: "オプション (メンションの後ろに自由に組み合わせ可能。例: `@MiQ color new font=pop`) — それぞれ逆の指定と1文字の短縮形があります(`font=`/`theme=`を除く)。保存済みデフォルトをその場だけ上書きできます",
  },
  optionColor: {
    en: "`color` (`c`) / `mono` (`m`) — color or grayscale avatar",
    ja: "`color` (`c`) / `mono` (`m`) — カラーまたはモノクロのアバター",
  },
  optionBold: {
    en: "`bold` (`b`) / `regular` (`r`) — bold or regular quote text",
    ja: "`bold` (`b`) / `regular` (`r`) — 太字または通常の引用文",
  },
  optionLight: {
    en: "`light` (`l`) / `dark` (`d`) — light or dark theme",
    ja: "`light` (`l`) / `dark` (`d`) — ライトまたはダークテーマ",
  },
  optionFlip: {
    en: "`flip` (`f`) / `unflip` (`u`) — avatar on the right, or back on the left (side layout only)",
    ja: "`flip` (`f`) / `unflip` (`u`) — アバターを右に配置、または左に戻す (横画像レイアウトのみ)",
  },
  optionNew: {
    en: "`new` (`n`, or `portrait`) / `classic` (or `side`, `s`) — portrait layout (avatar full-bleed, quote over the bottom) or the regular side-by-side layout",
    ja: "`new` (`n`、または `portrait`) / `classic` (または `side`、`s`) — 縦画像レイアウト (アバターを全面に、下部に引用文) または通常の横画像レイアウト",
  },
  optionFont: {
    en: "`font=<alias>` — pick a font, defaults to `mplus` (see Fonts below)",
    ja: "`font=<エイリアス>` — フォントを指定 (デフォルトは `mplus`。下記フォント一覧を参照)",
  },
  optionTheme: {
    en: "`theme=<alias>` — pick a background color, or `theme=default` to clear a saved one (see Color themes below)",
    ja: "`theme=<エイリアス>` — 背景カラーを指定。`theme=default` で保存済みの指定を解除 (下記カラーテーマ一覧を参照)",
  },
  fakequoteHint: {
    en: "`/fakequote author: message: options:` makes up a quote in someone else's name — they can block this for themselves with `/settings set`.",
    ja: "`/fakequote author: message: options:` は指定したユーザーの名前で引用文をでっち上げます。使われたくない場合は `/settings set` で自分をブロックできます。",
  },
  contextMenuHint: {
    en: 'Right-click (or long-press, or the ⋯ menu) any message and choose "Quote" to do the same without typing a mention.',
    ja: "メッセージを右クリック(または長押し、⋯メニュー)して「引用画像を作成」を選ぶと、メンションを打たずに同じことができます。",
  },
  fontsTitle: { en: "Fonts", ja: "フォント" },
  colorThemesTitle: { en: "Color themes", ja: "カラーテーマ" },
  settingsHint: {
    en: "Save your own defaults with `/settings set`, this server's with `/server-settings set` (Manage Server), or clear either with the matching `reset` command.",
    ja: "`/settings set` で自分用のデフォルトを、`/server-settings set` (サーバー管理権限が必要) でこのサーバーのデフォルトを保存できます。それぞれ対応する `reset` でリセットできます。",
  },
} satisfies Record<string, Translations>;

export function buildHelpCommand() {
  return new SlashCommandBuilder()
    .setName("help")
    .setDescription(STRINGS.description.en)
    .setDescriptionLocalizations({ ja: STRINGS.description.ja });
}

export async function runHelpCommand(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  const locale = callerLocale(interaction);
  const lines = [
    `**${t(STRINGS.title, locale)}**`,
    t(STRINGS.mention, locale),
    "",
    t(STRINGS.optionsTitle, locale),
    `- ${t(STRINGS.optionColor, locale)}`,
    `- ${t(STRINGS.optionBold, locale)}`,
    `- ${t(STRINGS.optionLight, locale)}`,
    `- ${t(STRINGS.optionFlip, locale)}`,
    `- ${t(STRINGS.optionNew, locale)}`,
    `- ${t(STRINGS.optionFont, locale)}`,
    `- ${t(STRINGS.optionTheme, locale)}`,
    "",
    `**${t(STRINGS.fontsTitle, locale)}**`,
    FONT_ALIAS_LIST,
    "",
    `**${t(STRINGS.colorThemesTitle, locale)}**`,
    COLOR_THEME_LIST,
    "",
    t(STRINGS.settingsHint, locale),
    t(STRINGS.fakequoteHint, locale),
    t(STRINGS.contextMenuHint, locale),
  ];
  await interaction.reply({ content: lines.join("\n"), ephemeral: true });
}
