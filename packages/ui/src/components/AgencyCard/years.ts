/**
 * How long an agency has been running, worked out rather than stored.
 *
 * The prop carries the year operations began, not a count of years. A stored
 * "12" is right for one year and quietly wrong for every year after it, and
 * nothing in the product would ever notice: the number would simply stop being
 * true. Counting from the founding year is the only version that stays honest
 * while nobody is looking.
 *
 * Returns null when the year cannot be one - a count passed by mistake, a year
 * in the future, a fraction - so the caller shows nothing rather than
 * "2,014 years in operation".
 */
export function yearsInOperation(since: number, now: Date = new Date()): number | null {
  if (!Number.isInteger(since)) return null;

  const thisYear = now.getFullYear();
  /* Modern travel licensing does not predate this, and anything smaller is a
     duration that has been handed over in place of a year. */
  if (since < 1900 || since > thisYear) return null;

  const years = thisYear - since;
  /* An agency in its first year has no count worth printing. */
  return years >= 1 ? years : null;
}
