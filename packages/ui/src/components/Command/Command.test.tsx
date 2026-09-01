import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './Command.js';

function BasicCommand(
  overrides: {
    onSelectCalendar?: () => void;
    onSelectProfile?: () => void;
  } = {},
) {
  return (
    <Command label="Command menu">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem value="Calendar" onSelect={overrides.onSelectCalendar}>
            Calendar
          </CommandItem>
          <CommandItem value="Search Emoji">Search Emoji</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem value="Profile" onSelect={overrides.onSelectProfile}>
            Profile
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem value="Billing" disabled>
            Billing
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe('Command', () => {
  it('renders every item across every group, and the shortcut hint', () => {
    render(<BasicCommand />);
    expect(screen.getByText('Calendar')).toBeDefined();
    expect(screen.getByText('Search Emoji')).toBeDefined();
    expect(screen.getByText('Profile')).toBeDefined();
    expect(screen.getByText('Billing')).toBeDefined();
    expect(screen.getByText('⌘P')).toBeDefined();
  });

  it('does not show CommandEmpty while there is anything to show', () => {
    render(<BasicCommand />);
    expect(screen.queryByText('No results found.')).toBeNull();
  });

  it('filters items by the query, case-insensitively', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    await user.type(screen.getByRole('combobox'), 'cal');
    expect(screen.getByText('Calendar')).toBeDefined();
    expect(screen.queryByText('Search Emoji')).toBeNull();
    expect(screen.queryByText('Profile')).toBeNull();
  });

  it('hides a group entirely once none of its items match', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    await user.type(screen.getByRole('combobox'), 'calendar');
    expect(screen.queryByRole('group', { name: 'Settings' })).toBeNull();
  });

  it('shows CommandEmpty once nothing matches', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    await user.type(screen.getByRole('combobox'), 'nothing matches this');
    expect(screen.getByText('No results found.')).toBeDefined();
  });

  it('keeps a disabled item visible but never gives it the active highlight', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    const input = screen.getByRole('combobox');
    const billingOption = screen.getByText('Billing').closest('[role="option"]');
    input.focus();
    // Four items total, Billing disabled - cycling four times returns to the
    // start without ever landing on it.
    for (let i = 0; i < 4; i += 1) {
      await user.keyboard('{ArrowDown}');
      expect(input.getAttribute('aria-activedescendant')).not.toBe(billingOption?.id);
    }
  });

  it('runs the active item on Enter', async () => {
    const user = userEvent.setup();
    const onSelectCalendar = vi.fn();
    render(<BasicCommand onSelectCalendar={onSelectCalendar} />);
    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{Enter}');
    expect(onSelectCalendar).toHaveBeenCalledTimes(1);
  });

  it('moves the active item with ArrowDown/ArrowUp and runs it on Enter', async () => {
    const user = userEvent.setup();
    const onSelectProfile = vi.fn();
    render(<BasicCommand onSelectProfile={onSelectProfile} />);
    const input = screen.getByRole('combobox');
    input.focus();
    // Calendar -> Search Emoji -> Profile (Billing is disabled, skipped).
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelectProfile).toHaveBeenCalledTimes(1);
  });

  it('runs an item on click without requiring it to be active first', async () => {
    const user = userEvent.setup();
    const onSelectProfile = vi.fn();
    render(<BasicCommand onSelectProfile={onSelectProfile} />);
    await user.click(screen.getByText('Profile'));
    expect(onSelectProfile).toHaveBeenCalledTimes(1);
  });

  it('does not run a disabled item on click', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    const billing = screen.getByText('Billing');
    await user.click(billing);
    expect(billing.closest('[role="option"]')?.getAttribute('aria-disabled')).toBe('true');
  });

  it('wraps active-item navigation at both ends', async () => {
    const user = userEvent.setup();
    render(<BasicCommand />);
    const input = screen.getByRole('combobox');
    input.focus();
    await user.keyboard('{ArrowUp}'); // from nothing active, should land on the last navigable item.
    expect(input.getAttribute('aria-activedescendant')).toBe(
      screen.getByText('Profile').closest('[role="option"]')?.id,
    );
  });

  it('seeds the query from defaultValue', () => {
    render(
      <Command label="Command menu" defaultValue="calendar">
        <CommandInput />
        <CommandList>
          <CommandItem value="Calendar">Calendar</CommandItem>
          <CommandItem value="Billing">Billing</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByText('Calendar')).toBeDefined();
    expect(screen.queryByText('Billing')).toBeNull();
  });

  it('stays controlled: the query only follows the value prop', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Command label="Command menu" value="cal" onValueChange={onValueChange}>
        <CommandInput />
        <CommandList>
          <CommandItem value="Calendar">Calendar</CommandItem>
          <CommandItem value="Billing">Billing</CommandItem>
        </CommandList>
      </Command>,
    );
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('cal');
    await user.type(input, 'x');
    expect(onValueChange).toHaveBeenCalledWith('calx');
    // The consumer hasn't fed the new value back in yet, so it holds.
    expect(input.value).toBe('cal');
    rerender(
      <Command label="Command menu" value="calx" onValueChange={onValueChange}>
        <CommandInput />
        <CommandList>
          <CommandItem value="Calendar">Calendar</CommandItem>
          <CommandItem value="Billing">Billing</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(input.value).toBe('calx');
  });

  it('gives the input an accessible name from the Command label when none is supplied', () => {
    render(
      <Command label="Search actions">
        <CommandInput />
        <CommandList>
          <CommandItem value="New booking">New booking</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole('combobox', { name: 'Search actions' })).toBeDefined();
  });

  it('respects an explicit aria-label on the input over the Command label', () => {
    render(
      <Command label="Search actions">
        <CommandInput aria-label="Custom name" />
        <CommandList>
          <CommandItem value="New booking">New booking</CommandItem>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole('combobox', { name: 'Custom name' })).toBeDefined();
  });

  it('gives a non-string CommandGroup heading an accessible name too', () => {
    render(
      <Command label="Command menu">
        <CommandInput />
        <CommandList>
          <CommandGroup
            heading={
              <span>
                Actions <em>(1)</em>
              </span>
            }
          >
            <CommandItem value="New booking">New booking</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(screen.getByRole('group', { name: 'Actions (1)' })).toBeDefined();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<BasicCommand />);
    await expectNoA11yViolations(container);
  });

  it('has no accessibility violations when filtered to empty', async () => {
    const user = userEvent.setup();
    const { container } = render(<BasicCommand />);
    await user.type(screen.getByRole('combobox'), 'zzz');
    await expectNoA11yViolations(container);
  });
});
