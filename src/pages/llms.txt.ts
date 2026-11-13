import type { APIRoute } from 'astro';

import { siteConfig } from '@/constants';
import { getPosts, postDescription, postPath } from '@/lib/posts';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const body = `# ${siteConfig.siteName}

> ${siteConfig.siteDefaultDescription}

## Blog Posts

${posts
  .map((post) => {
    const url = new URL(postPath(post.id), siteConfig.siteUrl).href;
    const description = postDescription(post);
    return `- [${post.data.title}](${url})${description ? `: ${description}` : ''}`;
  })
  .join('\n')}

## Legal Documents

- [プライバシーポリシー](${new URL('/privacy/', siteConfig.siteUrl).href})
- [利用規約](${new URL('/terms/', siteConfig.siteUrl).href})`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
