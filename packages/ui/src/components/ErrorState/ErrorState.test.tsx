import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { ErrorState } from './ErrorState.js';

describe('ErrorState', () => {
  it('renders a title and a default icon when none is supplied', () => {
    render(<ErrorState title="Could not load packages" />);
    expect(screen.getByText('Could not load packages')).toBeDefined();
    expect(document.querySelector('.uh-state-message__icon svg')).not.toBeNull();
  });

  it('renders as role=alert - it interrupts, unlike EmptyState', () => {
    render(<ErrorState title="Could not load packages" />);
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('tints the icon for the error tone', () => {
    render(<ErrorState title="Could not load packages" />);
    expect(document.querySelector('.uh-state-message__icon')?.getAttribute('data-tone')).toBe(
      'error',
    );
  });

  it('renders an optional description', () => {
    render(
      <ErrorState
        title="Could not load packages"
        description="Check your connection and try again."
      />,
    );
    expect(screen.getByText('Check your connection and try again.')).toBeDefined();
  });

  it('swaps in a custom icon over the default one', () => {
    render(<ErrorState title="Payment failed" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeDefined();
    expect(document.querySelector('.uh-state-message__icon svg')).toBeNull();
  });

  it('defaults to size md', () => {
    render(<ErrorState title="Could not load packages" />);
    expect(document.querySelector('.uh-error-state')?.getAttribute('data-size')).toBe('md');
  });

  it('carries size sm through', () => {
    render(<ErrorState title="Could not load packages" size="sm" />);
    expect(document.querySelector('.uh-error-state')?.getAttribute('data-size')).toBe('sm');
  });

  describe('actions', () => {
    it('renders a retry action and fires its handler', () => {
      const onRetry = vi.fn();
      render(
        <ErrorState
          title="Could not load packages"
          action={{ label: 'Try again', onClick: onRetry }}
        />,
      );
      screen.getByRole('button', { name: 'Try again' }).click();
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('renders both actions independently', () => {
      const onRetry = vi.fn();
      const onSupport = vi.fn();
      render(
        <ErrorState
          title="Payment failed"
          action={{ label: 'Try again', onClick: onRetry }}
          secondaryAction={{ label: 'Contact support', onClick: onSupport }}
        />,
      );
      screen.getByRole('button', { name: 'Contact support' }).click();
      expect(onSupport).toHaveBeenCalledTimes(1);
      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no violations with description and both actions', async () => {
      render(
        <ErrorState
          title="Could not load packages"
          description="Check your connection and try again."
          action={{ label: 'Try again', onClick: () => {} }}
          secondaryAction={{ label: 'Contact support', onClick: () => {} }}
        />,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations at size sm with a custom icon', async () => {
      render(
        <ErrorState
          title="Could not load this section"
          size="sm"
          icon={
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
            </svg>
          }
        />,
      );
      await expectNoA11yViolations(document.body);
    });
  });
});
