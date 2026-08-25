import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  type SlashCommandSubcommandBuilder,
  type SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import { COLOR_THEME_LIST, resolveColorTheme } from "../colorThemes.js";
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
import { getAvailableLocales, isSupportedLocale, t } from "../i18n/index.js";
import type { QuoteSettings } from "../quoteOptions.js";

const EN = "en";

function d(key: string): { description: string; ja: string } {
  return { description: t(key, EN), ja: t(key, "ja") };
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
  return sub
    .addStringOption((opt) =>
      opt
        .setName("language")
        .setDescription(t("commands.options.language", EN))
        .setDescriptionLocalizations({
          ja: t("commands.options.language", "ja"),
        }),
    )
    .addStringOption((opt) =>
      opt
        .setName("font")
        .setDescription(t("commands.options.font", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.font", "ja") }),
    )
    .addStringOption((opt) =>
      opt
        .setName("theme")
        .setDescription(t("commands.options.theme", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.theme", "ja") }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("color")
        .setDescription(t("commands.options.color", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.color", "ja") }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("bold")
        .setDescription(t("commands.options.bold", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.bold", "ja") }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("light")
        .setDescription(t("commands.options.light", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.light", "ja") }),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("flip")
        .setDescription(t("commands.options.flip", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.flip", "ja") }),
    )
    .addStringOption((opt) =>
      opt
        .setName("layout")
        .setDescription(t("commands.options.layout", EN))
        .setDescriptionLocalizations({ ja: t("commands.options.layout", "ja") })
        .addChoices(
          {
            name: "side",
            value: "side",
            name_localizations: { ja: t("components.layout.toSide", "ja") },
          },
          {
            name: "portrait",
            value: "portrait",
            name_localizations: { ja: t("components.layout.toPortrait", "ja") },
          },
        ),
    )
    .addBooleanOption((opt) =>
      opt
        .setName("block-fakequote")
        .setDescription(t(`commands.options.blockFakequote.${scopeKey}`, EN))
        .setDescriptionLocalizations({
          ja: t(`commands.options.blockFakequote.${scopeKey}`, "ja"),
        }),
    );
}

/** Builds a top-level `view`/`set`/`reset` command for one settings scope. */
export function buildScopeCommand(
  name: string,
  descKey: string,
  scopeKey: "user" | "guild" | "bot",
): SlashCommandSubcommandsOnlyBuilder {
  const { description, ja } = d(`${descKey}.description`);
  const { description: vd, ja: vja } = d(`${descKey}.view.description`);
  const { description: sd, ja: sja } = d(`${descKey}.set.description`);
  const { description: rd, ja: rja } = d(`${descKey}.reset.description`);

  return new SlashCommandBuilder()
    .setName(name)
    .setDescription(description)
    .setDescriptionLocalizations({ ja })
    .addSubcommand((sub) =>
      sub
        .setName("view")
        .setDescription(vd)
        .setDescriptionLocalizations({ ja: vja }),
    )
    .addSubcommand((sub) =>
      addSetOptions(
        sub
          .setName("set")
          .setDescription(sd)
          .setDescriptionLocalizations({ ja: sja }),
        scopeKey,
      ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("reset")
        .setDescription(rd)
        .setDescriptionLocalizations({ ja: rja }),
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
  key: string,
  options?: Record<string, string>,
): Promise<void> {
  const locale = callerLocale(interaction);
  await interaction.reply({
    content: t(key, locale, options),
    ephemeral: true,
  });
}

function capitalize(text: string): string {
  return text.length ? text[0]!.toLocaleUpperCase() + text.slice(1) : text;
}

function formatBool(value: boolean | undefined, locale: string): string {
  if (value === undefined) return t("settings.values.notSet", locale);
  return t(value ? "settings.values.on" : "settings.values.off", locale);
}

function formatLayout(
  value: QuoteSettings["layout"] | undefined,
  locale: string,
): string {
  if (value === undefined) return t("settings.values.notSet", locale);
  return t(`settings.values.${value}`, locale);
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
  const scopeLabel = t(`settings.scope.${scope.key}`, locale);
  const isEmpty =
    data.language === undefined &&
    data.fakeQuoteDisabled === undefined &&
    (!data.quoteDefaults || Object.keys(data.quoteDefaults).length === 0);

  if (isEmpty) {
    await interaction.reply({
      content: t("settings.viewEmpty", locale, { scope: scopeLabel }),
      ephemeral: true,
    });
    return;
  }

  const qd = data.quoteDefaults ?? {};
  const lines = [
    `**${capitalize(t("settings.viewTitle", locale, { scope: scopeLabel }))}**`,
    `${t("settings.fields.language", locale)}: ${data.language ?? t("settings.values.notSet", locale)}`,
    `${t("settings.fields.color", locale)}: ${formatBool(qd.color, locale)}`,
    `${t("settings.fields.bold", locale)}: ${formatBool(qd.bold, locale)}`,
    `${t("settings.fields.light", locale)}: ${formatBool(qd.light, locale)}`,
    `${t("settings.fields.flip", locale)}: ${formatBool(qd.flip, locale)}`,
    `${t("settings.fields.layout", locale)}: ${formatLayout(qd.layout, locale)}`,
    `${t("settings.fields.font", locale)}: ${qd.font ?? t("settings.values.notSet", locale)}`,
    `${t("settings.fields.theme", locale)}: ${qd.colorTheme ?? t("settings.values.notSet", locale)}`,
    `${t("settings.fields.fakequoteBlocked", locale)}: ${formatBool(data.fakeQuoteDisabled, locale)}`,
  ];
  await interaction.reply({ content: lines.join("\n"), ephemeral: true });
}

async function handleReset(
  interaction: ChatInputCommandInteraction,
  scope: Scope,
): Promise<void> {
  await scope.reset();
  const locale = callerLocale(interaction);
  const scopeLabel = t(`settings.scope.${scope.key}`, locale);
  await interaction.reply({
    content: t("settings.resetSuccess", locale, { scope: scopeLabel }),
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
  const blockFakequote = interaction.options.getBoolean("block-fakequote");

  if (
    language === null &&
    font === null &&
    theme === null &&
    color === null &&
    bold === null &&
    light === null &&
    flip === null &&
    layout === null &&
    blockFakequote === null
  ) {
    await interaction.reply({
      content: t("settings.errors.noOptions", locale),
      ephemeral: true,
    });
    return;
  }

  if (language !== null && !isSupportedLocale(language)) {
    await interaction.reply({
      content: t("settings.errors.invalidLocale", locale, {
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
        content: t("settings.errors.invalidFont", locale, {
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
        content: t("settings.errors.invalidTheme", locale, {
          token: theme,
          themes: COLOR_THEME_LIST,
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
  if (resolvedFont !== undefined) quoteDefaults.font = resolvedFont;
  if (resolvedTheme !== undefined) quoteDefaults.colorTheme = resolvedTheme;

  await scope.set({
    ...(language !== null ? { language } : {}),
    ...(Object.keys(quoteDefaults).length ? { quoteDefaults } : {}),
    ...(blockFakequote !== null ? { fakeQuoteDisabled: blockFakequote } : {}),
  });

  const newLocale = callerLocale(interaction);
  const scopeLabel = t(`settings.scope.${scope.key}`, newLocale);
  await interaction.reply({
    content: t("settings.setSuccess", newLocale, { scope: scopeLabel }),
    ephemeral: true,
  });
}
