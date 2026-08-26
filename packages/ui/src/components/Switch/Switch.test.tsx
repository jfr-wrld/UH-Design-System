import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Switch } from './Switch.js';

describe('Switch', () => {
  it('exposes the switch role, not checkbox', () => {
    render(<Switch label="Email me trip updates" />);
    expect(screen.getByRole('switch', { name: 'Email me trip updates' })).toBeDefined();
    expect(screen.queryByRole('checkbox')).toBeNull();
  });

  it('reports state through the native checked property, not a hand-written attribute', async () => {
    render(<Switch label="Email me trip updates" />);
    const toggle = screen.getByRole('switch') as HTMLInputElement;

    // role="switch" on a checkbox maps checked onto aria-checked; writing the
    // attribute too would give one element two sources of truth.
    expect(toggle.hasAttribute('aria-checked')).toBe(false);
    expect(toggle.checked).toBe(false);

    await userEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  it('toggles from the label', async () => {
    render(<Switch label="Email me trip updates" />);
    await userEvent.click(screen.getByText('Email me trip updates'));
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
  });

  it('is operable by keyboard', async () => {
    render(<Switch label="Email me trip updates" />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('switch'));
    await userEvent.keyboard(' ');
    expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
  });

  it('links the description', () => {
    render(<Switch label="Email me trip updates" description="Departure reminders and changes" />);
    const id = screen.getByRole('switch').getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe(
      'Departure reminders and changes',
    );
  });

  describe('disabled', () => {
    it('cannot be toggled', async () => {
      const onChange = vi.fn();
      render(<Switch label="Email me trip updates" disabled onChange={onChange} />);
      await userEvent.click(screen.getByText('Email me trip updates'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps an on value visible', () => {
      render(<Switch label="Email me trip updates" disabled defaultChecked />);
      expect((screen.getByRole('switch') as HTMLInputElement).checked).toBe(true);
    });
  });

  it('supports controlled use', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return <Switch label="Email me" checked={on} onChange={(e) => setOn(e.target.checked)} />;
    }
    render(<Controlled />);
    const toggle = screen.getByRole('switch') as HTMLInputElement;
    await userEvent.click(toggle);
    expect(toggle.checked).toBe(true);
  });

  describe('accessibility', () => {
    it('has no axe violations across sizes and states', async () => {
      const { container } = render(
        <>
          <Switch label="Email me trip updates" size="sm" />
          <Switch label="SMS reminders" size="md" defaultChecked />
          <Switch label="WhatsApp updates" disabled />
          <Switch
            label="Push notifications"
            disabled
            defaultChecked
            description="Device settings apply"
          />
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
