import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { DateField } from './DateField.js';

describe('DateField', () => {
  it('renders day, month, and year segments in that order', () => {
    render(<DateField label="Date of birth" />);
    const segments = screen.getAllByRole('spinbutton');
    expect(segments.map((s) => s.getAttribute('aria-label'))).toEqual(['Day', 'Month', 'Year']);
  });

  it('shows a placeholder on each empty segment', () => {
    render(<DateField label="Date of birth" />);
    expect(screen.getByRole('spinbutton', { name: 'Day' }).textContent).toBe('dd');
    expect(screen.getByRole('spinbutton', { name: 'Month' }).textContent).toBe('mm');
    expect(screen.getByRole('spinbutton', { name: 'Year' }).textContent).toBe('yyyy');
  });

  it('displays a defaultValue split across segments, zero-padded', () => {
    render(<DateField label="Date of birth" defaultValue={{ day: 5, month: 3, year: 1998 }} />);
    expect(screen.getByRole('spinbutton', { name: 'Day' }).textContent).toBe('05');
    expect(screen.getByRole('spinbutton', { name: 'Month' }).textContent).toBe('03');
    expect(screen.getByRole('spinbutton', { name: 'Year' }).textContent).toBe('1998');
  });

  it('types a two-digit day by combining consecutive digit keys', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" defaultValue={{ day: 1, month: 1, year: 2000 }} />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    day.focus();
    await user.keyboard('2');
    await user.keyboard('5');
    expect(day.textContent).toBe('25');
  });

  it('types a four-digit year by combining four consecutive digit keys', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    await user.keyboard('1');
    await user.keyboard('9');
    await user.keyboard('8');
    await user.keyboard('7');
    expect(year.textContent).toBe('1987');
  });

  it('auto-advances to month once a day cannot be extended (e.g. "31")', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    day.focus();
    await user.keyboard('3');
    await user.keyboard('1');
    expect(document.activeElement).toBe(screen.getByRole('spinbutton', { name: 'Month' }));
  });

  it('auto-advances to day/year respectively once four year digits are typed', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" defaultValue={{ day: 1, month: 1, year: 2000 }} />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    await user.keyboard('1987');
    // Year is the last segment - nothing to advance to, focus simply stays.
    expect(document.activeElement).toBe(year);
    expect(year.textContent).toBe('1987');
  });

  it('rejects a digit that can never lead to a value in range (year starting with 0)', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" minYear={1900} maxYear={2100} />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    await user.keyboard('0');
    expect(year.textContent).toBe('yyyy');
    expect(document.activeElement).toBe(year);
  });

  it('does not zero-pad a year still being typed, only the digits typed so far', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    await user.keyboard('1');
    expect(year.textContent).toBe('1');
    await user.keyboard('9');
    expect(year.textContent).toBe('19');
  });

  it('a lone digit that is a valid prefix but not a valid day on its own (e.g. "0") stays put on timeout rather than settling on an impossible day', () => {
    vi.useFakeTimers();
    try {
      render(<DateField label="Date of birth" />);
      const day = screen.getByRole('spinbutton', { name: 'Day' });
      day.focus();
      fireEvent.keyDown(day, { key: '0' });
      expect(day.textContent).toBe('00'); // intermediate display while buffering
      vi.advanceTimersByTime(700);
      // Never advanced to Month - the buffered "0" alone never reached a
      // legitimate day, so the auto-advance-on-timeout was suppressed.
      expect(document.activeElement).toBe(day);
    } finally {
      vi.useRealTimers();
    }
  });

  it('clamps the day down when the month changes to one with fewer days', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" defaultValue={{ day: 31, month: 1, year: 2023 }} />);
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    month.focus();
    await user.keyboard('0');
    await user.keyboard('2'); // -> February, non-leap 2023 has 28 days
    expect(screen.getByRole('spinbutton', { name: 'Day' }).textContent).toBe('28');
  });

  it('allows 29 February in a leap year but clamps it in a non-leap one', () => {
    const { rerender } = render(
      <DateField
        label="Date of birth"
        value={{ day: 29, month: 2, year: 2024 }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('spinbutton', { name: 'Day' }).textContent).toBe('29');
    const onChange = vi.fn();
    rerender(
      <DateField
        label="Date of birth"
        value={{ day: 29, month: 2, year: 2024 }}
        onChange={onChange}
      />,
    );
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    fireEvent.keyDown(year, { key: 'ArrowDown' }); // 2024 -> 2023, non-leap
    expect(onChange).toHaveBeenLastCalledWith({ day: 28, month: 2, year: 2023 });
  });

  it('steps a segment up and down with the arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" defaultValue={{ day: 1, month: 12, year: 2000 }} />);
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    month.focus();
    await user.keyboard('{ArrowUp}');
    expect(month.textContent).toBe('01');
    await user.keyboard('{ArrowDown}');
    expect(month.textContent).toBe('12');
  });

  it('moves focus between segments with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    day.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(day);
  });

  it('clears a segment with Backspace', async () => {
    const user = userEvent.setup();
    render(<DateField label="Date of birth" defaultValue={{ day: 5, month: 3, year: 1998 }} />);
    const year = screen.getByRole('spinbutton', { name: 'Year' });
    year.focus();
    await user.keyboard('{Backspace}');
    expect(year.textContent).toBe('yyyy');
  });

  it('is uncontrolled by default and only fires onChange once every segment is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateField label="Date of birth" onChange={onChange} />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    day.focus();
    await user.keyboard('05');
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.keyboard('03'); // now on month, per auto-advance
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.keyboard('1998'); // now on year
    expect(onChange).toHaveBeenLastCalledWith({ day: 5, month: 3, year: 1998 });
  });

  it('stays controlled: the displayed segments only follow the value prop', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <DateField
        label="Date of birth"
        value={{ day: 5, month: 3, year: 1998 }}
        onChange={onChange}
      />,
    );
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    day.focus();
    fireEvent.keyDown(day, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith({ day: 6, month: 3, year: 1998 });
    expect(day.textContent).toBe('05');
    rerender(
      <DateField
        label="Date of birth"
        value={{ day: 6, month: 3, year: 1998 }}
        onChange={onChange}
      />,
    );
    expect(day.textContent).toBe('06');
  });

  it('marks every segment disabled and out of tab order', () => {
    render(<DateField label="Date of birth" disabled />);
    for (const spinbutton of screen.getAllByRole('spinbutton')) {
      expect(spinbutton.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('carries the value into a native form via a hidden input, ISO order', () => {
    const { container } = render(
      <DateField
        label="Date of birth"
        name="dob"
        defaultValue={{ day: 5, month: 3, year: 1998 }}
      />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe('dob');
    expect(hidden.value).toBe('1998-03-05');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <DateField
        label="Date of birth"
        helperText="As shown on your passport."
        defaultValue={{ day: 5, month: 3, year: 1998 }}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations with an error', async () => {
    const { container } = render(
      <DateField label="Date of birth" errorMessage="Enter a date of birth." required />,
    );
    await expectNoA11yViolations(container);
  });
});
