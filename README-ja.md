# MiQ Bot

_[English](./README.md)_

メッセージを引用画像に変換する、セルフホスト用の Discord Bot。

メッセージにリプライした状態でBotをメンションする(または右クリックして「引用画像を作成」を選ぶ)と、そのメッセージを [makeitaquote](https://www.npmjs.com/package/makeitaquote) で引用画像にして画像リプライします。

## 使い方

**リプライ内でBotをメンションする** — メンションの後ろにオプションを付けられます:

```
@MiQ                            … リプライ先のメッセージをquote
@MiQ color                      … アバターをカラーのままにする
@MiQ light                      … ライトテーマ
@MiQ flip                       … アバターを右側に配置 (横画像レイアウトのみ)
@MiQ new                        … 縦画像レイアウト — アバターを全面に、下部に引用文
@MiQ font=pop                   … フォントをエイリアスで指定
@MiQ theme=sunset               … 背景カラーを名前で指定
@MiQ theme=default              … 保存済みのカラーテーマ指定をそのメッセージだけ解除
@MiQ theme=sunset new font=pop  … 組み合わせも自由 — font= は末尾に置く(それ以降を読み切るため)
@MiQ new flip                   … …ただし new (縦画像) 指定時、flip は効きません —
                                    makeitaquoteの縦画像レイアウトはアバターの左右指定を無視するため
```

それぞれのオプションには逆の指定があり、保存済みのデフォルト(下記スラッシュコマンド参照)がオンになっていても、そのメッセージだけ元に戻せます:

| オプション                | 逆の指定                  |
| ------------------------- | ------------------------- |
| `color`                   | `mono`                    |
| `light`                   | `dark`                    |
| `flip` (または `right`)   | `unflip` (または `left`)  |
| `new` (または `portrait`) | `classic` (または `side`) |

**または、メッセージを右クリック(モバイルでは長押し) → アプリ → 引用画像を作成** — 結果は同じで、入力の手間はありませんが、オプションを入力する段階がないため常にあなたの保存済みデフォルトが使われます(下記参照)。

フォントは makeitaquote 自身の `FONT_ALIASES` のエイリアスで指定します: `sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`, `serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`, `script`, `castoro`。makeitaquoteの正式なフォント名(例: `font="Dela Gothic One"`)も引き続き使用できます。何も指定しない場合のBot自体のデフォルトは `mplus` (M PLUS Rounded 1c) です。`theme=` はダーク/ライト/縦画像の各テーマに重ねる21種類の名前付き背景カラー(`sunset`, `forest`, `midnight_blurple` など)から選べます — `theme=default` で保存済みの指定を未設定に戻せます。両方の全一覧はローカライズされた `/help` を実行して確認してください。

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

## 必要なもの

- Node.js v24以上
  - `fnm` や `nvm` を推奨
- [pnpm](https://pnpm.io/) — Node同梱の [Corepack](https://nodejs.org/api/corepack.html) 経由で: `corepack enable` を実行すれば、`package.json` の `packageManager` に固定されたバージョンが自動的に使われます
- Discord Bot トークン (`.env` に `DISCORD_TOKEN=...` を設定)
  - Developer Portal で **Message Content Intent** を有効にしてください

## セットアップ

```bash
# 依存関係をインストール
pnpm install

# "Ignored build scripts" と警告された場合は、内容を確認して必要なものだけ許可する:
# pnpm approve-builds

# フォント/絵文字を全てインストール
pnpm run setup

# スラッシュコマンドとコンテキストメニューコマンドを登録 (内容が変わるたびに再実行)
pnpm run deploy-commands

# ビルド
pnpm run build

# Bot起動
pnpm start
```

## 設定

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

## 開発

```bash
pnpm run dev   # .env / .env.local を読み込んで起動
pnpm test      # vitest
pnpm run lint  # eslint
```

## 作者

otoneko. https://github.com/otnc

## ライセンス

このプロジェクトは [GNU Affero General Public License v3.0 以降](./LICENSE) に、[追加条項](./ADDITIONAL_TERMS.md) を加えたライセンスの下で提供されています。

- **SPDX:** `AGPL-3.0-or-later` (AGPL-3.0 第7条に基づく追加条項付き)
- 本Botの改変版を配布または運用する場合は、改変後のソースコードをAGPL-3.0の下で公開し、[追加条項](./ADDITIONAL_TERMS.md) に従って帰属表示 (元のリポジトリURL: https://github.com/otnc/OpenMiQ) を行う必要があります。
