import { readFileSync } from 'node:fs';
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { Resvg, initWasm } from '@resvg/resvg-wasm';
import { loadDefaultJapaneseParser } from 'budoux';
import satori from 'satori';

import { siteConfig } from '@/constants';

const cardWidth = 1100;
const avatarSize = 200;
const avatarRight = 30;
const detailFontSize = 27;

function iconDataUrl(path: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000000" d="${path}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const dateIcon = iconDataUrl(
  'M19 19H5V8h14m-3-7v2H8V1H6v2H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-1V1m-1 11h-5v5h5z',
);
const updatedIcon = iconDataUrl(
  'M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v-2H5V8h14v1h2V5a2 2 0 0 0-2-2m2.7 10.35l-1 1l-2.05-2l1-1c.2-.21.54-.22.77 0l1.28 1.28c.19.2.19.52 0 .72M12 18.94l6.07-6.06l2.05 2L14.06 21H12z',
);
const categoryIcon = iconDataUrl(
  'M20 18H4V8h16m0-2h-8l-2-2H4c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2',
);
const tagIcon = iconDataUrl(
  'm21.41 11.58l-9-9A2 2 0 0 0 11 2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 .59 1.42l9 9A2 2 0 0 0 13 22a2 2 0 0 0 1.41-.59l7-7A2 2 0 0 0 22 13a2 2 0 0 0-.59-1.42M13 20l-9-9V4h7l9 9M6.5 5A1.5 1.5 0 1 1 5 6.5A1.5 1.5 0 0 1 6.5 5',
);

type OgMetadata = {
  title: string;
  published: string;
  updated: string | null;
  category: string;
  tags: string[];
  icon: string;
};

type OgFonts = {
  regular: Buffer;
  bold: Buffer;
};

function titleFontSize(title: string): number {
  const length = Array.from(title).length;
  // 55文字は従来の最小段階。36px を 45px にしたので各段階を 5/4 倍。
  if (length > 42) return 45;
  if (length > 30) return 55;
  if (length > 18) return 65;
  return 80;
}

function labeledIcon(icon: string, label: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', height: detailFontSize },
            children: {
              type: 'img',
              props: { src: icon, width: detailFontSize, height: detailFontSize },
            },
          },
        },
        { type: 'span', props: { children: label } },
      ],
    },
  };
}

function metaRow(bottom: number, children: ReturnType<typeof labeledIcon>[]) {
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        bottom,
        left: 30,
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        maxWidth: cardWidth - 30 - avatarRight - avatarSize - 16,
        fontSize: detailFontSize,
        lineHeight: 1,
        color: '#000000',
      },
      children,
    },
  };
}

async function textWidth(text: string, font: Buffer): Promise<number> {
  let width = 0;
  await satori(
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          width: 'fit-content',
          fontFamily: 'Noto Sans JP',
          fontSize: detailFontSize,
          lineHeight: 1,
        },
        children: text,
      },
    },
    {
      width: cardWidth,
      height: detailFontSize * 2,
      fonts: [{ name: 'Noto Sans JP', data: font, weight: 400, style: 'normal' }],
      onNodeDetected(node) {
        width = node.width;
      },
    },
  );
  return width;
}

function siteNameNode(width: number) {
  const centerFromRight = avatarRight + avatarSize / 2;
  const fitsCentered = width > 0 && width <= centerFromRight * 2;
  const style = fitsCentered
    ? width <= avatarSize
      ? { right: avatarRight, width: avatarSize, justifyContent: 'center' }
      : { right: centerFromRight - width / 2, width }
    : { right: avatarRight };

  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        bottom: 30,
        display: 'flex',
        fontSize: detailFontSize,
        lineHeight: 1,
        color: '#000000',
        ...style,
      },
      children: siteConfig.siteName,
    },
  };
}

async function createOgSvg(metadata: OgMetadata, fonts: OgFonts): Promise<string> {
  const parser = loadDefaultJapaneseParser();
  const title = parser.parse(metadata.title).join('\u200b');
  const siteNameWidth = await textWidth(siteConfig.siteName, fonts.regular);
  const topics = [
    labeledIcon(categoryIcon, metadata.category),
    ...metadata.tags.map((tag) => labeledIcon(tagIcon, tag)),
  ];
  const dates = [
    labeledIcon(dateIcon, metadata.published),
    ...(metadata.updated ? [labeledIcon(updatedIcon, metadata.updated)] : []),
  ];

  return satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundImage:
            'linear-gradient(297.6deg, rgba(245, 103, 226, 1) 0%, rgba(180, 126, 242, 1) 23%, rgba(164, 133, 234, 1) 48%, rgba(230, 145, 247, 1) 58%, rgba(195, 100, 239, 1) 76%, rgba(228, 98, 219, 1) 100%)',
          fontFamily: 'Noto Sans JP',
        },
        children: {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 50,
              left: 50,
              width: cardWidth,
              height: 530,
              display: 'flex',
              borderRadius: 30,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              color: '#000000',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: 30,
                    left: 30,
                    width: cardWidth - 60,
                    display: 'flex',
                    fontSize: titleFontSize(metadata.title),
                    fontWeight: 700,
                    lineHeight: 1.35,
                  },
                  children: title,
                },
              },
              metaRow(85, topics),
              metaRow(30, dates),
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    bottom: 70,
                    right: avatarRight,
                    width: avatarSize,
                    height: avatarSize,
                    display: 'flex',
                    borderRadius: avatarSize / 2,
                    overflow: 'hidden',
                  },
                  children: {
                    type: 'img',
                    props: {
                      src: metadata.icon,
                      width: avatarSize,
                      height: avatarSize,
                      style: { objectFit: 'cover' },
                    },
                  },
                },
              },
              siteNameNode(siteNameWidth),
            ],
          },
        },
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Noto Sans JP', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Noto Sans JP', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    },
  );
}

export const ogImageIntegration: AstroIntegration = {
  name: 'og-image',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const outputDirectory = fileURLToPath(new URL('posts/', dir));
      const entries = await readdir(outputDirectory, { withFileTypes: true }).catch((error) => {
        if (error.code === 'ENOENT') return [];
        throw error;
      });
      const postDirectories = entries.filter((entry) => entry.isDirectory());
      if (!postDirectories.length) return;

      const wasmPath = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'));
      await initWasm(readFileSync(wasmPath));
      const fonts = {
        regular: readFileSync(new URL('../assets/fonts/noto-sans-jp-regular.ttf', import.meta.url)),
        bold: readFileSync(new URL('../assets/fonts/noto-sans-jp-bold.ttf', import.meta.url)),
      };

      for (const directory of postDirectories) {
        const metadataPath = join(outputDirectory, directory.name, 'og-image.json');
        const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as OgMetadata;
        const svg = await createOgSvg(metadata, fonts);
        const renderer = new Resvg(svg, {
          font: {
            fontBuffers: [fonts.regular, fonts.bold],
            defaultFontFamily: 'Noto Sans JP',
            loadSystemFonts: false,
          },
        });
        try {
          const image = renderer.render();
          try {
            await writeFile(join(outputDirectory, directory.name, 'og-image.png'), image.asPng());
          } finally {
            image.free();
          }
        } finally {
          renderer.free();
        }
        await unlink(metadataPath);
      }
    },
  },
};
