import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Overlay, type OverlayProps } from './Overlay.js';

const dialog = () => screen.queryByRole('dialog');
const panel = () => document.querySelector('.uh-overlay__panel') as HTMLElement;
const backdrop = () => document.querySelector('.uh-overlay__backdrop') as HTMLElement;

/** The exit waits for animationend; jsdom fires nothing, so this does - see
    Modal's own identical helper for why it targets the panel directly. */
const finishExit = () => {
  const node = panel();
  if (node) fireEvent(node, new Event('animationend'));
};

function Host(props: Partial<OverlayProps> & { defaultOpen?: boolean }) {
  const { defaultOpen = false, children, ...rest } = props;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open overlay
      </button>
      <Overlay aria-label="Custom overlay" {...rest} open={open} onClose={() => setOpen(false)}>
        {children ?? <p>Overlay content</p>}
      </Overlay>
    </>
  );
}

describe('Overlay', () => {
  it('renders nothing while closed', () => {
    render(<Host />);
    expect(dialog()).toBeNull();
    expect(document.querySelector('.uh-overlay')).toBeNull();
  });

  it('is a labelled, portalled dialog holding whatever content it is given', () => {
    render(<Host defaultOpen />);
    const node = dialog();
    expect(node).not.toBeNull();
    expect(node?.getAttribute('aria-label')).toBe('Custom overlay');
    expect(node?.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByText('Overlay content')).toBeDefined();
    // Portalled to the body, not nested under the trigger button.
    expect(node?.closest('body')).toBe(document.body);
  });

  it('renders alertdialog when asked', () => {
    render(<Host defaultOpen role="alertdialog" />);
    expect(screen.queryByRole('alertdialog')).not.toBeNull();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<Host defaultOpen />);
    expect(dialog()).not.toBeNull();
    await user.keyboard('{Escape}');
    finishExit();
    expect(dialog()).toBeNull();
  });

  it('does not close on Escape when closeOnEsc is false', async () => {
    const user = userEvent.setup();
    render(<Host defaultOpen closeOnEsc={false} />);
    await user.keyboard('{Escape}');
    expect(dialog()).not.toBeNull();
  });

  it('closes on a backdrop click', () => {
    render(<Host defaultOpen />);
    fireEvent.click(backdrop());
    finishExit();
    expect(dialog()).toBeNull();
  });

  it('does not close on a backdrop click when closeOnOverlayClick is false', () => {
    render(<Host defaultOpen closeOnOverlayClick={false} />);
    fireEvent.click(backdrop());
    expect(dialog()).not.toBeNull();
  });

  it('traps focus inside the panel', async () => {
    const user = userEvent.setup();
    render(
      <Host defaultOpen>
        <button type="button">First</button>
        <button type="button">Last</button>
      </Host>,
    );
    const buttons = screen
      .getAllByRole('button')
      .filter((b) => b !== screen.getByText('Open overlay'));
    expect(buttons.length).toBeGreaterThan(0);
    await user.tab();
    expect(panel().contains(document.activeElement)).toBe(true);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Host defaultOpen />);
    await expectNoA11yViolations(container);
  });
});
