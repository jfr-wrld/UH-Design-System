import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { HotelCard, type HotelCardProps } from './HotelCard.js';
import type { Amenity } from './amenities.js';

const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'Free Wi-Fi' },
  { id: 'breakfast', label: 'Breakfast included' },
  { id: 'shuttle', label: 'Haram shuttle' },
  { id: 'prayer', label: 'Prayer room' },
  { id: 'elevator', label: 'Lift' },
  { id: 'laundry', label: 'Laundry' },
];

const base: HotelCardProps = {
  name: 'Al Safwah Royale Orchid',
  starRating: 5,
  city: 'Makkah',
  distanceToHaram: 200,
  nights: 5,
  amenities: AMENITIES,
};

const card = () => document.querySelector('.uh-hotel') as HTMLElement;

describe('HotelCard', () => {
  it('shows the name, the class and the nights', () => {
    render(<HotelCard {...base} />);
    expect(screen.getByText('Al Safwah Royale Orchid')).toBeDefined();
    expect(screen.getByText('5 nights')).toBeDefined();
  });

  describe('distance', () => {
    it('is the headline, formatted through the shared distance formatter', () => {
      render(<HotelCard {...base} />);
      expect(screen.getByText('200 m from Haram')).toBeDefined();
    });

    it('switches to kilometres on its own', () => {
      render(<HotelCard {...base} distanceToHaram={1200} />);
      expect(screen.getByText('1.2 km from Haram')).toBeDefined();
    });

    /* The prop is named for the Haram, but a Madinah hotel is measured from
       the Prophet's Mosque; the city picks the landmark. */
    it('names the Nabawi for a Madinah hotel', () => {
      render(<HotelCard {...base} city="Madinah" distanceToHaram={450} />);
      expect(screen.getByText('450 m from Nabawi')).toBeDefined();
      expect(screen.queryByText(/from Haram/)).toBeNull();
    });

    it('uses the locale decimal', () => {
      render(<HotelCard {...base} distanceToHaram={1200} locale="id-ID" />);
      expect(screen.getByText('1,2 km from Haram')).toBeDefined();
    });

    it('shows nothing rather than a distance that is not a number', () => {
      render(<HotelCard {...base} distanceToHaram={Number.NaN} />);
      expect(document.querySelector('.uh-hotel__distance')).toBeNull();
    });
  });

  describe('stars', () => {
    it('reads as one sentence', () => {
      render(<HotelCard {...base} />);
      expect(screen.getByRole('img', { name: '5 out of 5 stars' })).toBeDefined();
    });

    it('shows no stars for an unclassified hotel', () => {
      render(<HotelCard {...base} starRating={undefined} />);
      expect(screen.queryByRole('img')).toBeNull();
    });
  });

  describe('amenities', () => {
    it('names every icon, so nothing lives in the tooltip alone', () => {
      render(<HotelCard {...base} variant="full" />);
      for (const amenity of AMENITIES) {
        expect(screen.getByRole('button', { name: amenity.label })).toBeDefined();
      }
    });

    it('folds the compact row and counts the rest', () => {
      render(<HotelCard {...base} variant="compact" />);
      expect(screen.getAllByRole('button')).toHaveLength(4);
      expect(screen.getByText('+2')).toBeDefined();
    });

    it('shows everything in the full form', () => {
      render(<HotelCard {...base} variant="full" />);
      expect(screen.getAllByRole('button')).toHaveLength(6);
      expect(screen.queryByText(/^\+/)).toBeNull();
    });

    it('gives an unknown amenity the generic mark, still labelled', () => {
      render(
        <HotelCard {...base} amenities={[{ id: 'rooftop-majlis', label: 'Rooftop majlis' }]} />,
      );
      expect(screen.getByRole('button', { name: 'Rooftop majlis' })).toBeDefined();
    });

    it('shows the note on focus, so the keyboard gets it too', async () => {
      render(<HotelCard {...base} />);
      screen.getByRole('button', { name: 'Free Wi-Fi' }).focus();
      expect(await screen.findByRole('tooltip')).toBeDefined();
    });
  });

  describe('variants', () => {
    it('is compact by default', () => {
      render(<HotelCard {...base} />);
      expect(card().dataset.variant).toBe('compact');
    });

    it('carries the full layout through', () => {
      render(<HotelCard {...base} variant="full" />);
      expect(card().dataset.variant).toBe('full');
    });
  });

  describe('incomplete data', () => {
    it('renders from a name and a city alone', () => {
      render(<HotelCard name="Hotel Near Haram" city="Makkah" />);
      expect(screen.getByText('Hotel Near Haram')).toBeDefined();
      expect(document.querySelector('.uh-hotel__distance')).toBeNull();
      expect(document.querySelector('.uh-hotel__amenities')).toBeNull();
      expect(document.querySelector('.uh-hotel__nights')).toBeNull();
    });

    it('draws a placeholder rather than a broken image', () => {
      render(<HotelCard {...base} />);
      expect(document.querySelector('.uh-hotel__image')).toBeNull();
      expect(document.querySelector('.uh-hotel__image-fallback')).not.toBeNull();
    });
  });

  describe('translation', () => {
    it('takes every string', () => {
      render(
        <HotelCard
          {...base}
          city="Madinah"
          distanceToHaram={450}
          locale="ms-MY"
          labels={{
            fromNabawi: (d) => `${d} dari Masjid Nabawi`,
            nights: (count) => `${count} malam`,
            stars: (count) => `${count} daripada 5 bintang`,
          }}
        />,
      );
      expect(screen.getByText('450 m dari Masjid Nabawi')).toBeDefined();
      expect(screen.getByText('5 malam')).toBeDefined();
      expect(screen.getByRole('img', { name: '5 daripada 5 bintang' })).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations in either form', async () => {
      const { container, rerender } = render(<HotelCard {...base} />);
      await expectNoA11yViolations(container);
      rerender(<HotelCard {...base} variant="full" />);
      await expectNoA11yViolations(container);
    });

    it('keeps the amenities a list', () => {
      render(<HotelCard {...base} variant="full" />);
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(6);
    });
  });
});
