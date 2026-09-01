import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { EmptyState } from './EmptyState.js';

describe('EmptyState', () => {
  it('renders a title and a default icon when none is supplied', () => {
    render(<EmptyState title="No packages match your filters" />);
    expect(screen.getByText('No packages match your filters')).toBeDefined();
    expect(document.querySelector('.uh-state-message__icon svg')).not.toBeNull();
  });

  it('renders an optional description', () => {
    render(
      <EmptyState
        title="Your wishlist is empty"
        description="Save packages you like to find them here."
      />,
    );
    expect(screen.getByText('Save packages you like to find them here.')).toBeDefined();
  });

  it('renders no description when none is given', () => {
    render(<EmptyState title="No results" />);
    expect(document.querySelector('.uh-state-message__description')).toBeNull();
  });

  it('swaps in a custom icon over the default one', () => {
    render(<EmptyState title="No bookings yet" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeDefined();
    expect(document.querySelector('.uh-state-message__icon svg')).toBeNull();
  });

  it('defaults to size md', () => {
    render(<EmptyState title="No results" />);
    expect(document.querySelector('.uh-empty-state')?.getAttribute('data-size')).toBe('md');
  });

  it('carries size sm through', () => {
    render(<EmptyState title="No results" size="sm" />);
    expect(document.querySelector('.uh-empty-state')?.getAttribute('data-size')).toBe('sm');
  });

  it('renders no actions row when neither action is given', () => {
    render(<EmptyState title="No results" />);
    expect(document.querySelector('.uh-state-message__actions')).toBeNull();
  });

  describe('actions', () => {
    it('renders the primary action and fires its handler', () => {
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No packages match your filters"
          action={{ label: 'Clear filters', onClick }}
        />,
      );
      screen.getByRole('button', { name: 'Clear filters' }).click();
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders both the primary and secondary action independently', () => {
      const onPrimary = vi.fn();
      const onSecondary = vi.fn();
      render(
        <EmptyState
          title="No packages match your filters"
          action={{ label: 'Clear filters', onClick: onPrimary }}
          secondaryAction={{ label: 'Browse all packages', onClick: onSecondary }}
        />,
      );
      screen.getByRole('button', { name: 'Browse all packages' }).click();
      expect(onSecondary).toHaveBeenCalledTimes(1);
      expect(onPrimary).not.toHaveBeenCalled();
    });

    it('renders a secondary action alone', () => {
      render(
        <EmptyState
          title="No results"
          secondaryAction={{ label: 'Reset search', onClick: () => {} }}
        />,
      );
      expect(screen.getByRole('button', { name: 'Reset search' })).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations with description and both actions', async () => {
      render(
        <EmptyState
          title="No packages match your filters"
          description="Try widening your dates or removing a filter."
          action={{ label: 'Clear filters', onClick: () => {} }}
          secondaryAction={{ label: 'Browse all packages', onClick: () => {} }}
        />,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations at size sm with a custom icon', async () => {
      render(
        <EmptyState
          title="Your wishlist is empty"
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
