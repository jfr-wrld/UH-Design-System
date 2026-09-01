import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { TimePicker } from './TimePicker.js';

describe('TimePicker', () => {
  it('shows the placeholder until a time is chosen', () => {
    render(<TimePicker label="Select time" placeholder="Choose a time" />);
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toContain(
      'Choose a time',
    );
  });

  it('shows a formatted defaultValue on the trigger', () => {
    render(<TimePicker label="Select time" defaultValue={{ hour: 9, minute: 30 }} />);
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toMatch(/9:30/);
  });

  it('opens the popover on click, with hour, minute, and period columns', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeDefined();
    expect(screen.getByRole('listbox', { name: 'Minute' })).toBeDefined();
    expect(screen.getByRole('listbox', { name: 'AM/PM' })).toBeDefined();
  });

  it('omits the period column in 24-hour mode', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" hourCycle={24} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    expect(screen.queryByRole('listbox', { name: 'AM/PM' })).toBeNull();
  });

  it('lists minutes stepped by minuteStep', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" minuteStep={15} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const minuteList = screen.getByRole('listbox', { name: 'Minute' });
    expect(minuteList.querySelectorAll('[role="option"]')).toHaveLength(4);
  });

  it('selects an hour by clicking an option and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker label="Select time" onChange={onChange} defaultValue={{ hour: 9, minute: 0 }} />,
    );
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const hours = within(screen.getByRole('listbox', { name: 'Hour' }));
    await user.click(hours.getByRole('option', { name: '10' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 10, minute: 0 });
  });

  it('marks the currently selected option in each column', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" defaultValue={{ hour: 9, minute: 30 }} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const hours = within(screen.getByRole('listbox', { name: 'Hour' }));
    const minutes = within(screen.getByRole('listbox', { name: 'Minute' }));
    const periods = within(screen.getByRole('listbox', { name: 'AM/PM' }));
    expect(hours.getByRole('option', { name: '09' }).getAttribute('aria-selected')).toBe('true');
    expect(minutes.getByRole('option', { name: '30' }).getAttribute('aria-selected')).toBe('true');
    expect(periods.getByRole('option', { name: 'AM' }).getAttribute('aria-selected')).toBe('true');
  });

  it('switching AM/PM keeps the same 12-hour value but flips the 24-hour one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <TimePicker label="Select time" onChange={onChange} defaultValue={{ hour: 9, minute: 30 }} />,
    );
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const periods = within(screen.getByRole('listbox', { name: 'AM/PM' }));
    await user.click(periods.getByRole('option', { name: 'PM' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 21, minute: 30 });
  });

  it('does not fire onChange until every column hourCycle requires has been picked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker label="Select time" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const minutes = within(screen.getByRole('listbox', { name: 'Minute' }));
    await user.click(minutes.getByRole('option', { name: '05' }));
    // Only the minute column has been touched - hour and period are still
    // unset, so this must not fabricate a default hour and fire onChange.
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toContain(
      'Select a time',
    );
    const hours = within(screen.getByRole('listbox', { name: 'Hour' }));
    await user.click(hours.getByRole('option', { name: '10' }));
    expect(onChange).not.toHaveBeenCalled(); // period still unset
    const periods = within(screen.getByRole('listbox', { name: 'AM/PM' }));
    await user.click(periods.getByRole('option', { name: 'PM' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 22, minute: 5 });
  });

  it('fires onChange as soon as hour and minute are both picked in 24-hour mode', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TimePicker label="Select time" hourCycle={24} onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const hours = within(screen.getByRole('listbox', { name: 'Hour' }));
    await user.click(hours.getByRole('option', { name: '14' }));
    expect(onChange).not.toHaveBeenCalled();
    const minutes = within(screen.getByRole('listbox', { name: 'Minute' }));
    await user.click(minutes.getByRole('option', { name: '30' }));
    expect(onChange).toHaveBeenLastCalledWith({ hour: 14, minute: 30 });
  });

  it('scrolls the pre-selected option into view when a column opens', async () => {
    const scrollIntoView = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
    const user = userEvent.setup();
    render(<TimePicker label="Select time" defaultValue={{ hour: 23, minute: 0 }} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const hours = within(screen.getByRole('listbox', { name: 'Hour' }));
    const selectedHour = hours.getByRole('option', { name: '11' }); // 23:00 -> 11 PM
    expect(scrollIntoView).toHaveBeenCalled();
    expect(selectedHour.getAttribute('aria-selected')).toBe('true');
  });

  it('is uncontrolled by default', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" defaultValue={{ hour: 9, minute: 0 }} />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const minutes = within(screen.getByRole('listbox', { name: 'Minute' }));
    await user.click(minutes.getByRole('option', { name: '05' }));
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toMatch(/9:05/);
  });

  it('stays controlled: the trigger only follows the value prop', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <TimePicker label="Select time" value={{ hour: 9, minute: 0 }} onChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    const minutes = within(screen.getByRole('listbox', { name: 'Minute' }));
    await user.click(minutes.getByRole('option', { name: '05' }));
    expect(onChange).toHaveBeenCalledWith({ hour: 9, minute: 5 });
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toMatch(/9:00/);
    rerender(<TimePicker label="Select time" value={{ hour: 9, minute: 5 }} onChange={onChange} />);
    expect(screen.getByRole('button', { name: /Select time/ }).textContent).toMatch(/9:05/);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Select time" />);
    const trigger = screen.getByRole('button', { name: /Select time/ });
    await user.click(trigger);
    expect(screen.getByRole('listbox', { name: 'Hour' })).toBeDefined();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox', { name: 'Hour' })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('disables the trigger', () => {
    render(<TimePicker label="Select time" disabled />);
    expect(
      (screen.getByRole('button', { name: /Select time/ }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('has no accessibility violations closed', async () => {
    const { container } = render(<TimePicker label="Select time" helperText="Pick a slot." />);
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations open', async () => {
    const user = userEvent.setup();
    const { container } = render(<TimePicker label="Select time" />);
    await user.click(screen.getByRole('button', { name: /Select time/ }));
    await expectNoA11yViolations(container);
  });
});
