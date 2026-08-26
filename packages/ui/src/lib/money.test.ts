import { describe, expect, it } from 'vitest';

import { currencyName, currencySymbol, formatMoney, parseAmount, separators } from './money.js';

describe('formatMoney', () => {
  it('produces the three reference formats in their home locales', () => {
    expect(formatMoney(12500, 'MYR', 'ms-MY', 0)).toBe('RM 12,500');
    expect(formatMoney(45000000, 'IDR', 'id-ID', 0)).toBe('Rp 45.000.000');
    expect(formatMoney(4200, 'SGD', 'en-SG', 0)).toBe('S$ 4,200');
  });

  describe('currency and locale are separate axes', () => {
    it('takes the symbol from the currency, never the locale', () => {
      // Intl's own currency style would print "IDR" here, which is the bug
      // this component exists to avoid.
      expect(formatMoney(45000000, 'IDR', 'en', 0)).toBe('Rp 45,000,000');
      expect(formatMoney(45000000, 'IDR', 'ms-MY', 0)).toBe('Rp 45,000,000');
    });

    it('takes the group separator from the locale, never the currency', () => {
      expect(formatMoney(12500, 'MYR', 'id-ID', 0)).toBe('RM 12.500');
      expect(formatMoney(4200, 'SGD', 'id-ID', 0)).toBe('S$ 4.200');
    });

    it('handles all nine combinations without throwing', () => {
      for (const currency of ['MYR', 'IDR', 'SGD'] as const) {
        for (const locale of ['en', 'ms-MY', 'id-ID']) {
          expect(formatMoney(1234567, currency, locale, 0)).toMatch(/^(RM|Rp|S\$) [\d.,]+$/);
        }
      }
    });
  });

  it('honours fraction digits when asked', () => {
    expect(formatMoney(12500.5, 'MYR', 'en', 2)).toBe('RM 12,500.50');
    expect(formatMoney(12500.5, 'MYR', 'id-ID', 2)).toBe('RM 12.500,50');
  });
});

describe('separators', () => {
  it('reads them from the locale rather than assuming', () => {
    expect(separators('en')).toEqual({ group: ',', decimal: '.' });
    expect(separators('id-ID')).toEqual({ group: '.', decimal: ',' });
  });
});

describe('parseAmount', () => {
  it('reads a bare number', () => {
    expect(parseAmount('12500', 'en', 0)).toBe(12500);
  });

  it.each([
    ['RM 12,500', 'en', 12500],
    ['Rp 45.000.000', 'id-ID', 45000000],
    ['S$ 4,200', 'en', 4200],
    ['12 500', 'en', 12500],
    ['  1.234.567  ', 'id-ID', 1234567],
  ])('sanitises pasted %s', (raw, locale, expected) => {
    expect(parseAmount(raw, locale, 0)).toBe(expected);
  });

  it('treats every separator as grouping when a paste crosses locales', () => {
    // "45.000.000" pasted into an English field is 45 million, not 45.
    expect(parseAmount('45.000.000', 'en', 0)).toBe(45000000);
    expect(parseAmount('45,000,000', 'id-ID', 0)).toBe(45000000);
  });

  it('distinguishes nothing entered from zero', () => {
    expect(parseAmount('', 'en', 0)).toBeNull();
    expect(parseAmount('abc', 'en', 0)).toBeNull();
    expect(parseAmount('0', 'en', 0)).toBe(0);
  });

  describe('with fraction digits', () => {
    it('reads a single decimal separator as a decimal point', () => {
      expect(parseAmount('12,500.75', 'en', 2)).toBe(12500.75);
      expect(parseAmount('12.500,75', 'id-ID', 2)).toBe(12500.75);
    });

    it('treats a repeated separator as grouping, since it cannot be a decimal point', () => {
      expect(parseAmount('1.234.567', 'en', 2)).toBe(1234567);
    });
  });
});

describe('currencyName', () => {
  it('localises the name that the symbol stands for', () => {
    expect(currencyName('MYR', 'en')).toBe('Malaysian Ringgit');
    expect(currencyName('MYR', 'ms-MY')).toBe('Ringgit Malaysia');
  });
});

describe('currencySymbol', () => {
  it('gives S$ for SGD, which Intl cannot', () => {
    // Every currencyDisplay option renders SGD as a bare "$" in en-SG.
    expect(currencySymbol('SGD')).toBe('S$');
    expect(
      new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(1),
    ).toContain('$');
  });
});
