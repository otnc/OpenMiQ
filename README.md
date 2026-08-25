# MiQ Bot

*[日本語](./README-ja.md)*

A self-hosted Discord bot that turns a message into a quote image.

Reply to a message and mention the bot (or right-click it and choose
"Quote"): it renders that message as a quote image (via
[makeitaquote](https://www.npmjs.com/package/makeitaquote)) and replies with
it.

## Usage

**Mention the bot in a reply**, with optional options after the mention:

```
@MiQ                            … quote the replied-to message
@MiQ color                      … keep the avatar in color
@MiQ light                      … light theme
@MiQ flip                       … avatar on the right (side layout only)
@MiQ new                        … portrait layout — avatar full-bleed, quote over the bottom
@MiQ font=pop                   … pick a font by alias
@MiQ theme=sunset               … pick a named background color
@MiQ theme=sunset new font=pop  … options combine freely — put font= last, it reads to the end
@MiQ new flip                   … …except flip has no effect once new (portrait) is set —
                                    makeitaquote's portrait layout ignores avatar side
```

Every toggle has an opposite, so a saved default (see Slash commands below)
can be overridden back for a single message even when it's already on:

| Option | Opposite |
| --- | --- |
| `color` | `mono` |
| `light` | `dark` |
| `flip` (or `right`) | `left` |
| `new` | `side` |

**Or right-click (long-press on mobile) any message → Apps → Quote** — same
result, no typing, but it always uses your saved defaults (see below) since
there's nowhere to type options.

Fonts are chosen by short alias — `makeitaquote`'s own `FONT_ALIASES`:
`sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`,
`serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`,
`script`, `castoro`. An exact makeitaquote family name (e.g.
`font="Dela Gothic One"`) also works. `theme=` picks one of 21 named
background colors (`sunset`, `forest`, `midnight_blurple`, …) layered on top
of the base dark/light/portrait theme. Run `/help` for the full, localized
lists of both.

The posted image comes with buttons (🎨 color / 🔄 flip / ☀️ theme / layout)
and font/color-theme select menus that re-render in place when used.

> Regenerating from the buttons relies on in-memory state, so it stops
> working for a given image after the bot restarts.

### Slash commands

Each is its own top-level command (not grouped under a shared prefix), so a
server can enable or disable them individually from Discord's integration
settings.

- `/settings view|set|reset` — your own default quote options and language,
  applied whenever you don't specify them after a mention (or always, for
  the right-click "Quote" command).
- `/server-settings view|set|reset` — this server's defaults (requires the
  Manage Server permission).
- `/admin view|set|reset` — the bot's own fallback defaults (only for the
  Discord user IDs listed in `ADMIN_IDS`).
- `/help` — usage help in your resolved language.
- `/fakequote author: message: options:` — makes a quote image in someone
  else's name and avatar, with fabricated text. `options` takes the same
  syntax as after a mention (`color`, `new`, `font=pop`, …). Anyone can be
  protected from this: the target author can block being used with
  `/settings set block-fakequote:true`, a server can turn it off entirely
  with `/server-settings set block-fakequote:true`, and bot admins can
  disable it everywhere with `/admin set block-fakequote:true`.

Defaults are resolved as: options typed after a mention > your settings >
this server's settings > the bot's own defaults > built-in fallback (the
right-click "Quote" command skips straight to your settings, since it has no
options step). The same order picks which language a reply is shown in.

## Required

- Node.js v24 or later
  - `fnm` or `nvm` recommended
- [pnpm](https://pnpm.io/) — via [Corepack](https://nodejs.org/api/corepack.html)
  (bundled with Node): `corepack enable`, then `pnpm` uses the version pinned
  in `package.json`'s `packageManager` field automatically
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

# Register the slash and context-menu commands (re-run whenever they change)
pnpm run deploy-commands

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

Adding a language beyond English/Japanese is a matter of dropping a new
`locales/<code>.json` file (same keys as `locales/en.json`) — no code change
needed; it's picked up at startup.

## Development

```bash
pnpm run dev   # loads .env / .env.local
pnpm test      # vitest
pnpm run lint  # eslint
```

## Author

otoneko. https://github.com/otnc

## License

This project is licensed under the [GNU Affero General Public License v3.0 or later](./LICENSE) with [additional terms](./ADDITIONAL_TERMS.md).

- **SPDX:** `AGPL-3.0-or-later` (with additional terms under AGPL-3.0 Section 7)
- If you distribute or run a modified version of this bot, you must:
  - make the modified source code available under AGPL-3.0, and
  - display attribution (original repository URL: https://github.com/otnc/miq-bot) as required by the [additional terms](./ADDITIONAL_TERMS.md).
