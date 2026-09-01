import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Alert } from './Alert.js';

const settle = () => {
  const node = document.querySelector('.uh-alert[data-state="closing"]');
  if (node) fireEvent(node, new Event('animationend'));
};

describe('Alert', () => {
  it('renders a description with an icon, defaulting to info/inline', () => {
    render(<Alert>Check-in opens 48 hours before departure.</Alert>);
    const alert = screen
      .getByText('Check-in opens 48 hours before departure.')
      .closest('.uh-alert')!;
    expect(alert.getAttribute('data-variant')).toBe('info');
    expect(alert.getAttribute('data-layout')).toBe('inline');
    expect(alert.getAttribute('role')).toBe('status');
    expect(alert.querySelector('.uh-alert__icon svg')).not.toBeNull();
  });

  it('renders an optional title above the description', () => {
    render(<Alert title="Sold out">This package has no seats left.</Alert>);
    expect(screen.getByText('Sold out')).toBeDefined();
    expect(screen.getByText('This package has no seats left.')).toBeDefined();
  });

  it('carries the banner layout through', () => {
    render(<Alert layout="banner">Prices shown include tax.</Alert>);
    expect(document.querySelector('.uh-alert')?.getAttribute('data-layout')).toBe('banner');
  });

  describe('roles by urgency', () => {
    it.each([
      ['success', 'status'],
      ['info', 'status'],
      ['warning', 'alert'],
      ['error', 'alert'],
    ] as const)('%s renders role=%s', (variant, role) => {
      render(<Alert variant={variant}>A message.</Alert>);
      expect(document.querySelector('.uh-alert')?.getAttribute('role')).toBe(role);
    });
  });

  it('names itself via aria-labelledby when a title is present', () => {
    render(<Alert title="Sold out">This package has no seats left.</Alert>);
    const alert = document.querySelector('.uh-alert')!;
    const titleId = alert.getAttribute('aria-labelledby');
    expect(titleId).toBeTruthy();
    expect(document.getElementById(titleId!)?.textContent).toBe('Sold out');
  });

  it('is not dismissible by default', () => {
    render(<Alert>Prices shown include tax.</Alert>);
    expect(screen.queryByRole('button')).toBeNull();
  });

  describe('actions', () => {
    it('renders each action and fires its own handler', () => {
      const onRetry = vi.fn();
      const onContact = vi.fn();
      render(
        <Alert
          variant="error"
          title="Payment failed"
          actions={[
            { label: 'Retry', onClick: onRetry },
            { label: 'Contact support', onClick: onContact },
          ]}
        >
          We could not charge your card.
        </Alert>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      fireEvent.click(screen.getByRole('button', { name: 'Contact support' }));
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onContact).toHaveBeenCalledTimes(1);
    });
  });

  describe('dismissal', () => {
    it('shows a close button when dismissible, sized as a tap target', () => {
      render(
        <Alert dismissible onDismiss={() => {}}>
          Prices shown include tax.
        </Alert>,
      );
      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDefined();
    });

    it('calls onDismiss only after the exit animation settles', () => {
      const onDismiss = vi.fn();
      render(
        <Alert dismissible onDismiss={onDismiss}>
          Prices shown include tax.
        </Alert>,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      expect(onDismiss).not.toHaveBeenCalled();
      expect(document.querySelector('.uh-alert')?.getAttribute('data-state')).toBe('closing');
      settle();
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(document.querySelector('.uh-alert')).toBeNull();
    });

    it('unmounts itself once closed, independent of the parent re-rendering', () => {
      function Host() {
        const [dismissed, setDismissed] = useState(false);
        return (
          <div>
            {dismissed ? <p>Gone</p> : null}
            <Alert dismissible onDismiss={() => setDismissed(true)}>
              Prices shown include tax.
            </Alert>
          </div>
        );
      }
      render(<Host />);
      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      settle();
      expect(screen.getByText('Gone')).toBeDefined();
      expect(document.querySelector('.uh-alert')).toBeNull();
    });

    it('overrides the close label for localisation', () => {
      render(
        <Alert dismissible closeLabel="Tutup" onDismiss={() => {}}>
          Prices shown include tax.
        </Alert>,
      );
      expect(screen.getByRole('button', { name: 'Tutup' })).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has no violations with title, actions and a close button', async () => {
      render(
        <Alert
          variant="warning"
          title="Prices may change"
          dismissible
          onDismiss={() => {}}
          actions={[{ label: 'Learn more', onClick: () => {} }]}
        >
          Prices are indicative and may change closer to departure.
        </Alert>,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations as a banner with no dismiss', async () => {
      render(
        <Alert layout="banner" variant="info">
          Prices shown include tax.
        </Alert>,
      );
      await expectNoA11yViolations(document.body);
    });
  });
});
