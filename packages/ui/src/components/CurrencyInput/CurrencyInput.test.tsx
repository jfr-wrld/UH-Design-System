import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { CurrencyInput } from './CurrencyInput.js';

const field = () => screen.getByLabelText<HTMLInputElement>(/Package price/);

describe('CurrencyInput', () => {
  it('shows a formatted amount while unfocused', () => {
    render(
      <CurrencyInput label="Package price" currency="MYR" locale="ms-MY" defaultValue={12500} />,
    );
    expect(field().value).toBe('12,500');
  });

  it('renders the symbol outside the input so Ctrl+A cannot take it', () => {
    const { container } = render(
      <CurrencyInput label="Package price" currency="MYR" defaultValue={12500} />,
    );
    const prefix = container.querySelector('.uh-currency__prefix');
    expect(prefix?.textContent).toBe('RM');
    // The symbol is a sibling; the input holds nothing but the amount.
    expect(field().value).not.toContain('RM');
  });

  it('names the currency for assistive tech, since the symbol is decorative', () => {
    const { container } = render(
      <CurrencyInput label="Package price" currency="MYR" locale="en" defaultValue={1} />,
    );
    expect(container.querySelector('.uh-currency__prefix')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    const ids = (field().getAttribute('aria-describedby') ?? '').split(' ');
    const text = ids.map((i) => document.getElementById(i)?.textContent).join(' ');
    expect(text).toContain('Malaysian Ringgit');
  });

  describe('currency and locale stay separate', () => {
    it.each([
      ['MYR', 'en', 'RM', '12,500', 12500],
      ['MYR', 'id-ID', 'RM', '12.500', 12500],
      ['IDR', 'en', 'Rp', '45,000,000', 45000000],
      ['IDR', 'id-ID', 'Rp', '45.000.000', 45000000],
      ['SGD', 'id-ID', 'S$', '4.200', 4200],
    ] as const)('%s in %s renders %s %s', (currency, locale, symbol, formatted, amount) => {
      const { container } = render(
        <CurrencyInput
          label="Package price"
          currency={currency}
          locale={locale}
          defaultValue={amount}
        />,
      );
      expect(container.querySelector('.uh-currency__prefix')?.textContent).toBe(symbol);
      expect(field().value).toBe(formatted);
    });
  });

  describe('typing', () => {
    it('drops to raw digits on focus and formats again on blur', async () => {
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" locale="en" defaultValue={12500} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const input = field();
      expect(input.value).toBe('12,500');

      await userEvent.click(input);
      // No group separators under the caret while typing.
      expect(input.value).toBe('12500');

      await userEvent.clear(input);
      await userEvent.type(input, '98000');
      expect(input.value).toBe('98000');

      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(input.value).toBe('98,000');
    });

    it('emits a number, never a formatted string', async () => {
      const onChange = vi.fn();
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" locale="en" onChange={onChange} />
          <button type="button">Elsewhere</button>
        </>,
      );
      await userEvent.type(field(), '12500');
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));

      expect(onChange).toHaveBeenLastCalledWith(12500);
      expect(typeof onChange.mock.calls.at(-1)?.[0]).toBe('number');
    });

    it('reports null for an emptied field rather than zero', async () => {
      const onChange = vi.fn();
      render(
        <>
          <CurrencyInput
            label="Package price"
            currency="MYR"
            defaultValue={500}
            onChange={onChange}
          />
          <button type="button">Elsewhere</button>
        </>,
      );
      await userEvent.clear(field());
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('clamps to min and max on blur', async () => {
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" locale="en" min={1000} max={50000} />
          <button type="button">Elsewhere</button>
        </>,
      );
      await userEvent.type(field(), '99999999');
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field().value).toBe('50,000');
    });
  });

  describe('paste', () => {
    it.each([
      ['RM 12,500', 'en', '12,500'],
      ['Rp 45.000.000', 'en', '45,000,000'],
      ['1 234 567', 'en', '1,234,567'],
    ])('sanitises %s', async (pasted, locale, expected) => {
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" locale={locale} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const input = field();
      await userEvent.click(input);
      await userEvent.paste(pasted);
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(input.value).toBe(expected);
    });
  });

  describe('keyboard', () => {
    it('reaches the field by Tab and edits it', async () => {
      render(<CurrencyInput label="Package price" currency="MYR" locale="en" defaultValue={100} />);
      await userEvent.tab();
      expect(document.activeElement).toBe(field());

      await userEvent.keyboard('{Control>}a{/Control}7500');
      expect(field().value).toBe('7500');
    });

    it('Ctrl+A replaces only the amount, leaving the symbol in place', async () => {
      const { container } = render(
        <CurrencyInput
          label="Package price"
          currency="IDR"
          locale="id-ID"
          defaultValue={45000000}
        />,
      );
      const input = field();
      await userEvent.click(input);
      await userEvent.keyboard('{Control>}a{/Control}999');

      expect(input.value).toBe('999');
      expect(container.querySelector('.uh-currency__prefix')?.textContent).toBe('Rp');
    });

    it('skips a disabled field in the tab order', async () => {
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" disabled />
          <button type="button">After</button>
        </>,
      );
      await userEvent.tab();
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    });
  });

  describe('controlled and uncontrolled', () => {
    it('works uncontrolled', async () => {
      render(
        <>
          <CurrencyInput label="Package price" currency="MYR" locale="en" />
          <button type="button">Elsewhere</button>
        </>,
      );
      await userEvent.type(field(), '300');
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field().value).toBe('300');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [amount, setAmount] = useState<number | null>(1000);
        return (
          <>
            <CurrencyInput
              label="Package price"
              currency="MYR"
              locale="en"
              value={amount}
              onChange={setAmount}
            />
            <button type="button">Elsewhere</button>
          </>
        );
      }
      render(<Controlled />);
      await userEvent.clear(field());
      await userEvent.type(field(), '2500');
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field().value).toBe('2,500');
    });
  });

  it('never decides what is valid on its own', () => {
    render(
      <CurrencyInput
        label="Package price"
        currency="MYR"
        defaultValue={1}
        errorMessage="Below the minimum deposit"
      />,
    );
    expect(field().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Below the minimum deposit');
  });

  it('has no axe violations across currencies and states', async () => {
    const { container } = render(
      <>
        <CurrencyInput
          label="Package price"
          currency="MYR"
          locale="ms-MY"
          defaultValue={12500}
          required
        />
        <CurrencyInput
          label="Deposit"
          currency="IDR"
          locale="id-ID"
          defaultValue={45000000}
          helperText="20% of the package price"
        />
        <CurrencyInput
          label="Balance"
          currency="SGD"
          locale="en"
          defaultValue={4200}
          errorMessage="Exceeds the remaining balance"
        />
        <CurrencyInput label="Refund" currency="MYR" disabled />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
