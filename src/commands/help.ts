import {
  ActionRowBuilder,
  type ButtonInteraction,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { COLOR_THEME_LIST } from "../colorThemes.js";
import { FONT_ALIAS_LIST } from "../fonts.js";
import { t, type Translations } from "../i18n/index.js";
import { callerLocale } from "./scope.js";

const STRINGS = {
  description: { en: "Show how to use the bot", ja: "Botの使い方を表示" },
  title: { en: "MiQ Bot help", ja: "MiQ Bot ヘルプ" },
  pageFooter: {
    en: "Page {{page}} / {{total}}",
    ja: "ページ {{page}} / {{total}}",
  },
  basicsTitle: { en: "📌 Quoting a message", ja: "📌 メッセージを引用する" },
  basics: {
    en: "Reply to a message and mention this bot — the message becomes a quote image.\nRight-click (long-press / ⋯ menu) → **Quote** works too.",
    ja: "メッセージにリプライした状態でこのBotをメンションすると、引用画像になります。\n右クリック(長押し・⋯メニュー)→「引用画像を作成」でもOKです。",
  },
  commandsTitle: { en: "🤖 Commands", ja: "🤖 コマンド" },
  commands: {
    en: "`/settings` — your own defaults\n`/server-settings` — this server's defaults (Manage Server)\n`/fakequote` — make up a quote in someone's name\n`/admin` — bot-wide defaults (bot admins only)\n`/help` — this help",
    ja: "`/settings` — あなたのデフォルト設定\n`/server-settings` — サーバーのデフォルト設定 (要サーバー管理権限)\n`/fakequote` — 誰かの名前で架空の引用を作る\n`/admin` — Bot全体のデフォルト設定 (Bot管理者のみ)\n`/help` — このヘルプ",
  },
  optionsTitle: { en: "⚙️ Mention options", ja: "⚙️ メンションのオプション" },
  optionsIntro: {
    en: "Combine freely after the mention, e.g. `@MiQ color new font=pop`. Every toggle has a one-letter shortcut.",
    ja: "メンションの後ろに自由に組み合わせられます。例: `@MiQ color new font=pop`。トグルには1文字の短縮形があります。",
  },
  optionColor: {
    en: "Color / grayscale avatar",
    ja: "カラー / モノクロのアバター",
  },
  optionBold: {
    en: "Bold / regular quote text",
    ja: "太字 / 通常の引用文",
  },
  optionLight: { en: "Light / dark theme", ja: "ライト / ダークテーマ" },
  optionFlip: {
    en: "Avatar on the right / back on the left (side layout only)",
    ja: "アバターを右 / 左に配置 (横画像のみ)",
  },
  optionNew: {
    en: "Portrait / side-by-side layout",
    ja: "縦画像 / 横画像レイアウト",
  },
  optionFont: {
    en: "Pick a font — see page 3",
    ja: "フォントを指定 — 3ページ目を参照",
  },
  optionTheme: {
    en: "Background color, `theme=default` clears it — see page 3",
    ja: "背景カラーを指定。`theme=default` で解除 — 3ページ目を参照",
  },
  fontsTitle: {
    en: "🔤 Fonts — `font=<alias>`",
    ja: "🔤 フォント — `font=<エイリアス>`",
  },
  colorThemesTitle: {
    en: "🎨 Color themes — `theme=<alias>`",
    ja: "🎨 カラーテーマ — `theme=<エイリアス>`",
  },
  defaultsTitle: { en: "💾 Saving defaults", ja: "💾 デフォルトの保存" },
  defaults: {
    en: "`/settings set` saves your own defaults, `/server-settings set` this server's (Manage Server). The matching `reset` command clears them.",
    ja: "`/settings set` で自分の、`/server-settings set` でサーバーのデフォルトを保存できます (要サーバー管理権限)。対応する `reset` コマンドで解除できます。",
  },
  fakequoteTitle: { en: "🎭 /fakequote", ja: "🎭 /fakequote" },
  fakequote: {
    en: "`/fakequote author: message:` makes up a quote in someone else's name. Don't want it used on you? Block it with `/settings set`.",
    ja: "`/fakequote author: message:` は指定したユーザーの名前で引用文をでっち上げます。使われたくない人は `/settings set` でブロックできます。",
  },
  prev: { en: "Prev", ja: "前へ" },
  next: { en: "Next", ja: "次へ" },
  close: { en: "Close", ja: "閉じる" },
  closed: { en: "Help closed.", ja: "ヘルプを閉じました。" },
  notYours: {
    en: "This help message belongs to someone else — run `/help` for your own.",
    ja: "このヘルプは別のユーザーのものです。自分のものは `/help` で表示できます。",
  },
} satisfies Record<string, Translations>;

const EMBED_COLOR = 0x58_65_f2;

/** Prefix shared by every help-pagination button's custom ID. */
export const HELP_BUTTON_PREFIX = "miq:help:";

/** What a help-pagination button's custom ID encodes, once parsed. */
interface HelpButtonId {
  action: "prev" | "next" | "close";
  /** The page the button was rendered on (0-based). */
  page: number;
  /** The locale the help was rendered in — pages rebuild in the same one. */
  locale: string;
  /** Who asked for the help; only they may page through or close it. */
  requesterId: string;
}

/**
 * Help pagination is stateless: the current page, the locale, and the
 * requester's ID all live in the button's custom ID, so pages rebuild from
 * scratch on every click and survive a restart (unlike quote state).
 */
function helpButtonId(id: HelpButtonId): string {
  return `${HELP_BUTTON_PREFIX}${id.action}:${id.page}:${id.locale}:${id.requesterId}`;
}

/** The inverse of {@link helpButtonId} — `null` for anything malformed. */
export function parseHelpButtonId(customId: string): HelpButtonId | null {
  const [miq, help, action, pageText, locale, requesterId, ...rest] =
    customId.split(":");
  if (miq !== "miq" || help !== "help" || rest.length > 0) return null;
  if (action !== "prev" && action !== "next" && action !== "close") {
    return null;
  }
  if (!pageText || !locale || !requesterId) return null;
  const page = Number.parseInt(pageText, 10);
  if (!Number.isInteger(page) || page < 0) return null;
  return { action, page, locale, requesterId };
}

/**
 * The help's pages: basics + commands, mention options, then fonts, color
 * themes, and the settings/fakequote notes. Kept to three so every page
 * stays readable at a glance — the old single plain-text dump crammed all
 * of this into one wall of text.
 */
function buildHelpPages(locale: string): EmbedBuilder[] {
  const pages = [
    new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(t(STRINGS.title, locale))
      .addFields(
        {
          name: t(STRINGS.basicsTitle, locale),
          value: t(STRINGS.basics, locale),
        },
        {
          name: t(STRINGS.commandsTitle, locale),
          value: t(STRINGS.commands, locale),
        },
      ),
    new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(t(STRINGS.title, locale))
      .addFields(
        {
          name: t(STRINGS.optionsTitle, locale),
          value: t(STRINGS.optionsIntro, locale),
        },
        {
          name: "`color` (`c`) / `mono` (`m`)",
          value: t(STRINGS.optionColor, locale),
          inline: true,
        },
        {
          name: "`bold` (`b`) / `regular` (`r`)",
          value: t(STRINGS.optionBold, locale),
          inline: true,
        },
        {
          name: "`light` (`l`) / `dark` (`d`)",
          value: t(STRINGS.optionLight, locale),
          inline: true,
        },
        {
          name: "`flip` (`f`) / `unflip` (`u`)",
          value: t(STRINGS.optionFlip, locale),
          inline: true,
        },
        {
          name: "`new` (`n`) / `side` (`s`)",
          value: t(STRINGS.optionNew, locale),
          inline: true,
        },
        {
          name: "`font=<alias>`",
          value: t(STRINGS.optionFont, locale),
          inline: true,
        },
        {
          name: "`theme=<alias>`",
          value: t(STRINGS.optionTheme, locale),
          inline: true,
        },
      ),
    new EmbedBuilder()
      .setColor(EMBED_COLOR)
      .setTitle(t(STRINGS.title, locale))
      .addFields(
        {
          name: t(STRINGS.fontsTitle, locale),
          value: FONT_ALIAS_LIST,
        },
        {
          name: t(STRINGS.colorThemesTitle, locale),
          value: COLOR_THEME_LIST,
        },
        {
          name: t(STRINGS.defaultsTitle, locale),
          value: t(STRINGS.defaults, locale),
        },
        {
          name: t(STRINGS.fakequoteTitle, locale),
          value: t(STRINGS.fakequote, locale),
        },
      ),
  ];

  return pages.map((page, index) =>
    page.setFooter({
      text: t(STRINGS.pageFooter, locale, {
        page: String(index + 1),
        total: String(pages.length),
      }),
    }),
  );
}

/**
 * The embed + pagination row shown at a given page, for both `/help` and
 * the ❓-reaction help reply. `page` is clamped, so a stale button from
 * before a page-count change can't index out of bounds.
 */
export function buildHelpMessagePayload(
  locale: string,
  page: number,
  requesterId: string,
): {
  embeds: EmbedBuilder[];
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  const pages = buildHelpPages(locale);
  const current = Math.min(Math.max(page, 0), pages.length - 1);
  const embed = pages[current];
  // Unreachable — `current` is clamped into range and the page list is never
  // empty — but keeps the type honest without a non-null assertion.
  if (!embed) return { embeds: [], components: [] };

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(
        helpButtonId({ action: "prev", page: current, locale, requesterId }),
      )
      .setLabel(t(STRINGS.prev, locale))
      .setEmoji("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current === 0),
    new ButtonBuilder()
      .setCustomId(
        helpButtonId({ action: "next", page: current, locale, requesterId }),
      )
      .setLabel(t(STRINGS.next, locale))
      .setEmoji("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(current === pages.length - 1),
    new ButtonBuilder()
      .setCustomId(
        helpButtonId({ action: "close", page: current, locale, requesterId }),
      )
      .setLabel(t(STRINGS.close, locale))
      .setEmoji("🗑️")
      .setStyle(ButtonStyle.Secondary),
  );

  return { embeds: [embed], components: [row] };
}

/** A click on one of the help message's pagination buttons. */
export async function handleHelpButton(
  interaction: ButtonInteraction,
): Promise<void> {
  const parsed = parseHelpButtonId(interaction.customId);
  if (!parsed) return;

  if (interaction.user.id !== parsed.requesterId) {
    await interaction.reply({
      content: t(STRINGS.notYours, parsed.locale),
      ephemeral: true,
    });
    return;
  }

  if (parsed.action === "close") {
    await interaction.update({
      content: t(STRINGS.closed, parsed.locale),
      embeds: [],
      components: [],
    });
    return;
  }

  const delta = parsed.action === "prev" ? -1 : 1;
  await interaction.update(
    buildHelpMessagePayload(
      parsed.locale,
      parsed.page + delta,
      parsed.requesterId,
    ),
  );
}

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
  await interaction.reply({
    ...buildHelpMessagePayload(locale, 0, interaction.user.id),
    ephemeral: true,
  });
}
