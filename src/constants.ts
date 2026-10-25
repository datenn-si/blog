import type { ImageMetadata } from 'astro';
import icon from './assets/icon.png';

export const postsPerPage = 10;
export const recommendedPostsLimit = 3;

export const navigationItems: { label: string; href: string }[] = [
  { label: 'タグ', href: '/tags/' },
  { label: 'カテゴリ', href: '/categories/' },
  { label: 'アーカイブ', href: '/archive/' },
];

export type Author = {
  readonly id: string;
  readonly name: string;
  readonly icon: ImageMetadata;
};

export const authors: Record<string, Author> = {
  'datenn-si': {
    id: 'datenn-si',
    name: 'だてんし',
    icon,
  },
};

export function getAuthor(id: string): Author | undefined {
  return authors[id];
}

export const siteConfig: {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly siteDefaultDescription: string;
  readonly siteDefaultOGImagePath: string;
  readonly twitterCardType: 'summary' | 'summary_large_image';
  readonly twitterUserName: string;
} = {
  siteName: 'blog.datenn.si',
  siteUrl: 'https://blog.datenn.si/',
  siteDefaultDescription:
    '「だてんし」（@datenn-si）の個人ブログ。Web開発や生成 AI 関連のことを書いていきます。',
  siteDefaultOGImagePath: '/og-image.png',
  twitterCardType: 'summary_large_image',
  twitterUserName: 'datenn_si',
};

export const socialLinks: {
  readonly name: string;
  readonly url: string;
  readonly iconClass: string;
}[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/datenn-si',
    iconClass: 'icon-[simple-icons--github]',
  },
  {
    name: 'X',
    url: 'https://x.com/datenn_si',
    iconClass: 'icon-[simple-icons--x]',
  },
  {
    name: 'Bluesky',
    url: 'https://bsky.app/profile/datenn.si',
    iconClass: 'icon-[simple-icons--bluesky]',
  },
  {
    name: 'Hugging Face',
    url: 'https://huggingface.co/datenn-si',
    iconClass: 'icon-[simple-icons--huggingface]',
  },
  {
    name: 'note',
    url: 'https://note.com/datenn_si',
    iconClass: 'icon-[simple-icons--note]',
  },
  {
    name: 'Qiita',
    url: 'https://qiita.com/datenn-si',
    iconClass: 'icon-[simple-icons--qiita]',
  },
  {
    name: 'Zenn',
    url: 'https://zenn.dev/datenn_si',
    iconClass: 'icon-[simple-icons--zenn]',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@datenn-si',
    iconClass: 'icon-[simple-icons--youtube]',
  },
  {
    name: 'pixiv',
    url: 'https://pixiv.me/datenn-si',
    iconClass: 'icon-[simple-icons--pixiv]',
  },
];
