/**
 * Every word this component can put on screen.
 *
 * They are words rather than punctuation on purpose: "/ pax" reads as a slash
 * to a screen reader, and the three languages do not agree on where the
 * qualifier goes relative to the number.
 */
export interface PriceDisplayLabels {
  /** Qualifies a range of prices: "from RM 9,800". */
  from: string;
  /** Follows the amount: "RM 9,800 per pax". */
  perPax: string;
  /** Follows the monthly amount: "RM 817/month". */
  perMonth: string;
  /** Joins the full price to the instalment alternative. */
  or: string;
  /** Read out before the struck-through price, which is silent otherwise. */
  originalPrice: string;
  /** Reads the instalment line: monthly amount and how many of them. */
  instalments: (monthly: string, months: string) => string;
}

export const DEFAULT_LABELS: PriceDisplayLabels = {
  from: 'from',
  perPax: 'per pax',
  perMonth: '/month',
  or: 'or',
  originalPrice: 'Original price',
  instalments: (monthly, months) => `${monthly} × ${months}`,
};
