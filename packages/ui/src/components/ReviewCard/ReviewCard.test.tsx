import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { ReviewCard, type ReviewCardProps } from './ReviewCard.js';
import { RatingBreakdown } from './RatingBreakdown.js';

const base: ReviewCardProps = {
  author: { name: 'Aisyah Rahman', verified: true },
  rating: 5,
  date: new Date(2026, 2, 1),
  content:
    'Alhamdulillah, everything was taken care of from the airport to the hotel. The mutawwif was patient with my parents.',
  packageName: '14-Day Ramadan Umrah Package',
  helpfulCount: 12,
};

/* Pinned so relative dates in assertions cannot rot. 14 days after `date`. */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 2, 15, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

/** jsdom cannot lay text out, so the four-line overflow is staged by hand. */
function forceOverflow() {
  const node = document.querySelector('.uh-review__content') as HTMLElement;
  Object.defineProperty(node, 'scrollHeight', { configurable: true, value: 200 });
  Object.defineProperty(node, 'clientHeight', { configurable: true, value: 88 });
}

describe('ReviewCard', () => {
  it('shows the author, the review and its context', () => {
    render(<ReviewCard {...base} />);
    expect(screen.getByText('Aisyah Rahman')).toBeDefined();
    expect(screen.getByText(/Alhamdulillah/)).toBeDefined();
    expect(screen.getByText('14-Day Ramadan Umrah Package')).toBeDefined();
    expect(screen.getByRole('img', { name: '5.0 out of 5' })).toBeDefined();
  });

  describe('date', () => {
    it('reads a fresh review relatively', () => {
      render(<ReviewCard {...base} />);
      expect(screen.getByText('2 weeks ago')).toBeDefined();
    });

    it('reads an old one absolutely', () => {
      render(<ReviewCard {...base} date={new Date(2025, 10, 2)} locale="en-MY" />);
      expect(screen.getByText('2 Nov 2025')).toBeDefined();
    });

    /* The machine-readable instant survives whichever wording is shown.
       Compared as an instant, not a substring: toISOString speaks UTC and the
       suite runs in whatever timezone the machine is in. */
    it('keeps the real date on the time element', () => {
      render(<ReviewCard {...base} />);
      const stamp = document.querySelector('time')!.getAttribute('datetime')!;
      expect(new Date(stamp).getTime()).toBe(base.date!.getTime());
    });
  });

  describe('verified purchase', () => {
    it('marks a verified reviewer in words', () => {
      render(<ReviewCard {...base} />);
      expect(screen.getByText('Verified purchase')).toBeDefined();
    });

    it('marks nobody it cannot vouch for', () => {
      render(<ReviewCard {...base} author={{ name: 'Aisyah Rahman' }} />);
      expect(screen.queryByText('Verified purchase')).toBeNull();
    });
  });

  describe('clamp', () => {
    it('clamps the content and offers no toggle while everything fits', () => {
      render(<ReviewCard {...base} />);
      expect((document.querySelector('.uh-review__content') as HTMLElement).dataset.clamped).toBe(
        'true',
      );
      expect(screen.queryByRole('button', { name: 'Read more' })).toBeNull();
    });

    it('offers Read more once four lines genuinely overflow', async () => {
      const { rerender } = render(<ReviewCard {...base} />);
      forceOverflow();
      /* Re-render so the layout effect measures the staged heights. */
      rerender(<ReviewCard {...base} content={`${base.content} And more.`} />);
      expect(screen.getByRole('button', { name: 'Read more' })).toBeDefined();
    });

    it('unclamps, flips to Show less, and folds back', async () => {
      const { rerender } = render(<ReviewCard {...base} />);
      forceOverflow();
      rerender(<ReviewCard {...base} content={`${base.content} And more.`} />);

      const toggle = screen.getByRole('button', { name: 'Read more' });
      expect(toggle.getAttribute('aria-expanded')).toBe('false');
      await userEvent.click(toggle);
      expect(
        (document.querySelector('.uh-review__content') as HTMLElement).dataset.clamped,
      ).toBeUndefined();
      expect(screen.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded')).toBe(
        'true',
      );
    });
  });

  describe('photos', () => {
    const photos = [{ src: 'a.jpg', alt: 'The hotel lobby' }, { src: 'b.jpg' }, { src: 'c.jpg' }];

    it('shows a thumbnail row', () => {
      render(<ReviewCard {...base} photos={photos} />);
      expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(3);
    });

    /*
     * The lightbox is the consumer's: it is a modal dialog and there is no
     * Modal primitive yet. With a handler the thumbnails are buttons; without
     * one they are plain images, not dead controls.
     */
    it('makes thumbnails buttons only when a handler exists', () => {
      const { rerender } = render(<ReviewCard {...base} photos={photos} />);
      expect(screen.queryByRole('button', { name: /Photo/ })).toBeNull();
      rerender(<ReviewCard {...base} photos={photos} onPhotoClick={vi.fn()} />);
      expect(screen.getByRole('button', { name: 'Photo 2 of 3' })).toBeDefined();
    });

    it('reports which photo was opened, preferring the photo own words', async () => {
      const onPhotoClick = vi.fn();
      render(<ReviewCard {...base} photos={photos} onPhotoClick={onPhotoClick} />);
      await userEvent.click(screen.getByRole('button', { name: 'The hotel lobby' }));
      expect(onPhotoClick).toHaveBeenCalledExactlyOnceWith(0);
    });
  });

  describe('helpful', () => {
    it('is a statement without a handler', () => {
      render(<ReviewCard {...base} />);
      expect(screen.getByText('Helpful (12)')).toBeDefined();
      expect(screen.queryByRole('button', { name: /Helpful/ })).toBeNull();
    });

    it('is a button with one', async () => {
      const onHelpful = vi.fn();
      render(<ReviewCard {...base} onHelpful={onHelpful} />);
      await userEvent.click(screen.getByRole('button', { name: 'Helpful (12)' }));
      expect(onHelpful).toHaveBeenCalledTimes(1);
    });

    it('groups the count for the locale', () => {
      render(<ReviewCard {...base} helpfulCount={1284} locale="id-ID" />);
      expect(screen.getByText('Helpful (1.284)')).toBeDefined();
    });
  });

  describe('incomplete data', () => {
    it('renders from an author and content alone', () => {
      render(<ReviewCard author={{ name: 'Fatimah' }} content="Sangat baik." />);
      expect(screen.getByText('Sangat baik.')).toBeDefined();
      expect(document.querySelector('.uh-rating')).toBeNull();
      expect(document.querySelector('time')).toBeNull();
      expect(document.querySelector('.uh-review__helpful')).toBeNull();
      expect(screen.queryByRole('list')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has no violations fully loaded', async () => {
      const { container } = render(
        <ReviewCard
          {...base}
          photos={[{ src: 'a.jpg', alt: 'The hotel lobby' }]}
          onPhotoClick={vi.fn()}
          onHelpful={vi.fn()}
        />,
      );
      await expectNoA11yViolations(container);
    });
  });
});

describe('RatingBreakdown', () => {
  const COUNTS = { 5: 96, 4: 20, 3: 8, 2: 3, 1: 1 };

  it('is one named group with a row per bucket', () => {
    render(<RatingBreakdown counts={COUNTS} />);
    expect(screen.getByRole('group', { name: 'Rating breakdown' })).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('reads each row as a sentence, singulars included', () => {
    render(<RatingBreakdown counts={COUNTS} />);
    expect(screen.getByLabelText('5 stars: 96 reviews')).toBeDefined();
    expect(screen.getByLabelText('1 star: 1 review')).toBeDefined();
  });

  /*
   * The average IS computed, where money totals never are: a weighted mean of
   * the supplied counts has exactly one right answer.
   */
  it('computes the weighted average', () => {
    render(<RatingBreakdown counts={COUNTS} />);
    /* (480+80+24+6+1)/128 = 4.6171... -> 4.6 */
    expect(document.querySelector('.uh-ratings__average')!.textContent).toBe('4.6');
    expect(screen.getByText('128 reviews')).toBeDefined();
  });

  it('sizes each bar as a share of the whole', () => {
    render(<RatingBreakdown counts={{ 5: 3, 1: 1 }} />);
    const bars = [...document.querySelectorAll('.uh-ratings__fill')].map(
      (bar) => (bar as HTMLElement).style.inlineSize,
    );
    expect(bars[0]).toBe('75%');
    expect(bars[4]).toBe('25%');
  });

  it('treats a missing bucket as empty, not an error', () => {
    render(<RatingBreakdown counts={{ 5: 10 }} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
    expect(document.querySelector('.uh-ratings__average')!.textContent).toBe('5.0');
  });

  it('draws nothing at all from an empty distribution', () => {
    const { container } = render(<RatingBreakdown counts={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('formats for the locale', () => {
    render(<RatingBreakdown counts={COUNTS} locale="id-ID" />);
    expect(document.querySelector('.uh-ratings__average')!.textContent).toBe('4,6');
  });

  it('has no violations', async () => {
    const { container } = render(<RatingBreakdown counts={COUNTS} />);
    await expectNoA11yViolations(container);
  });
});
