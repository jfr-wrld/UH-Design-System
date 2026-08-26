import { describe, expect, it } from 'vitest';

import { formatCount, formatDistance, formatDuration } from './units.js';

describe('formatDuration', () => {
  /* Intl translates and pluralises; there is no table of our own to drift. */
  it.each([
    ['en', 14, '14 days'],
    ['en', 1, '1 day'],
    ['ms-MY', 14, '14 hari'],
    ['id-ID', 14, '14 hari'],
  ])('%s renders %i days as %s', (locale, days, expected) => {
    expect(formatDuration(days, locale)).toBe(expected);
  });
});

describe('formatDistance', () => {
  it('stays in metres below a kilometre', () => {
    expect(formatDistance(200, 'en')).toBe('200 m');
    expect(formatDistance(999, 'en')).toBe('999 m');
  });

  it('switches to kilometres at a thousand metres', () => {
    expect(formatDistance(1000, 'en')).toBe('1 km');
    expect(formatDistance(1200, 'en')).toBe('1.2 km');
  });

  /* One break point for the whole product: a list mixing "1200 m" with
     "1.2 km" makes the comparison pilgrims actually care about harder. */
  it('breaks at the same place whatever the locale', () => {
    expect(formatDistance(999, 'id-ID')).toBe('999 m');
    expect(formatDistance(1200, 'id-ID')).toBe('1,2 km');
    expect(formatDistance(1200, 'ms-MY')).toBe('1.2 km');
  });

  it('rounds metres to whole numbers', () => {
    expect(formatDistance(249.6, 'en')).toBe('250 m');
  });
});

describe('formatCount', () => {
  it('groups a large count', () => {
    expect(formatCount(1284, 'en')).toBe('1,284');
    expect(formatCount(1284, 'id-ID')).toBe('1.284');
  });

  it('keeps a rating to one decimal when asked', () => {
    expect(formatCount(4.8, 'en', 1)).toBe('4.8');
    expect(formatCount(5, 'en', 1)).toBe('5.0');
    expect(formatCount(4.8, 'id-ID', 1)).toBe('4,8');
  });
});
