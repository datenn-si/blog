import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const excerptLength = 100;

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => {
    const byDate = b.data.published.getTime() - a.data.published.getTime();
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id, 'ja');
  });
}

export function formatPostDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

export function formatPostDateIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function excerptFromMarkdown(markdown: string, length = excerptLength): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/^\s*(?:import|export)\s.+$/gm, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return text.slice(0, length) + (text.length > length ? '...' : '');
}

export function postDescription(post: Post): string {
  return post.data.description ?? excerptFromMarkdown(post.body ?? '');
}

export function postPath(id: string): string {
  return `/posts/${encodeURIComponent(id)}/`;
}

export function tagPath(tag: string): string {
  return `/tags/${encodeURIComponent(tag)}/`;
}

export function categoryPath(category: string): string {
  return `/categories/${encodeURIComponent(category)}/`;
}

export function yearPath(year: number): string {
  return `/archive/${year}/`;
}

export function monthParam(month: number): string {
  return String(month).padStart(2, '0');
}

export function monthPath(year: number, month: number): string {
  return `/archive/${year}-${monthParam(month)}/`;
}

export function postsWithTag(posts: Post[], tag: string): Post[] {
  return posts.filter((post) => post.data.tags.includes(tag));
}

export function postsWithCategory(posts: Post[], category: string): Post[] {
  return posts.filter((post) => post.data.category === category);
}

export function postsInYear(posts: Post[], year: number): Post[] {
  return posts.filter((post) => post.data.published.getUTCFullYear() === year);
}

export function postsInMonth(posts: Post[], year: number, month: number): Post[] {
  return posts.filter(
    (post) =>
      post.data.published.getUTCFullYear() === year &&
      post.data.published.getUTCMonth() + 1 === month,
  );
}

export type TagCount = {
  tag: string;
  count: number;
};

export function countTags(posts: Post[]): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag, 'ja') || b.count - a.count);
}

export type CategoryCount = {
  category: string;
  count: number;
};

export function countCategories(posts: Post[]): CategoryCount[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    const category = post.data.category;
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category, 'ja') || b.count - a.count);
}

export type MonthCount = {
  month: number;
  count: number;
};

export type YearArchive = {
  year: number;
  count: number;
  months: MonthCount[];
};

export function groupArchive(posts: Post[]): YearArchive[] {
  const years = new Map<number, Map<number, number>>();
  for (const post of posts) {
    const year = post.data.published.getUTCFullYear();
    const month = post.data.published.getUTCMonth() + 1;
    const months = years.get(year) ?? new Map<number, number>();
    months.set(month, (months.get(month) ?? 0) + 1);
    years.set(year, months);
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      count: [...months.values()].reduce((sum, count) => sum + count, 0),
      months: [...months.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([month, count]) => ({ month, count })),
    }));
}

export function pageDocumentTitle(heading: string, currentPage: number): string {
  return currentPage === 1 ? heading : `${heading}（${currentPage}）`;
}
