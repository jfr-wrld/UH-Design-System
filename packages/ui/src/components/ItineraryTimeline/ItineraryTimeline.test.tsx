import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { ItineraryTimeline, type ItineraryDay } from './ItineraryTimeline.js';

const DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: new Date(2026, 2, 15),
    title: 'Arrival in Madinah',
    location: 'Madinah',
    activities: [
      { type: 'flight', label: 'KUL to MED, direct', time: '08:30' },
      { type: 'hotel', label: 'Check in at Dar Al Taqwa' },
      { type: 'ibadah', label: 'Maghrib at Masjid Nabawi' },
    ],
  },
  {
    dayNumber: 2,
    date: new Date(2026, 2, 16),
    title: 'Ziarah in Madinah',
    location: 'Madinah',
    activities: [
      { type: 'ziarah', label: 'Quba Mosque and Uhud' },
      { type: 'meal', label: 'Lunch at the hotel' },
    ],
  },
  {
    dayNumber: 3,
    date: new Date(2026, 2, 17),
    title: 'Travel to Makkah',
    location: 'Makkah',
    activities: [{ type: 'flight', label: 'Coach to Makkah, miqat at Dhul Hulaifah' }],
  },
];

/* Not getAllByRole('listitem'): the activity rows are list items too, and a
   role query inside the outer list would count them all. */
const days = () => document.querySelectorAll('.uh-itinerary__item');

/** Folded content stays in the DOM under `hidden`, so presence is the wrong
 *  question; whether its body is hidden is the right one. */
const dayBody = (name: RegExp) => {
  const toggle = screen.getByRole('button', { name });
  return document.getElementById(toggle.getAttribute('aria-controls')!) as HTMLElement;
};

describe('ItineraryTimeline', () => {
  it('is one ordered list with a day per item', () => {
    render(<ItineraryTimeline days={DAYS} />);
    expect(screen.getByRole('list', { name: 'Itinerary' }).tagName).toBe('OL');
    expect(days()).toHaveLength(3);
    expect(screen.getByText('Day 1')).toBeDefined();
    expect(screen.getByText('Arrival in Madinah')).toBeDefined();
  });

  it('formats the date through Intl', () => {
    render(<ItineraryTimeline days={DAYS} locale="en-MY" />);
    expect(screen.getByText('15 Mar 2026')).toBeDefined();
  });

  it('marks the location of each day', () => {
    render(<ItineraryTimeline days={DAYS} />);
    expect(screen.getAllByText('Madinah')).toHaveLength(2);
    expect(screen.getByText('Makkah')).toBeDefined();
  });

  describe('collapsing', () => {
    it('starts with day one open and the rest folded', () => {
      render(<ItineraryTimeline days={DAYS} />);
      expect(dayBody(/Day 1/).hidden).toBe(false);
      expect(screen.getByText('KUL to MED, direct')).toBeDefined();
      expect(dayBody(/Day 2/).hidden).toBe(true);
    });

    it('opens a folded day and says so', async () => {
      render(<ItineraryTimeline days={DAYS} />);
      const toggle = screen.getByRole('button', { name: /Day 2/ });
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      await userEvent.click(toggle);
      expect(toggle.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByText('Quba Mosque and Uhud')).toBeDefined();
    });

    it('lets several days stand open at once', async () => {
      render(<ItineraryTimeline days={DAYS} />);
      await userEvent.click(screen.getByRole('button', { name: /Day 2/ }));
      await userEvent.click(screen.getByRole('button', { name: /Day 3/ }));
      expect(screen.getByText('KUL to MED, direct')).toBeDefined();
      expect(screen.getByText('Quba Mosque and Uhud')).toBeDefined();
      expect(screen.getByText(/Coach to Makkah/)).toBeDefined();
    });

    it('folds day one back down', async () => {
      render(<ItineraryTimeline days={DAYS} />);
      await userEvent.click(screen.getByRole('button', { name: /Day 1/ }));
      expect(dayBody(/Day 1/).hidden).toBe(true);
    });

    it('shows everything with no buttons when not collapsible', () => {
      render(<ItineraryTimeline days={DAYS} collapsible={false} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      expect(screen.getByText('KUL to MED, direct')).toBeDefined();
      expect(screen.getByText('Quba Mosque and Uhud')).toBeDefined();
    });
  });

  describe('activities', () => {
    it('lists them with their times', () => {
      render(<ItineraryTimeline days={DAYS} />);
      expect(screen.getByText('08:30')).toBeDefined();
      expect(screen.getByText('Check in at Dar Al Taqwa')).toBeDefined();
    });

    it('survives an unknown activity kind', () => {
      render(
        <ItineraryTimeline
          days={[
            {
              dayNumber: 1,
              title: 'Free day',
              activities: [{ type: 'shopping', label: 'Souq near the hotel' }],
            },
          ]}
        />,
      );
      expect(screen.getByText('Souq near the hotel')).toBeDefined();
    });
  });

  describe('incomplete data', () => {
    it('renders a day from a number and a title alone', () => {
      render(<ItineraryTimeline days={[{ dayNumber: 1, title: 'Arrival' }]} />);
      expect(screen.getByText('Arrival')).toBeDefined();
      expect(document.querySelector('time')).toBeNull();
      expect(document.querySelector('.uh-itinerary__activities')).toBeNull();
    });
  });

  describe('translation', () => {
    it('takes the day word and the locale date', () => {
      render(
        <ItineraryTimeline
          days={DAYS}
          locale="ms-MY"
          labels={{ itinerary: 'Jadual perjalanan', day: (n) => `Hari ${n}` }}
        />,
      );
      expect(screen.getByRole('list', { name: 'Jadual perjalanan' })).toBeDefined();
      expect(screen.getByText('Hari 1')).toBeDefined();
      expect(screen.getByText('15 Mac 2026')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations open or folded', async () => {
      const { container } = render(<ItineraryTimeline days={DAYS} />);
      await expectNoA11yViolations(container);
      await userEvent.click(screen.getByRole('button', { name: /Day 2/ }));
      await expectNoA11yViolations(container);
    });

    it('has no violations when static', async () => {
      const { container } = render(<ItineraryTimeline days={DAYS} collapsible={false} />);
      await expectNoA11yViolations(container);
    });
  });
});

/* Regression guard: the toggles are real disclosure buttons, not clickable divs. */
describe('ItineraryTimeline toggles', () => {
  it('wires aria-controls to the body it folds', () => {
    render(<ItineraryTimeline days={DAYS} />);
    const toggle = screen.getByRole('button', { name: /Day 2/ });
    const controls = toggle.getAttribute('aria-controls')!;
    expect(document.getElementById(controls)).not.toBeNull();
  });

  it('is operable from the keyboard', async () => {
    const user = userEvent.setup();
    render(<ItineraryTimeline days={DAYS} />);
    const toggle = screen.getByRole('button', { name: /Day 2/ });
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });
});
