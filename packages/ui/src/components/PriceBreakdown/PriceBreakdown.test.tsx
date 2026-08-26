import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PriceBreakdown, type PriceItem } from './PriceBreakdown.js';

const ITEMS: PriceItem[] = [
  { label: 'Base Price', amount: 19600, type: 'base', quantity: 2 },
  { label: 'Visa Processing', amount: 900, type: 'fee', note: 'Handled by the agency.' },
  { label: 'Travel Insurance', amount: 500, type: 'addon' },
  { label: 'SST', amount: 1200, type: 'tax' },
  { label: 'Early bird discount', amount: 1500, type: 'discount' },
  { label: 'Total', amount: 20700, type: 'total' },
];

const table = () => screen.getByRole('table', { name: 'Price breakdown' });
const amountOf = (label: RegExp | string) =>
  within(screen.getByRole('rowheader', { name: label }).closest('tr')!)
    .getByRole('cell')
    .textContent!.trim();

/** jsdom has no matchMedia; the default is the desktop, details open. */
function stubViewport(mobile: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: mobile,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => vi.unstubAllGlobals());

describe('PriceBreakdown', () => {
  it('is a real table, one row per item', () => {
    render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
    expect(within(table()).getAllByRole('row')).toHaveLength(6);
  });

  it('formats every amount through the shared money formatter', () => {
    render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
    expect(amountOf(/Base Price/)).toBe('RM 19,600');
    expect(amountOf('Total')).toBe('RM 20,700');
  });

  /* The trap the whole money layer exists to close. */
  it('keeps the currency when the language changes', () => {
    render(<PriceBreakdown items={ITEMS} currency="IDR" locale="en" />);
    expect(amountOf('Total')).toBe('Rp 20,700');
  });

  it('groups the locale way', () => {
    render(<PriceBreakdown items={ITEMS} currency="MYR" locale="id-ID" />);
    expect(amountOf('Total')).toBe('RM 20.700');
  });

  describe('discount', () => {
    it('draws the amount negative', () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      expect(amountOf('Early bird discount')).toContain('−');
      expect(amountOf('Early bird discount')).toContain('RM 1,500');
    });

    /* Neither a sign nor a colour is reliably announced; the word is. */
    it('says the word for a screen reader', () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      const row = screen.getByRole('rowheader', { name: 'Early bird discount' }).closest('tr')!;
      expect(within(row).getByRole('cell').textContent).toContain('Discount');
    });

    /*
     * One way to say a thing. A consumer passing -1500 out of habit gets the
     * same subtraction as one passing 1500, rather than a double negative.
     */
    it('treats a negative amount the same as a positive one', () => {
      render(
        <PriceBreakdown
          items={[{ label: 'Promo', amount: -500, type: 'discount' }]}
          currency="MYR"
          locale="en"
        />,
      );
      const row = screen.getByRole('rowheader', { name: 'Promo' }).closest('tr')!;
      const cell = within(row).getByRole('cell').textContent!;
      expect(cell).toContain('RM 500');
      expect(cell.match(/−/g)).toHaveLength(1);
    });
  });

  describe('quantities', () => {
    it('shows the multiplier in the label', () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      expect(screen.getByRole('rowheader', { name: 'Base Price × 2' })).toBeDefined();
    });

    it('leaves a quantity of one unwritten', () => {
      render(
        <PriceBreakdown
          items={[{ label: 'Adults', amount: 9800, type: 'base', quantity: 1 }]}
          currency="MYR"
          locale="en"
        />,
      );
      expect(screen.getByRole('rowheader', { name: 'Adults' })).toBeDefined();
      expect(screen.queryByText(/×/)).toBeNull();
    });
  });

  describe('passengers', () => {
    it('summarises who the total covers', () => {
      render(
        <PriceBreakdown
          items={ITEMS}
          currency="MYR"
          locale="en"
          passengers={{ adults: 2, children: 1, infants: 1 }}
        />,
      );
      expect(screen.getByText('2 Adults, 1 Child, 1 Infant')).toBeDefined();
    });

    it('drops the empty categories', () => {
      render(
        <PriceBreakdown
          items={ITEMS}
          currency="MYR"
          locale="en"
          passengers={{ adults: 2, children: 0, infants: 0 }}
        />,
      );
      expect(screen.getByText('2 Adults')).toBeDefined();
      expect(screen.queryByText(/Child/)).toBeNull();
    });

    it('shows no summary with nobody in it', () => {
      render(
        <PriceBreakdown
          items={ITEMS}
          currency="MYR"
          locale="en"
          passengers={{ adults: 0, children: 0, infants: 0 }}
        />,
      );
      expect(document.querySelector('.uh-breakdown__passengers')).toBeNull();
    });
  });

  describe('notes', () => {
    it('gives a noted row a named info control', () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      expect(screen.getByRole('button', { name: 'More about Visa Processing' })).toBeDefined();
    });

    it('shows the note on focus, so it works without a mouse', async () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      const info = screen.getByRole('button', { name: 'More about Visa Processing' });
      info.focus();
      expect(await screen.findByRole('tooltip')).toBeDefined();
      expect(screen.getByRole('tooltip').textContent).toBe('Handled by the agency.');
    });

    it('gives an unnoted row no control at all', () => {
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      const row = screen.getByRole('rowheader', { name: 'SST' }).closest('tr')!;
      expect(within(row).queryByRole('button')).toBeNull();
    });
  });

  describe('collapsing', () => {
    it('starts open on a desktop', () => {
      stubViewport(false);
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      expect(screen.getByRole('button', { name: /Hide details/ })).toBeDefined();
      expect(screen.getByRole('rowheader', { name: 'SST' })).toBeDefined();
    });

    it('starts closed on a phone, with the total still shown', () => {
      stubViewport(true);
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      expect(screen.getByRole('button', { name: /Show details/ })).toBeDefined();
      /* The details are hidden; the one number the screen exists for is not. */
      expect(screen.queryByRole('rowheader', { name: 'SST' })).toBeNull();
      expect(screen.getByRole('rowheader', { name: 'Total' })).toBeDefined();
    });

    it('toggles and says so', async () => {
      stubViewport(true);
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      const toggle = screen.getByRole('button', { name: /Show details/ });
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      await userEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByRole('rowheader', { name: 'SST' })).toBeDefined();
    });

    it('honours an explicit default over the viewport', () => {
      stubViewport(false);
      render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" defaultExpanded={false} />);
      expect(screen.getByRole('button', { name: /Show details/ })).toBeDefined();
    });

    it('offers no toggle when there is nothing to collapse', () => {
      render(
        <PriceBreakdown
          items={[{ label: 'Total', amount: 9800, type: 'total' }]}
          currency="MYR"
          locale="en"
        />,
      );
      expect(screen.queryByRole('button', { name: /details/ })).toBeNull();
    });
  });

  describe('bad data', () => {
    it('drops a row whose amount is not a number', () => {
      render(
        <PriceBreakdown
          items={[
            { label: 'Base Price', amount: 9800, type: 'base' },
            { label: 'Mystery', amount: Number.NaN, type: 'fee' },
          ]}
          currency="MYR"
          locale="en"
        />,
      );
      expect(screen.queryByRole('rowheader', { name: 'Mystery' })).toBeNull();
    });

    it('renders an empty list as an empty table, not a crash', () => {
      render(<PriceBreakdown items={[]} currency="MYR" locale="en" />);
      expect(table()).toBeDefined();
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('renders details with no total rather than inventing one', () => {
      render(
        <PriceBreakdown
          items={[{ label: 'Base Price', amount: 9800, type: 'base' }]}
          currency="MYR"
          locale="en"
        />,
      );
      expect(screen.queryByRole('rowheader', { name: 'Total' })).toBeNull();
    });
  });

  describe('translation', () => {
    it('takes every string', () => {
      stubViewport(true);
      render(
        <PriceBreakdown
          items={ITEMS}
          currency="MYR"
          locale="ms-MY"
          passengers={{ adults: 2, children: 0, infants: 0 }}
          labels={{
            breakdown: 'Pecahan harga',
            showDetails: 'Tunjukkan butiran',
            hideDetails: 'Sembunyikan butiran',
            adults: (count) => `${count} Dewasa`,
            discount: 'Diskaun',
          }}
        />,
      );
      expect(screen.getByRole('table', { name: 'Pecahan harga' })).toBeDefined();
      expect(screen.getByRole('button', { name: /Tunjukkan butiran/ })).toBeDefined();
      expect(screen.getByText('2 Dewasa')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations open', async () => {
      stubViewport(false);
      const { container } = render(
        <PriceBreakdown
          items={ITEMS}
          currency="MYR"
          locale="en"
          passengers={{ adults: 2, children: 1, infants: 0 }}
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations collapsed', async () => {
      stubViewport(true);
      const { container } = render(<PriceBreakdown items={ITEMS} currency="MYR" locale="en" />);
      await expectNoA11yViolations(container);
    });
  });
});
