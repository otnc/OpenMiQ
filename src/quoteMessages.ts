import type { Translations } from "./i18n/index.js";

/**
 * User-facing messages shared by every place that can turn a message into a
 * quote: the mention handler, `/fakequote`, the "Quote" context-menu
 * command, and the buttons under an already-posted quote.
 */
export const QUOTE_MESSAGES = {
  noText: {
    en: "This message has no text to quote.",
    ja: "このメッセージには引用できるテキストがありません。",
  },
  expired: {
    en: "Couldn't find this quote's data — it was generated before the last restart, so it can't be regenerated.",
    ja: "この引用の情報が見つかりませんでした。Botの再起動前に生成された画像のため、再生成できません。",
  },
  unknownFont: {
    en: 'Unknown font "{{token}}". Available: {{aliases}}.',
    ja: '不明なフォントです: "{{token}}"。利用可能: {{aliases}}',
  },
  unknownTheme: {
    en: 'Unknown color theme "{{token}}". Available: {{themes}}.',
    ja: '不明なカラーテーマです: "{{token}}"。利用可能: {{themes}}',
  },
} satisfies Record<string, Translations>;
