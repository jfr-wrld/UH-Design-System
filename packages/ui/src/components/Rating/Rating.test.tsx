import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Rating } from './Rating.js';

const fill = () =>
  (document.querySelector('.uh-rating__layer[data-filled="true"]') as HTMLElement).style.inlineSize;

describe('Rating', () => {
  it('is one image with the score as its name', () => {
    render(<Rating value={4.8} reviewCount={128} />);
    expect(screen.getByRole('img', { name: '4.8 out of 5, 128 reviews' })).toBeDefined();
  });

  it('names itself without a count when there is none', () => {
    render(<Rating value={4.8} />);
    expect(screen.getByRole('img', { name: '4.8 out of 5' })).toBeDefined();
  });

  it('draws five stars twice, once empty and once filled', () => {
    render(<Rating value={4.8} />);
    expect(document.querySelectorAll('.uh-rating__layer')).toHaveLength(2);
    expect(document.querySelectorAll('.uh-rating__layer > svg')).toHaveLength(10);
  });

  /* A true fraction rather than rounding 4.3 up to four and a half. */
  it.each([
    [5, '100%'],
    [4.3, '86%'],
    [0, '0%'],
  ])('fills to the score: %s of 5', (value, expected) => {
    render(<Rating value={value} />);
    expect(fill()).toBe(expected);
  });

  it('clamps a score outside the scale', () => {
    const { rerender } = render(<Rating value={9} />);
    expect(fill()).toBe('100%');
    rerender(<Rating value={-2} />);
    expect(fill()).toBe('0%');
  });

  it('takes a different scale', () => {
    render(<Rating value={7} max={10} />);
    expect(document.querySelectorAll('.uh-rating__layer > svg')).toHaveLength(20);
    expect(fill()).toBe('70%');
  });

  it('formats the score and count for the locale', () => {
    render(<Rating value={4.8} reviewCount={1284} locale="id-ID" />);
    expect(document.querySelector('.uh-rating__value')!.textContent).toBe('4,8');
    expect(document.querySelector('.uh-rating__count')!.textContent).toBe('(1.284)');
  });

  it('always shows one decimal, so a column of scores lines up', () => {
    render(<Rating value={5} />);
    expect(document.querySelector('.uh-rating__value')!.textContent).toBe('5.0');
  });

  it('can hide the number', () => {
    render(<Rating value={4.8} showValue={false} />);
    expect(document.querySelector('.uh-rating__value')).toBeNull();
  });

  it('takes a translated sentence', () => {
    render(
      <Rating
        value={4.8}
        reviewCount={128}
        locale="ms-MY"
        label={(v, m, c) => `${v} daripada ${m}, ${c} ulasan`}
      />,
    );
    expect(screen.getByRole('img', { name: '4.8 daripada 5, 128 ulasan' })).toBeDefined();
  });

  /* Guessing zero stars would libel the agency; the caller decides instead. */
  it.each([
    ['not a number', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
  ])('draws nothing for a score that is %s', (_case, value) => {
    const { container } = render(<Rating value={value} />);
    expect(container.firstChild).toBeNull();
  });

  it('draws nothing for a scale of zero', () => {
    const { container } = render(<Rating value={3} max={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('has no violations', async () => {
    const { container } = render(<Rating value={4.8} reviewCount={128} size="md" />);
    await expectNoA11yViolations(container);
  });

  describe('input mode', () => {
    const stars = () => screen.getAllByRole('radio');

    it('display mode is the default - value alone draws the decorative score', () => {
      render(<Rating value={4} />);
      expect(screen.getByRole('img')).toBeDefined();
      expect(screen.queryByRole('radiogroup')).toBeNull();
    });

    it('onChange alone switches to a radiogroup of one radio per star', () => {
      render(<Rating value={0} onChange={() => {}} />);
      expect(screen.getByRole('radiogroup', { name: 'Rating' })).toBeDefined();
      expect(stars()).toHaveLength(5);
    });

    it('defaultValue alone also switches modes, uncontrolled', () => {
      render(<Rating defaultValue={2} onChange={() => {}} />);
      expect(stars()[1]!.hasAttribute('checked')).toBe(true);
    });

    it('names each star for a screen reader independent of the visible glyph', () => {
      render(<Rating value={0} onChange={() => {}} />);
      expect(screen.getByRole('radio', { name: '3 stars' })).toBeDefined();
      expect(screen.getByRole('radio', { name: '1 star' })).toBeDefined();
    });

    it('respects a different scale', () => {
      render(<Rating value={0} max={10} onChange={() => {}} />);
      expect(stars()).toHaveLength(10);
    });

    it('fires onChange with the clicked star, controlled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Rating value={2} onChange={onChange} groupLabel="Rate this agency" />);
      await user.click(screen.getByRole('radio', { name: '4 stars' }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(4);
      /* Controlled: the DOM does not move until the parent says so. */
      expect(screen.getByRole('radio', { name: '2 stars' })).toHaveProperty('checked', true);
    });

    it('round-trips through a controlling parent', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [value, setValue] = useState(2);
        return <Rating value={value} onChange={setValue} />;
      }
      render(<Controlled />);
      await user.click(screen.getByRole('radio', { name: '5 stars' }));
      expect(screen.getByRole('radio', { name: '5 stars' })).toHaveProperty('checked', true);
    });

    it('runs uncontrolled from defaultValue when the parent never passes value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Rating defaultValue={1} onChange={onChange} />);
      await user.click(screen.getByRole('radio', { name: '3 stars' }));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(3);
      expect(screen.getByRole('radio', { name: '3 stars' })).toHaveProperty('checked', true);
    });

    it('native arrow-key navigation moves and selects within the group', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Rating defaultValue={2} onChange={onChange} />);
      screen.getByRole('radio', { name: '2 stars' }).focus();
      await user.keyboard('{ArrowRight}');
      expect(onChange).toHaveBeenLastCalledWith(3);
    });

    it('is reachable via aria-readonly and blocks the change instead of disabling', () => {
      const onChange = vi.fn();
      render(<Rating value={3} onChange={onChange} readOnly />);
      const group = screen.getByRole('radiogroup');
      expect(group.getAttribute('aria-readonly')).toBe('true');
      const target = screen.getByRole('radio', { name: '5 stars' });
      expect(target).toHaveProperty('disabled', false);
      fireEvent.click(target);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('readOnly alone (no onChange) still renders the picker shape', () => {
      render(<Rating value={3} readOnly />);
      expect(screen.getByRole('radiogroup')).toBeDefined();
    });

    it('disables every star and blocks the change', () => {
      const onChange = vi.fn();
      render(<Rating value={3} onChange={onChange} disabled />);
      const target = screen.getByRole('radio', { name: '5 stars' });
      expect(target).toHaveProperty('disabled', true);
      fireEvent.click(target);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('has no violations as a live picker', async () => {
      render(<Rating value={3} onChange={() => {}} groupLabel="Rate this agency" />);
      await expectNoA11yViolations(document.body);
    });

    it('has no violations read-only', async () => {
      render(<Rating value={3} readOnly groupLabel="Your rating" />);
      await expectNoA11yViolations(document.body);
    });
  });
});
