import { describe, expect, it } from 'vitest';

import { daysInMonth, formatDateValue, toNativeDateString } from './date.js';

describe('daysInMonth', () => {
  it('returns 31 for January', () => {
    expect(daysInMonth(2024, 1)).toBe(31);
  });

  it('returns 30 for April', () => {
    expect(daysInMonth(2024, 4)).toBe(30);
  });

  it('returns 29 for February in a leap year', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(daysInMonth(2023, 2)).toBe(28);
  });

  it('returns 28 for February in a century year not divisible by 400', () => {
    expect(daysInMonth(1900, 2)).toBe(28);
  });

  it('returns 29 for February in a century year divisible by 400', () => {
    expect(daysInMonth(2000, 2)).toBe(29);
  });
});

describe('toNativeDateString', () => {
  it('zero-pads month and day, in YYYY-MM-DD order', () => {
    expect(toNativeDateString({ year: 1998, month: 3, day: 5 })).toBe('1998-03-05');
  });

  it('pads a short year out to four digits', () => {
    expect(toNativeDateString({ year: 87, month: 12, day: 25 })).toBe('0087-12-25');
  });
});

describe('formatDateValue', () => {
  it('formats a full localised date', () => {
    expect(formatDateValue({ year: 1998, month: 3, day: 5 }, 'en')).toBe('March 5, 1998');
  });

  it('returns an empty string for null', () => {
    expect(formatDateValue(null, 'en')).toBe('');
  });
});
