import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { resetAnnouncer } from '../../lib/announcer.js';
import { Carousel, type CarouselSlide } from './Carousel.js';

const SLIDES: CarouselSlide[] = [
  { id: 'a', content: <img alt="" src="a.jpg" />, label: 'Hotel exterior' },
  { id: 'b', content: <img alt="" src="b.jpg" />, label: 'Room' },
  { id: 'c', content: <img alt="" src="c.jpg" />, label: 'Pool' },
];

describe('Carousel', () => {
  it('renders every slide and starts on the first', () => {
    render(<Carousel slides={SLIDES} label="Hotel photos" />);
    expect(screen.getAllByRole('group', { name: /Hotel photos|\/ 3/ }).length).toBeGreaterThan(0);
    expect(screen.getByRole('tab', { name: 'Go to slide 1' }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('advances with Next and disables Prev at the first slide', async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES} label="Hotel photos" />);
    expect(screen.getByRole('button', { name: 'Previous slide' })).toHaveProperty('disabled', true);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(screen.getByRole('tab', { name: 'Go to slide 2' }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('disables Next at the last slide', async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES} label="Hotel photos" defaultIndex={2} />);
    expect(screen.getByRole('button', { name: 'Next slide' })).toHaveProperty('disabled', true);
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
    expect(screen.getByRole('tab', { name: 'Go to slide 2' }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('jumps directly to a slide from its dot', async () => {
    const user = userEvent.setup();
    render(<Carousel slides={SLIDES} label="Hotel photos" />);
    await user.click(screen.getByRole('tab', { name: 'Go to slide 3' }));
    expect(screen.getByRole('tab', { name: 'Go to slide 3' }).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByRole('button', { name: 'Next slide' })).toHaveProperty('disabled', true);
  });

  it('hides Prev/Next and dots entirely for a single slide', () => {
    render(<Carousel slides={[SLIDES[0]!]} label="Hotel photos" />);
    expect(screen.queryByRole('button', { name: 'Next slide' })).toBeNull();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('renders nothing for an empty slide list', () => {
    const { container } = render(<Carousel slides={[]} label="Hotel photos" />);
    expect(container.firstChild).toBeNull();
  });

  it('round-trips through a controlling parent', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [i, setI] = useState(0);
      return (
        <Carousel
          slides={SLIDES}
          label="Hotel photos"
          index={i}
          onChange={(next) => {
            setI(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('tab', { name: 'Go to slide 2' }).getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('announces the new slide by label', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    resetAnnouncer();
    const user = userEvent.setup({ delay: null });
    render(<Carousel slides={SLIDES} label="Hotel photos" />);
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    await vi.advanceTimersByTimeAsync(60);
    expect(document.body.textContent).toContain('Room, slide 2 of 3');
    vi.useRealTimers();
    resetAnnouncer();
  });

  it('has no accessibility violations', async () => {
    render(<Carousel slides={SLIDES} label="Hotel photos" />);
    await expectNoA11yViolations(document.body);
  });
});
