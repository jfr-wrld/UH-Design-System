/** A calendar date - no time-of-day, no timezone, the same "plain civil
    value" spirit `TimeValue` already keeps for time of day. */
export interface DateValue {
  year: number;
  /** 1-12. */
  month: number;
  /** 1-31, bounded by whichever month/year it actually sits in. */
  day: number;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function pad4(n: number): string {
  return String(n).padStart(4, '0');
}

/** How many days `month` (1-12) actually has in `year` - the one thing a
    time-of-day segment never had to ask, since every hour has 60 minutes
    but not every month has 31 days (and February alone depends on the
    year too). Day 0 of the *next* month is the last day of this one -
    `Date`'s own rollover does the leap-year arithmetic so nothing here
    has to. */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function clampWrap(value: number, min: number, max: number): number {
  const span = max - min + 1;
  return ((((value - min) % span) + span) % span) + min;
}

/** `YYYY-MM-DD`, zero-padded - the value a native `<input type="hidden">`
    needs to carry this field's value into a form submission the same way
    `<input type="date">` would, regardless of which order the segments
    themselves display in. */
export function toNativeDateString(value: DateValue): string {
  return `${pad4(value.year)}-${pad2(value.month)}-${pad2(value.day)}`;
}

/** The sentence a screen reader hears for the field's current value as a
    whole - not per segment, since those are already announced
    individually as they change. Used as the group's aria-valuetext
    equivalent, the same job `formatTimeValue` does for `TimeField`. */
export function formatDateValue(value: DateValue | null, locale: string): string {
  if (!value) return '';
  const date = new Date(value.year, value.month - 1, value.day);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}
