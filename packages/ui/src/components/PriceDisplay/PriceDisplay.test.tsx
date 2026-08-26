import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PriceDisplay } from './PriceDisplay.js';

const price = () => document.querySelector('.uh-price') as HTMLElement;
const amount = () => document.querySelector('.uh-price__amount') as HTMLElement;
const original = () => document.querySelector('.uh-price__original');

describe('PriceDisplay', () => {
  it('formats an amount with its own currency symbol', () => {
    render(<PriceDisplay amount={12500} currency="MYR" locale="en" />);
    expect(amount().textContent).toBe('RM 12,500');
  });

  /*
   * The trap this component exists to close. Intl's own `style: 'currency'`
   * takes the symbol from the locale, so an Indonesian price read in English
   * comes out as "IDR 45,000,000". The symbol comes from `currency` and the
   * grouping from `locale`, and neither is derived from the other.
   */
  describe('currency is separate from locale', () => {
    it.each([
      ['MYR', 'en', 'RM 12,500'],
      ['MYR', 'id-ID', 'RM 12.500'],
      ['MYR', 'ms-MY', 'RM 12,500'],
      ['IDR', 'en', 'Rp 12,500'],
      ['IDR', 'id-ID', 'Rp 12.500'],
      ['SGD', 'en', 'S$ 12,500'],
      ['SGD', 'id-ID', 'S$ 12.500'],
    ] as const)('%s in %s reads %s', (currency, locale, expected) => {
      render(<PriceDisplay amount={12500} currency={currency} locale={locale} />);
      expect(amount().textContent).toBe(expected);
    });

    it('keeps the symbol when the language changes', () => {
      const { rerender } = render(<PriceDisplay amount={45000000} currency="IDR" locale="en" />);
      expect(amount().textContent).toBe('Rp 45,000,000');
      rerender(<PriceDisplay amount={45000000} currency="IDR" locale="ms-MY" />);
      expect(amount().textContent).toBe('Rp 45,000,000');
    });
  });

  describe('rounding', () => {
    it('shows whole units by default', () => {
      render(<PriceDisplay amount={12500.5} currency="MYR" locale="en" />);
      expect(amount().textContent).toBe('RM 12,501');
    });

    it('shows the minor unit when asked', () => {
      render(<PriceDisplay amount={12500.5} currency="MYR" locale="en" fractionDigits={2} />);
      expect(amount().textContent).toBe('RM 12,500.50');
    });
  });

  describe('discount', () => {
    it('strikes the original beside the price', () => {
      render(<PriceDisplay amount={9800} originalAmount={12500} currency="MYR" locale="en" />);
      expect(amount().textContent).toBe('RM 9,800');
      expect(original()!.textContent).toContain('RM 12,500');
      expect(original()!.tagName).toBe('S');
      expect(price().dataset.discounted).toBe('true');
    });

    /* A strike-through says nothing out loud, so it carries its own label. */
    it('names the struck price for a screen reader', () => {
      render(<PriceDisplay amount={9800} originalAmount={12500} currency="MYR" locale="en" />);
      expect(original()!.textContent).toBe('Original price RM 12,500');
    });

    it('puts the price to be paid before the one that was', () => {
      render(<PriceDisplay amount={9800} originalAmount={12500} currency="MYR" locale="en" />);
      expect(price().textContent!.indexOf('RM 9,800')).toBeLessThan(
        price().textContent!.indexOf('RM 12,500'),
      );
    });

    it('formats both ends the same way', () => {
      render(<PriceDisplay amount={9800} originalAmount={12500} currency="IDR" locale="id-ID" />);
      expect(amount().textContent).toBe('Rp 9.800');
      expect(original()!.textContent).toContain('Rp 12.500');
    });

    /*
     * Incomplete data is expected; nonsense is not passed on. A struck price
     * that is not higher than the price is a data error, and drawing it beside
     * an identical number is worse than drawing nothing.
     */
    it.each([
      ['equal to the price', 9800],
      ['lower than the price', 8000],
      ['not a number', Number.NaN],
    ])('ignores an original %s', (_case, originalAmount) => {
      render(
        <PriceDisplay amount={9800} originalAmount={originalAmount} currency="MYR" locale="en" />,
      );
      expect(original()).toBeNull();
      expect(price().dataset.discounted).toBeUndefined();
    });

    it('has no struck price when none is given', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" />);
      expect(original()).toBeNull();
    });
  });

  describe('qualifiers', () => {
    it('adds the from prefix before the amount', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" prefix="from" />);
      expect(price().textContent).toBe('fromRM 9,800');
    });

    it('leaves the prefix out by default', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" />);
      expect(document.querySelector('.uh-price__prefix')).toBeNull();
    });

    it('adds the per-pax label after the amount', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" showPerPax />);
      expect(price().textContent).toBe('RM 9,800per pax');
    });

    it('takes both at once', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" prefix="from" showPerPax />);
      expect(price().textContent).toBe('fromRM 9,800per pax');
    });
  });

  describe('instalments', () => {
    it('offers the plan beside the full price', () => {
      render(
        <PriceDisplay
          amount={9800}
          currency="MYR"
          locale="en"
          installment={{ monthly: 817, months: 12 }}
        />,
      );
      expect(document.querySelector('.uh-price__instalment')!.textContent).toBe(
        'or RM 817/month × 12',
      );
    });

    /*
     * The monthly figure is supplied, never derived. 9800 divided by 12 is
     * 816.67, and a plan whose rounded instalments do not add up to the price
     * is not something a display component may invent.
     */
    it('shows exactly the monthly figure it was given', () => {
      render(
        <PriceDisplay
          amount={9800}
          currency="MYR"
          locale="en"
          installment={{ monthly: 900, months: 12 }}
        />,
      );
      expect(document.querySelector('.uh-price__instalment')!.textContent).toContain('RM 900');
    });

    it('formats the monthly amount in the same currency and locale', () => {
      render(
        <PriceDisplay
          amount={45000000}
          currency="IDR"
          locale="id-ID"
          installment={{ monthly: 3750000, months: 12 }}
        />,
      );
      expect(document.querySelector('.uh-price__instalment')!.textContent).toContain(
        'Rp 3.750.000',
      );
    });

    it.each([
      ['no months', { monthly: 817, months: 0 }],
      ['a monthly figure that is not a number', { monthly: Number.NaN, months: 12 }],
    ])('ignores a plan with %s', (_case, installment) => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" installment={installment} />);
      expect(document.querySelector('.uh-price__instalment')).toBeNull();
    });
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg', 'xl'] as const)('carries the %s size through', (size) => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" size={size} />);
      expect(price().dataset.size).toBe(size);
    });

    it('is md by default', () => {
      render(<PriceDisplay amount={9800} currency="MYR" locale="en" />);
      expect(price().dataset.size).toBe('md');
    });
  });

  describe('translation', () => {
    it.each([
      ['ms', { from: 'dari', perPax: 'setiap orang', perMonth: '/bulan', or: 'atau' }],
      ['id', { from: 'mulai', perPax: 'per orang', perMonth: '/bulan', or: 'atau' }],
    ])('takes %s wording', (_lang, labels) => {
      render(
        <PriceDisplay
          amount={9800}
          currency="MYR"
          locale="ms-MY"
          prefix="from"
          showPerPax
          installment={{ monthly: 817, months: 12 }}
          labels={labels}
        />,
      );
      expect(price().textContent).toContain(labels.from);
      expect(price().textContent).toContain(labels.perPax);
      expect(price().textContent).toContain(labels.perMonth);
    });
  });

  describe('bad data', () => {
    it.each([
      ['not a number', Number.NaN],
      ['infinite', Number.POSITIVE_INFINITY],
    ])('draws nothing for an amount that is %s', (_case, value) => {
      const { container } = render(<PriceDisplay amount={value} currency="MYR" locale="en" />);
      expect(container.firstChild).toBeNull();
    });

    it('draws a zero price rather than hiding it', () => {
      render(<PriceDisplay amount={0} currency="MYR" locale="en" />);
      expect(amount().textContent).toBe('RM 0');
    });
  });

  describe('accessibility', () => {
    it('takes a name when the number alone is ambiguous', () => {
      render(
        <PriceDisplay
          amount={25000}
          currency="MYR"
          locale="en"
          aria-label="Total for two pilgrims"
        />,
      );
      expect(screen.getByLabelText('Total for two pilgrims')).toBeDefined();
    });

    it('has no violations in its fullest form', async () => {
      const { container } = render(
        <PriceDisplay
          amount={9800}
          originalAmount={12500}
          currency="MYR"
          locale="en"
          size="lg"
          prefix="from"
          showPerPax
          installment={{ monthly: 817, months: 12 }}
        />,
      );
      await expectNoA11yViolations(container);
    });
  });
});
