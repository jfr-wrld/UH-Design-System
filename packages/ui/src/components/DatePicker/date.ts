/**
 * Date arithmetic and naming for the calendar.
 *
 * Everything here works in local time on whole days. A calendar cell is a
 * civil date, not an instant: 3 March is 3 March wherever the pilgrim is, and
 * carrying a time of day through would let a UTC-midnight value land on the
 * 2nd for anyone west of Greenwich.
 *
 * Every name and number that reaches the screen comes from Intl. Month and
 * weekday names are never assembled from a table in this file, so a locale we
 * have not thought about still reads correctly.
 */

export type DisabledDates = readonly Date[] | ((date: Date) => boolean);

export interface CalendarDay {
  date: Date;
  /** A leading or trailing day belonging to a neighbouring month. */
  outside: boolean;
}

export const startOfDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date: Date, count: number): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + count);

/** Clamps rather than rolls over, so 31 January plus one month is 28 February. */
export function addMonths(date: Date, count: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + count, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Negative when a is earlier, zero on the same day, positive when later. */
export function compareDay(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export const isSameDay = (a: Date, b: Date): boolean => compareDay(a, b) === 0;

export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

/** Whole days from a to b, inclusive of both ends. 3rd to 5th is three days. */
export const dayCount = (a: Date, b: Date): number =>
  Math.round(Math.abs(compareDay(a, b)) / 86_400_000) + 1;

/**
 * Which weekday a week begins on in this locale, as 0 for Sunday through 6 for
 * Saturday. Intl reports 1 for Monday through 7 for Sunday, so Sunday folds
 * back to 0 to line up with Date#getDay.
 */
export function weekStart(locale: string): number {
  try {
    const info = (
      new Intl.Locale(locale) as Intl.Locale & { getWeekInfo?: () => { firstDay: number } }
    ).getWeekInfo?.();
    if (info && typeof info.firstDay === 'number') return info.firstDay % 7;
  } catch {
    /* Older engines have no week info; Monday is the safe default here. */
  }
  return 1;
}

/**
 * Always six rows, even when five would do. A grid that changed height between
 * March and April would move the buttons under it every time the month
 * changed.
 */
export function monthGrid(month: Date, weekStartsOn: number): CalendarDay[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const start = addDays(first, -lead);

  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, week * 7 + index);
      return { date, outside: !isSameMonth(date, month) };
    }),
  );
}

/* ------------------------------------------------------------------ names */

const cache = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let found = cache.get(key);
  if (!found) {
    found = new Intl.DateTimeFormat(locale, options);
    cache.set(key, found);
  }
  return found;
}

/** "March 2026", "Mac 2026", "Maret 2026". */
export const monthYearLabel = (month: Date, locale: string): string =>
  formatter(locale, { month: 'long', year: 'numeric' }).format(month);

/** The full name a screen reader should read for a cell. */
export const fullDateLabel = (date: Date, locale: string): string =>
  formatter(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(
    date,
  );

/**
 * "15 Mar 2026". The compact form a card uses.
 *
 * Order comes from the locale, not from us: `en` is American and puts the
 * month first, while `en-MY`, `en-GB`, `ms-MY` and `id-ID` all lead with the
 * day. A Malaysian product wanting day-first English asks for `en-MY`.
 */
export const formatDateShort = (date: Date, locale: string): string =>
  formatter(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

/** What the trigger shows once a date is chosen. */
export const formatDate = (date: Date, locale: string): string =>
  formatter(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);

/**
 * Both ends of a range in one string. Intl collapses whatever the two dates
 * share and supplies the locale's own separator, so English gets "3 - 12 March
 * 2026" and Indonesian gets its own form without a separator being invented
 * here.
 */
export const formatDateRange = (start: Date, end: Date, locale: string): string =>
  formatter(locale, { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(start, end);

/** The number in the cell. Through Intl, so a locale with its own digits gets them. */
export const dayNumber = (date: Date, locale: string): string =>
  new Intl.NumberFormat(locale, { useGrouping: false }).format(date.getDate());

export interface WeekdayName {
  short: string;
  long: string;
}

export function weekdayNames(locale: string, weekStartsOn: number): WeekdayName[] {
  /* Any known Sunday will do; 7 January 2024 is one. */
  const sunday = new Date(2024, 0, 7);
  return Array.from({ length: 7 }, (_, index) => {
    const day = addDays(sunday, weekStartsOn + index);
    return {
      short: formatter(locale, { weekday: 'short' }).format(day),
      long: formatter(locale, { weekday: 'long' }).format(day),
    };
  });
}

/* ------------------------------------------------------------- disabling */

export interface DateBounds {
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  disabledDates?: DisabledDates | undefined;
}

/**
 * Folds the three ways a consumer can rule a date out into one predicate, so
 * every caller asks the same question and cannot disagree about the answer.
 */
export function makeIsDisabled(bounds: DateBounds): (date: Date) => boolean {
  const { minDate, maxDate, disabledDates } = bounds;
  const listed =
    disabledDates && Array.isArray(disabledDates)
      ? new Set(disabledDates.map((date) => startOfDay(date).getTime()))
      : null;
  const predicate = typeof disabledDates === 'function' ? disabledDates : null;

  return (date: Date) => {
    const day = startOfDay(date);
    if (minDate && compareDay(day, minDate) < 0) return true;
    if (maxDate && compareDay(day, maxDate) > 0) return true;
    if (listed) return listed.has(day.getTime());
    if (predicate) return predicate(day);
    return false;
  };
}

/**
 * The nearest selectable day from `from`, walking in `step` day increments.
 * Returns null when the walk finds nothing, which is what stops the caret
 * moving into a month that is entirely ruled out.
 */
export function nextEnabled(
  from: Date,
  step: number,
  isDisabled: (date: Date) => boolean,
  limit = 366,
): Date | null {
  let candidate = from;
  for (let tries = 0; tries < limit; tries += 1) {
    if (!isDisabled(candidate)) return candidate;
    candidate = addDays(candidate, step);
  }
  return null;
}

/**
 * The selectable day closest to `target` without leaving `target`'s month.
 * Used by the month buttons: stepping into April should land somewhere in
 * April or not move at all, never skid into May looking for a free day.
 */
export function nearestEnabledInMonth(
  target: Date,
  isDisabled: (date: Date) => boolean,
): Date | null {
  const year = target.getFullYear();
  const month = target.getMonth();
  const last = new Date(year, month + 1, 0).getDate();

  for (let offset = 0; offset < last; offset += 1) {
    for (const direction of offset === 0 ? [0] : [-1, 1]) {
      const day = target.getDate() + direction * offset;
      if (day < 1 || day > last) continue;
      const candidate = new Date(year, month, day);
      if (!isDisabled(candidate)) return candidate;
    }
  }
  return null;
}

/** Index of `date` within its week, given where the week starts. */
export const dayOfWeekIndex = (date: Date, weekStartsOn: number): number =>
  (date.getDay() - weekStartsOn + 7) % 7;

/**
 * Where the caret belongs when a calendar opens: the chosen day if it is still
 * selectable, otherwise today, and otherwise the nearest day the consumer
 * allows.
 *
 * The last step matters more than it looks. Opening on a day nobody may pick
 * leaves the grid with no tab stop at all, so a keyboard user arrives in a
 * calendar they cannot move around in. When today falls outside the bounds the
 * search therefore starts from the bound it fell outside of, not from today.
 */
export function openingDate(
  selected: Date | null,
  bounds: DateBounds,
  isDisabled: (date: Date) => boolean,
): Date {
  if (selected && !isDisabled(selected)) return selected;

  const today = startOfDay(new Date());
  if (!isDisabled(today)) return today;

  const { minDate, maxDate } = bounds;
  const anchor =
    minDate && compareDay(today, minDate) < 0
      ? startOfDay(minDate)
      : maxDate && compareDay(today, maxDate) > 0
        ? startOfDay(maxDate)
        : today;

  return nearestEnabledInMonth(anchor, isDisabled) ?? nextEnabled(anchor, 1, isDisabled) ?? anchor;
}
