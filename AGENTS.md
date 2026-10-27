# Instruction for Agents

When a repository's documentation and its existing code disagree, follow the conventions used in the existing code, and in your final reply point out each inconsistency you found between the documentation and the code.

## Project overview

This repository is a personal blog built with Astro, Tailwind CSS, and Cloudflare Workers. The app is mostly static content generation: blog posts live under `posts/` as MDX, are collected in `src/content.config.ts`, and are rendered through route files in `src/pages/`.

Key architecture points:

- `astro.config.mjs` configures the Astro site, Cloudflare adapter, MDX, sitemap, and Tailwind via Vite.
- `src/content.config.ts` defines the `posts` content collection and validates the date-based post naming scheme.
- `src/lib/posts.ts` centralizes post ordering, excerpts, archive/tag logic, and path helpers.
- `src/pages/` contains static routes for the home page, post pages, archive pages, tag pages, and legal pages.
- `src/layouts/Layout.astro` is the shared wrapper for document metadata, SEO tags, fonts, header, and footer.
- `src/constants.ts` holds site metadata, author data, and social links.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

This project uses pnpm and Node 22.13+ (`package.json`):

- Install dependencies: `pnpm install --frozen-lockfile`
- Start the dev server: `pnpm dev` or `astro dev --background`
- Build production output: `pnpm build`
- Preview the built site: `pnpm preview`
- Lint: `pnpm lint`
- Fix lint issues: `pnpm lint:fix`
- Format: `pnpm fmt`
- Check formatting without fixing: `pnpm fmt:check`
- Deploy to Cloudflare Workers: `pnpm deploy`

CI (`.github/workflows/ci.yml`) runs on pull requests to `main`:

- `pnpm lint`
- `pnpm fmt:check`
- `pnpm test`
- `pnpm build`

Deploy (`.github/workflows/deploy.yml`) runs on pushes to `main`: `pnpm build`, then `pnpm deploy`.

Tests use Node's built-in runner (`node --experimental-strip-types --test`) and live under `src/`. For a focused validation pass, prefer:

- `pnpm lint` for component/script/style changes
- `pnpm build` for MDX/posts/routes/content changes
- `pnpm fmt:check` when editing formatting-sensitive files

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Content and routing conventions

- Posts are authored as `posts/YYYY-MM-DD-slug/README.mdx`.
- The folder name is part of the route and the post ID; the date must be a valid Gregorian date.
- Frontmatter is validated in `src/content.config.ts` and must include:
  - `title: string`
  - `author: string`
  - `tags: string[]`
  - `published: date`
  - optional `updated: date`
- Keep route generation logic centralized in `src/lib/posts.ts` rather than duplicating path/date logic across pages.
- Prefer the `@/*` import alias defined in `tsconfig.json` for internal imports.
- When changing pages or shared layout code, keep SEO metadata consistent with `Layout.astro` and `src/constants.ts`.

## Repository-specific conventions

- The site is Japanese-first; project docs and user-facing text are written in Japanese unless a specific file is intentionally bilingual.
- The README explicitly states: run lint, format, and build before committing. Pull request CI also runs those checks and the test script.
- `public/` is for static assets such as favicon, manifest, OG images, and site files.
- `resource/` is reserved for excluded or separately licensed content and should not be treated like normal source code.
- Use the existing Astro/MDX/Tailwind stack; avoid introducing alternative frameworks or build systems unless a task explicitly requires them.

## Useful references

- `README.md` — repo overview and project rules
- `AGENTS.md` — repo-specific guidance for local dev workflow
- `.github/workflows/ci.yml` — pull request checks
- `.github/workflows/deploy.yml` — production build and deploy
- `.github/workflows/update-posts.yml` and `merge-posts.yml` — posts submodule pull request and merge
- `posts/.github/workflows/post.yml` — starts the posts update from `datenn-si/posts`
