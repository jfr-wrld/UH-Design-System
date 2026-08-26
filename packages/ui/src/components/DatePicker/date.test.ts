import { describe, expect, it } from 'vitest';

import {
  addDays,
  addMonths,
  compareDay,
  dayCount,
  dayOfWeekIndex,
  formatDate,
  formatDateRange,
  fullDateLabel,
  isSameDay,
  makeIsDisabled,
  monthGrid,
  monthYearLabel,
  nearestEnabledInMonth,
  nextEnabled,
  startOfDay,
  weekStart,
  weekdayNames,
} from './date.js';

/* Monday 2 March 2026, chosen because March 2026 starts on a Sunday. */
const MARCH_2 = new Date(2026, 2, 2);

describe('date arithmetic', () => {
  it('strips the time of day', () => {
    const noon = new Date(2026, 2, 2, 13, 45, 30, 500);
    expect(startOfDay(noon).getHours()).toBe(0);
    expect(startOfDay(noon).getDate()).toBe(2);
  });

  it('adds days across a month boundary', () => {
    const result = addDays(new Date(2026, 2, 30), 5);
    expect(result.getMonth()).toBe(3);
    expect(result.getDate()).toBe(4);
  });

  /* Rolling over would turn 31 January into 3 March, which is nobody's idea
     of "next month". */
  it('clamps rather than rolls when adding months', () => {
    const result = addMonths(new Date(2026, 0, 31), 1);
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(28);
  });

  it('orders days and ignores the clock', () => {
    expect(compareDay(new Date(2026, 2, 2, 23), new Date(2026, 2, 2, 1))).toBe(0);
    expect(compareDay(new Date(2026, 2, 1), MARCH_2)).toBeLessThan(0);
    expect(compareDay(new Date(2026, 2, 3), MARCH_2)).toBeGreaterThan(0);
    expect(isSameDay(new Date(2026, 2, 2, 9), MARCH_2)).toBe(true);
  });

  it('counts both ends of a span', () => {
    expect(dayCount(MARCH_2, MARCH_2)).toBe(1);
    expect(dayCount(MARCH_2, new Date(2026, 2, 4))).toBe(3);
  });

  /* Umrah trips cross the spring clock change in several of these markets, and
     a span measured in milliseconds would be an hour short across it. */
  it('counts a span that crosses a daylight-saving boundary', () => {
    expect(dayCount(new Date(2026, 2, 28), new Date(2026, 2, 30))).toBe(3);
  });
});

describe('month grid', () => {
  it('always has six rows, so the panel height never jumps', () => {
    for (const month of [new Date(2026, 1, 1), new Date(2026, 2, 1), new Date(2026, 7, 1)]) {
      expect(monthGrid(month, 1)).toHaveLength(6);
    }
  });

  it('has seven days in every row', () => {
    for (const week of monthGrid(MARCH_2, 1)) expect(week).toHaveLength(7);
  });

  it('starts the first row on the requested weekday', () => {
    expect(monthGrid(MARCH_2, 1)[0]![0]!.date.getDay()).toBe(1);
    expect(monthGrid(MARCH_2, 0)[0]![0]!.date.getDay()).toBe(0);
  });

  it('marks the days that belong to a neighbouring month', () => {
    /* March 2026 begins on a Sunday, so a Monday-first grid leads with
       23 February. */
    const first = monthGrid(MARCH_2, 1)[0]![0]!;
    expect(first.outside).toBe(true);
    expect(first.date.getMonth()).toBe(1);
    expect(monthGrid(MARCH_2, 1)[1]![0]!.outside).toBe(false);
  });

  it('runs without a gap', () => {
    const flat = monthGrid(MARCH_2, 1).flat();
    for (let index = 1; index < flat.length; index += 1) {
      expect(dayCount(flat[index - 1]!.date, flat[index]!.date)).toBe(2);
    }
  });
});

/*
 * The names in this block are the ones the specification asks for by hand.
 * They come out of Intl rather than a table here, so the test is really
 * checking that no table was smuggled in.
 */
describe('names through Intl', () => {
  it.each([
    ['en', 'March', 'Mon'],
    ['ms', 'Mac', 'Isn'],
    ['id', 'Maret', 'Sen'],
  ])('names the month and weekday in %s', (locale, month, monday) => {
    expect(monthYearLabel(MARCH_2, locale)).toContain(month);
    const names = weekdayNames(locale, 1);
    expect(names[0]!.short).toBe(monday);
  });

  it('gives a cell the full date as its name', () => {
    expect(fullDateLabel(MARCH_2, 'en')).toBe('Monday, March 2, 2026');
    expect(fullDateLabel(MARCH_2, 'ms')).toBe('Isnin, 2 Mac 2026');
    expect(fullDateLabel(MARCH_2, 'id')).toBe('Senin, 2 Maret 2026');
  });

  it('formats a chosen date for each locale', () => {
    expect(formatDate(MARCH_2, 'en')).toBe('March 2, 2026');
    expect(formatDate(MARCH_2, 'ms')).toBe('2 Mac 2026');
    expect(formatDate(MARCH_2, 'id')).toBe('2 Maret 2026');
  });

  /* Intl collapses what the two ends share and supplies the separator, so no
     dash is invented in our code. */
  it('formats a range through Intl rather than joining two dates', () => {
    const range = formatDateRange(MARCH_2, new Date(2026, 2, 12), 'ms');
    expect(range).toContain('Mac 2026');
    expect(range.match(/Mac/g)).toHaveLength(1);
  });

  it('gives seven weekday names, long and short', () => {
    const names = weekdayNames('en', 0);
    expect(names).toHaveLength(7);
    expect(names[0]).toEqual({ short: 'Sun', long: 'Sunday' });
  });

  /*
   * Reported rather than assumed: these three locales do not agree, so a
   * product that wants one shape across all of them must pin weekStartsOn.
   */
  it('takes the first day of the week from the locale', () => {
    expect(weekStart('ms')).toBe(1);
    expect(weekStart('en')).toBe(0);
    expect(weekStart('id')).toBe(0);
  });

  it('places a day within its week', () => {
    expect(dayOfWeekIndex(MARCH_2, 1)).toBe(0);
    expect(dayOfWeekIndex(MARCH_2, 0)).toBe(1);
  });
});

describe('disabling', () => {
  it('rules out everything before minDate', () => {
    const isDisabled = makeIsDisabled({ minDate: MARCH_2 });
    expect(isDisabled(new Date(2026, 2, 1))).toBe(true);
    expect(isDisabled(MARCH_2)).toBe(false);
  });

  it('rules out everything after maxDate', () => {
    const isDisabled = makeIsDisabled({ maxDate: MARCH_2 });
    expect(isDisabled(new Date(2026, 2, 3))).toBe(true);
    expect(isDisabled(MARCH_2)).toBe(false);
  });

  it('treats both bounds as inclusive', () => {
    const isDisabled = makeIsDisabled({ minDate: MARCH_2, maxDate: MARCH_2 });
    expect(isDisabled(MARCH_2)).toBe(false);
  });

  it('accepts a list of days, whatever time of day they carry', () => {
    const isDisabled = makeIsDisabled({ disabledDates: [new Date(2026, 2, 4, 18, 30)] });
    expect(isDisabled(new Date(2026, 2, 4))).toBe(true);
    expect(isDisabled(new Date(2026, 2, 5))).toBe(false);
  });

  it('accepts a predicate for a rule a list cannot express', () => {
    const isDisabled = makeIsDisabled({ disabledDates: (date) => date.getDay() === 5 });
    expect(isDisabled(new Date(2026, 2, 6))).toBe(true);
    expect(isDisabled(new Date(2026, 2, 7))).toBe(false);
  });
});

describe('finding a selectable day', () => {
  it('returns the day itself when nothing rules it out', () => {
    const found = nextEnabled(MARCH_2, 1, () => false);
    expect(isSameDay(found!, MARCH_2)).toBe(true);
  });

  it('walks in the direction of travel until it finds one', () => {
    const closed = [2, 3, 4].map((day) => new Date(2026, 2, day));
    const isDisabled = makeIsDisabled({ disabledDates: closed });
    expect(nextEnabled(MARCH_2, 1, isDisabled)!.getDate()).toBe(5);
    expect(nextEnabled(MARCH_2, -1, isDisabled)!.getDate()).toBe(1);
  });

  it('gives up rather than walking forever', () => {
    expect(nextEnabled(MARCH_2, 1, () => true, 10)).toBeNull();
  });

  it('stays inside the month when stepping between months', () => {
    const isDisabled = makeIsDisabled({ minDate: new Date(2026, 2, 20) });
    /* Every day of March up to the 19th is out, so the nearest free day in
       March is the 20th and the walk must not skid into April. */
    const found = nearestEnabledInMonth(new Date(2026, 2, 2), isDisabled);
    expect(found!.getMonth()).toBe(2);
    expect(found!.getDate()).toBe(20);
  });

  it('returns null when the whole month is ruled out', () => {
    expect(nearestEnabledInMonth(MARCH_2, () => true)).toBeNull();
  });
});
