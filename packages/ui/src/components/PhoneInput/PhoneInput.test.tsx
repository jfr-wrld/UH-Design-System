import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PhoneInput } from './PhoneInput.js';
import { DEFAULT_COUNTRIES } from './countries.js';

const trigger = () => screen.getByRole('combobox', { name: 'Country calling code' });

describe('PhoneInput', () => {
  it('labels the number field and defaults to Malaysia', () => {
    render(<PhoneInput label="Mobile Number" />);
    expect(screen.getByLabelText('Mobile Number')).toBeDefined();
    expect(trigger().textContent).toContain('+60');
  });

  it('honours defaultCountry', () => {
    render(<PhoneInput label="Mobile Number" defaultCountry="ID" />);
    expect(trigger().textContent).toContain('+62');
  });

  it('uses type=tel and a national autocomplete hint', () => {
    render(<PhoneInput label="Mobile Number" />);
    const input = screen.getByLabelText('Mobile Number');
    expect(input.getAttribute('type')).toBe('tel');
    expect(input.getAttribute('autocomplete')).toBe('tel-national');
  });

  describe('country listbox', () => {
    it('is collapsed until opened, and exposes expanded state', async () => {
      render(<PhoneInput label="Mobile Number" />);
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(trigger().getAttribute('aria-expanded')).toBe('false');

      await userEvent.click(trigger());

      expect(screen.getByRole('listbox')).toBeDefined();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
    });

    it('renders one option per country and marks the selected one', async () => {
      render(<PhoneInput label="Mobile Number" />);
      await userEvent.click(trigger());

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(DEFAULT_COUNTRIES.length);
      expect(options[0]?.getAttribute('aria-selected')).toBe('true');
      expect(within(options[0] as HTMLElement).getByText('Malaysia')).toBeDefined();
    });

    it('selects with the pointer and reports the change', async () => {
      const onCountryChange = vi.fn();
      render(<PhoneInput label="Mobile Number" onCountryChange={onCountryChange} />);
      await userEvent.click(trigger());
      await userEvent.click(screen.getByRole('option', { name: /Indonesia/ }));

      expect(onCountryChange).toHaveBeenCalledWith(expect.objectContaining({ iso2: 'ID' }));
      expect(trigger().textContent).toContain('+62');
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('opens on ArrowDown and selects with Enter', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();

      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeDefined();

      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(trigger().textContent).toContain('+62');
    });

    it('tracks the active option with aria-activedescendant instead of moving focus', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}');

      // Focus must stay on the trigger for this pattern to be sound.
      expect(document.activeElement).toBe(trigger());
      const active = trigger().getAttribute('aria-activedescendant');
      expect(active).toBeTruthy();
      expect(document.getElementById(active as string)?.getAttribute('role')).toBe('option');
    });

    it('wraps at both ends', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}');

      // From the first option, ArrowUp wraps to the last.
      await userEvent.keyboard('{ArrowUp}{Enter}');
      const last = DEFAULT_COUNTRIES[DEFAULT_COUNTRIES.length - 1];
      expect(trigger().textContent).toContain(last?.dialCode);
    });

    it('supports Home and End', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}{End}{Enter}');
      expect(trigger().textContent).toContain('+61');
    });

    it('jumps by type-ahead', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('sing');
      await userEvent.keyboard('{Enter}');
      expect(trigger().textContent).toContain('+65');
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      render(<PhoneInput label="Mobile Number" />);
      trigger().focus();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('{Escape}');

      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('does not open when disabled', async () => {
      render(<PhoneInput label="Mobile Number" disabled />);
      await userEvent.click(trigger());
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  it('keeps the dial code out of the number value', async () => {
    const onChange = vi.fn();
    render(<PhoneInput label="Mobile Number" onChange={onChange} />);
    const input = screen.getByLabelText<HTMLInputElement>('Mobile Number');
    await userEvent.type(input, '123456789');
    expect(input.value).toBe('123456789');
  });

  it('wires the error message', () => {
    render(<PhoneInput label="Mobile Number" errorMessage="Enter a valid mobile number" />);
    const input = screen.getByLabelText('Mobile Number');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const id = input.getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe('Enter a valid mobile number');
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('accepts a custom country list', async () => {
    const custom = DEFAULT_COUNTRIES.filter((c) => ['SG', 'BN'].includes(c.iso2));
    render(<PhoneInput label="Mobile Number" countries={custom} defaultCountry="SG" />);
    await userEvent.click(trigger());
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('accepts a localised selector name', () => {
    render(<PhoneInput label="Nombor Telefon" countryListLabel="Kod negara" />);
    expect(screen.getByRole('combobox', { name: 'Kod negara' })).toBeDefined();
  });

  it('announces the selected country as the combobox value, not its name', () => {
    render(<PhoneInput label="Mobile Number" />);
    // The name stays static; the country is the value.
    expect(trigger().textContent).toContain('Malaysia');
    expect(trigger().textContent).toContain('+60');
  });

  describe('accessibility', () => {
    it('has no axe violations: closed', async () => {
      const { container } = render(
        <PhoneInput label="Mobile Number" required helperText="We send trip updates here" />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: open listbox', async () => {
      const { container } = render(<PhoneInput label="Mobile Number" />);
      await userEvent.click(trigger());
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: error state', async () => {
      const { container } = render(
        <PhoneInput label="Mobile Number" required errorMessage="Enter a valid mobile number" />,
      );
      await expectNoA11yViolations(container);
    });
  });
});
