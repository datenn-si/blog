import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { tocBootScript } from './toc-boot.ts';

function boot(bottom: number | null) {
  const classes = new Set<string>();
  const dataset: Record<string, string> = {};
  const shell =
    bottom === null
      ? null
      : {
          getBoundingClientRect: () => ({ bottom }),
          classList: {
            add(name: string) {
              classes.add(name);
            },
          },
          dataset,
        };
  let observerCallback: (() => void) | undefined;
  class MutationObserver {
    constructor(callback: () => void) {
      observerCallback = callback;
    }
    observe() {}
    disconnect() {}
  }
  const document = {
    documentElement: {},
    querySelector: () => shell,
  };
  const addEventListener = () => {};
  new Function('document', 'MutationObserver', 'addEventListener', tocBootScript)(
    document,
    MutationObserver,
    addEventListener,
  );
  observerCallback?.();
  return { hidden: classes.has('toc-boot-pending'), marked: dataset.bootFloat === '1' };
}

test('toc out of view at load is hidden and marked', () => {
  assert.deepEqual(boot(-1), { hidden: true, marked: true });
});

test('toc in view at load is left alone', () => {
  assert.deepEqual(boot(120), { hidden: false, marked: false });
});

test('missing toc is ignored', () => {
  assert.deepEqual(boot(null), { hidden: false, marked: false });
});

test('boot script hash is allowed by CSP', () => {
  const hash = createHash('sha256').update(tocBootScript).digest('base64');
  const headers = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../public/_headers'),
    'utf8',
  );
  assert.ok(headers.includes(`'sha256-${hash}'`));
});
