export type Currency = 'MYR' | 'IDR' | 'SGD';

/**
 * Symbols come from the currency; grouping comes from the locale. Those are
 * two separate axes on purpose, so a Malaysian reading the site in Indonesian
 * still sees ringgit written as ringgit.
 *
 * Intl cannot supply these on its own. It gives "RM" and "Rp" correctly, but
 * every currencyDisplay option renders SGD as a bare "$" in en-SG, which is
 * indistinguishable from a US dollar. Rather than take two symbols from Intl
 * and hand-write the third, all three are stated here.
 */
const SYMBOL: Record<Currency, string> = {
  MYR: 'RM',
  IDR: 'Rp',
  SGD: 'S$',
};

export const currencySymbol = (currency: Currency): string => SYMBOL[currency];

/** The localised name, for announcing what the symbol means. */
export function currencyName(currency: Currency, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(currency) ?? currency;
  } catch {
    return currency;
  }
}

/** What this locale writes between groups and before the fraction. */
export function separators(locale: string): { group: string; decimal: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
  return {
    group: parts.find((p) => p.type === 'group')?.value ?? ',',
    decimal: parts.find((p) => p.type === 'decimal')?.value ?? '.',
  };
}

/**
 * The amount only. Intl does the grouping and the fraction; the symbol is
 * prepended rather than handed to `style: 'currency'`, because that style takes
 * the symbol from the locale and would print "IDR 45,000,000" the moment
 * someone reads an Indonesian price in English.
 */
export function formatAmount(value: number, locale: string, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    useGrouping: true,
  }).format(value);
}

export function formatMoney(
  value: number,
  currency: Currency,
  locale: string,
  fractionDigits: number,
): string {
  return `${currencySymbol(currency)} ${formatAmount(value, locale, fractionDigits)}`;
}

/**
 * Reads a number out of whatever was typed or pasted: "RM 12,500",
 * "Rp 45.000.000", "12 500", or a bare "12500".
 *
 * With no fraction digits every separator is a group separator, which is the
 * case that matters here because package prices are whole amounts. When
 * fractions are allowed, a separator that occurs more than once cannot be the
 * decimal point, so it is treated as grouping too. That is what makes pasting
 * "45.000.000" into an English-locale field give 45 million rather than 45.
 *
 * Returns null for an empty or unreadable string, so "nothing entered" stays
 * distinguishable from zero.
 */
export function parseAmount(raw: string, locale: string, fractionDigits: number): number | null {
  const negative = /-/.test(raw);
  const cleaned = raw.replace(/[^\d.,]/g, '');
  if (cleaned === '') return null;

  let normalised: string;

  if (fractionDigits === 0) {
    normalised = cleaned.replace(/[.,]/g, '');
  } else {
    const { decimal } = separators(locale);
    const occurrences = cleaned.split(decimal).length - 1;
    if (occurrences === 1) {
      const [whole = '', fraction = ''] = cleaned.split(decimal);
      normalised = `${whole.replace(/[.,]/g, '')}.${fraction.replace(/[.,]/g, '')}`;
    } else {
      normalised = cleaned.replace(/[.,]/g, '');
    }
  }

  const parsed = Number(normalised);
  if (!Number.isFinite(parsed)) return null;
  return negative ? -parsed : parsed;
}
