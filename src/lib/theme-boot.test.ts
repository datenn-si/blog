import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { isDarkTheme, themeBootScript, themeMode, type ThemeMode } from './theme-boot.ts';

function boot(stored: string | null, systemDark: boolean) {
  const classes = new Set<string>();
  const dataset: { theme?: string } = {};
  const document = {
    documentElement: {
      dataset,
      classList: {
        toggle(name: string, on: boolean) {
          if (on) classes.add(name);
          else classes.delete(name);
        },
      },
    },
  };
  const localStorage = {
    getItem() {
      return stored;
    },
  };
  const matchMedia = () => ({ matches: systemDark });
  new Function('document', 'localStorage', 'matchMedia', themeBootScript)(
    document,
    localStorage,
    matchMedia,
  );
  return { theme: dataset.theme, dark: classes.has('dark') };
}

const cases: [string | null, boolean, ThemeMode, boolean][] = [
  [null, false, 'auto', false],
  [null, true, 'auto', true],
  ['auto', false, 'auto', false],
  ['auto', true, 'auto', true],
  ['light', true, 'light', false],
  ['dark', false, 'dark', true],
  ['nope', true, 'auto', true],
];

for (const [stored, systemDark, mode, dark] of cases) {
  test(`theme ${stored ?? 'empty'} / system ${systemDark}`, () => {
    assert.equal(themeMode(stored), mode);
    assert.equal(isDarkTheme(mode, systemDark), dark);
    assert.deepEqual(boot(stored, systemDark), { theme: mode, dark });
  });
}

test('boot script hash is allowed by CSP', () => {
  const hash = createHash('sha256').update(themeBootScript).digest('base64');
  const headers = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), '../../public/_headers'),
    'utf8',
  );
  assert.ok(headers.includes(`'sha256-${hash}'`));
});
