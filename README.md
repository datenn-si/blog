# blog

[![CI](https://github.com/datenn-si/blog/actions/workflows/ci.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/ci.yml)
[![Deploy](https://github.com/datenn-si/blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/deploy.yml)

[ English | [日本語](README.ja.md) ]

My personal blog site [blog.datenn.si](https://blog.datenn.si/)

Articles are managed separately in the [`datenn-si/posts`](https://github.com/datenn-si/posts) repository.

> [!NOTE]
> The website content is written in Japanese only.

## Frameworks and Technologies Used (Excerpt)

- Astro.js
- Tailwind CSS
- Iconify
- MDX
- Cloudflare Adapter
- Cloudflare Workers
- Oxfmt
- Oxlint
- GitHub Actions

## File Structure

```text
├── .github/
│   └── workflows/
│       ├── ci.yml               # Lint, format, test, and build on pull requests to main
│       ├── deploy.yml           # Build and deploy on push to main
│       ├── update-posts.yml     # Open a pull request that updates the posts submodule
│       └── merge-posts.yml      # Merge that pull request after CI succeeds
├── public/                      # Public files such as favicon, OG images, and manifest
├── src/
│   ├── assets/                  # Images and other assets
│   ├── components/
│   │   ├── Footer.astro
│   │   ├── Header.astro
│   │   ├── Pagination.astro     # Pager for post lists
│   │   ├── PostCard.astro       # Post card
│   │   ├── PostList.astro       # Heading, list, and pager
│   │   ├── PostMeta.astro       # Date, author, and tags
│   │   └── StalePostWarning.astro  # Warning when a post is over a year old
│   ├── layouts/
│   │   ├── Layout.astro         # Shared layout
│   │   └── LegalPage.astro      # Layout of Legal Markdown Docs
│   ├── lib/
│   │   └── posts.ts             # Post queries, dates, excerpts, and paths
│   ├── pages/
│   │   ├── [...page].astro      # Post list
│   │   ├── 404.astro            # Not found page
│   │   ├── archive/
│   │   │   ├── [year]/
│   │   │   │   └── [...page].astro          # Posts in a year
│   │   │   ├── [year]-[month]/
│   │   │   │   └── [...page].astro          # Posts in a year and month
│   │   │   └── index.astro      # Years and months that have posts
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       ├── index.astro      # Post page
│   │   │       └── og-image.json.ts # JSON for OGP Image Generation
│   │   ├── privacy.md           # Privacy policy
│   │   └── tags/
│   │       ├── [tag]/
│   │       │   └── [...page].astro  # Posts with a tag
│   │       └── index.astro      # Tag list
│   ├── styles/                  # Global styles
│   ├── constants.ts             # Site settings, authors, and shared data
│   ├── content.config.ts        # Content collection definition
│   └── env.d.ts                 # Cloudflare runtime type definitions
├── astro.config.mjs             # Astro, Cloudflare, and Tailwind configuration
├── package.json                 # Dependencies and npm scripts
├── pnpm-lock.yaml               # Dependency lockfile
├── pnpm-workspace.yaml          # pnpm workspace configuration
├── tsconfig.json                # TypeScript configuration
├── worker-configuration.d.ts    # Cloudflare Worker type definitions
└── wrangler.jsonc               # Cloudflare Workers configuration
```

`[...page]` is the page number. Page 1 has no number in the URL. Later pages are `/2`, `/3`, and so on.

## Development

Work on a `feature` or `fix` branch. Merge into `main` only through a pull request.

- Before committing, run lint, format, and build.
  - Husky and lint-staged are not used.
- A pull request to `main` runs CI: lint, format, test, and build (`.github/workflows/ci.yml`).
- A push to `main` runs Deploy: build, then deploy to Cloudflare Workers (`.github/workflows/deploy.yml`).

## Updating articles

Articles live in the [`datenn-si/posts`](https://github.com/datenn-si/posts) submodule. A push to `main` there publishes when one of its commits has a subject line that starts with `post:`. Use that prefix for a new article and for a later edit.

1. `datenn-si/posts` runs `.github/workflows/post.yml` and starts `Update posts` in this repository with that commit's SHA. A push event includes at most 20 commits, so an older `post:` commit in a longer push is not detected.
2. `update-posts.yml` opens a pull request from `posts/update-<sha>` that points the submodule at that SHA.
3. CI runs on the pull request. When it succeeds, `merge-posts.yml` merges the pull request with a merge commit.
4. The merge pushes `main`, and Deploy publishes the site.

`pnpm new-post` in the posts repository creates a folder and a `README.mdx` file. It does not create the commit. Start the commit subject with `post:`, for example `post: cloudflare-free-disable-jsd`. To publish a SHA whose subject does not use that prefix, open the Actions tab, run `Update posts`, and pass the SHA.

`posts/update-*` branches are reserved for this automation. After CI succeeds, the merge workflow merges a pull request from that branch only when the pull request comes from this repository and its head is still the commit CI checked.

If another `post:` push arrives before that pull request merges, the later pull request can conflict on the submodule pointer. Merge the older pull request first.

### Secrets

Deploy uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets.

Article updates use one fine-grained personal access token, stored as two Actions secrets. Create it from [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new) for resource owner `datenn-si`, with access only to the `blog` repository:

- Actions: Read and write
- Contents: Read and write
- Pull requests: Read and write

| Secret                | Repository        | Use                                                        |
| --------------------- | ----------------- | ---------------------------------------------------------- |
| `BLOG_DISPATCH_TOKEN` | `datenn-si/posts` | Start `Update posts`                                       |
| `POSTS_UPDATE_TOKEN`  | `datenn-si/blog`  | Push `posts/update-*`, open the pull request, and merge it |

The same token value goes in both secrets. Fine-grained tokens expire. After you rotate the token, replace both secrets.

`GITHUB_TOKEN` stays limited to reading this repository. The posts workflow needs `BLOG_DISPATCH_TOKEN` to start a workflow in this repository. The update and merge workflows need `POSTS_UPDATE_TOKEN` so the pull request and the merge push start CI and Deploy. The posts checkout during those runs uses the public repository URL, so this token is not granted access to `datenn-si/posts`. If that repository becomes private, give the token contents read on `posts` and authenticate the submodule fetch.

## License

The source code in this repository is provided under the GNU Affero General Public License v3.0 only (AGPL-3.0-only). For details, see the [`LICENSE.txt`](./LICENSE.txt) file in the repository root.

However, the following content is not included within the scope of AGPL-3.0-only, and all rights are separately reserved:

- The "datenn-si" icon, background images, OG images, and other image or non-code visual assets
- All files in the `resource/` directory
- Biographical text, profile information, SNS links, and other personal content related to "Datenshi"

No permission to use these contents is granted under AGPL-3.0-only. If you wish to use, copy, modify, redistribute, or otherwise handle these contents, you must obtain separate permission from the respective rights holders.

If you fork and use this repository, do not reuse the excluded content listed above as-is. Please replace it with your own icon, background images, profile information, SNS links, and similar content.

This section is intended to clarify the rights relating to the excluded content. It does not alter the rights or conditions set forth by AGPL-3.0-only for the source code to which that license applies.

The article text and related assets are managed in the [`datenn-si/posts`](https://github.com/datenn-si/posts) repository.

Please check there for information regarding their licenses.
