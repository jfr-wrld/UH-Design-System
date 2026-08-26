import { describe, expect, it } from 'vitest';

import { COUNTRY_RULES, formatNational, fromE164, parsePhone, toE164 } from './phone.js';

describe('parsePhone', () => {
  describe('the same Malaysian mobile, four ways', () => {
    // The exact set the brief asks to prove.
    it.each(['0123456789', '+60123456789', '60123456789', '012-345 6789'])(
      '%s normalises to the same number',
      (input) => {
        const parsed = parsePhone(input, 'MY');
        expect(parsed.country).toBe('MY');
        expect(parsed.national).toBe('123456789');
        expect(toE164(parsed.country, parsed.national)).toBe('+60123456789');
      },
    );
  });

  it('takes the country from an explicit plus, overriding the selection', () => {
    // Someone pasting a Singapore number into a field set to Malaysia.
    const parsed = parsePhone('+6591234567', 'MY');
    expect(parsed.country).toBe('SG');
    expect(parsed.national).toBe('91234567');
  });

  it('reads the longest dial code first, so +673 is not read as +6', () => {
    const parsed = parsePhone('+6737123456', 'MY');
    expect(parsed.country).toBe('BN');
    expect(parsed.national).toBe('7123456');
  });

  it('drops the trunk digit only where the country uses one', () => {
    expect(parsePhone('0812345678', 'ID').national).toBe('812345678');
    // Singapore has no trunk prefix, so a leading digit is part of the number.
    expect(parsePhone('91234567', 'SG').national).toBe('91234567');
  });

  it('keeps digits that merely look like a dial code', () => {
    // "6012..." with the dial stripped would leave 8 digits, outside Malaysia's
    // 9 to 10, so it is treated as the number itself.
    const parsed = parsePhone('60123456', 'MY');
    expect(parsed.national).toBe('60123456');
  });

  it('strips punctuation of any shape', () => {
    expect(parsePhone('(012) 345-6789', 'MY').national).toBe('123456789');
    expect(parsePhone('012 345 6789', 'MY').national).toBe('123456789');
  });

  it('returns an empty number rather than guessing', () => {
    expect(parsePhone('', 'MY')).toEqual({ country: 'MY', national: '', dial: '' });
    expect(parsePhone('abc', 'MY').national).toBe('');
  });

  it('falls back to other for an unknown dial code', () => {
    const parsed = parsePhone('+971501234567', 'MY');
    expect(parsed.country).toBe('other');
  });
});

describe('toE164', () => {
  it('emits plus, dial, digits and nothing else', () => {
    expect(toE164('MY', '123456789')).toBe('+60123456789');
    expect(toE164('SG', '91234567')).toBe('+6591234567');
    expect(toE164('BN', '7123456')).toBe('+6737123456');
  });

  it('uses the manual code for other', () => {
    expect(toE164('other', '501234567', '+971')).toBe('+971501234567');
    expect(toE164('other', '501234567', '971')).toBe('+971501234567');
  });

  it('is empty when there is nothing to emit', () => {
    expect(toE164('other', '', '')).toBe('');
  });
});

describe('formatNational', () => {
  it.each([
    ['MY', '123456789', '012-345 6789'],
    ['ID', '81234567890', '0812-3456-7890'],
    ['SG', '91234567', '9123 4567'],
    ['BN', '7123456', '712 3456'],
  ] as const)('formats %s for display', (country, national, expected) => {
    expect(formatNational(country, national)).toBe(expected);
  });

  it('formats partial input as it is typed', () => {
    expect(formatNational('MY', '1')).toBe('01');
    expect(formatNational('MY', '12345')).toBe('012-345');
    expect(formatNational('SG', '9123')).toBe('9123');
  });

  it('appends anything past the pattern rather than dropping it', () => {
    // An unusually long number stays visible instead of being silently cut.
    expect(formatNational('SG', '912345678888')).toContain('8888');
  });

  it('leaves an unknown country unformatted', () => {
    expect(formatNational('other', '501234567')).toBe('501234567');
  });
});

describe('fromE164', () => {
  it('round-trips through the stored form', () => {
    for (const [country, national] of [
      ['MY', '123456789'],
      ['ID', '81234567890'],
      ['SG', '91234567'],
      ['BN', '7123456'],
    ] as const) {
      const stored = toE164(country, national);
      const back = fromE164(stored, 'MY');
      expect(back.country).toBe(country);
      expect(back.national).toBe(national);
    }
  });
});

describe('COUNTRY_RULES', () => {
  it('covers exactly the four supported markets', () => {
    expect(Object.keys(COUNTRY_RULES)).toEqual(['MY', 'ID', 'SG', 'BN']);
  });

  it('each example formats back to itself', () => {
    for (const rule of Object.values(COUNTRY_RULES)) {
      const parsed = parsePhone(rule.example, rule.iso2);
      expect(formatNational(rule.iso2, parsed.national)).toBe(rule.example);
    }
  });
});
