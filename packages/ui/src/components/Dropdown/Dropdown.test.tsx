import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownGroup,
  DropdownSeparator,
} from './Dropdown.js';

function Menu(overrides: { onEdit?: () => void; onDelete?: () => void } = {}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <button type="button">Actions</button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownGroup heading="Booking">
          <DropdownItem onSelect={overrides.onEdit}>Edit</DropdownItem>
          <DropdownItem disabled>Duplicate</DropdownItem>
        </DropdownGroup>
        <DropdownSeparator />
        <DropdownItem destructive onSelect={overrides.onDelete}>
          Delete
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

const trigger = () => screen.getByRole('button', { name: 'Actions' });
const menu = () => screen.queryByRole('menu');

describe('Dropdown', () => {
  it('renders only the trigger while closed', () => {
    render(<Menu />);
    expect(trigger()).toBeDefined();
    expect(menu()).toBeNull();
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  });

  it('opens on click, named after the trigger by default, and focuses the first item', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    const panel = menu()!;
    expect(panel).not.toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(panel.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(document.activeElement).toBe(screen.getByText('Edit'));
  });

  it('names the menu from an explicit aria-label instead, when given', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown>
        <DropdownTrigger>
          <button type="button">Open</button>
        </DropdownTrigger>
        <DropdownContent aria-label="Row actions">
          <DropdownItem>Edit</DropdownItem>
        </DropdownContent>
      </Dropdown>,
    );
    await user.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('menu', { name: 'Row actions' })).toBeDefined();
  });

  it('moves focus between items with the arrow keys, wrapping at both ends', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    expect(document.activeElement).toBe(screen.getByText('Edit'));
    await user.keyboard('{ArrowUp}'); // wraps to the last item (Delete) - Duplicate is disabled
    expect(document.activeElement).toBe(screen.getByText('Delete'));
    await user.keyboard('{ArrowDown}'); // wraps back to the first
    expect(document.activeElement).toBe(screen.getByText('Edit'));
  });

  it('skips a disabled item during arrow navigation', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    await user.keyboard('{ArrowDown}'); // Edit -> Delete, Duplicate is disabled and skipped
    expect(document.activeElement).toBe(screen.getByText('Delete'));
  });

  it('Home/End jump to the first/last enabled item', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(screen.getByText('Delete'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(screen.getByText('Edit'));
  });

  it('runs onSelect and closes on Enter, returning focus to the trigger', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<Menu onEdit={onEdit} />);
    await user.click(trigger());
    await user.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('runs onSelect and closes on click', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(<Menu onDelete={onDelete} />);
    await user.click(trigger());
    await user.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(menu()).toBeNull();
  });

  it('never runs a disabled item', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    await user.click(screen.getByText('Duplicate'));
    // Still open - a disabled item does not close the menu either.
    expect(menu()).not.toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    await user.keyboard('{Escape}');
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('opens via ArrowDown on the trigger too', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    trigger().focus();
    await user.keyboard('{ArrowDown}');
    expect(menu()).not.toBeNull();
  });

  it('marks a group with its own heading as an accessible-named group', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    expect(screen.getByRole('group', { name: 'Booking' })).toBeDefined();
  });

  it('marks the destructive item distinctly', async () => {
    const user = userEvent.setup();
    render(<Menu />);
    await user.click(trigger());
    expect(
      screen.getByText('Delete').closest('[role="menuitem"]')?.getAttribute('data-destructive'),
    ).toBe('true');
  });

  it('has no accessibility violations, closed or open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu />);
    await expectNoA11yViolations(container);
    await user.click(trigger());
    await expectNoA11yViolations(container);
  });
});
