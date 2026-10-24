# blog

[![CI/CD](https://github.com/datenn-si/blog/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/datenn-si/blog/actions/workflows/ci-cd.yml)

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
│       └── ci-cd.yml            # CI, build, and deployment
├── posts/                       # Blog posts
│   └── yyyy-mm-dd-slug/
│       └── README.mdx           # Post body. yyyy-mm-dd is the publish date
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
│   │   │   └── [slug].astro     # Post page
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

## Development Rules

- Run lint, format, and build before committing.
  - Husky and lint-staged are not currently used.
- CI also runs the same checks.

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
