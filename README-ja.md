# Open MiQ Bot

[![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

_[English](./README.md)_

メッセージを引用画像に変換する、セルフホスト用の Discord Bot。

メッセージにリプライした状態でBotをメンションする(または右クリックして「引用画像を作成」を選ぶ)と、そのメッセージを [makeitaquote](https://github.com/otnc/makeitaquote) で引用画像にして画像リプライします。

## 使い方

**リプライ内でBotをメンションする** — メンションの後ろにオプションを付けられます:

```
@MiQ                            … リプライ先のメッセージをquote
@MiQ color                      … アバターをカラーのままにする
@MiQ bold                       … 引用文を太字にする
@MiQ light                      … ライトテーマ
@MiQ flip                       … アバターを右側に配置 (横画像レイアウトのみ)
@MiQ new                        … 縦画像レイアウト — アバターを全面に、下部に引用文
                                    (保存済みのflipデフォルトもオフに戻します)
@MiQ font=pop                   … フォントをエイリアスで指定
@MiQ theme=sunset               … 背景カラーを名前で指定
@MiQ theme=default              … 保存済みのカラーテーマ指定をそのメッセージだけ解除
@MiQ theme=sunset new font=pop  … 組み合わせも自由 — font= は末尾に置く(それ以降を読み切るため)
@MiQ new flip                   … …new の後に flip を置くとそのリセットを上書きしますが、
                                    見た目には影響しません — makeitaquoteの縦画像レイアウトは
                                    アバターの左右指定を無視するため
@MiQ c b l f n                  … "color bold light flip new" と同じ — 下記の各オプションには
                                    1文字の短縮形もあります
```

それぞれのオプションには逆の指定と1文字の短縮形があり(`font=`/`theme=`を除く)、保存済みのデフォルト(下記スラッシュコマンド参照)がオンになっていても、そのメッセージだけ元に戻せます:

| オプション                | 短縮形 | 逆の指定                  | 短縮形 |
| ------------------------- | ------ | ------------------------- | ------ |
| `color`                   | `c`    | `mono`                    | `m`    |
| `bold`                    | `b`    | `regular`                 | `r`    |
| `light`                   | `l`    | `dark`                    | `d`    |
| `flip`                    | `f`    | `unflip`                  | `u`    |
| `new` (または `portrait`) | `n`    | `side` (または `classic`) | `s`    |

**または、メッセージを右クリック(モバイルでは長押し) → アプリ → 引用画像を作成** — 結果は同じで、入力の手間はありませんが、オプションを入力する段階がないため常にあなたの保存済みデフォルトが使われます(下記参照)。

リプライせずにBotをメンションした場合、使い方メッセージを送ってすぐ削除する代わりに ❓ をリアクションします — 1分以内にそのリアクションを押すと `/help` と同じ内容が返信されます。

フォントは makeitaquote 自身の `FONT_ALIASES` のエイリアスで指定します: `sans`, `mplus`, `dela`, `dot`, `pop`, `rampart`, `reggae`, `rocknroll`, `serif`, `yuji`, `yusei`, `inconsolata`, `exo2`, `bruno`, `poltawski`, `vina`, `script`, `castoro`。makeitaquoteの正式なフォント名(例: `font="Dela Gothic One"`)も引き続き使用できます。何も指定しない場合のBot自体のデフォルトは `mplus` (M PLUS Rounded 1c) です。`theme=` は21種類の名前付き背景カラー(`sunset`, `forest`, `midnight_blurple` など)から選べます。[本家Make it a Quoteのテーマ一覧](https://wiki.neody.land/wiki/Make_it_a_Quote/Themes/ja)と同じ構成で、正式なキー、アンダースコアを抜いた表記(`midnightblurple`)、短縮コードがあるテーマはその短縮コード(`mb`)のいずれでも指定できます。それぞれコントラストのために文字色が固定されているため、指定すると `light`/`dark` は効かなくなります(`flip` と縦画像の関係と同様です) — `theme=default` (またはそのエイリアスの `theme=def`, `theme=b`, `theme=w`) で保存済みの指定を未設定に戻せます。両方の全一覧はローカライズされた `/help` を実行して確認してください。カラーテーマのセレクトメニューは、`pnpm run deploy:images` (または `deploy`) でアプリケーション絵文字として作成済みなら、それぞれ小さなグラデーション絵文字でプレビュー表示されます — 未作成の間はテキストのみの選択肢になります。

メンションへの返信は、画像が生成されるまで「生成中…」というプレースホルダー(こちらも `deploy:images` で作られる専用のアニメーション絵文字付き)を表示し、完成したら同じメッセージを編集して差し替えます。

生成される引用画像には、必ずBot自身のDiscordタグが小さな透かし(ウォーターマーク)として隅に入ります。

生成された画像の下には、それぞれを切り替えられるボタン(🎨 カラー / 🅱️ 太字 / 🔄 反転 / ☀️ テーマ / レイアウト)とフォント/カラーテーマを選択できるセレクトメニュー(使うたびに画像が再生成されます)に加え、無効化されていなければ(下記スラッシュコマンド参照)🗑️ 削除ボタンも付きます。削除ボタンを押せるのは、その引用を生成した本人か、引用対象になった本人(引用元メッセージの投稿者、または `/fakequote` の `author:`)だけです。実際にメッセージを削除するのではなく、画像とコンポーネントを取り除く編集を行うだけなので、`SAVE_IMAGES_DIR` に保存されたコピーがあれば影響を受けません。

> ボタンによる再生成はメモリ上の状態に基づくため、Botの再起動後は再生成できません。

### スラッシュコマンド

それぞれ独立したトップレベルコマンドです(共通のプレフィックスでまとめていません)。そのため、サーバー側のインテグレーション設定からコマンドごとに個別に有効/無効を切り替えられます。

- `/settings view|set|reset` — あなた自身の引用オプションと言語のデフォルト。メンションの後ろで指定しなかった場合(または右クリックの「引用画像を作成」では常に)適用されます。`fake-label:false` で、自分自身の `/fakequote` から "(fake)" の表示を外せます (デフォルトはオン)。
- `/server-settings view|set|reset` — このサーバーのデフォルト (サーバー管理権限が必要)。`delete-button:false` でこのサーバー全体の削除ボタンを非表示にでき (デフォルトはオン)、`fake-label:false` でサーバー全体の表示を外せます。
- `/admin view|set|reset` — Bot自体のフォールバック用デフォルト (`ADMIN_IDS` に列挙されたDiscordユーザーIDのみ実行可能)。同じ `delete-button:false` と `fake-label:false` オプションがBot全体に適用されます。
- `/help` — あなたの言語でのヘルプ表示。
- `/fakequote author: message: options:` — 指定したユーザーの名前とアイコンで、でっち上げの引用画像を作成します。`options` はメンション時と同じ構文(`color`, `new`, `font=pop` など)が使えます。でっち上げの引用が本物と誤解されないよう、ユーザーネームの表示欄は通常の "@user" ではなく "(fake) @user" になります — 実行者本人は上記の設定コマンドで `fake-label:false` にすれば自分の `/fakequote` に限りこれを外せますし、サーバーやBot管理者が強制的に外すこともできます。また、なりすまし自体への悪用防止として、対象ユーザー本人は `/settings set block-fakequote:true` で自分が使われるのをブロックでき、サーバーは `/server-settings set block-fakequote:true` でサーバー全体で無効化でき、Bot管理者は `/admin set block-fakequote:true` でBot全体で無効化できます。

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

# スラッシュ/コンテキストメニューコマンドとカラーテーマのスウォッチ絵文字を登録
# (どちらかが変わるたびに再実行。deploy:commands / deploy:images で片方だけも可)
# .env を読み込みます — --dev を付けると .env.local を読み込みます
pnpm run deploy

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

画面に表示される文字列はすべて `src/i18n/index.ts` の `Translations` オブジェクトとして、それを使うコードのすぐそば (`src/components.ts`、`src/commands/*.ts`、`src/quoteMessages.ts` など) に書かれています。個別のロケールファイルには分かれていません。英語・日本語以外の言語を追加するには、`src/i18n/index.ts` の `SUPPORTED_LOCALES` にその言語コードを追加したうえで、`Translations` オブジェクトが定義されている箇所すべてに新しい言語の項目を埋めていきます。

## 開発

```bash
pnpm run dev   # .env / .env.local を読み込んで起動
pnpm test      # vitest
pnpm run lint  # eslint
```

## 作者

otoneko. https://github.com/otnc

## クレジット

### 参考

- Make it a Quote (Twitter) https://twitter.com/MakeItAQuote
- Make it a Quote (Discord / Misskey / Bluesky) https://miq.moe/

## ライセンス

このプロジェクトは [GNU Affero General Public License v3.0 以降](./LICENSE) に、[追加条項](./ADDITIONAL_TERMS.md) を加えたライセンスの下で提供されています。

- **SPDX:** `AGPL-3.0-or-later` (AGPL-3.0 第7条に基づく追加条項付き)
- 本Botの改変版を配布または運用する場合は、改変後のソースコードをAGPL-3.0の下で公開し、[追加条項](./ADDITIONAL_TERMS.md) に従って帰属表示 (元のリポジトリURL: https://github.com/otnc/OpenMiQ) を行う必要があります。
