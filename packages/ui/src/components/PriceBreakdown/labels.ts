/** Every word the breakdown can put on screen. */
export interface PriceBreakdownLabels {
  /** Names the whole table for assistive technology. */
  breakdown: string;
  showDetails: string;
  hideDetails: string;
  /** Accessible name of a row's info control: "More about Visa Processing". */
  moreAbout: (label: string) => string;
  /** Read before a discount amount, which is otherwise only a sign and a colour. */
  discount: string;
  /** "Adults × 2". The multiplication sign is typography, so it lives here. */
  quantified: (label: string, count: string) => string;
  /**
   * One passenger-summary fragment per category; zero counts are dropped and
   * the fragments are joined through Intl.ListFormat. The count arrives
   * already formatted for the locale, so "1" is a safe singular test.
   */
  adults: (count: string) => string;
  children: (count: string) => string;
  infants: (count: string) => string;
}

export const DEFAULT_LABELS: PriceBreakdownLabels = {
  breakdown: 'Price breakdown',
  showDetails: 'Show details',
  hideDetails: 'Hide details',
  moreAbout: (label) => `More about ${label}`,
  discount: 'Discount',
  quantified: (label, count) => `${label} × ${count}`,
  adults: (count) => (count === '1' ? '1 Adult' : `${count} Adults`),
  children: (count) => (count === '1' ? '1 Child' : `${count} Children`),
  infants: (count) => (count === '1' ? '1 Infant' : `${count} Infants`),
};
