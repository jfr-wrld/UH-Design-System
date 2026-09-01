import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { List, ListItem } from './List.js';

describe('List', () => {
  it('renders a ul with the given direction, dividers on by default', () => {
    const { container } = render(
      <List>
        <ListItem>Passport</ListItem>
      </List>,
    );
    const ul = container.querySelector('ul')!;
    expect(ul.getAttribute('data-direction')).toBe('vertical');
    expect(ul.getAttribute('data-hide-dividers')).toBeNull();
  });

  it('supports the horizontal direction and hiding dividers', () => {
    const { container } = render(
      <List direction="horizontal" hideDividers>
        <ListItem>Passport</ListItem>
      </List>,
    );
    const ul = container.querySelector('ul')!;
    expect(ul.getAttribute('data-direction')).toBe('horizontal');
    expect(ul.getAttribute('data-hide-dividers')).toBe('true');
  });

  it('renders a plain row with no interactive element when href/onClick are both omitted', () => {
    const { container } = render(
      <List>
        <ListItem>Visa status</ListItem>
      </List>,
    );
    expect(container.querySelector('a, button')).toBeNull();
    expect(screen.getByText('Visa status')).toBeDefined();
  });

  it('renders an anchor row when href is set, and follows a click', async () => {
    const user = userEvent.setup();
    render(
      <List>
        <ListItem href="/passengers/1">Ahmad Fauzi</ListItem>
      </List>,
    );
    const row = screen.getByRole('link', { name: 'Ahmad Fauzi' });
    expect(row.getAttribute('href')).toBe('/passengers/1');
    await user.click(row);
  });

  it('renders a button row when onClick is set, and calls it on click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <List>
        <ListItem onClick={onClick}>Remove passenger</ListItem>
      </List>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove passenger' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps a disabled link row in the tab order but blocks its click from bubbling', async () => {
    const user = userEvent.setup();
    const onWrapperClick = vi.fn();
    render(
      <div onClick={onWrapperClick}>
        <List>
          <ListItem href="/blocked" disabled>
            Blocked
          </ListItem>
        </List>
      </div>,
    );
    const row = screen.getByRole('link', { name: 'Blocked' });
    expect(row.getAttribute('href')).toBe('/blocked');
    expect(row.getAttribute('aria-disabled')).toBe('true');
    await user.click(row);
    expect(onWrapperClick).not.toHaveBeenCalled();
  });

  it('disables a button row natively', () => {
    render(
      <List>
        <ListItem onClick={() => {}} disabled>
          Remove passenger
        </ListItem>
      </List>,
    );
    const row = screen.getByRole('button', { name: 'Remove passenger' });
    expect((row as HTMLButtonElement).disabled).toBe(true);
  });

  it('marks the active row with data-active', () => {
    render(
      <List>
        <ListItem href="/economy" active>
          Economy
        </ListItem>
        <ListItem href="/business">Business</ListItem>
      </List>,
    );
    expect(screen.getByRole('link', { name: 'Economy' }).getAttribute('data-active')).toBe('true');
    expect(screen.getByRole('link', { name: 'Business' }).getAttribute('data-active')).toBeNull();
  });

  it('renders leading icon and trailing content', () => {
    render(
      <List>
        <ListItem leadingIcon={<svg data-testid="icon" />} trailing="3">
          Documents
        </ListItem>
      </List>,
    );
    expect(screen.getByTestId('icon')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('has no accessibility violations across static, link, and button rows', async () => {
    const { container } = render(
      <List>
        <ListItem>Static row</ListItem>
        <ListItem href="/a">Link row</ListItem>
        <ListItem onClick={() => {}}>Button row</ListItem>
        <ListItem href="/b" disabled>
          Disabled link row
        </ListItem>
        <ListItem onClick={() => {}} disabled>
          Disabled button row
        </ListItem>
      </List>,
    );
    await expectNoA11yViolations(container);
  });
});
