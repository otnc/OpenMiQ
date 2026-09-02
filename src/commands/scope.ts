import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandSubcommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { ALL_COLOR_THEME_LIST, resolveColorTheme } from "../colorThemes.js";
import { LAYOUT_LABELS } from "../components.js";
import {
  getBotDefaults,
  getGuildSettings,
  getUserSettings,
  resetBotDefaults,
  resetGuildSettings,
  resetUserSettings,
  resolveLocale,
  setBotDefaults,
  setGuildSettings,
  setUserSettings,
  type ScopeSettings,
} from "../config/settings.js";
import { FONT_ALIAS_LIST, resolveFontAlias } from "../fonts.js";
import {
  getAvailableLocales,
  isSupportedLocale,
  t,
  type Translations,
} from "../i18n/index.js";
import type { QuoteSettings } from "../quoteOptions.js";

const STRINGS = {
  optionLanguage: {
    en: "Language code (see /help)",
    ja: "言語コード (/help を参照)",
  },
  optionFont: {
    en: "Font alias (see /help)",
    ja: "フォントのエイリアス (/help を参照)",
  },
  optionTheme: {
    en: "Color theme alias (see /help)",
    ja: "カラーテーマのエイリアス (/help を参照)",
  },
  optionColor: {
    en: "Keep the avatar in color",
    ja: "アバターをカラーのままにする",
  },
  optionBold: { en: "Bold quote text", ja: "引用文を太字にする" },
  optionLight: { en: "Light theme", ja: "ライトテーマ" },
  optionFlip: {
    en: "Avatar on the right (side layout only)",
    ja: "アバターを右側に配置 (横画像のみ)",
  },
  optionLayout: {
    en: "side or new",
    ja: "side (横画像) または new (縦画像)",
  },
  optionChain: {
    en: "Stack with the message it's replying to, when there is one (side layout only)",
    ja: "返信元があれば連結して表示する (横画像のみ)",
  },
  blockFakequoteUser: {
    en: "Block others from putting words in your mouth with /fakequote",
    ja: "/fakequote であなたの名前を使われるのをブロックする",
  },
  blockFakequoteGuild: {
    en: "Disable /fakequote in this server",
    ja: "このサーバーで /fakequote を無効化する",
  },
  blockFakequoteBot: {
    en: "Disable /fakequote bot-wide",
    ja: "Bot全体で /fakequote を無効化する",
  },
  optionDeleteButton: {
    en: "Show a delete button under posted quotes (on by default)",
    ja: "投稿された引用画像に削除ボタンを表示する (デフォルトはオン)",
  },
  optionFakeLabel: {
    en: 'Mark your /fakequote renders as "(fake) @user" (on by default)',
    ja: '自分の /fakequote に "(fake) @user" の表示を付ける (デフォルトはオン)',
  },

  scopeUser: { en: "your", ja: "あなたの" },
  scopeGuild: { en: "this server's", ja: "このサーバーの" },
  scopeBot: { en: "the bot's", ja: "Botの" },

  fieldLanguage: { en: "Language", ja: "言語" },
  fieldColor: { en: "Color", ja: "カラー" },
  fieldBold: { en: "Bold", ja: "太字" },
  fieldLight: { en: "Light theme", ja: "ライトテーマ" },
  fieldFlip: { en: "Flip", ja: "反転" },
  fieldLayout: { en: "Layout", ja: "レイアウト" },
  fieldChain: { en: "Chain", ja: "連結" },
  fieldFont: { en: "Font", ja: "フォント" },
  fieldTheme: { en: "Color theme", ja: "カラーテーマ" },
  fieldFakequoteBlocked: { en: "Fakequote blocked", ja: "Fakequoteのブロック" },
  fieldDeleteButton: { en: "Delete button", ja: "削除ボタン" },
  fieldFakeLabel: { en: "Fake label", ja: "Fakeの表示" },

  valueOn: { en: "on", ja: "オン" },
  valueOff: { en: "off", ja: "オフ" },
  valueNotSet: { en: "not set", ja: "未設定" },
  valueSide: { en: "side", ja: "横画像" },
  valueNew: { en: "new", ja: "縦画像" },

  viewTitle: { en: "{{scope}} defaults", ja: "{{scope}}デフォルト" },
  viewEmpty: {
    en: "{{scope}} defaults aren't set — using the fallback for everything.",
    ja: "{{scope}}デフォルトは設定されていません。すべてフォールバック値が使われます。",
  },
  setSuccess: {
    en: "Saved {{scope}} defaults.",
    ja: "{{scope}}デフォルトを保存しました。",
  },
  resetSuccess: {
    en: "Reset {{scope}} defaults.",
    ja: "{{scope}}デフォルトをリセットしました。",
  },

  errorGuildOnly: {
    en: "This can only be used in a server.",
    ja: "この操作はサーバー内でのみ実行できます。",
  },
  errorPermissionDenied: {
    en: "You need the Manage Server permission to do this.",
    ja: "この操作には「サーバーの管理」権限が必要です。",
  },
  errorAdminOnly: {
    en: "Only bot admins can do this.",
    ja: "この操作はBot管理者のみ実行できます。",
  },
  errorInvalidLocale: {
    en: 'Unknown language "{{locale}}". Available: {{locales}}.',
    ja: '不明な言語です: "{{locale}}"。利用可能: {{locales}}',
  },
  errorInvalidFont: {
    en: 'Unknown font "{{token}}". Available: {{aliases}}.',
    ja: '不明なフォントです: "{{token}}"。利用可能: {{aliases}}',
  },
  errorInvalidTheme: {
    en: 'Unknown color theme "{{token}}". Available: {{themes}}.',
    ja: '不明なカラーテーマです: "{{token}}"。利用可能: {{themes}}',
  },
  errorNoOptions: {
    en: "Give at least one option to set.",
    ja: "少なくとも1つオプションを指定してください。",
  },
} satisfies Record<string, Translations>;

/** Error messages `/settings`, `/server-settings` and `/admin` each need before dispatching into a shared scope. */
export const SCOPE_ERRORS = {
  guildOnly: STRINGS.errorGuildOnly,
  permissionDenied: STRINGS.errorPermissionDenied,
  adminOnly: STRINGS.errorAdminOnly,
};

const SCOPE_LABEL: Record<"user" | "guild" | "bot", Translations> = {
  user: STRINGS.scopeUser,
  guild: STRINGS.scopeGuild,
  bot: STRINGS.scopeBot,
};

const BLOCK_FAKEQUOTE_OPTION: Record<"user" | "guild" | "bot", Translations> = {
  user: STRINGS.blockFakequoteUser,
  guild: STRINGS.blockFakequoteGuild,
  bot: STRINGS.blockFakequoteBot,
};

/** The command description/subcommand-description strings a scope command supplies to {@link buildScopeCommand}. */
export interface ScopeCommandDescriptions {
  command: Translations;
  view: Translations;
  set: Translations;
  reset: Translations;
}

/**
 * A settings scope — user, guild, or bot — abstracted so `/settings`,
 * `/server-settings` and `/admin` can share one `view`/`set`/`reset`
 * implementation.
 */
export interface Scope {
  key: "user" | "guild" | "bot";
  get: () => ScopeSettings;
  set: (patch: ScopeSettings) => Promise<void>;
  reset: () => Promise<void>;
}

export function userScope(interaction: ChatInputCommandInteraction): Scope {
  const userId = interaction.user.id;
  return {
    key: "user",
    get: () => getUserSettings(userId),
    set: (patch) => setUserSettings(userId, patch),
    reset: () => resetUserSettings(userId),
  };
}

export function guildScope(guildId: string): Scope {
  return {
    key: "guild",
    get: () => getGuildSettings(guildId),
    set: (patch) => setGuildSettings(guildId, patch),
    reset: () => resetGuildSettings(guildId),
  };
}

export function botScope(): Scope {
  return {
    key: "bot",
    get: () => getBotDefaults(),
    set: (patch) => setBotDefaults(patch),
    reset: () => resetBotDefaults(),
  };
}

function addSetOptions(
  sub: SlashCommandSubcommandBuilder,
  scopeKey: "user" | "guild" | "bot",
): SlashCommandSubcommandBuilder {
  const withCommonOptions = sub
    .addStringOption((opt) =>
      opt
        .setName("language")
        .setDescription(STRINGS.optionLanguage.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionLanguage.ja }),
    )
    .addStringOption((opt) =>
      opt
        .setName("font")
        .setDescription(STRINGS.optionFont.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionFont.ja }),
    )
    .addStringOption((opt) =>
      opt
        .setName("theme")
        .setDescription(STRINGS.optionTheme.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionTheme.ja }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("color")
        .setDescription(STRINGS.optionColor.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionColor.ja }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("bold")
        .setDescription(STRINGS.optionBold.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionBold.ja }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("light")
        .setDescription(STRINGS.optionLight.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionLight.ja }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("flip")
        .setDescription(STRINGS.optionFlip.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionFlip.ja }),
    )
    .addStringOption((opt) =>
      opt
        .setName("layout")
        .setDescription(STRINGS.optionLayout.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionLayout.ja })
        .addChoices(
          {
            name: "side",
            value: "side",
            name_localizations: { ja: LAYOUT_LABELS.toSide.ja },
          },
          {
            name: "new",
            value: "new",
            name_localizations: { ja: LAYOUT_LABELS.toNew.ja },
          },
        ),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("chain")
        .setDescription(STRINGS.optionChain.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionChain.ja }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("block-fakequote")
        .setDescription(BLOCK_FAKEQUOTE_OPTION[scopeKey].en)
        .setDescriptionLocalizations({
          ja: BLOCK_FAKEQUOTE_OPTION[scopeKey].ja,
        }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("fake-label")
        .setDescription(STRINGS.optionFakeLabel.en)
        .setDescriptionLocalizations({ ja: STRINGS.optionFakeLabel.ja }),
    );

  // A moderation setting, not a personal preference — only for
  // /server-settings and /admin, not /settings.
  if (scopeKey === "user") return withCommonOptions;
  return withCommonOptions.addBooleanOption((opt) =>
    opt
      .setName("delete-button")
      .setDescription(STRINGS.optionDeleteButton.en)
      .setDescriptionLocalizations({ ja: STRINGS.optionDeleteButton.ja }),
  );
}

/** Builds a top-level `view`/`set`/`reset` command for one settings scope. */
export function buildScopeCommand(
  name: string,
  descriptions: ScopeCommandDescriptions,
  scopeKey: "user" | "guild" | "bot",
): SlashCommandSubcommandsOnlyBuilder {
  return new SlashCommandBuilder()
    .setName(name)
    .setDescription(descriptions.command.en)
    .setDescriptionLocalizations({ ja: descriptions.command.ja })
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription(descriptions.view.en)
        .setDescriptionLocalizations({ ja: descriptions.view.ja }),
    )
    .addSubcommand((sub) =>
      addSetOptions(
        sub
          .setName("set")
          .setDescription(descriptions.set.en)
          .setDescriptionLocalizations({ ja: descriptions.set.ja }),
        scopeKey,
      ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription(descriptions.reset.en)
        .setDescriptionLocalizations({ ja: descriptions.reset.ja }),
    );
}

export function callerLocale(interaction: ChatInputCommandInteraction): string {
  return resolveLocale({
    userId: interaction.user.id,
    guildId: interaction.guildId,
  });
}

export async function reply(
  interaction: ChatInputCommandInteraction,
  entry: Translations,
  vars?: Record<string, string>,
): Promise<void> {
  const locale = callerLocale(interaction);
  await interaction.reply({
    content: t(entry, locale, vars),
    ephemeral: true,
  });
}

function capitalize(text: string): string {
  return text.length ? text[0]!.toLocaleUpperCase() + text.slice(1) : text;
}

function formatBool(value: boolean | undefined, locale: string): string {
  if (value === undefined) return t(STRINGS.valueNotSet, locale);
  return t(value ? STRINGS.valueOn : STRINGS.valueOff, locale);
}

function formatLayout(
  value: QuoteSettings["layout"] | undefined,
  locale: string,
): string {
  if (value === undefined) return t(STRINGS.valueNotSet, locale);
  return t(value === "side" ? STRINGS.valueSide : STRINGS.valueNew, locale);
}

/** Dispatches `view`/`set`/`reset` for a `/settings`, `/server-settings` or `/admin` invocation. */
export async function runScopeCommand(
  interaction: ChatInputCommandInteraction,
  scope: Scope,
): Promise<void> {
  const sub = interaction.options.getSubcommand(true);
  if (sub === "view") {
    await handleView(interaction, scope);
  } else if (sub === "set") {
    await handleSet(interaction, scope);
  } else if (sub === "reset") {
    await handleReset(interaction, scope);
  }
}

async function handleView(
  interaction: ChatInputCommandInteraction,
  scope: Scope,
): Promise<void> {
  const locale = callerLocale(interaction);
  const data = scope.get();
  const scopeLabel = t(SCOPE_LABEL[scope.key], locale);
  const isEmpty =
    data.language === undefined &&
    data.fakeQuoteDisabled === undefined &&
    data.fakeQuoteLabelDisabled === undefined &&
    data.deleteButtonDisabled === undefined &&
    (!data.quoteDefaults || Object.keys(data.quoteDefaults).length === 0);

  if (isEmpty) {
    await interaction.reply({
      content: t(STRINGS.viewEmpty, locale, { scope: scopeLabel }),
      ephemeral: true,
    });
    return;
  }

  const qd = data.quoteDefaults ?? {};
  const lines = [
    `**${capitalize(t(STRINGS.viewTitle, locale, { scope: scopeLabel }))}**`,
    `${t(STRINGS.fieldLanguage, locale)}: ${data.language ?? t(STRINGS.valueNotSet, locale)}`,
    `${t(STRINGS.fieldColor, locale)}: ${formatBool(qd.color, locale)}`,
    `${t(STRINGS.fieldBold, locale)}: ${formatBool(qd.bold, locale)}`,
    `${t(STRINGS.fieldLight, locale)}: ${formatBool(qd.light, locale)}`,
    `${t(STRINGS.fieldFlip, locale)}: ${formatBool(qd.flip, locale)}`,
    `${t(STRINGS.fieldLayout, locale)}: ${formatLayout(qd.layout, locale)}`,
    `${t(STRINGS.fieldChain, locale)}: ${formatBool(qd.chain, locale)}`,
    `${t(STRINGS.fieldFont, locale)}: ${qd.font ?? t(STRINGS.valueNotSet, locale)}`,
    `${t(STRINGS.fieldTheme, locale)}: ${qd.colorTheme ?? t(STRINGS.valueNotSet, locale)}`,
    `${t(STRINGS.fieldFakequoteBlocked, locale)}: ${formatBool(data.fakeQuoteDisabled, locale)}`,
    `${t(STRINGS.fieldFakeLabel, locale)}: ${formatBool(
      data.fakeQuoteLabelDisabled === undefined
        ? undefined
        : !data.fakeQuoteLabelDisabled,
      locale,
    )}`,
    ...(scope.key === "user"
      ? []
      : [
          `${t(STRINGS.fieldDeleteButton, locale)}: ${formatBool(
            data.deleteButtonDisabled === undefined
              ? undefined
              : !data.deleteButtonDisabled,
            locale,
          )}`,
        ]),
  ];
  await interaction.reply({ content: lines.join("\n"), ephemeral: true });
}

async function handleReset(
  interaction: ChatInputCommandInteraction,
  scope: Scope,
): Promise<void> {
  await scope.reset();
  const locale = callerLocale(interaction);
  const scopeLabel = t(SCOPE_LABEL[scope.key], locale);
  await interaction.reply({
    content: t(STRINGS.resetSuccess, locale, { scope: scopeLabel }),
    ephemeral: true,
  });
}

async function handleSet(
  interaction: ChatInputCommandInteraction,
  scope: Scope,
): Promise<void> {
  const locale = callerLocale(interaction);
  const language = interaction.options.getString("language");
  const font = interaction.options.getString("font");
  const theme = interaction.options.getString("theme");
  const color = interaction.options.getBoolean("color");
  const bold = interaction.options.getBoolean("bold");
  const light = interaction.options.getBoolean("light");
  const flip = interaction.options.getBoolean("flip");
  const layout = interaction.options.getString("layout") as
    QuoteSettings["layout"] | null;
  const chain = interaction.options.getBoolean("chain");
  const blockFakequote = interaction.options.getBoolean("block-fakequote");
  const fakeLabel = interaction.options.getBoolean("fake-label");
  const deleteButton = interaction.options.getBoolean("delete-button");

  if (
    language === null &&
    font === null &&
    theme === null &&
    color === null &&
    bold === null &&
    light === null &&
    flip === null &&
    layout === null &&
    chain === null &&
    blockFakequote === null &&
    fakeLabel === null &&
    deleteButton === null
  ) {
    await interaction.reply({
      content: t(STRINGS.errorNoOptions, locale),
      ephemeral: true,
    });
    return;
  }

  if (language !== null && !isSupportedLocale(language)) {
    await interaction.reply({
      content: t(STRINGS.errorInvalidLocale, locale, {
        locale: language,
        locales: getAvailableLocales().join(", "),
      }),
      ephemeral: true,
    });
    return;
  }

  let resolvedFont: string | undefined;
  if (font !== null) {
    const alias = resolveFontAlias(font);
    if (!alias) {
      await interaction.reply({
        content: t(STRINGS.errorInvalidFont, locale, {
          token: font,
          aliases: FONT_ALIAS_LIST,
        }),
        ephemeral: true,
      });
      return;
    }
    resolvedFont = alias;
  }

  let resolvedTheme: string | undefined;
  if (theme !== null) {
    const key = resolveColorTheme(theme);
    if (!key) {
      await interaction.reply({
        content: t(STRINGS.errorInvalidTheme, locale, {
          token: theme,
          themes: ALL_COLOR_THEME_LIST,
        }),
        ephemeral: true,
      });
      return;
    }
    resolvedTheme = key;
  }

  const quoteDefaults: Partial<QuoteSettings> = {};
  if (color !== null) quoteDefaults.color = color;
  if (bold !== null) quoteDefaults.bold = bold;
  if (light !== null) quoteDefaults.light = light;
  if (flip !== null) quoteDefaults.flip = flip;
  if (layout !== null) quoteDefaults.layout = layout;
  if (chain !== null) quoteDefaults.chain = chain;
  if (resolvedFont !== undefined) quoteDefaults.font = resolvedFont;
  if (resolvedTheme !== undefined) quoteDefaults.colorTheme = resolvedTheme;

  await scope.set({
    ...(language !== null ? { language } : {}),
    ...(Object.keys(quoteDefaults).length ? { quoteDefaults } : {}),
    ...(blockFakequote !== null ? { fakeQuoteDisabled: blockFakequote } : {}),
    ...(fakeLabel !== null ? { fakeQuoteLabelDisabled: !fakeLabel } : {}),
    ...(deleteButton !== null ? { deleteButtonDisabled: !deleteButton } : {}),
  });

  const newLocale = callerLocale(interaction);
  const scopeLabel = t(SCOPE_LABEL[scope.key], newLocale);
  await interaction.reply({
    content: t(STRINGS.setSuccess, newLocale, { scope: scopeLabel }),
    ephemeral: true,
  });
}
