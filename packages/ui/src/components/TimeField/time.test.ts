import { describe, expect, it } from 'vitest';

import { clampWrap, pad2, to12Hour, to24Hour, toNativeTimeString } from './time.js';

describe('pad2', () => {
  it('pads single digits', () => {
    expect(pad2(5)).toBe('05');
  });

  it('leaves two digits alone', () => {
    expect(pad2(23)).toBe('23');
  });
});

describe('clampWrap', () => {
  it('wraps past the max back to the min', () => {
    expect(clampWrap(13, 1, 12)).toBe(1);
  });

  it('wraps below the min back to the max', () => {
    expect(clampWrap(0, 1, 12)).toBe(12);
  });

  it('leaves an in-range value alone', () => {
    expect(clampWrap(6, 1, 12)).toBe(6);
  });
});

describe('to12Hour', () => {
  it('midnight is 12 AM', () => {
    expect(to12Hour(0)).toEqual({ hour12: 12, period: 'am' });
  });

  it('noon is 12 PM', () => {
    expect(to12Hour(12)).toEqual({ hour12: 12, period: 'pm' });
  });

  it('13:00 is 1 PM', () => {
    expect(to12Hour(13)).toEqual({ hour12: 1, period: 'pm' });
  });

  it('9:00 is 9 AM', () => {
    expect(to12Hour(9)).toEqual({ hour12: 9, period: 'am' });
  });
});

describe('to24Hour', () => {
  it('12 AM is midnight', () => {
    expect(to24Hour(12, 'am')).toBe(0);
  });

  it('12 PM is noon', () => {
    expect(to24Hour(12, 'pm')).toBe(12);
  });

  it('1 PM is 13:00', () => {
    expect(to24Hour(1, 'pm')).toBe(13);
  });

  it('9 AM is 9:00', () => {
    expect(to24Hour(9, 'am')).toBe(9);
  });
});

describe('toNativeTimeString', () => {
  it('formats HH:MM, zero-padded', () => {
    expect(toNativeTimeString({ hour: 9, minute: 5 })).toBe('09:05');
  });

  it('formats HH:MM:SS when a second is present', () => {
    expect(toNativeTimeString({ hour: 9, minute: 5, second: 3 })).toBe('09:05:03');
  });
});
