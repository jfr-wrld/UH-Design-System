import { formatDateShort } from '../DatePicker/date.js';

/** Reviews younger than this read relatively; anything older gets the date. */
const RELATIVE_WINDOW_DAYS = 30;

/**
 * "2 weeks ago" while a review is fresh, "15 Mar 2026" once it is not.
 *
 * The words come from Intl.RelativeTimeFormat with `numeric: 'auto'`, which is
 * what turns -1 day into "yesterday" rather than "1 day ago" - in every locale
 * we ship, with no table of our own. The 30-day window is a product policy,
 * not a formatting one: beyond a month, "5 weeks ago" makes a reader do
 * arithmetic that the date does for free.
 *
 * A timestamp from the future is clock skew, not the future; it reads as the
 * absolute date rather than "in 2 hours", which would be nonsense on a review.
 */
export function formatReviewDate(date: Date, locale: string, now: Date = new Date()): string {
  const elapsedMs = now.getTime() - date.getTime();
  const days = Math.floor(elapsedMs / 86_400_000);

  if (elapsedMs < 0 || days >= RELATIVE_WINDOW_DAYS) return formatDateShort(date, locale);

  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (days >= 7) return relative.format(-Math.floor(days / 7), 'week');
  if (days >= 1) return relative.format(-days, 'day');

  const hours = Math.floor(elapsedMs / 3_600_000);
  if (hours >= 1) return relative.format(-hours, 'hour');

  const minutes = Math.floor(elapsedMs / 60_000);
  if (minutes >= 1) return relative.format(-minutes, 'minute');
  /* numeric:'auto' at zero seconds is the locale's own word for "now". */
  return relative.format(0, 'second');
}
