import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Checkbox } from './Checkbox.js';

describe('Checkbox', () => {
  it('is named by its label and toggles by clicking it', async () => {
    render(<Checkbox label="I agree to the booking terms" />);
    const box = screen.getByRole('checkbox', { name: 'I agree to the booking terms' });

    // The label is the target most people hit, so it has to work.
    await userEvent.click(screen.getByText('I agree to the booking terms'));
    expect((box as HTMLInputElement).checked).toBe(true);
  });

  it('links the description through aria-describedby', () => {
    render(
      <Checkbox
        label="Travel insurance"
        description="Covers medical costs and trip cancellation"
      />,
    );
    const id = screen.getByRole('checkbox').getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe(
      'Covers medical costs and trip cancellation',
    );
  });

  describe('indeterminate', () => {
    it('reports mixed through the native property, not a hand-written attribute', () => {
      render(<Checkbox label="All pilgrims" indeterminate />);
      const box = screen.getByRole('checkbox') as HTMLInputElement;

      // The DOM property is what makes the platform expose aria-checked="mixed";
      // setting that attribute by hand would conflict with the native state.
      expect(box.indeterminate).toBe(true);
      expect(box.hasAttribute('aria-checked')).toBe(false);
    });

    it('clears the property when it is turned off', () => {
      const { rerender } = render(<Checkbox label="All pilgrims" indeterminate />);
      rerender(<Checkbox label="All pilgrims" indeterminate={false} />);
      expect((screen.getByRole('checkbox') as HTMLInputElement).indeterminate).toBe(false);
    });
  });

  it('marks the error state without relying on colour alone', () => {
    render(<Checkbox label="I agree to the booking terms" error />);
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
  });

  describe('disabled', () => {
    it('cannot be toggled', async () => {
      const onChange = vi.fn();
      render(<Checkbox label="Travel insurance" disabled onChange={onChange} />);
      await userEvent.click(screen.getByText('Travel insurance'));
      expect(onChange).not.toHaveBeenCalled();
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(false);
    });

    it('keeps a checked value visible', () => {
      render(<Checkbox label="Travel insurance" disabled defaultChecked />);
      expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
    });
  });

  it('is operable by keyboard', async () => {
    render(<Checkbox label="I agree to the booking terms" />);
    await userEvent.tab();
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    expect(document.activeElement).toBe(box);

    await userEvent.keyboard(' ');
    expect(box.checked).toBe(true);
  });

  it('supports controlled use', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <Checkbox label="Travel insurance" checked={on} onChange={(e) => setOn(e.target.checked)} />
      );
    }
    render(<Controlled />);
    const box = screen.getByRole('checkbox') as HTMLInputElement;
    await userEvent.click(box);
    expect(box.checked).toBe(true);
  });

  describe('accessibility', () => {
    it('has no axe violations: with description', async () => {
      const { container } = render(
        <Checkbox
          label="Travel insurance"
          description="Covers medical costs and trip cancellation"
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: indeterminate, error and disabled', async () => {
      const { container } = render(
        <>
          <Checkbox label="All pilgrims" indeterminate />
          <Checkbox label="I agree to the booking terms" error />
          <Checkbox label="Travel insurance" disabled defaultChecked />
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
