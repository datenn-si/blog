// @ts-check
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import expressiveCode from 'astro-expressive-code';
import { unified } from '@astrojs/markdown-remark';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import rehypeToc from 'rehype-toc';
import remarkGfm from 'remark-gfm';
import remarkLinkCard from 'remark-link-card-plus';
import remarkGithubAlerts from 'remark-github-alerts';

import { siteConfig } from '@/constants';
import { ogImageIntegration } from '@/lib/og-image';

const pagefindBin = fileURLToPath(new URL('./runner/bin.cjs', import.meta.resolve('pagefind')));

/** @returns {import('astro').AstroIntegration} */
function pagefindIntegration() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': ({ dir }) =>
        new Promise((resolve, reject) => {
          const child = spawn(process.execPath, [pagefindBin, '--site', fileURLToPath(dir)], {
            stdio: 'inherit',
          });
          child.on('error', reject);
          child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`pagefind exited with ${code}`));
          });
        }),
    },
  };
}

/** @type {import('@astrojs/markdown-remark').RemarkPlugin<[]>} */
const addNotProseToLinkCards = () => (tree) => {
  for (const node of tree.children) {
    if (node.type === 'html') {
      node.value = node.value.replace(
        'class="remark-link-card-plus__container"',
        'class="not-prose remark-link-card-plus__container"',
      );
    }
  }
};

/** @type {import('@astrojs/markdown-remark').RehypePlugin<[import('rehype-toc').Options]>} */
// @ts-expect-error rehype-toc's declarations use Unified 9, while Astro's processor uses Unified 11.
const rehypeTocPlugin = rehypeToc;

// https://astro.build/config
export default defineConfig({
  site: siteConfig.siteUrl,
  trailingSlash: 'always',
  adapter: cloudflare(),

  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkGfm,
        remarkGithubAlerts,
        [remarkLinkCard, { cache: true, shortenUrl: true, thumbnailPosition: 'right' }],
        addNotProseToLinkCards,
      ],
      rehypePlugins: [
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
        rehypeSlug,
        [
          rehypeTocPlugin,
          {
            headings: ['h2', 'h3'],
            cssClasses: {
              toc: 'toc not-prose',
              list: 'toc-list',
              listItem: 'toc-item',
              link: 'toc-link',
            },
            customizeTOC: (/** @type {import('rehype-toc').HtmlElementNode} */ toc) => ({
              type: 'element',
              tagName: 'details',
              properties: {
                'data-pagefind-ignore': '',
                open: 'open',
                className: 'toc-shell',
              },
              children: [
                {
                  type: 'element',
                  tagName: 'summary',
                  properties: { className: 'toc-summary' },
                  children: [
                    { type: 'text', value: '目次' },
                    {
                      type: 'element',
                      tagName: 'span',
                      properties: {
                        className: 'icon-[mdi--chevron-down] toc-chevron',
                        ariaHidden: 'true',
                      },
                      children: [],
                    },
                  ],
                },
                toc,
              ],
            }),
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'append',
            properties: {
              className: ['heading-anchor'],
              ariaLabel: '見出しへのリンク',
              tabIndex: 0,
            },
            content: {
              type: 'element',
              tagName: 'span',
              properties: {
                className: ['icon-[mdi--link-variant]'],
                ariaHidden: 'true',
              },
              children: [],
            },
          },
        ],
      ],
    }),
  },

  fonts: [
    {
      cssVariable: '--font-noto-sans-jp',
      name: 'Noto Sans JP',
      provider: fontProviders.google(),
      weights: ['300 700'],
      subsets: ['latin', 'japanese'],
    },
  ],

  vite: {
    build: {
      assetsInlineLimit: 1,
    },
    plugins: [tailwindcss()],
  },

  integrations: [
    ogImageIntegration,
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : false),
      defaultProps: {
        wrap: true,
      },
    }),
    mdx(),
    sitemap(),
    pagefindIntegration(),
  ],
});
