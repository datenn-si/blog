import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';

const invalidIdPrefix = 'invalid/';

const postFilePattern =
  /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})-(?<slug>[^/]+)\/README\.mdx$/;

const invalidEntries = new WeakSet<object>();

function postIdFromEntry(entry: string, data: Record<string, unknown>): string {
  const normalized = entry.replaceAll('\\', '/');
  const match = postFilePattern.exec(normalized);
  if (!match?.groups) {
    invalidEntries.add(data);
    return `${invalidIdPrefix}${normalized}`;
  }

  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const published = new Date(Date.UTC(year, month - 1, day));
  const isRealDate =
    published.getUTCFullYear() === year &&
    published.getUTCMonth() === month - 1 &&
    published.getUTCDate() === day;

  if (!isRealDate) {
    invalidEntries.add(data);
    return `${invalidIdPrefix}${normalized}`;
  }

  data.published = `${match.groups.year}-${match.groups.month}-${match.groups.day}`;
  return match.groups.slug;
}

function postsLoader(): Loader {
  const inner = glob({
    base: new URL('../posts/', import.meta.url),
    pattern: '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]-*/README.mdx',
    generateId: ({ entry, data }) => postIdFromEntry(entry, data),
  });

  return {
    name: 'posts-loader',
    load: async (context) => {
      const { parseData, store } = context;
      await inner.load({
        ...context,
        parseData: (options) => {
          if (invalidEntries.has(options.data)) return Promise.resolve(options.data);
          return parseData(options);
        },
        store: {
          ...store,
          set: (entry) => {
            if (entry.id.startsWith(invalidIdPrefix) || invalidEntries.has(entry.data))
              return false;
            return store.set(entry);
          },
        },
      });

      for (const id of store.keys()) {
        if (id.startsWith(invalidIdPrefix)) store.delete(id);
      }
    },
  };
}

const posts = defineCollection({
  loader: postsLoader(),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1).optional(),
    author: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string()),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { posts };
