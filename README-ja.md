# MiQ Bot

*[English](./README.md)*

メッセージを引用画像に変換する、セルフホスト用の Discord Bot。

メッセージにリプライした状態でBotをメンションする(または右クリックして「引用画像を作成」を選ぶ)と、そのメッセージを [makeitaquote](https://www.npmjs.com/package/makeitaquote) で引用画像にして画像リプライします。

## Usage

**リプライ内でBotをメンションする** — メンションの後ろにオプションを付けられます:

```
@MiQ                            … リプライ先のメッセージをquote
@MiQ color                      … アバターをカラーのままにする
@MiQ light                      … ライトテーマ
@MiQ flip                       … アバターを右側に配置 (横画像レイアウトのみ)
@MiQ new                        … 縦画像レイアウト — アバターを全面に、下部に引用文
@MiQ font=pop                   … フォントをエイリアスで指定
@MiQ theme=sunset               … 背景カラーを名前で指定
@MiQ theme=sunset new font=pop  … 組み合わせも自由 — font= は末尾に置く(それ以降を読み切るため)
@MiQ new flip                   … …ただし new (縦画像) 指定時、flip は効きません —
                                    makeitaquoteの縦画像レイアウトはアバターの左右指定を無視するため
```

それぞれのオプションには逆の指定があり、保存済みのデフォルト(下記スラッシュコマンド参照)がオンになっていても、そのメッセージだけ元に戻せます:

| オプション | 逆の指定 |
| --- | --- |
| `color` | `mono` |
| `light` | `dark` |
| `flip` (または `right`) | `left` |
| `new` | `side` |

**または、メッセージを右クリック(モバイルでは長押し) → アプリ → 引用画像を作成** — 結果は同じで、入力の手間はありませんが、オプションを入力する段階がないため常にあなたの保存済みデフォルトが使われます(下記参照)。

フォントは makeitaquote 自身の `FONT_ALIASES` のエイリアスで指定します: `sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`, `serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`, `script`, `castoro`。makeitaquoteの正式なフォント名(例: `font="Dela Gothic One"`)も引き続き使用できます。`theme=` はダーク/ライト/縦画像の各テーマに重ねる21種類の名前付き背景カラー(`sunset`, `forest`, `midnight_blurple` など)から選べます。両方の全一覧はローカライズされた `/help` を実行して確認してください。

生成された画像の下には、それぞれを切り替えられるボタン(🎨 カラー / 🔄 反転 / ☀️ テーマ / レイアウト)と、フォント/カラーテーマを選択できるセレクトメニューが付きます。使うたびに画像が再生成されます。

> ボタンによる再生成はメモリ上の状態に基づくため、Botの再起動後は再生成できません。

### スラッシュコマンド

それぞれ独立したトップレベルコマンドです(共通のプレフィックスでまとめていません)。そのため、サーバー側のインテグレーション設定からコマンドごとに個別に有効/無効を切り替えられます。

- `/settings view|set|reset` — あなた自身の引用オプションと言語のデフォルト。メンションの後ろで指定しなかった場合(または右クリックの「引用画像を作成」では常に)適用されます。
- `/server-settings view|set|reset` — このサーバーのデフォルト (サーバー管理権限が必要)。
- `/admin view|set|reset` — Bot自体のフォールバック用デフォルト (`ADMIN_IDS` に列挙されたDiscordユーザーIDのみ実行可能)。
- `/help` — あなたの言語でのヘルプ表示。
- `/fakequote author: message: options:` — 指定したユーザーの名前とアイコンで、でっち上げの引用画像を作成します。`options` はメンション時と同じ構文(`color`, `new`, `font=pop` など)が使えます。悪用防止のため、対象ユーザー本人は `/settings set block-fakequote:true` で自分が使われるのをブロックでき、サーバーは `/server-settings set block-fakequote:true` でサーバー全体で無効化でき、Bot管理者は `/admin set block-fakequote:true` でBot全体で無効化できます。

デフォルトは「メンションの後ろのオプション > あなたの設定 > このサーバーの設定 > Botのデフォルト > 組み込みのフォールバック」の順で解決されます(右クリックの「引用画像を作成」はオプション入力の段階がないため、あなたの設定から直接解決されます)。返信で使われる言語も同じ順序で決まります。

## Required

- Node.js v24 or later
  - Recommend `fnm` or `nvm`
- [pnpm](https://pnpm.io/) — Node同梱の [Corepack](https://nodejs.org/api/corepack.html) 経由で: `corepack enable` を実行すれば、`package.json` の `packageManager` に固定されたバージョンが自動的に使われます
- Discord Bot Token (`.env` に `DISCORD_TOKEN=...` を設定)
  - Developer Portal で **Message Content Intent** を有効にしてください

## Setup

```bash
# Install dependnecies
pnpm install

# "Ignored build scripts" と警告された場合は、内容を確認して必要なものだけ許可する:
# pnpm approve-builds

# Install all fonts/emoji
pnpm run setup

# スラッシュコマンドとコンテキストメニューコマンドを登録 (内容が変わるたびに再実行)
pnpm run deploy-commands

# Build script
pnpm run build

# Start bot
pnpm start
```

## Configuration

以下はすべて `.env` に設定します (`.env.example` を参照):

| 変数 | 用途 |
| --- | --- |
| `DISCORD_TOKEN` | Botトークン |
| `DISCORD_CLIENT_ID` | コマンド登録に必要なApplication ID |
| `ADMIN_IDS` | `/admin` を実行できるDiscordユーザーIDのカンマ区切りリスト |
| `DEFAULT_LOCALE` | 他に設定がない場合に使われる言語 (デフォルト `en`) |
| `DATA_DIR` | ユーザー/サーバー/Botの設定をJSONで保存する場所 (デフォルト `./data`) |
| `SAVE_IMAGES_DIR` | 設定すると、生成した画像のコピーもこのディレクトリに保存する (デフォルトでは無効) |

英語・日本語以外の言語を追加するには、`locales/<code>.json` を追加するだけです (`locales/en.json` と同じキー構成)。コードの変更は不要で、起動時に自動的に読み込まれます。

## Development

```bash
pnpm run dev   # .env / .env.local を読み込んで起動
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
