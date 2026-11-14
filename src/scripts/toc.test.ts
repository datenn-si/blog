import assert from 'node:assert/strict';
import test from 'node:test';

import { tocShouldScroll, tocShouldStick } from './toc.ts';

test('toc sticks at the sticky line and releases just below it', () => {
  assert.equal(tocShouldStick(61, 60, false), false);
  assert.equal(tocShouldStick(60, 60, false), true);
  assert.equal(tocShouldStick(60.5, 60, true), true);
  assert.equal(tocShouldStick(62, 60, true), false);
});

test('toc list scrolls only while stuck and taller than the cap', () => {
  assert.equal(tocShouldScroll(false, 400, 200), false);
  assert.equal(tocShouldScroll(true, 180, 200), false);
  assert.equal(tocShouldScroll(true, 400, 200), true);
});
