import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

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
});
