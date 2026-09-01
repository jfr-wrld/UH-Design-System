import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { TimeField } from './TimeField.js';

describe('TimeField', () => {
  it('renders hour, minute, and period segments by default', () => {
    render(<TimeField label="Meeting time" />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' })).toBeDefined();
    expect(screen.getByRole('spinbutton', { name: 'Minute' })).toBeDefined();
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' })).toBeDefined();
    expect(screen.queryByRole('spinbutton', { name: 'Second' })).toBeNull();
  });

  it('renders a second segment when granularity is second', () => {
    render(<TimeField label="Meeting time" granularity="second" />);
    expect(screen.getByRole('spinbutton', { name: 'Second' })).toBeDefined();
  });

  it('omits the period segment in 24-hour mode', () => {
    render(<TimeField label="Meeting time" hourCycle={24} />);
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).toBeNull();
  });

  it('shows a placeholder on each empty segment', () => {
    render(<TimeField label="Meeting time" />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).textContent).toBe('hh');
    expect(screen.getByRole('spinbutton', { name: 'Minute' }).textContent).toBe('mm');
  });

  it('displays a defaultValue split across segments', () => {
    render(<TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 30 }} />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).textContent).toBe('09');
    expect(screen.getByRole('spinbutton', { name: 'Minute' }).textContent).toBe('30');
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' }).textContent).toBe('AM');
  });

  it('converts a 24-hour value to 12-hour segments correctly (13:00 -> 1 PM)', () => {
    render(<TimeField label="Meeting time" defaultValue={{ hour: 13, minute: 0 }} />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).textContent).toBe('01');
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' }).textContent).toBe('PM');
  });

  it('midnight (0:00) shows as 12 AM', () => {
    render(<TimeField label="Meeting time" defaultValue={{ hour: 0, minute: 0 }} />);
    expect(screen.getByRole('spinbutton', { name: 'Hour' }).textContent).toBe('12');
    expect(screen.getByRole('spinbutton', { name: 'AM/PM' }).textContent).toBe('AM');
  });

  it('steps the hour up and down with the arrow keys, wrapping at the ends', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" defaultValue={{ hour: 12, minute: 0 }} />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('{ArrowUp}');
    expect(hour.textContent).toBe('01');
    await user.keyboard('{ArrowDown}');
    expect(hour.textContent).toBe('12');
  });

  it('types a two-digit hour by combining consecutive digit keys', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 0 }} />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('1');
    await user.keyboard('2');
    expect(hour.textContent).toBe('12');
  });

  it('auto-advances to the next segment once a digit cannot be extended', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('9'); // 9x would exceed 12, so it commits immediately
    expect(document.activeElement).toBe(screen.getByRole('spinbutton', { name: 'Minute' }));
  });

  it('ignores a digit that cannot start any valid value for the segment', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('0'); // every 12-hour hour (1-12) starts with "1", never "0"
    expect(hour.textContent).toBe('hh');
    expect(document.activeElement).toBe(hour);
  });

  it('cancels a pending digit buffer when the arrow keys move focus away', () => {
    vi.useFakeTimers();
    try {
      render(<TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 0 }} />);
      const hour = screen.getByRole('spinbutton', { name: 'Hour' });
      const minute = screen.getByRole('spinbutton', { name: 'Minute' });
      const period = screen.getByRole('spinbutton', { name: 'AM/PM' });
      hour.focus();
      fireEvent.keyDown(hour, { key: '1' }); // buffers - 10/11/12 are still reachable
      fireEvent.keyDown(hour, { key: 'ArrowRight' }); // -> minute, before the buffer settles
      fireEvent.keyDown(minute, { key: 'ArrowRight' }); // -> period
      // If the buffer's auto-advance timeout were still armed, it would fire
      // here and yank focus back to minute (hour's own neighbor).
      vi.advanceTimersByTime(700);
      expect(document.activeElement).toBe(period);
    } finally {
      vi.useRealTimers();
    }
  });

  it('omits aria-valuenow on the period segment while it is unset', () => {
    render(<TimeField label="Meeting time" />);
    const period = screen.getByRole('spinbutton', { name: 'AM/PM' });
    expect(period.hasAttribute('aria-valuenow')).toBe(false);
    expect(period.getAttribute('aria-valuetext')).toBe('Not set');
  });

  it('moves focus between segments with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('spinbutton', { name: 'Minute' }));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(hour);
  });

  it('toggles AM/PM with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 0 }} />);
    const period = screen.getByRole('spinbutton', { name: 'AM/PM' });
    period.focus();
    await user.keyboard('{ArrowUp}');
    expect(period.textContent).toBe('PM');
  });

  it('clears a segment with Backspace', async () => {
    const user = userEvent.setup();
    render(<TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 30 }} />);
    const minute = screen.getByRole('spinbutton', { name: 'Minute' });
    minute.focus();
    await user.keyboard('{Backspace}');
    expect(minute.textContent).toBe('mm');
  });

  it('is uncontrolled by default and only fires onChange once every segment is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimeField label="Meeting time" onChange={onChange} />);
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('9');
    expect(onChange).toHaveBeenLastCalledWith(null);
    await user.keyboard('3'); // now on minute, per auto-advance
    expect(onChange).toHaveBeenLastCalledWith(null);
    const period = screen.getByRole('spinbutton', { name: 'AM/PM' });
    period.focus();
    await user.keyboard('p');
    expect(onChange).toHaveBeenLastCalledWith({ hour: 21, minute: 3 });
  });

  it('stays controlled: the displayed segments only follow the value prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <TimeField label="Meeting time" value={{ hour: 9, minute: 0 }} onChange={onChange} />,
    );
    const hour = screen.getByRole('spinbutton', { name: 'Hour' });
    hour.focus();
    await user.keyboard('{ArrowUp}');
    expect(onChange).toHaveBeenCalledWith({ hour: 10, minute: 0 });
    // The consumer hasn't fed the new value back in yet, so the field holds.
    expect(hour.textContent).toBe('09');
    rerender(
      <TimeField label="Meeting time" value={{ hour: 10, minute: 0 }} onChange={onChange} />,
    );
    expect(hour.textContent).toBe('10');
  });

  it('marks every segment disabled and out of tab order', () => {
    render(<TimeField label="Meeting time" disabled />);
    for (const spinbutton of screen.getAllByRole('spinbutton')) {
      expect(spinbutton.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('carries the value into a native form via a hidden input', () => {
    const { container } = render(
      <TimeField label="Meeting time" name="meetingTime" defaultValue={{ hour: 9, minute: 30 }} />,
    );
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe('meetingTime');
    expect(hidden.value).toBe('09:30');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TimeField
        label="Meeting time"
        helperText="Choose a start time."
        defaultValue={{ hour: 9, minute: 30 }}
      />,
    );
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations with an error', async () => {
    const { container } = render(
      <TimeField label="Meeting time" errorMessage="Business hours only." required />,
    );
    await expectNoA11yViolations(container);
  });
});
