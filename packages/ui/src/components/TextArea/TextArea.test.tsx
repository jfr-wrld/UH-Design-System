import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { TextArea } from './TextArea.js';

describe('TextArea', () => {
  it('renders a native textarea, labelled', () => {
    render(<TextArea label="Bio" />);
    expect(screen.getByRole('textbox', { name: 'Bio' }).tagName).toBe('TEXTAREA');
  });

  it('defaults to 4 rows and accepts a different count', () => {
    const { rerender } = render(<TextArea label="Bio" />);
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('4');
    rerender(<TextArea label="Bio" rows={8} />);
    expect(screen.getByRole('textbox').getAttribute('rows')).toBe('8');
  });

  it('is uncontrolled by default and holds what is typed', async () => {
    const user = userEvent.setup();
    render(<TextArea label="Notes" />);
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(field, 'Window seat, please.');
    expect(field.value).toBe('Window seat, please.');
  });

  it('stays controlled: the displayed value only follows the value prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<TextArea label="Notes" value="Hi" onChange={onChange} />);
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;
    await user.type(field, '!');
    expect(onChange).toHaveBeenCalled();
    expect(field.value).toBe('Hi');
    rerender(<TextArea label="Notes" value="Hi!" onChange={onChange} />);
    expect(field.value).toBe('Hi!');
  });

  it('shows helper text by default, replaced by an error message when one is set', () => {
    const { rerender } = render(<TextArea label="Bio" helperText="Tell us about yourself." />);
    expect(screen.getByText('Tell us about yourself.')).toBeDefined();
    rerender(
      <TextArea label="Bio" helperText="Tell us about yourself." errorMessage="Bio is required." />,
    );
    expect(screen.getByText('Bio is required.')).toBeDefined();
    expect(screen.queryByText('Tell us about yourself.')).toBeNull();
  });

  it('marks the field invalid to assistive tech when an error is present', () => {
    render(<TextArea label="Bio" errorMessage="Bio is required." />);
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });

  it('shows a character counter when maxLength is set', () => {
    render(<TextArea label="Bio" defaultValue="Hello" maxLength={280} />);
    expect(screen.getByText('5/280')).toBeDefined();
  });

  it('marks the field required and disabled programmatically', () => {
    render(<TextArea label="Bio" required disabled />);
    const field = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(field.getAttribute('aria-required')).toBe('true');
    expect(field.disabled).toBe(true);
  });

  it('forwards a ref to the underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextArea label="Bio" ref={ref} />);
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TextArea label="Bio" helperText="Tell us about yourself." maxLength={280} />,
    );
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations in the error state', async () => {
    const { container } = render(<TextArea label="Bio" errorMessage="Bio is required." required />);
    await expectNoA11yViolations(container);
  });
});
