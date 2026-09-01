import { describe, expect, it } from 'vitest';

import { paginationRange } from './range.js';

describe('paginationRange', () => {
  it('returns every page when the total already fits', () => {
    expect(paginationRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('collapses the tail when standing near the start', () => {
    expect(paginationRange(1, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis-end', 20]);
  });

  it('collapses the head when standing near the end', () => {
    expect(paginationRange(20, 20)).toEqual([1, 'ellipsis-start', 16, 17, 18, 19, 20]);
  });

  it('collapses both sides in the middle', () => {
    expect(paginationRange(10, 20)).toEqual([1, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 20]);
  });

  it('never produces two ellipses back to back or a run past the total', () => {
    for (let pageCount = 1; pageCount <= 30; pageCount += 1) {
      for (let page = 1; page <= pageCount; page += 1) {
        const items = paginationRange(page, pageCount);
        for (const item of items) {
          if (typeof item === 'number') {
            expect(item).toBeGreaterThanOrEqual(1);
            expect(item).toBeLessThanOrEqual(pageCount);
          }
        }
        expect(items[0]).not.toBe('ellipsis-start');
        expect(items[items.length - 1]).not.toBe('ellipsis-end');
      }
    }
  });
});
