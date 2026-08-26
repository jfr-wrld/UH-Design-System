import { describe, expect, it } from 'vitest';

import { yearsInOperation } from './years.js';

const NOW = new Date(2026, 5, 1);

describe('yearsInOperation', () => {
  it('counts from the founding year', () => {
    expect(yearsInOperation(2014, NOW)).toBe(12);
  });

  /*
   * The reason this is computed at all. A stored count is right once and
   * silently wrong every year after, and nothing in the product would notice.
   */
  it('gives a different answer next year, from the same input', () => {
    expect(yearsInOperation(2014, new Date(2027, 5, 1))).toBe(13);
  });

  it('says nothing in the founding year itself', () => {
    expect(yearsInOperation(2026, NOW)).toBeNull();
  });

  /* A count handed over in place of a year would otherwise read as
     "2,014 years in operation". */
  it.each([
    ['a duration mistaken for a year', 12],
    ['a year in the future', 2030],
    ['a fraction', 2014.5],
    ['not a number', Number.NaN],
  ])('returns null for %s', (_case, value) => {
    expect(yearsInOperation(value, NOW)).toBeNull();
  });

  it('accepts a long-established agency', () => {
    expect(yearsInOperation(1974, NOW)).toBe(52);
  });
});
