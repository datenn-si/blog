import assert from 'node:assert/strict';
import test from 'node:test';

import { getRelatedPosts } from './recommendations.ts';
import type { Post } from './posts.ts';

function post(id: string, category: string, tags: string[], published: string): Post {
  return {
    id,
    data: { category, tags, published: new Date(published) },
  } as Post;
}

test('ranks posts by shared tags and category, excluding unrelated and current posts', () => {
  const current = post('current', 'web', ['astro', 'cloudflare'], '2026-10-24');
  const posts = [
    current,
    post('two-tags', 'other', ['astro', 'cloudflare'], '2025-01-01'),
    post('category-and-tag', 'web', ['astro'], '2026-01-01'),
    post('category-only', 'web', [], '2025-01-01'),
    post('unrelated', 'other', ['python'], '2026-10-01'),
  ];

  assert.deepEqual(
    getRelatedPosts(posts, current, 2).map(({ id }) => id),
    ['category-and-tag', 'two-tags'],
  );
});

test('returns no recommendations when the limit is zero', () => {
  const current = post('current', 'web', ['astro'], '2026-10-24');
  assert.deepEqual(getRelatedPosts([current], current, 0), []);
});
