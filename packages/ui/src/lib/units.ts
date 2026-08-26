/**
 * Quantities that are not money.
 *
 * Everything goes through Intl, which is doing more work here than it looks:
 * it translates the unit, pluralises it, and picks the decimal mark. "14 days"
 * becomes "14 hari" with no table of our own, and 1.2 km becomes 1,2 km in
 * Indonesian.
 */

/** "14 days", "14 hari". Intl handles both the word and its plural. */
export function formatDuration(days: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'day',
    unitDisplay: 'long',
    maximumFractionDigits: 0,
  }).format(days);
}

/**
 * "200 m" below a kilometre, "1.2 km" above it.
 *
 * The switch is here rather than at the call site so that every distance in
 * the product breaks at the same place. Walking distance to the Haram is the
 * number pilgrims compare packages on, and a list mixing "1200 m" with "1.2 km"
 * makes that comparison harder than it needs to be.
 */
export function formatDistance(metres: number, locale: string): string {
  const kilometres = metres >= 1000;
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: kilometres ? 'kilometer' : 'meter',
    unitDisplay: 'short',
    maximumFractionDigits: kilometres ? 1 : 0,
  }).format(kilometres ? metres / 1000 : metres);
}

/** A rating or a review count. Grouped, so 1,284 reviews reads as a number. */
export function formatCount(value: number, locale: string, fractionDigits = 0): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
