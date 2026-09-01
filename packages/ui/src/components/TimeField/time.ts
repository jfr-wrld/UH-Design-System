/** A time of day, always in 24-hour canonical form regardless of how the
    field displays it - `hourCycle` is a display choice, not a storage
    format, the same way a `Date` doesn't care what locale renders it. */
export interface TimeValue {
  /** 0-23. */
  hour: number;
  /** 0-59. */
  minute: number;
  /** 0-59. Present only once a field with granularity 'second' has one. */
  second?: number | undefined;
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function clampWrap(value: number, min: number, max: number): number {
  const span = max - min + 1;
  return ((((value - min) % span) + span) % span) + min;
}

/** 0-23 -> [1-12, 'am' | 'pm']. Midnight is 12am, noon is 12pm. */
export function to12Hour(hour24: number): { hour12: number; period: 'am' | 'pm' } {
  const period = hour24 < 12 ? 'am' : 'pm';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, period };
}

/** [1-12, period] -> 0-23. */
export function to24Hour(hour12: number, period: 'am' | 'pm'): number {
  const base = hour12 % 12;
  return period === 'pm' ? base + 12 : base;
}

/** `HH:MM` or `HH:MM:SS`, 24-hour, zero-padded - the value a native
    `<input type="hidden">` needs to carry this field's value into a form
    submission the same way `<input type="time">` would. */
export function toNativeTimeString(value: TimeValue): string {
  const base = `${pad2(value.hour)}:${pad2(value.minute)}`;
  return value.second === undefined ? base : `${base}:${pad2(value.second)}`;
}

/** The sentence a screen reader hears for the field's current value as a
    whole - not per segment, since those are already announced individually
    as they're changed. Used as the group's aria-valuetext equivalent. */
export function formatTimeValue(
  value: TimeValue | null,
  hourCycle: 12 | 24,
  locale: string,
): string {
  if (!value) return '';
  const date = new Date(2000, 0, 1, value.hour, value.minute, value.second ?? 0);
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: value.second === undefined ? undefined : '2-digit',
    hour12: hourCycle === 12,
  }).format(date);
}
