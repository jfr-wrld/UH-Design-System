import { forwardRef, useId, useState, type ForwardedRef } from 'react';
import { InfoCircle } from '@tailgrids/icons';

import { Tooltip } from '../Tooltip/Tooltip.js';
import { MOBILE_QUERY } from '../../hooks/breakpoints.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { formatMoney, type Currency } from '../../lib/money.js';
import { formatCount } from '../../lib/units.js';
import { DEFAULT_LABELS, type PriceBreakdownLabels } from './labels.js';
import { ChevronDownIcon } from '../../lib/icons.js';

export type PriceItemType = 'base' | 'addon' | 'tax' | 'fee' | 'discount' | 'total';

export interface PriceItem {
  label: string;
  /**
   * Always positive, a discount included: the `discount` type is what says the
   * amount is subtracted, and the component draws the sign. Accepting negative
   * amounts as well would mean two ways to say one thing, which is how a
   * discount ends up added once and subtracted elsewhere.
   */
  amount: number;
  type: PriceItemType;
  /** Extra context behind an info control: what the fee covers, why it exists. */
  note?: string | undefined;
  /** "Adults" with a quantity of 2 renders as "Adults × 2". */
  quantity?: number | undefined;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface PriceBreakdownProps {
  items: readonly PriceItem[];
  /** Never derived from `locale`; an Indonesian invoice read in English is still IDR. */
  currency: Currency;
  locale: string;
  /** Who the total covers. Shown as a summary line above the table. */
  passengers?: PassengerCounts | undefined;
  variant?: 'inline' | 'card' | undefined;
  /**
   * Overrides the collapsed start. Left alone, the details start open on a
   * desktop and closed on a phone; the total is visible either way.
   */
  defaultExpanded?: boolean | undefined;
  labels?: Partial<PriceBreakdownLabels> | undefined;
  className?: string | undefined;
}

function InfoIcon() {
  return <InfoCircle aria-hidden="true" focusable="false" />;
}

/** The summary fragments, joined the locale's own way: "2 Adults, 1 Infant". */
function passengerSummary(
  passengers: PassengerCounts,
  locale: string,
  labels: PriceBreakdownLabels,
): string {
  const parts = (
    [
      ['adults', passengers.adults],
      ['children', passengers.children],
      ['infants', passengers.infants],
    ] as const
  )
    .filter(([, count]) => Number.isFinite(count) && count > 0)
    .map(([category, count]) => labels[category](formatCount(count, locale)));

  if (parts.length === 0) return '';
  try {
    return new Intl.ListFormat(locale, { type: 'unit', style: 'short' }).format(parts);
  } catch {
    /* Engines without ListFormat still get a readable line. */
    return parts.join(', ');
  }
}

function PriceBreakdownImpl(props: PriceBreakdownProps, ref: ForwardedRef<HTMLDivElement>) {
  const {
    items,
    currency,
    locale,
    passengers,
    variant = 'card',
    defaultExpanded,
    labels: labelOverrides,
    className,
  } = props;

  const labels: PriceBreakdownLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const mobile = useMediaQuery(MOBILE_QUERY);
  const reactId = useId();
  const detailsId = `${reactId}-details`;

  /*
   * The viewport sets the default and the reader's choice overrides it - and
   * keeps overriding it, so rotating a phone does not undo a deliberate
   * collapse. `null` means "not yet touched".
   */
  const [chosen, setChosen] = useState<boolean | null>(null);
  const expanded = chosen ?? defaultExpanded ?? !mobile;

  const money = (value: number) => formatMoney(value, currency, locale, 0);

  /* An amount that is not a number is a data error, not a row. */
  const usable = items.filter((item) => Number.isFinite(item.amount));
  const details = usable.filter((item) => item.type !== 'total');
  const totals = usable.filter((item) => item.type === 'total');
  const summary = passengers ? passengerSummary(passengers, locale, labels) : '';
  const collapsible = details.length > 0;

  function row(item: PriceItem, index: number) {
    const discount = item.type === 'discount';
    const label =
      item.quantity !== undefined && Number.isFinite(item.quantity) && item.quantity > 1
        ? labels.quantified(item.label, formatCount(item.quantity, locale))
        : item.label;

    return (
      <tr key={`${item.label}-${index}`} className="uh-breakdown__row" data-type={item.type}>
        <th scope="row" className="uh-breakdown__label">
          {label}
          {item.note ? (
            <Tooltip content={item.note}>
              <button
                type="button"
                className="uh-breakdown__info"
                aria-label={labels.moreAbout(item.label)}
              >
                <InfoIcon />
              </button>
            </Tooltip>
          ) : null}
        </th>
        <td className="uh-breakdown__amount">
          {discount ? (
            <>
              {/* The minus is drawn; the word is what a screen reader gets,
                  because neither a sign nor a colour is reliably announced. */}
              <span className="uh-sr-only">{labels.discount} </span>
              <span aria-hidden="true">−</span>
            </>
          ) : null}
          {money(Math.abs(item.amount))}
        </td>
      </tr>
    );
  }

  return (
    <div
      ref={ref}
      className={['uh-breakdown', className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      {summary ? <p className="uh-breakdown__passengers">{summary}</p> : null}

      {collapsible ? (
        <button
          type="button"
          className="uh-breakdown__toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={() => setChosen(!expanded)}
        >
          {expanded ? labels.hideDetails : labels.showDetails}
          <span className="uh-breakdown__chevron" data-open={expanded ? 'true' : undefined}>
            <ChevronDownIcon />
          </span>
        </button>
      ) : null}

      <table className="uh-breakdown__table" aria-label={labels.breakdown}>
        {/*
         * The details collapse; the total never does. Hiding the one number
         * the screen exists to show would make the collapse a trap, so it
         * lives in tfoot outside the collapsing body.
         */}
        <tbody id={detailsId} hidden={collapsible && !expanded ? true : undefined}>
          {details.map(row)}
        </tbody>
        {totals.length > 0 ? <tfoot>{totals.map(row)}</tfoot> : null}
      </table>
    </div>
  );
}

export const PriceBreakdown = /* @__PURE__ */ forwardRef(PriceBreakdownImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  PriceBreakdown.displayName = 'PriceBreakdown';
}
