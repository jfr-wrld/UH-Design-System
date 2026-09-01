import { forwardRef, type ForwardedRef } from 'react';

import { formatMoney, type Currency } from '../../lib/money.js';
import { DEFAULT_LABELS, type PriceDisplayLabels } from './labels.js';

export type PriceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface InstalmentPlan {
  /** What is paid each month. Supplied, never derived. */
  monthly: number;
  months: number;
}

export interface PriceDisplayProps {
  amount: number;
  /** Never derived from `locale`. An Indonesian price read in English is still IDR. */
  currency: Currency;
  locale: string;
  /** The price before a discount. Ignored unless it is genuinely higher. */
  originalAmount?: number | undefined;
  size?: PriceSize | undefined;
  showPerPax?: boolean | undefined;
  installment?: InstalmentPlan | undefined;
  prefix?: 'from' | undefined;
  /**
   * Beyond the agreed props, and deliberately so: without it every amount is
   * rounded to whole units, and a package priced at RM 12,500.50 would quietly
   * display as RM 12,501. Package prices are whole, hence the default, but a
   * silent 50 sen is not something a component should decide on its own.
   */
  fractionDigits?: number | undefined;
  labels?: Partial<PriceDisplayLabels> | undefined;
  /** Names the price for assistive technology, e.g. "Total for two pilgrims". */
  'aria-label'?: string | undefined;
  className?: string | undefined;
}

function PriceDisplayImpl(props: PriceDisplayProps, ref: ForwardedRef<HTMLParagraphElement>) {
  const {
    amount,
    currency,
    locale,
    originalAmount,
    size = 'md',
    showPerPax = false,
    installment,
    prefix,
    fractionDigits = 0,
    labels: labelOverrides,
    className,
  } = props;

  const labels: PriceDisplayLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  /* A price we do not know is not a price to draw. Intl would print "NaN". */
  if (!Number.isFinite(amount)) return null;

  const money = (value: number) => formatMoney(value, currency, locale, fractionDigits);

  /*
   * A "discount" that is not lower than the price is a data error, and drawing
   * a struck-through number beside an identical one is worse than drawing
   * nothing. Incomplete data is expected here; nonsense is not passed on.
   */
  const discounted =
    originalAmount !== undefined && Number.isFinite(originalAmount) && originalAmount > amount;

  const plan =
    installment &&
    Number.isFinite(installment.monthly) &&
    Number.isFinite(installment.months) &&
    installment.months > 0
      ? installment
      : undefined;

  return (
    <p
      ref={ref}
      className={['uh-price', className].filter(Boolean).join(' ')}
      data-size={size}
      data-discounted={discounted ? 'true' : undefined}
      {...(props['aria-label'] ? { 'aria-label': props['aria-label'] } : {})}
    >
      <span className="uh-price__row">
        {prefix === 'from' ? <span className="uh-price__prefix">{labels.from}</span> : null}

        <span className="uh-price__amount">{money(amount)}</span>

        {/*
         * After the price, not before it. A strike-through is silent to a
         * screen reader, so it carries its own label, and the number that
         * actually has to be paid is the one that gets read first.
         */}
        {discounted ? (
          <s className="uh-price__original">
            <span className="uh-sr-only">{labels.originalPrice} </span>
            {money(originalAmount)}
          </s>
        ) : null}

        {showPerPax ? <span className="uh-price__per-pax">{labels.perPax}</span> : null}
      </span>

      {plan ? (
        <span className="uh-price__instalment">
          <span className="uh-price__instalment-join">{labels.or}</span>{' '}
          {labels.instalments(
            `${money(plan.monthly)}${labels.perMonth}`,
            /* Through Intl as well: a 24-month plan is "24" everywhere we ship,
               but the rule does not carve out small integers. */
            new Intl.NumberFormat(locale).format(plan.months),
          )}
        </span>
      ) : null}
    </p>
  );
}

export const PriceDisplay = /* @__PURE__ */ forwardRef(PriceDisplayImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  PriceDisplay.displayName = 'PriceDisplay';
}
