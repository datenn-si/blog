# blog

[![CI](https://github.com/datenn-si/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/ci.yml)
[![Deploy](https://github.com/datenn-si/blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/deploy.yml)

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
│       ├── ci.yml               # main への PR で lint、format、test、build
│       ├── deploy.yml           # main への push で build と deploy
│       ├── update-posts.yml     # posts サブモジュールを更新する PR を作る
│       └── merge-posts.yml      # CI 成功後にその PR をマージする
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
│   │   │   └── [slug]/
│   │   │       ├── index.astro      # 投稿ページ
│   │   │       └── og-image.json.ts # OGP画像生成処理用JSON
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

## 開発

作業は `feature` ブランチまたは `fix` ブランチで行い、`main` への反映は pull request のマージだけで行います。

- コミット前に lint、format、build を実行する
  - Husky と lint-staged は使っていません
- `main` への pull request では CI が lint、format、test、build を実行します（`.github/workflows/ci.yml`）
- `main` への push では Deploy が build のあと Cloudflare Workers へ deploy します（`.github/workflows/deploy.yml`）

## 記事の自動更新

記事は [`datenn-si/posts`](https://github.com/datenn-si/posts) サブモジュールにあります。そこの `main` へ push したコミットのうち、件名が `post:` で始まるものがあると公開処理が始まります。新規投稿も、その後の更新も、この接頭辞を使います。

1. `datenn-si/posts` の `.github/workflows/new-post.yml` が、そのコミットの SHA を渡してこのリポジトリの `Update posts` を起動します。push のペイロードに含まれるコミットは最大 20 件なので、それより古い `post:` コミットは検知されません。
2. `update-posts.yml` が `posts/update-<sha>` ブランチを作り、サブモジュールをその SHA に向けた pull request を開きます。
3. pull request で CI が走り、成功すると `merge-posts.yml` が merge commit でマージします。
4. そのマージが `main` への push になり、Deploy がサイトを公開します。

posts リポジトリの `pnpm new-post` はフォルダと `README.mdx` を作るだけで、コミットは作りません。コミット件名の先頭を `post:` にしてください。例: `post: cloudflare-free-disable-jsd`。その接頭辞が付いていない SHA を公開するときは、Actions タブから `Update posts` を実行し、その SHA を入力します。

`posts/update-*` ブランチはこの自動処理専用です。CI が成功したあと、マージ用ワークフローは、このリポジトリ自身から開かれた pull request であり、ヘッドが CI の対象コミットのままである場合にマージします。

その pull request がマージされる前に次の `post:` が push されると、後から開いた pull request はサブモジュールの参照で衝突することがあります。先に開いた pull request を先にマージしてください。

### シークレット

Deploy は、`CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を使います。

記事の更新には、fine-grained personal access token を 1 つ作り、Actions のシークレットとして 2 か所に保存します。[Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new) から、Resource owner を `datenn-si`、対象リポジトリを `blog` だけにして作成します。

- Actions: Read and write
- Contents: Read and write
- Pull requests: Read and write

| シークレット          | リポジトリ        | 用途                                                  |
| --------------------- | ----------------- | ----------------------------------------------------- |
| `BLOG_DISPATCH_TOKEN` | `datenn-si/posts` | `Update posts` を起動する                             |
| `POSTS_UPDATE_TOKEN`  | `datenn-si/blog`  | `posts/update-*` の push、pull request の作成、マージ |

両方に同じトークンの値を入れます。fine-grained token には有効期限があります。ローテーションしたあとは、両方のシークレットを差し替えてください。

`GITHUB_TOKEN` はこのリポジトリの読み取りに限っています。posts 側のワークフローがこのリポジトリのワークフローを起動するには `BLOG_DISPATCH_TOKEN` が必要です。更新とマージのワークフローが CI と Deploy を起動するには `POSTS_UPDATE_TOKEN` が必要です。これらの実行で posts を取得するときは公開リポジトリの URL を使うため、このトークンに `datenn-si/posts` への権限は付けていません。posts を private にする場合は、トークンに posts の contents read を追加し、サブモジュールの fetch にもそのトークンを使うようにしてください。

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
