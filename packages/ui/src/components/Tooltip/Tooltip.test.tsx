import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Tooltip } from './Tooltip.js';

function Trigger() {
  return (
    <Tooltip content="Deposit is 20% of the package price" delay={0}>
      <button type="button">Deposit</button>
    </Tooltip>
  );
}

describe('Tooltip', () => {
  it('stays closed until asked', () => {
    render(<Trigger />);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  describe('keyboard', () => {
    it('opens on focus, not only on hover', async () => {
      render(<Trigger />);
      // The whole point: a keyboard user never hovers.
      await userEvent.tab();
      expect(screen.getByRole('tooltip')).toBeDefined();
    });

    it('closes on blur', async () => {
      render(
        <>
          <Trigger />
          <button type="button">Next</button>
        </>,
      );
      await userEvent.tab();
      expect(screen.getByRole('tooltip')).toBeDefined();

      await userEvent.tab();
      await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    });

    it('closes on Escape while focus stays on the trigger', async () => {
      render(<Trigger />);
      await userEvent.tab();
      const trigger = screen.getByRole('button', { name: 'Deposit' });

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('tooltip')).toBeNull();
      // Escape dismisses the tip, it does not move the user.
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('pointer', () => {
    it('opens on hover and closes on leave', async () => {
      render(<Trigger />);
      const trigger = screen.getByRole('button', { name: 'Deposit' });

      await userEvent.hover(trigger);
      await waitFor(() => expect(screen.getByRole('tooltip')).toBeDefined());

      await userEvent.unhover(trigger);
      await waitFor(() => expect(screen.queryByRole('tooltip')).toBeNull());
    });

    /*
     * Real timers on purpose. Faking them here poisons userEvent, which needs
     * real ones of its own, and the leak takes out every test that follows.
     */
    it('waits out the delay before opening', async () => {
      render(
        <Tooltip content="Deposit is 20%" delay={150}>
          <button type="button">Deposit</button>
        </Tooltip>,
      );
      await userEvent.hover(screen.getByRole('button'));

      // Still shut immediately after the pointer arrives.
      expect(screen.queryByRole('tooltip')).toBeNull();

      await waitFor(() => expect(screen.getByRole('tooltip')).toBeDefined());
    });
  });

  it('describes the trigger rather than renaming it', async () => {
    render(<Trigger />);
    await userEvent.tab();

    const trigger = screen.getByRole('button', { name: 'Deposit' });
    const id = trigger.getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toContain(
      'Deposit is 20% of the package price',
    );
    // The name is still the button's own text, not the tooltip.
    expect(trigger.textContent).toBe('Deposit');
  });

  it('drops aria-describedby when closed', async () => {
    render(<Trigger />);
    const trigger = screen.getByRole('button', { name: 'Deposit' });
    expect(trigger.getAttribute('aria-describedby')).toBeNull();
  });

  it('renders in a portal, outside the trigger', async () => {
    const { container } = render(<Trigger />);
    await userEvent.tab();
    const tip = screen.getByRole('tooltip');
    expect(container.contains(tip)).toBe(false);
    expect(document.body.contains(tip)).toBe(true);
  });

  it('does nothing when disabled', async () => {
    render(
      <Tooltip content="Deposit is 20%" delay={0} disabled>
        <button type="button">Deposit</button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('keeps the trigger own handlers working', async () => {
    const onFocus = vi.fn();
    render(
      <Tooltip content="Deposit is 20%" delay={0}>
        <button type="button" onFocus={onFocus}>
          Deposit
        </button>
      </Tooltip>,
    );
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('tooltip')).toBeDefined();
  });

  it('has no axe violations while open', async () => {
    render(<Trigger />);
    await userEvent.tab();
    // Portalled, so the scope is the whole document.
    await expectNoA11yViolations(document.body);
  });
});
