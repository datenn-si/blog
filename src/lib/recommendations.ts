import type { Post } from './posts';

export function getRelatedPosts(posts: Post[], currentPost: Post, limit: number): Post[] {
  if (limit <= 0) return [];

  const currentTags = new Set(currentPost.data.tags);

  return posts
    .filter((post) => post.id !== currentPost.id)
    .map((post) => ({
      post,
      score:
        post.data.tags.filter((tag) => currentTags.has(tag)).length +
        Number(post.data.category === currentPost.data.category),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.post.data.published.getTime() - a.post.data.published.getTime() ||
        a.post.id.localeCompare(b.post.id, 'ja'),
    )
    .slice(0, limit)
    .map(({ post }) => post);
}
