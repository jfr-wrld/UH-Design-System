import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PackageCard, type PackageCardProps } from './PackageCard.js';

const TITLE = '14-Day Ramadan Umrah Package, 5-Star Hotel';

const base: PackageCardProps = {
  title: TITLE,
  agency: { name: 'Madinah Travel', verified: true },
  price: 12500,
  currency: 'MYR',
  locale: 'en-MY',
};

const card = () => document.querySelector('.uh-package') as HTMLElement;
const action = () => screen.getByRole('button', { name: TITLE });
const wishlist = () => screen.getByRole('button', { name: /Save|Remove/ });

describe('PackageCard', () => {
  it('is one article with the package name as its action', () => {
    render(<PackageCard {...base} />);
    expect(screen.getByRole('article')).toBeDefined();
    expect(action()).toBeDefined();
  });

  /*
   * The whole card is clickable through the title's stretched hit area, which
   * is what keeps a card to a single tab stop with a real accessible name.
   * Nesting a button inside a button would be neither.
   */
  it('has exactly two controls: the package and the wishlist', () => {
    render(<PackageCard {...base} onClick={vi.fn()} onWishlist={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('opens the package when the action is used', async () => {
    const onClick = vi.fn();
    render(<PackageCard {...base} onClick={onClick} />);
    await userEvent.click(action());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /*
   * The heart sits at the top right of the image, above the title, so it comes
   * first in the tab order too. Focus order follows what is on screen rather
   * than what we would prefer to be first, and the wishlist label carries the
   * package name, so nothing is announced without context.
   */
  it('reaches both controls from the keyboard, in the order they are drawn', async () => {
    const onClick = vi.fn();
    render(<PackageCard {...base} onClick={onClick} onWishlist={vi.fn()} />);

    await userEvent.tab();
    expect(document.activeElement).toBe(wishlist());
    await userEvent.tab();
    expect(document.activeElement).toBe(action());

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens with Space as well', async () => {
    const onClick = vi.fn();
    render(<PackageCard {...base} onClick={onClick} />);
    action().focus();
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  describe('variants', () => {
    it.each(['grid', 'list', 'mobile'] as const)('carries the %s layout through', (variant) => {
      render(<PackageCard {...base} variant={variant} />);
      expect(card().dataset.variant).toBe(variant);
    });

    it('is a grid card by default', () => {
      render(<PackageCard {...base} />);
      expect(card().dataset.variant).toBe('grid');
    });
  });

  describe('wishlist', () => {
    it('reports the state it is in, not just the action', () => {
      const { rerender } = render(<PackageCard {...base} onWishlist={vi.fn()} />);
      expect(wishlist().getAttribute('aria-pressed')).toBe('false');
      rerender(<PackageCard {...base} isWishlisted onWishlist={vi.fn()} />);
      expect(wishlist().getAttribute('aria-pressed')).toBe('true');
    });

    it('names the package it would save', () => {
      render(<PackageCard {...base} onWishlist={vi.fn()} />);
      expect(screen.getByRole('button', { name: `Save ${TITLE}` })).toBeDefined();
    });

    it('toggles rather than only ever setting', async () => {
      const onWishlist = vi.fn();
      const { rerender } = render(<PackageCard {...base} onWishlist={onWishlist} />);
      await userEvent.click(wishlist());
      expect(onWishlist).toHaveBeenLastCalledWith(true);
      rerender(<PackageCard {...base} isWishlisted onWishlist={onWishlist} />);
      await userEvent.click(wishlist());
      expect(onWishlist).toHaveBeenLastCalledWith(false);
    });

    /* A tap on the heart must not also open the package. */
    it('does not open the package', async () => {
      const onClick = vi.fn();
      render(<PackageCard {...base} onClick={onClick} onWishlist={vi.fn()} />);
      await userEvent.click(wishlist());
      expect(onClick).not.toHaveBeenCalled();
    });

    it('stops the click reaching a handler wrapped around the card', async () => {
      const onOuter = vi.fn();
      render(
        <div onClick={onOuter}>
          <PackageCard {...base} onWishlist={vi.fn()} />
        </div>,
      );
      await userEvent.click(wishlist());
      expect(onOuter).not.toHaveBeenCalled();
    });
  });

  describe('sold out', () => {
    it('shows the label over the image', () => {
      render(<PackageCard {...base} soldOut />);
      expect(screen.getByText('Sold out')).toBeDefined();
      expect(card().dataset.soldOut).toBe('true');
    });

    /* aria-disabled rather than disabled, so the card keeps its tab stop and a
       screen reader can still read what the package was. */
    it('disables the package action without removing it', async () => {
      const onClick = vi.fn();
      render(<PackageCard {...base} soldOut onClick={onClick} />);
      expect(action().getAttribute('aria-disabled')).toBe('true');
      await userEvent.click(action());
      expect(onClick).not.toHaveBeenCalled();
    });

    it('leaves the wishlist working', async () => {
      const onWishlist = vi.fn();
      render(<PackageCard {...base} soldOut onWishlist={onWishlist} />);
      await userEvent.click(wishlist());
      expect(onWishlist).toHaveBeenCalledWith(true);
    });
  });

  describe('loading', () => {
    it('replaces the card with a skeleton that says so', () => {
      render(<PackageCard {...base} loading />);
      expect(card().getAttribute('aria-busy')).toBe('true');
      expect(screen.getByLabelText('Loading package')).toBeDefined();
    });

    it('offers nothing to click while it loads', () => {
      render(<PackageCard {...base} loading onClick={vi.fn()} onWishlist={vi.fn()} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('keeps the layout it is loading into', () => {
      render(<PackageCard {...base} loading variant="list" />);
      expect(card().dataset.variant).toBe('list');
    });
  });

  describe('the numbers', () => {
    it('formats the departure date through Intl', () => {
      render(<PackageCard {...base} departureDate={new Date(2026, 2, 15)} />);
      expect(screen.getByText('15 Mar 2026')).toBeDefined();
    });

    it.each([
      ['ms-MY', '15 Mac 2026', '14 hari'],
      ['id-ID', '15 Mar 2026', '14 hari'],
    ])('reads the date and duration in %s', (locale, date, duration) => {
      render(
        <PackageCard
          {...base}
          locale={locale}
          departureDate={new Date(2026, 2, 15)}
          durationDays={14}
        />,
      );
      expect(screen.getByText(date)).toBeDefined();
      expect(screen.getByText(duration)).toBeDefined();
    });

    it('hands the price to PriceDisplay rather than formatting it', () => {
      render(<PackageCard {...base} price={12500} originalPrice={15000} />);
      expect(document.querySelector('.uh-price__amount')!.textContent).toBe('RM 12,500');
      expect(document.querySelector('.uh-price__original')!.textContent).toContain('RM 15,000');
    });

    it('keeps the currency when the language changes', () => {
      render(<PackageCard {...base} currency="IDR" locale="en-MY" price={45000000} />);
      expect(document.querySelector('.uh-price__amount')!.textContent).toBe('Rp 45,000,000');
    });

    it('switches distance from metres to kilometres on its own', () => {
      render(<PackageCard {...base} hotelDistance={{ makkah: 200, madinah: 1200 }} />);
      expect(screen.getByText('200 m from Haram')).toBeDefined();
      expect(screen.getByText('1.2 km from Nabawi')).toBeDefined();
    });
  });

  describe('seats remaining', () => {
    it.each([
      [11, false],
      [10, true],
      [1, true],
    ])('shows %i seats: %s', (seatsRemaining, visible) => {
      render(<PackageCard {...base} seatsRemaining={seatsRemaining} />);
      expect(document.querySelector('.uh-package__seats') !== null).toBe(visible);
    });

    it('warns only once it is down to five', () => {
      const { rerender } = render(<PackageCard {...base} seatsRemaining={6} />);
      expect(document.querySelector('.uh-package__seats')!.getAttribute('data-urgent')).toBeNull();
      rerender(<PackageCard {...base} seatsRemaining={5} />);
      expect(document.querySelector('.uh-package__seats')!.getAttribute('data-urgent')).toBe(
        'true',
      );
    });

    it('says nothing when the trip has none left rather than "0 seats left"', () => {
      render(<PackageCard {...base} seatsRemaining={0} />);
      expect(document.querySelector('.uh-package__seats')).toBeNull();
    });
  });

  describe('badges', () => {
    it.each([
      ['bestSeller', 'Best seller'],
      ['promo', 'Promo'],
      ['almostFull', 'Almost full'],
    ] as const)('renders the %s badge', (badge, text) => {
      render(<PackageCard {...base} badge={badge} />);
      expect(screen.getByText(text)).toBeDefined();
    });

    it.each([[null], [undefined]])('renders no badge for %s', (badge) => {
      render(<PackageCard {...base} badge={badge} />);
      expect(document.querySelector('.uh-package__badge')).toBeNull();
    });
  });

  describe('agency', () => {
    it('marks a verified agency in words as well as with a mark', () => {
      render(<PackageCard {...base} />);
      expect(screen.getByText('Verified agency')).toBeDefined();
    });

    it('leaves an unverified agency unmarked', () => {
      render(<PackageCard {...base} agency={{ name: 'Small Tours' }} />);
      expect(screen.queryByText('Verified agency')).toBeNull();
      expect(screen.getByText('Small Tours')).toBeDefined();
    });
  });

  /* Phase 5 rule 4: a half-filled agency record is the normal case. */
  describe('incomplete data', () => {
    it('renders with nothing but a title, an agency and a price', () => {
      render(<PackageCard {...base} />);
      expect(screen.getByRole('article')).toBeDefined();
      expect(document.querySelector('.uh-rating')).toBeNull();
      expect(document.querySelector('.uh-package__meta')).toBeNull();
      expect(document.querySelector('.uh-package__hotels')).toBeNull();
      expect(document.querySelector('.uh-package__seats')).toBeNull();
      expect(document.querySelector('.uh-price__original')).toBeNull();
    });

    it('draws a placeholder rather than a broken image', () => {
      render(<PackageCard {...base} />);
      expect(document.querySelector('.uh-package__image')).toBeNull();
      expect(document.querySelector('.uh-package__image-fallback')).not.toBeNull();
    });

    it('shows no rating rather than a rating of zero', () => {
      render(<PackageCard {...base} rating={undefined} reviewCount={128} />);
      expect(document.querySelector('.uh-rating')).toBeNull();
    });

    it('leaves out a duration that is not a number', () => {
      render(<PackageCard {...base} durationDays={Number.NaN} />);
      expect(document.querySelector('.uh-package__meta')).toBeNull();
    });

    it('leaves out a distance that is not a number', () => {
      render(<PackageCard {...base} hotelDistance={{ makkah: Number.NaN }} />);
      expect(document.querySelector('.uh-package__hotels')).toBeNull();
    });

    it('takes the first image and keeps the rest for later', () => {
      render(<PackageCard {...base} image={['a.jpg', 'b.jpg', 'c.jpg']} />);
      const images = document.querySelectorAll('.uh-package__image');
      expect(images).toHaveLength(1);
      expect(images[0]!.getAttribute('src')).toBe('a.jpg');
    });
  });

  describe('translation', () => {
    it('takes every word it can show', () => {
      render(
        <PackageCard
          {...base}
          locale="ms-MY"
          badge="promo"
          seatsRemaining={3}
          soldOut
          hotelDistance={{ makkah: 200 }}
          labels={{
            badges: { bestSeller: 'Paling laris', promo: 'Promosi', almostFull: 'Hampir penuh' },
            verified: 'Agensi disahkan',
            makkahDistance: (d) => `${d} dari Masjidil Haram`,
            seatsLeft: (count) => `${count} tempat lagi`,
            soldOut: 'Habis dijual',
          }}
        />,
      );
      expect(screen.getByText('Promosi')).toBeDefined();
      expect(screen.getByText('Agensi disahkan')).toBeDefined();
      expect(screen.getByText('200 m dari Masjidil Haram')).toBeDefined();
      expect(screen.getByText('3 tempat lagi')).toBeDefined();
      expect(screen.getByText('Habis dijual')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    const full: PackageCardProps = {
      ...base,
      image: ['cover.jpg'],
      rating: 4.8,
      reviewCount: 128,
      departureDate: new Date(2026, 2, 15),
      durationDays: 14,
      hotelDistance: { makkah: 200, madinah: 450 },
      originalPrice: 15000,
      seatsRemaining: 4,
      badge: 'promo',
    };

    it('has no violations in its fullest form', async () => {
      const { container } = render(
        <PackageCard {...full} onClick={vi.fn()} onWishlist={vi.fn()} />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations sold out', async () => {
      const { container } = render(<PackageCard {...full} soldOut onWishlist={vi.fn()} />);
      await expectNoA11yViolations(container);
    });

    it('has no violations loading', async () => {
      const { container } = render(<PackageCard {...full} loading />);
      await expectNoA11yViolations(container);
    });

    it('has no violations with almost nothing to show', async () => {
      const { container } = render(<PackageCard {...base} />);
      await expectNoA11yViolations(container);
    });

    it('reads the rating as a sentence, not as five images', () => {
      render(<PackageCard {...full} />);
      expect(
        within(screen.getByRole('article')).getByRole('img', { name: '4.8 out of 5, 128 reviews' }),
      ).toBeDefined();
    });
  });
});
