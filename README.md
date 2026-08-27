# Open MiQ Bot

[![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

_[日本語](./README-ja.md)_

A self-hosted Discord bot that turns a message into a quote image.

Reply to a message and mention the bot (or right-click it and choose "Quote"): it renders that message as a quote image (via [makeitaquote](https://github.com/otnc/makeitaquote)) and replies with it.

## Usage

**Mention the bot in a reply**, with optional options after the mention:

```
@MiQ                            … quote the replied-to message
@MiQ color                      … keep the avatar in color
@MiQ bold                       … bold quote text
@MiQ light                      … light theme
@MiQ flip                       … avatar on the right (side layout only)
@MiQ new                        … portrait layout — avatar full-bleed, quote over the bottom —
                                    also resets a saved flip default back off
@MiQ font=pop                   … pick a font by alias
@MiQ theme=sunset               … pick a named background color
@MiQ theme=default              … clear a saved color-theme default for this message
@MiQ theme=sunset new font=pop  … options combine freely — put font= last, it reads to the end
@MiQ new flip                   … …flip after new overrides that reset, but still has no visual
                                    effect — makeitaquote's portrait layout ignores avatar side
@MiQ c b l f n                  … same as "color bold light flip new" — every option below
                                    also has a one-letter shortcut
@MiQ c,n                        … commas work as separators too, with or without spaces —
                                    same as "c n" or "c, n"
```

Every toggle has an opposite (and a one-letter shortcut, except `font=`/`theme=`), so a saved default (see Slash commands below) can be overridden back for a single message even when it's already on:

| Option                | Shortcut | Opposite              | Shortcut |
| --------------------- | -------- | --------------------- | -------- |
| `color`               | `c`      | `mono`                | `m`      |
| `bold`                | `b`      | `regular`             | `r`      |
| `light`               | `l`      | `dark`                | `d`      |
| `flip`                | `f`      | `unflip`              | `u`      |
| `new` (or `portrait`) | `n`      | `side` (or `classic`) | `s`      |

**Or right-click (long-press on mobile) any message → Apps → Quote** — same result, no typing, but it always uses your saved defaults (see below) since there's nowhere to type options.

Mentioning the bot without replying to anything reacts with ❓ instead of sending (and then deleting) a usage message — press that reaction within a minute and it replies with `/help`'s text.

Fonts are chosen by short alias — `makeitaquote`'s own `FONT_ALIASES`: `sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`, `serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`, `script`, `castoro`. An exact makeitaquote family name (e.g. `font="Dela Gothic One"`) also works, and `mplus` (M PLUS Rounded 1c) is the bot's own default when nothing else picks one. `theme=` picks one of 21 named background colors (`sunset`, `forest`, `midnight_blurple`, …), matching the [official Make it a Quote bot's own theme list](https://wiki.neody.land/wiki/Make_it_a_Quote/Themes) — its full key, that key with underscores dropped (`midnightblurple`), and its short code where it has one (`mb`) all resolve the same way. Each theme comes with its own fixed text color for contrast, so `light`/`dark` has no effect once one is set (same idea as `flip` and portrait) — `theme=default` (or its own aliases `theme=def`, `theme=b`, `theme=w`) clears a saved default back to none. Run `/help` for the full, localized lists of both. The color-theme select menu previews each one as a small gradient emoji, once `pnpm run deploy:images` (or `deploy`) has created them as application emoji — it falls back to plain text options until then.

A mention reply shows a "Generating…" placeholder (with its own animated emoji, also from `deploy:images`) while the image renders, then gets edited in place with the result.

Every quote image carries the bot's own Discord tag as a small watermark in the corner.

The posted image comes with buttons (🎨 color / 🅱️ bold / 🔄 flip / ☀️ theme / layout) and font/color-theme select menus that re-render in place when used, plus — unless turned off, see Slash commands below — a 🗑️ delete button. Only the person who generated the quote or the person it's about (the quoted message's author, or `/fakequote`'s `author:`) can press it; it edits the message to drop the image and components rather than actually deleting it, so a `SAVE_IMAGES_DIR` copy (if any) is untouched.

> Regenerating from the buttons relies on in-memory state, so it stops working for a given image after the bot restarts.

### Slash commands

Each is its own top-level command (not grouped under a shared prefix), so a server can enable or disable them individually from Discord's integration settings.

- `/settings view|set|reset` — your own default quote options and language, applied whenever you don't specify them after a mention (or always, for the right-click "Quote" command). Also has `fake-label:false` to drop the "(fake)" marker from your own `/fakequote` renders (on by default).
- `/server-settings view|set|reset` — this server's defaults (requires the Manage Server permission). Also has `delete-button:false` to hide the delete button server-wide (on by default), and `fake-label:false` to drop the marker server-wide.
- `/admin view|set|reset` — the bot's own fallback defaults (only for the Discord user IDs listed in `ADMIN_IDS`). Same `delete-button:false` and `fake-label:false` options, bot-wide.
- `/help` — usage help in your resolved language.
- `/fakequote author: message: options:` — makes a quote image in someone else's name and avatar, with fabricated text. `options` takes the same syntax as after a mention (`color`, `new`, `font=pop`, …). To keep a fabricated quote from being mistaken for a real one, its username line reads "(fake) @user" instead of the usual "@user" — the person running the command can turn this off for their own fakequotes with `fake-label:false` (see the settings commands above), and a server or the bot admins can force it off too. Anyone can also be protected from being impersonated at all: the target author can block being used with `/settings set block-fakequote:true`, a server can turn it off entirely with `/server-settings set block-fakequote:true`, and bot admins can disable it everywhere with `/admin set block-fakequote:true`.

Defaults are resolved as: options typed after a mention > your settings > this server's settings > the bot's own defaults > built-in fallback (the right-click "Quote" command skips straight to your settings, since it has no options step). The same order picks which language a reply is shown in.

## Required

- Node.js v24 or later
  - `fnm` or `nvm` recommended
- [pnpm](https://pnpm.io/) — via [Corepack](https://nodejs.org/api/corepack.html) (bundled with Node): `corepack enable`, then `pnpm` uses the version pinned in `package.json`'s `packageManager` field automatically
- A Discord bot token (`DISCORD_TOKEN=...` in `.env`)
  - Enable **Message Content Intent** in the Developer Portal

## Setup

```bash
# Install dependencies
pnpm install

# If pnpm warns about "Ignored build scripts", review and allow any that
# turn out to be needed: pnpm approve-builds

# Install all fonts/emoji
pnpm run setup

# Register the slash/context-menu commands and the color-theme swatch emoji
# (re-run whenever either changes; deploy:commands / deploy:images run just
# one half). Reads .env — pass --dev to read .env.local instead.
pnpm run deploy

# Build
pnpm run build

# Start
pnpm start
```

## Configuration

All of these go in `.env` (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `DISCORD_TOKEN` | Bot token |
| `DISCORD_CLIENT_ID` | Application ID, needed to register commands |
| `ADMIN_IDS` | Comma-separated Discord user IDs allowed to run `/admin` |
| `DEFAULT_LOCALE` | Locale used when nothing else sets one (default `en`) |
| `DATA_DIR` | Where per-user/guild/bot settings are stored as JSON (default `./data`) |
| `SAVE_IMAGES_DIR` | If set, also save a copy of every generated image here (disabled by default) |

Every user-facing string lives in `src/i18n/index.ts`'s `Translations` objects, colocated with the code that uses it (`src/components.ts`, `src/commands/*.ts`, `src/quoteMessages.ts`, …) rather than in separate per-locale files. Adding a language beyond English/Japanese means adding its code to `SUPPORTED_LOCALES` in `src/i18n/index.ts` and filling in that new entry everywhere a `Translations` object is defined.

## Development

```bash
pnpm run dev   # loads .env / .env.local
pnpm test      # vitest
pnpm run lint  # eslint
```

## Author

otoneko. https://github.com/otnc

## Credits

### Inspiration

- Make it a Quote (Twitter) https://twitter.com/MakeItAQuote
- Make it a Quote (Discord / Misskey / Bluesky) https://miq.moe/

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE) with [additional terms](./ADDITIONAL_TERMS.md).

- **SPDX:** `AGPL-3.0-or-later` (with additional terms under AGPL-3.0 Section 7)
- If you distribute or run a modified version of this bot, you must make the modified source code available under AGPL-3.0, and display attribution (original repository URL: https://github.com/otnc/OpenMiQ) as required by the [additional terms](./ADDITIONAL_TERMS.md).
