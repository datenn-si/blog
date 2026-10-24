import { getCollection, getEntry } from 'astro:content';
import type { APIRoute, GetStaticPaths } from 'astro';

import iconDataUrl from '@/assets/icon.png?inline';
import { formatPostDate } from '@/lib/posts';

export const prerender = true;

export const getStaticPaths = (async () => {
  const posts = await getCollection('posts');
  return posts.map((post) => ({ params: { slug: post.id } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) return new Response('Not found', { status: 404 });

  const post = await getEntry('posts', slug);
  if (!post) return new Response('Not found', { status: 404 });

  return new Response(
    JSON.stringify({
      title: post.data.title,
      published: formatPostDate(post.data.published),
      updated: post.data.updated ? formatPostDate(post.data.updated) : null,
      category: post.data.category,
      tags: post.data.tags,
      icon: iconDataUrl,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};
