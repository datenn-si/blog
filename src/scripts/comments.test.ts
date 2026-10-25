import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { giscusTheme, sendGiscusTheme } from './comments.ts';

test('giscus theme follows the page', () => {
  assert.equal(giscusTheme(false), 'light');
  assert.equal(giscusTheme(true), 'dark');
});

test('sendGiscusTheme does nothing without a frame', () => {
  assert.equal(sendGiscusTheme(null, 'dark'), false);
});

test('sendGiscusTheme skips a lazy frame that has not navigated', () => {
  let posted = false;
  const iframe = {
    contentWindow: {
      postMessage() {
        posted = true;
        throw new DOMException(
          "The target origin provided does not match the recipient window's origin.",
        );
      },
    },
    contentDocument: {},
  } as unknown as HTMLIFrameElement;
  assert.equal(sendGiscusTheme(iframe, 'light'), false);
  assert.equal(posted, false);
});

test('sendGiscusTheme posts when the widget frame is ready', () => {
  let message: unknown;
  let origin = '';
  const iframe = {
    contentWindow: {
      postMessage(data: unknown, target: string) {
        message = data;
        origin = target;
      },
    },
    get contentDocument(): Document | null {
      return null;
    },
  } as unknown as HTMLIFrameElement;
  assert.equal(sendGiscusTheme(iframe, 'dark'), true);
  assert.deepEqual(message, { giscus: { setConfig: { theme: 'dark' } } });
  assert.equal(origin, 'https://giscus.app');
});

test('csp allows giscus', () => {
  const headers = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../public/_headers'),
    'utf8',
  );
  assert.ok(
    headers.includes(
      "script-src 'self' 'sha256-h1VyDNS+EPgt/19Gf8VYx/FRqUfEiu7bbZxkYHBCv2Q=' 'wasm-unsafe-eval' https://static.cloudflareinsights.com/ https://giscus.app",
    ),
  );
  assert.ok(headers.includes("style-src-elem 'self' 'unsafe-inline' https://giscus.app"));
  assert.ok(headers.includes('frame-src https://giscus.app'));
  assert.equal(headers.includes('/giscus/'), false);
});
