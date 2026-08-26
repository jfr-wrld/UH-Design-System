import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Radio } from './Radio.js';
import { RadioGroup, type RadioGroupProps } from './RadioGroup.js';

function Payment(props: Partial<RadioGroupProps> = {}) {
  return (
    <RadioGroup label="Payment plan" {...props}>
      <Radio value="full" label="Full Payment" description="Pay the whole amount today" />
      <Radio value="deposit" label="Deposit" description="Secure your seat with 20% now" />
      <Radio value="monthly" label="Monthly Installment" description="Spread it over six months" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  it('names the group from its legend', () => {
    render(<Payment />);
    expect(screen.getByRole('radiogroup', { name: /Payment plan/ })).toBeDefined();
  });

  it('gives every radio the same name so the browser groups them', () => {
    render(<Payment />);
    const names = screen.getAllByRole('radio').map((r) => r.getAttribute('name'));
    expect(new Set(names).size).toBe(1);
    expect(names[0]).toBeTruthy();
  });

  it('honours an explicit name', () => {
    render(<Payment name="payment-plan" />);
    expect(screen.getAllByRole('radio')[0]?.getAttribute('name')).toBe('payment-plan');
  });

  it('exposes its orientation', () => {
    render(<Payment orientation="horizontal" />);
    expect(screen.getByRole('radiogroup').getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('selects on label click and reports the value', async () => {
    const onChange = vi.fn();
    render(<Payment onChange={onChange} />);
    await userEvent.click(screen.getByText('Deposit'));

    expect(onChange).toHaveBeenCalledWith('deposit', expect.anything());
    expect((screen.getByRole('radio', { name: /Deposit/ }) as HTMLInputElement).checked).toBe(true);
  });

  it('moves between options with the arrow keys', async () => {
    render(<Payment defaultValue="full" />);
    (screen.getByRole('radio', { name: /Full Payment/ }) as HTMLInputElement).focus();

    // Native behaviour for same-name radios; nothing custom to break.
    await userEvent.keyboard('{ArrowDown}');
    expect((screen.getByRole('radio', { name: /Deposit/ }) as HTMLInputElement).checked).toBe(true);
  });

  it('keeps one tab stop for the whole group', async () => {
    render(
      <>
        <Payment defaultValue="deposit" />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: /Deposit/ }));

    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('disables every option at once', async () => {
    const onChange = vi.fn();
    render(<Payment disabled onChange={onChange} />);
    for (const radio of screen.getAllByRole('radio')) {
      expect((radio as HTMLInputElement).disabled).toBe(true);
    }
    await userEvent.click(screen.getByText('Deposit'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('wires the error message to the group', () => {
    render(<Payment errorMessage="Choose how you want to pay" />);
    const group = screen.getByRole('radiogroup');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    const id = group.getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe('Choose how you want to pay');
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('supports controlled use', async () => {
    function Controlled() {
      const [plan, setPlan] = useState('full');
      return <Payment value={plan} onChange={setPlan} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByText('Monthly Installment'));
    expect(
      (screen.getByRole('radio', { name: /Monthly Installment/ }) as HTMLInputElement).checked,
    ).toBe(true);
  });

  it('links each description to its own radio', () => {
    render(<Payment />);
    const id = screen.getByRole('radio', { name: /Deposit/ }).getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe(
      'Secure your seat with 20% now',
    );
  });

  describe('accessibility', () => {
    it('has no axe violations: vertical', async () => {
      const { container } = render(<Payment defaultValue="full" />);
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: horizontal, required, error', async () => {
      const { container } = render(
        <Payment orientation="horizontal" required errorMessage="Choose how you want to pay" />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: disabled', async () => {
      const { container } = render(<Payment disabled defaultValue="deposit" />);
      await expectNoA11yViolations(container);
    });
  });
});
