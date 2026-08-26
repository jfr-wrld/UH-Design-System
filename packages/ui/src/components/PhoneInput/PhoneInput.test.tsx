import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PhoneInput } from './PhoneInput.js';

const number = () => screen.getByLabelText<HTMLInputElement>('Mobile number');
const picker = () => screen.getByRole('combobox');

describe('PhoneInput', () => {
  it('starts on the default country', () => {
    render(<PhoneInput label="Mobile number" defaultCountry="ID" />);
    expect(picker().textContent).toContain('+62');
  });

  it('names the selected country in the picker label', () => {
    render(<PhoneInput label="Mobile number" defaultCountry="SG" />);
    expect(screen.getByRole('combobox', { name: 'Country: Singapore' })).toBeDefined();
  });

  it('offers exactly the four markets plus a manual option', async () => {
    render(<PhoneInput label="Mobile number" />);
    await userEvent.click(picker());
    const names = screen.getAllByRole('option').map((o) => o.textContent);
    expect(names).toHaveLength(5);
    expect(names.join(' ')).toContain('Malaysia');
    expect(names.join(' ')).toContain('Other');
  });

  describe('emits E.164', () => {
    it.each(['0123456789', '+60123456789', '60123456789', '012-345 6789'])(
      'normalises %s to +60123456789',
      async (typed) => {
        const onChange = vi.fn();
        render(<PhoneInput label="Mobile number" onChange={onChange} defaultCountry="MY" />);
        await userEvent.click(number());
        await userEvent.paste(typed);
        expect(onChange).toHaveBeenLastCalledWith('+60123456789');
      },
    );

    it('emits E.164 while typing, not only on blur', async () => {
      const onChange = vi.fn();
      render(<PhoneInput label="Mobile number" onChange={onChange} />);
      await userEvent.type(number(), '12');
      expect(onChange).toHaveBeenLastCalledWith('+6012');
    });

    it('re-emits when the country changes, keeping the digits', async () => {
      const onChange = vi.fn();
      render(<PhoneInput label="Mobile number" onChange={onChange} defaultValue="+60123456789" />);
      await userEvent.click(picker());
      await userEvent.click(screen.getByRole('option', { name: /Singapore/ }));
      expect(onChange).toHaveBeenLastCalledWith('+65123456789');
    });
  });

  describe('pasting', () => {
    it('switches the picker when the pasted number names another country', async () => {
      render(<PhoneInput label="Mobile number" defaultCountry="MY" />);
      await userEvent.click(number());
      await userEvent.paste('+6591234567');
      expect(picker().textContent).toContain('+65');
    });

    it('falls back to the manual option for an unsupported code', async () => {
      render(<PhoneInput label="Mobile number" />);
      await userEvent.click(number());
      await userEvent.paste('+971501234567');
      expect(picker().getAttribute('aria-label')).toBe('Country: Other');
    });
  });

  describe('display', () => {
    it('groups the number when the field is not focused', () => {
      render(<PhoneInput label="Mobile number" defaultValue="+60123456789" />);
      expect(number().value).toBe('012-345 6789');
    });

    it('shows raw digits while the caret is in the field', async () => {
      render(<PhoneInput label="Mobile number" defaultValue="+60123456789" />);
      await userEvent.click(number());
      // Separators appearing under the caret would move it as you type.
      expect(number().value).toBe('123456789');
    });
  });

  describe('other', () => {
    it('reveals a manual code field and folds it into the value', async () => {
      const onChange = vi.fn();
      render(<PhoneInput label="Mobile number" onChange={onChange} />);
      await userEvent.click(picker());
      await userEvent.click(screen.getByRole('option', { name: /Other/ }));

      const code = screen.getByLabelText<HTMLInputElement>('Country calling code');
      await userEvent.type(code, '971');
      await userEvent.type(number(), '501234567');

      expect(onChange).toHaveBeenLastCalledWith('+971501234567');
    });

    it('has no manual code field for a listed country', () => {
      render(<PhoneInput label="Mobile number" />);
      expect(screen.queryByLabelText('Country calling code')).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('opens the picker on ArrowDown and selects with Enter', async () => {
      render(<PhoneInput label="Mobile number" />);
      picker().focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeDefined();

      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(picker().textContent).toContain('+62');
    });

    it('keeps focus on the picker and tracks aria-activedescendant', async () => {
      render(<PhoneInput label="Mobile number" />);
      picker().focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(picker());
      const active = picker().getAttribute('aria-activedescendant');
      expect(document.getElementById(active as string)?.getAttribute('role')).toBe('option');
    });

    it('tabs from the picker into the number without being trapped', async () => {
      render(<PhoneInput label="Mobile number" />);
      await userEvent.tab();
      expect(document.activeElement).toBe(picker());

      await userEvent.tab();
      expect(document.activeElement).toBe(number());
    });

    it('closes an open picker on Tab and moves on rather than holding focus', async () => {
      render(<PhoneInput label="Mobile number" />);
      picker().focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeDefined();

      await userEvent.tab();
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.activeElement).toBe(number());
    });

    it('closes on Escape and keeps focus on the picker', async () => {
      render(<PhoneInput label="Mobile number" />);
      picker().focus();
      await userEvent.keyboard('{ArrowDown}{Escape}');
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.activeElement).toBe(picker());
    });

    it('does not open when disabled', async () => {
      render(<PhoneInput label="Mobile number" disabled />);
      await userEvent.click(picker());
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('controlled and uncontrolled', () => {
    it('works uncontrolled', async () => {
      render(<PhoneInput label="Mobile number" />);
      await userEvent.type(number(), '123456789');
      expect(number().value).toBe('123456789');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [v, setV] = useState('');
        return (
          <>
            <PhoneInput label="Mobile number" value={v} onChange={setV} />
            <output>{v}</output>
          </>
        );
      }
      render(<Controlled />);
      await userEvent.type(number(), '123456789');
      expect(screen.getByRole('status').textContent).toBe('+60123456789');
    });
  });

  it('never decides what is valid on its own', () => {
    render(
      <PhoneInput label="Mobile number" defaultValue="+601" errorMessage="Number is too short" />,
    );
    expect(number().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Number is too short');
  });

  it('has no axe violations, open and closed', async () => {
    const { container } = render(
      <PhoneInput label="Mobile number" required helperText="We send trip updates here" />,
    );
    await expectNoA11yViolations(container);

    await userEvent.click(picker());
    await expectNoA11yViolations(container);
  });
});
