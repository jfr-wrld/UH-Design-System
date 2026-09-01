import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { CommandDialog, type CommandDialogProps } from './CommandDialog.js';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from './Command.js';

function Palette(props: Partial<CommandDialogProps> = {}) {
  return (
    <CommandDialog label="Command palette" {...props}>
      <Command label="Command palette">
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandGroup heading="Actions">
            <CommandItem value="New file">New file</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

const finishExit = () => {
  const panel = document.querySelector('.uh-overlay__panel');
  if (panel) fireEvent(panel, new Event('animationend'));
};

describe('CommandDialog', () => {
  it('renders nothing while closed', () => {
    render(<Palette />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens on Cmd/Ctrl+K globally, without needing focus inside the page', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).not.toBeNull();
    expect(screen.getByPlaceholderText('Type a command...')).toBeDefined();
  });

  it('opens on Ctrl+K too', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog')).not.toBeNull();
  });

  it('toggles closed on a second Cmd+K', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).not.toBeNull();
    await user.keyboard('{Meta>}k{/Meta}');
    finishExit();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('ignores Cmd/Ctrl+K when Shift or Alt is also held', () => {
    render(<Palette />);
    fireEvent.keyDown(document, { key: 'k', metaKey: true, shiftKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true, altKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('does not steal the shortcut from an unrelated text field elsewhere on the page', () => {
    render(
      <>
        <input aria-label="Unrelated field" />
        <Palette />
      </>,
    );
    screen.getByLabelText('Unrelated field').focus();
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('still closes via the shortcut while its own input has focus', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.getByRole('dialog')).not.toBeNull();
    screen.getByPlaceholderText('Type a command...').focus();
    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    finishExit();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('respects a custom shortcutKey', async () => {
    const user = userEvent.setup();
    render(<Palette shortcutKey="p" />);
    await user.keyboard('{Meta>}k{/Meta}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await user.keyboard('{Meta>}p{/Meta}');
    expect(screen.getByRole('dialog')).not.toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.keyboard('{Meta>}k{/Meta}');
    await user.keyboard('{Escape}');
    finishExit();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is controllable via open/onOpenChange', () => {
    const { rerender } = render(<Palette open={false} onOpenChange={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(<Palette open onOpenChange={() => {}} />);
    expect(screen.getByRole('dialog')).not.toBeNull();
  });

  it('has no accessibility violations while open', async () => {
    const user = userEvent.setup();
    const { container } = render(<Palette />);
    await user.keyboard('{Meta>}k{/Meta}');
    await expectNoA11yViolations(container);
  });
});
