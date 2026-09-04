<div align="center">

<img src=".github/assets/icon.png" width="120" alt="OpenMiQ icon">

<br />

<img src=".github/assets/logo.png" width="320" alt="OpenMiQ logo">

</div>

[![CI](https://img.shields.io/github/actions/workflow/status/otnc/OpenMiQ/ci.yml?branch=main&label=ci)](https://github.com/otnc/OpenMiQ/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/otnc/OpenMiQ)](./LICENSE) [![Additional Terms](https://img.shields.io/badge/additional%20terms-important)](./ADDITIONAL_TERMS.md) [![Node](https://img.shields.io/badge/node-%3E%3D24-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

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
@MiQ new                        … new layout — avatar full-bleed, quote over the bottom
@MiQ chain                      … stack with the message it's replying to, if there is one (side layout only)
@MiQ font=pop                   … pick a font by alias
@MiQ theme=sunset               … pick a named background color
@MiQ theme=default              … clear a saved color-theme default for this message
@MiQ theme=sunset new font=pop  … options combine freely — put font= last, it reads to the end
@MiQ new flip                   … flip overrides new's automatic reset, but new ignores it anyway
@MiQ c b l f n                  … same as "color bold light flip new"
@MiQ c,n                        … commas work as separators too, same as "c n"
```

Every toggle has an opposite (and a one-letter shortcut, except `font=`/`theme=`/`chain`), so a saved default (see Slash commands below) can be overridden back for a single message even when it's already on:

| Option  | Shortcut | Opposite  | Shortcut |
| ------- | -------- | --------- | -------- |
| `color` | `c`      | `mono`    | `m`      |
| `bold`  | `b`      | `regular` | `r`      |
| `light` | `l`      | `dark`    | `d`      |
| `flip`  | `f`      | `unflip`  | `u`      |
| `new`   | `n`      | `side`    | `s`      |
| `chain` | —        | `unchain` | —        |

`chain` stacks the quoted message with the message _it's_ replying to into one image (top and bottom, via makeitaquote's `MiQChain`) — if the quoted message isn't itself a reply, `chain` has no effect and a single quote is rendered as usual. `chain` and `new` can't combine — that full-bleed layout has no left/right avatar box for two quotes to share — and `chain` wins: it's forced back to the `side` layout for as long as `chain` is on (the layout button under an already-posted quote is disabled while it is, for the same reason), rather than the layout picking which one wins. Unlike the other toggles, `chain` itself isn't available from the buttons under an already-posted quote, so switch it with a saved default (`/settings|/server-settings|/admin set chain:`) or type it after the mention.

**Or right-click (long-press on mobile) any message → Apps → Quote** — same result, no typing, but it always uses your saved defaults (see below) since there's nowhere to type options.

Mentioning the bot without replying to anything reacts with ❓ instead of sending (and then deleting) a usage message — press that reaction within a minute and it replies with `/help`'s text.

Fonts are chosen by short alias — `makeitaquote`'s own `FONT_ALIASES`: `sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`, `serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`, `script`, `castoro`. An exact makeitaquote family name (e.g. `font="Dela Gothic One"`) also works, and `mplus` (M PLUS Rounded 1c) is the bot's own default when nothing else picks one. `theme=` picks one of 21 named background colors (`sunset`, `forest`, `midnight_blurple`, …), matching the [official Make it a Quote bot's own theme list](https://wiki.neody.land/wiki/Make_it_a_Quote/Themes) — its full key, that key with underscores dropped (`midnightblurple`), and its short code where it has one (`mb`) all resolve the same way. There are also 18 original themes makeitaquote ships on top of that list (`tokyo_night`, `emerald_depths`, `ruby_noir`, …) — same `theme=` syntax, aliases 4+ characters long (`tokyo`, `emerald`, `ruby`, …) to leave room for the official set's short ones. Each theme (official or original) comes with its own fixed text color for contrast, so `light`/`dark` has no effect once one is set (same idea as `flip` and the `new` layout) — `theme=default` (or its own aliases `theme=def`, `theme=b`, `theme=w`) clears a saved default back to none. Run `/help` for the full, localized lists of all three (fonts, official themes, original themes). The color-theme select menus preview each one as a small gradient emoji, once `pnpm run deploy:images` (or `deploy`) has created them as application emoji — it falls back to plain text options until then.

A mention reply shows a "Generating…" placeholder (with its own animated emoji, also from `deploy:images`) while the image renders, then gets edited in place with the result.

Every quote image carries the bot's own Discord tag as a small watermark in the corner.

The posted image comes with buttons (🎨 color / 🅱️ bold / 🔄 flip / ☀️ theme / layout), a font select menu, and two color-theme select menus — one for the 21 official themes, one for the 18 original ones, split across two menus since both together don't fit one Discord select menu's 25-option limit. They share the same underlying setting, so picking from one clears the other back to its own "Default" option. All of them re-render in place when used, plus a Markdown button that renders actual Discord formatting (bold/italic/underline/strikethrough) in the quote text instead of showing it as plain characters — it disables the bold button for as long as it's on, since a font weight applied to every character would erase the distinction real markdown bold is supposed to show — and, unless turned off, see Slash commands below, a 🗑️ delete button. Only the person who generated the quote or the person it's about (the quoted message's author, or `/fakequote`'s `author:`) can press it; it edits the message to drop the image and components rather than actually deleting it, so a `SAVE_IMAGES_DIR` copy (if any) is untouched.

> Regenerating from the buttons relies on in-memory state, so it stops working for a given image after the bot restarts.

### Slash commands

Each is its own top-level command (not grouped under a shared prefix), so a server can enable or disable them individually from Discord's integration settings.

- `/settings view|set|reset` — your own default quote options and language, applied whenever you don't specify them after a mention (or always, for the right-click "Quote" command). Also has `fake-label:false` to drop the "(fake)" marker from your own `/fakequote` renders (on by default).
- `/server-settings view|set|reset` — this server's defaults (requires the Manage Server permission). Also has `delete-button:false` to hide the delete button server-wide (on by default), and `fake-label:false` to drop the marker server-wide.
- `/admin view|set|reset` — the bot's own fallback defaults (only for the Discord user IDs listed in `ADMIN_IDS`). Same `delete-button:false` and `fake-label:false` options, bot-wide.
- `/help` — usage help in your resolved language.
- `/credits` — who made this bot and what it's built on.
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

## Running with pm2

To keep the bot running long-term (auto-restarting it if it crashes), use the included `ecosystem.config.cjs` with [pm2](https://pm2.io/) instead of `pnpm start`:

```bash
pnpm run pm2:start
pnpm run pm2:logs
pnpm run pm2:restart
pnpm run pm2:stop
```

It reads `.env` on its own — both for `PM2_APP_NAME` below and, via Node's `--env-file-if-exists`, for the bot's own variables — so there's nothing extra to export first. Set `PM2_APP_NAME` to name the process something other than the default `openmiq` (handy if you run more than one instance on the same machine).

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
| `ICON_PATH` | Path to an icon image `deploy:images` syncs to the Discord application (unset by default — no icon is synced) |
| `LOGO_PATH` | Path to a logo image drawn as the quote watermark in place of the bot's tag (unset by default) |
| `PM2_APP_NAME` | Process name pm2 registers the bot under, see [Running with pm2](#running-with-pm2) (default `openmiq`) |

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

### Fonts

- The icon and logo under [`.github/assets/`](./.github/assets/) use **あかずきんポップ (Akazukin POP)**, a free font by flopdesign: https://flopdesign.booth.pm/items/1748058
- Their quote-mark accent uses **M PLUS Rounded 1c** (SIL Open Font License 1.1) — the same font makeitaquote itself downloads as its default: https://fonts.google.com/specimen/M+PLUS+Rounded+1c

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE) with [additional terms](./ADDITIONAL_TERMS.md).

- **SPDX:** `AGPL-3.0-or-later` (with additional terms under AGPL-3.0 Section 7)
- If you distribute or run a modified version of this bot, you must make the modified source code available under AGPL-3.0, and display attribution (original repository URL: https://github.com/otnc/OpenMiQ) as required by the [additional terms](./ADDITIONAL_TERMS.md).
- The images under [`.github/assets/`](./.github/assets/) (the project icon and logo) are not covered by the AGPL-3.0 grant — see the [additional terms](./ADDITIONAL_TERMS.md#4-brand-assets-githubassets) for what's and isn't allowed.
