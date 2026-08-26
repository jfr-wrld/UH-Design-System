import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Skeleton, SkeletonCard, SkeletonList, SkeletonTable } from './Skeleton.js';

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    const { container } = render(<Skeleton />);
    // "Grey rectangle" is not information; the container announces instead.
    expect(container.querySelector('.uh-skeleton')?.getAttribute('aria-hidden')).toBe('true');
  });

  it.each(['text', 'circle', 'rect'] as const)('carries variant %s', (variant) => {
    const { container } = render(<Skeleton variant={variant} />);
    expect(container.querySelector('.uh-skeleton')?.getAttribute('data-variant')).toBe(variant);
  });

  it.each(['pulse', 'wave', 'none'] as const)('carries animation %s', (animation) => {
    const { container } = render(<Skeleton animation={animation} />);
    expect(container.querySelector('.uh-skeleton')?.getAttribute('data-animation')).toBe(animation);
  });

  it('applies width and height, numbers as pixels', () => {
    const { container } = render(<Skeleton width={120} height="2rem" />);
    const el = container.querySelector('.uh-skeleton') as HTMLElement;
    expect(el.style.width).toBe('120px');
    expect(el.style.height).toBe('2rem');
  });

  describe('multi-line text', () => {
    it('renders one bar per line', () => {
      const { container } = render(<Skeleton variant="text" lines={4} />);
      expect(container.querySelectorAll('.uh-skeleton')).toHaveLength(4);
    });

    it('shortens the last line so it reads as prose', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const bars = [...container.querySelectorAll<HTMLElement>('.uh-skeleton')];
      expect(bars[2]?.style.width).toBe('60%');
      expect(bars[0]?.style.width).toBe('');
    });

    it('stays a single bar when lines is 1', () => {
      const { container } = render(<Skeleton variant="text" lines={1} />);
      expect(container.querySelectorAll('.uh-skeleton')).toHaveLength(1);
    });
  });
});

describe('Skeleton presets', () => {
  it.each([
    ['SkeletonCard', <SkeletonCard key="c" />, 'Loading package'],
    ['SkeletonList', <SkeletonList key="l" />, 'Loading list'],
    ['SkeletonTable', <SkeletonTable key="t" />, 'Loading table'],
  ])('%s announces itself once and marks itself busy', (_name, element, label) => {
    render(element);
    const status = screen.getByRole('status');
    expect(status.getAttribute('aria-busy')).toBe('true');
    expect(status.textContent).toContain(label);
  });

  it('accepts a localised label', () => {
    render(<SkeletonCard label="Memuatkan pakej" />);
    expect(screen.getByRole('status').textContent).toContain('Memuatkan pakej');
  });

  it('SkeletonList renders the requested rows', () => {
    const { container } = render(<SkeletonList rows={5} />);
    expect(container.querySelectorAll('.uh-skeleton-list__row')).toHaveLength(5);
  });

  it('SkeletonTable renders rows by columns', () => {
    const { container } = render(<SkeletonTable rows={3} columns={5} />);
    const rows = container.querySelectorAll('.uh-skeleton-table__row');
    expect(rows).toHaveLength(3);
    expect(rows[0]?.querySelectorAll('.uh-skeleton')).toHaveLength(5);
  });

  it('passes the animation down to every bar', () => {
    const { container } = render(<SkeletonCard animation="wave" />);
    const bars = [...container.querySelectorAll('.uh-skeleton')];
    expect(bars.length).toBeGreaterThan(0);
    expect(bars.every((b) => b.getAttribute('data-animation') === 'wave')).toBe(true);
  });

  describe('accessibility', () => {
    it('has no axe violations across the presets', async () => {
      const { container } = render(
        <>
          <SkeletonCard />
          <SkeletonList rows={2} />
          <SkeletonTable rows={2} columns={3} />
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
