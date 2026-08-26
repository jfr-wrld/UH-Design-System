import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Input, type InputType } from './Input.js';

const TYPES: InputType[] = ['text', 'email', 'number', 'password'];

describe('Input', () => {
  it('associates the label with the field', () => {
    render(<Input label="Passport Number" />);
    expect(screen.getByLabelText('Passport Number')).toBeDefined();
  });

  it('generates unique ids for repeated fields', () => {
    render(
      <>
        <Input label="Passport Number" />
        <Input label="Emergency Contact" />
      </>,
    );
    const a = screen.getByLabelText('Passport Number');
    const b = screen.getByLabelText('Emergency Contact');
    expect(a.id).not.toBe(b.id);
  });

  describe('required', () => {
    it('sets aria-required and keeps the asterisk decorative', () => {
      render(<Input label="Passport Number" required />);
      const input = screen.getByLabelText('Passport Number');
      expect(input.getAttribute('aria-required')).toBe('true');
      // The accessible name must not pick up the asterisk.
      expect(input.getAttribute('aria-label')).toBeNull();
      expect(document.querySelector('.uh-field__required')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
    });
  });

  describe('error', () => {
    it('wires aria-invalid and aria-describedby to the message', () => {
      render(<Input label="Passport Number" errorMessage="Passport number is required" />);
      const input = screen.getByLabelText('Passport Number');

      expect(input.getAttribute('aria-invalid')).toBe('true');
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      const message = document.getElementById(describedBy as string);
      expect(message?.textContent).toBe('Passport number is required');
    });

    it('announces the error', () => {
      render(<Input label="Passport Number" errorMessage="Passport number is required" />);
      expect(screen.getByRole('alert').textContent).toBe('Passport number is required');
    });

    it('takes precedence over helper and success text', () => {
      render(
        <Input
          label="Passport Number"
          helperText="As printed on your passport"
          successMessage="Looks good"
          errorMessage="Passport number is required"
        />,
      );
      expect(screen.getByRole('alert').textContent).toBe('Passport number is required');
      expect(screen.queryByText('As printed on your passport')).toBeNull();
    });

    it('is not invalid without an error message', () => {
      render(<Input label="Passport Number" helperText="As printed on your passport" />);
      expect(screen.getByLabelText('Passport Number').getAttribute('aria-invalid')).toBeNull();
    });
  });

  describe('password', () => {
    it('toggles visibility and swaps the button name', async () => {
      render(<Input label="Password" type="password" />);
      const input = screen.getByLabelText('Password');
      expect(input.getAttribute('type')).toBe('password');

      const toggle = screen.getByRole('button', { name: 'Show password' });
      await userEvent.click(toggle);

      expect(screen.getByLabelText('Password').getAttribute('type')).toBe('text');
      expect(screen.getByRole('button', { name: 'Hide password' })).toBeDefined();
    });

    it('accepts localised toggle labels', () => {
      render(
        <Input
          label="Kata Laluan"
          type="password"
          showPasswordLabel="Tunjukkan kata laluan"
          hidePasswordLabel="Sembunyikan kata laluan"
        />,
      );
      expect(screen.getByRole('button', { name: 'Tunjukkan kata laluan' })).toBeDefined();
    });
  });

  describe('clearable', () => {
    it('appears only once there is a value, and empties the field', async () => {
      render(<Input label="Passport Number" clearable />);
      expect(screen.queryByRole('button', { name: 'Clear' })).toBeNull();

      const input = screen.getByLabelText<HTMLInputElement>('Passport Number');
      await userEvent.type(input, 'A1234567');
      expect(input.value).toBe('A1234567');

      await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
      expect(input.value).toBe('');
    });

    it('calls onClear for controlled usage', async () => {
      const onClear = vi.fn();
      render(
        <Input
          label="Passport Number"
          clearable
          value="A1234567"
          onChange={() => {}}
          onClear={onClear}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe('character counter', () => {
    it('counts up as the field fills', async () => {
      render(<Input label="Emergency Contact" maxLength={20} />);
      const counter = document.querySelector('.uh-field__counter');
      expect(counter?.textContent).toBe('0/20');

      await userEvent.type(screen.getByLabelText('Emergency Contact'), 'Ahmad');
      expect(counter?.textContent).toBe('5/20');
    });

    it('states the limit once, instead of announcing every keystroke', () => {
      render(<Input label="Emergency Contact" maxLength={20} />);
      const input = screen.getByLabelText('Emergency Contact');
      const ids = (input.getAttribute('aria-describedby') ?? '').split(' ');
      const limit = ids.map((id) => document.getElementById(id)).find(Boolean);
      expect(limit?.textContent).toBe('Maximum 20 characters');
      // The visible counter is decorative, so it is not read twice.
      expect(document.querySelector('.uh-field__counter')?.getAttribute('aria-hidden')).toBe(
        'true',
      );
    });
  });

  describe('disabled and readOnly', () => {
    it('uses the native disabled attribute so the value is not submitted', () => {
      render(<Input label="Passport Number" disabled />);
      expect(screen.getByLabelText<HTMLInputElement>('Passport Number').disabled).toBe(true);
    });

    it('keeps a readOnly field focusable and readable', async () => {
      render(<Input label="Passport Number" readOnly defaultValue="A1234567" />);
      const input = screen.getByLabelText<HTMLInputElement>('Passport Number');
      expect(input.readOnly).toBe(true);
      expect(input.disabled).toBe(false);

      await userEvent.tab();
      expect(document.activeElement).toBe(input);
    });
  });

  it.each(TYPES)('renders type=%s', (type) => {
    render(<Input label="Field" type={type} />);
    const input = document.querySelector('input');
    expect(input?.getAttribute('type')).toBe(type);
  });

  it('forwards a ref to the input', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Input
        label="Passport Number"
        ref={(element) => {
          node = element;
        }}
      />,
    );
    expect(node).not.toBeNull();
  });

  describe('accessibility', () => {
    it('has no axe violations: default with helper text', async () => {
      const { container } = render(
        <Input label="Passport Number" helperText="As printed on your passport" />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: required with error', async () => {
      const { container } = render(
        <Input label="Passport Number" required errorMessage="Passport number is required" />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: password with toggle', async () => {
      const { container } = render(<Input label="Password" type="password" />);
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: clearable with counter', async () => {
      const { container } = render(
        <Input label="Emergency Contact" clearable maxLength={20} defaultValue="Ahmad" />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: disabled and readOnly', async () => {
      const { container } = render(
        <>
          <Input label="Passport Number" disabled />
          <Input label="Departure Date" readOnly defaultValue="15 Mar 2026" />
        </>,
      );
      await expectNoA11yViolations(container);
    });
  });
});
