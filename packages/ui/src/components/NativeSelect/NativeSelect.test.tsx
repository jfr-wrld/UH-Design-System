import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { NativeSelect } from './NativeSelect.js';

function Basic(props: Partial<ComponentProps<typeof NativeSelect>> = {}) {
  return (
    <NativeSelect label="Negara" {...props}>
      <option value="id">Indonesia</option>
      <option value="my">Malaysia</option>
      <option value="sg">Singapura</option>
    </NativeSelect>
  );
}

describe('NativeSelect', () => {
  it('renders a real select, labelled for the field', () => {
    render(<Basic />);
    const select = screen.getByLabelText('Negara');
    expect(select.tagName).toBe('SELECT');
  });

  it('renders the given options as real <option> elements', () => {
    render(<Basic />);
    expect(screen.getByRole('option', { name: 'Indonesia' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Malaysia' })).toBeDefined();
    expect(screen.getByRole('option', { name: 'Singapura' })).toBeDefined();
  });

  it('renders a hidden placeholder option that the field starts on', () => {
    const { container } = render(<Basic placeholder="Pilih negara" />);
    const select = screen.getByLabelText('Negara') as HTMLSelectElement;
    const placeholderOption = container.querySelector('option[hidden]') as HTMLOptionElement;
    expect(placeholderOption).not.toBeNull();
    expect(placeholderOption.textContent).toBe('Pilih negara');
    // Not disabled: a disabled option is skipped as a default candidate, so
    // the field would silently start on the first real option instead.
    expect(placeholderOption.disabled).toBe(false);
    expect(select.value).toBe('');
  });

  it('changes value on selection and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Basic onChange={onChange} />);
    const select = screen.getByLabelText('Negara') as HTMLSelectElement;
    await user.selectOptions(select, 'my');
    expect(select.value).toBe('my');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('marks the field required with aria-required', () => {
    render(<Basic required />);
    expect(screen.getByLabelText('Negara').getAttribute('aria-required')).toBe('true');
  });

  it('disables the select', () => {
    render(<Basic disabled />);
    expect((screen.getByLabelText('Negara') as HTMLSelectElement).disabled).toBe(true);
  });

  it('switches to the error state and marks aria-invalid, message read as an alert', () => {
    render(<Basic errorMessage="Pilih salah satu negara" />);
    const select = screen.getByLabelText('Negara');
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Pilih salah satu negara');
  });

  it('shows helper text when there is no error or success message', () => {
    render(<Basic helperText="Sesuai paspor" />);
    expect(screen.getByText('Sesuai paspor')).toBeDefined();
  });

  it('has no accessibility violations, default and with an error', async () => {
    const { container, rerender } = render(<Basic />);
    await expectNoA11yViolations(container);
    rerender(<Basic errorMessage="Wajib diisi" required />);
    await expectNoA11yViolations(container);
  });
});
