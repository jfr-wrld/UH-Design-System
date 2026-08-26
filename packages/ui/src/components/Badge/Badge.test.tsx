import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Badge, type BadgeStatus, type BadgeVariant } from './Badge.js';

const VARIANTS: BadgeVariant[] = [
  'neutral',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];

const STATUSES: BadgeStatus[] = [
  'pending',
  'paid',
  'confirmed',
  'inProgress',
  'completed',
  'cancelled',
  'refunded',
];

describe('Badge', () => {
  it('renders its label', () => {
    render(<Badge>Almost Full</Badge>);
    expect(screen.getByText('Almost Full')).toBeDefined();
  });

  it.each(VARIANTS)('carries variant %s', (variant) => {
    const { container } = render(<Badge variant={variant}>Best Seller</Badge>);
    expect(container.querySelector('.uh-badge')?.getAttribute('data-variant')).toBe(variant);
  });

  it.each(STATUSES)('carries booking status %s', (status) => {
    const { container } = render(<Badge variant={status}>Status</Badge>);
    expect(container.querySelector('.uh-badge')?.getAttribute('data-variant')).toBe(status);
  });

  it('keeps the dot and icon out of the accessibility tree', () => {
    const { container } = render(
      <Badge dot icon={<svg viewBox="0 0 24 24" />}>
        Confirmed
      </Badge>,
    );
    // The label already says it; a decorative dot must not be announced twice.
    expect(container.querySelector('.uh-badge__dot')?.getAttribute('aria-hidden')).toBe('true');
    expect(container.querySelector('.uh-badge__icon')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('Confirmed')).toBeDefined();
  });

  describe('removable', () => {
    it('exposes a named control and calls onRemove', async () => {
      const onRemove = vi.fn();
      render(
        <Badge removable onRemove={onRemove} removeLabel="Remove Almost Full">
          Almost Full
        </Badge>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Remove Almost Full' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('has no remove control unless asked', () => {
      render(<Badge>Almost Full</Badge>);
      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has no axe violations across every variant', async () => {
      const { container } = render(
        <>
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v} dot>
              {v}
            </Badge>
          ))}
          {STATUSES.map((s) => (
            <Badge key={s} variant={s} size="sm">
              {s}
            </Badge>
          ))}
        </>,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: removable', async () => {
      const { container } = render(
        <Badge removable removeLabel="Remove Best Seller">
          Best Seller
        </Badge>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
