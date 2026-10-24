# profile-site

[![CI/CD](https://github.com/datenn-si/blog/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/ci-cd.yml)

[ [English](README.md) | 日本語 ]

個人ブログ [blog.datenn.si](https://blog.datenn.si/)

記事は [`datenn-si/posts`](https://github.com/datenn-si/posts) リポジトリで別途管理されています。

## 利用しているフレームワーク/技術 (抜粋)

- Astro.js
- Tailwind CSS
- Iconify
- MDX
- Cloudflare Adapter
- Cloudflare Workers
- Oxfmt
- Oxlint
- GitHub Actions

## ファイル構成

```text
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # CI・ビルド・デプロイ
├── posts/                       # ブログ投稿
│   └── yyyy-mm-dd-slug/
│       └── README.mdx           # 投稿本文。yyyy-mm-dd が投稿日
├── public/                      # favicon、OG 画像、manifest などの公開ファイル
├── src/
│   ├── assets/                  # 画像などのアセット
│   ├── components/
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Pagination.astro     # 投稿一覧のページング
│   │   ├── PostCard.astro       # 投稿カード
│   │   ├── PostList.astro       # 見出し、一覧、ページング
│   │   ├── PostMeta.astro       # 投稿日、著者、タグ
│   │   └── StalePostWarning.astro  # 最終更新から1年以上の警告
│   ├── layouts/
│   │   ├── Layout.astro         # 共通レイアウト
│   │   └── LegalPage.astro      # 法的文章 Markdown 用レイアウト
│   ├── lib/
│   │   └── posts.ts             # 投稿の取得、日付、抜粋、パス
│   ├── pages/
│   │   ├── [...page].astro      # 投稿一覧
│   │   ├── 404.astro            # 404 ページ
│   │   ├── archive/
│   │   │   ├── [year]/
│   │   │   │   └── [...page].astro      # 年別の投稿一覧
│   │   │   ├── [year]-[month]/
│   │   │   │   └── [...page].astro  # 年月別の投稿一覧
│   │   │   └── index.astro      # 投稿のあった年と月
│   │   ├── posts/
│   │   │   └── [slug].astro     # 投稿ページ
│   │   ├── privacy.md           # プライバシーポリシー
│   │   └── tags/
│   │       ├── [tag]/
│   │       │   └── [...page].astro  # タグ別の投稿一覧
│   │       └── index.astro      # タグ一覧
│   ├── styles/                  # グローバルスタイル
│   ├── constants.ts             # サイト設定、著者、共通データ
│   ├── content.config.ts        # コンテンツコレクション定義
│   └── env.d.ts                 # Cloudflare runtime の型定義
├── astro.config.mjs             # Astro・Cloudflare・Tailwind の設定
├── package.json                 # 依存関係と npm scripts
├── pnpm-lock.yaml               # 依存関係のロックファイル
├── pnpm-workspace.yaml          # pnpm workspace 設定
├── tsconfig.json                # TypeScript 設定
├── worker-configuration.d.ts    # Cloudflare Worker の型定義
└── wrangler.jsonc               # Cloudflare Workers の設定
```

`[...page]` はページ番号です。1ページ目は URL に番号を含まず、2ページ目以降は `/2`、`/3` のようになります。

## 開発ルール

- コミット前に lint と format 、ビルド を行う
  - 今のところは Husky + lint-staged を導入していません
- CI によっても同様にチェックを行う

## ライセンス

本リポジトリ内のソースコードは、GNU Affero General Public License v3.0 only（AGPL-3.0-only）の下で提供されています。詳細は、リポジトリルートの [`LICENSE.txt`](./LICENSE.txt) ファイルを参照してください。

ただし、以下のコンテンツは AGPL-3.0-only の適用対象に含まれず、別途権利が留保されています。

- 「だてんし」のアイコン、背景画像、OG 画像、その他の画像・非コードの視覚アセット
- `resource/` ディレクトリ内のすべてのファイル
- 「だてんし」個人に関する紹介文、プロフィール情報、SNS リンク、その他の個人的なコンテンツ

これらのコンテンツについては、AGPL-3.0-only に基づく利用許諾は付与されません。利用・複製・改変・再配布などを行う場合は、各権利者から別途許諾を得る必要があります。

本リポジトリをフォークして利用する場合は、上記の対象外コンテンツをそのまま流用せず、ご自身のアイコン、背景画像、プロフィール情報、SNS リンクなどに置き換えてください。

なお、本節は対象外コンテンツに関する権利を明確にするものであり、AGPL-3.0-only の適用対象となるソースコードについて、同ライセンスが定める権利や条件を変更するものではありません。

記事本文および関連リソースは、[`datenn-si/posts`](https://github.com/datenn-si/posts) リポジトリで管理されています。

ライセンスに関する情報については、そちらをご確認ください。
