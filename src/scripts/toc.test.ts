import assert from 'node:assert/strict';
import test from 'node:test';

import { tocShouldBeFloating, tocShouldScroll } from './toc.ts';

test('toc floats once its home position is fully out of view', () => {
  assert.equal(tocShouldBeFloating(1, false), false);
  assert.equal(tocShouldBeFloating(0, false), true);
  assert.equal(tocShouldBeFloating(-100, false), true);
});

test('toc returns just before its home position comes back into view', () => {
  assert.equal(tocShouldBeFloating(-25, true), true);
  assert.equal(tocShouldBeFloating(-24, true), true);
  assert.equal(tocShouldBeFloating(-23, true), false);
  assert.equal(tocShouldBeFloating(0, true), false);
});

test('toc list scrolls only while floating and taller than the cap', () => {
  assert.equal(tocShouldScroll(false, 400, 200), false);
  assert.equal(tocShouldScroll(true, 180, 200), false);
  assert.equal(tocShouldScroll(true, 400, 200), true);
});
