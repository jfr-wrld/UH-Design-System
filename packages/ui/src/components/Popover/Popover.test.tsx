import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Popover } from './Popover.js';

const trigger = () => screen.getByRole('button', { name: 'Share package' });
const popover = () => screen.queryByRole('dialog', { name: 'Share options' });

function Host(props: Partial<Parameters<typeof Popover>[0]> = {}) {
  return (
    <div>
      <Popover
        trigger={<button type="button">Share package</button>}
        aria-label="Share options"
        content={
          <div>
            <button type="button">Copy link</button>
            <button type="button">WhatsApp</button>
          </div>
        }
        {...props}
      />
      <button type="button">Elsewhere</button>
    </div>
  );
}

describe('Popover', () => {
  it('renders only the trigger while closed', () => {
    render(<Host />);
    expect(trigger()).toBeDefined();
    expect(popover()).toBeNull();
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    /* No dangling reference to a popup that is not in the document. */
    expect(trigger().hasAttribute('aria-controls')).toBe(false);
  });

  it('opens on click as a labelled non-modal dialog, portalled to the body', async () => {
    render(
      <div style={{ overflow: 'hidden' }}>
        <Host />
      </div>,
    );
    await userEvent.click(trigger());
    const panel = popover()!;
    expect(panel).not.toBeNull();
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(panel.parentElement).toBe(document.body);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(trigger().getAttribute('aria-controls')!)).toBe(panel);
  });

  it('toggles closed from the same trigger', async () => {
    render(<Host />);
    await userEvent.click(trigger());
    await userEvent.click(trigger());
    expect(popover()).toBeNull();
  });

  /* The whole point over Tooltip: things inside are usable. */
  it('keeps interactive content usable without closing', async () => {
    const onCopy = vi.fn();
    render(
      <Host
        content={
          <button type="button" onClick={onCopy}>
            Copy link
          </button>
        }
      />,
    );
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(popover()).not.toBeNull();
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Host />);
    await userEvent.click(trigger());
    await userEvent.keyboard('{Escape}');
    expect(popover()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('closes when the pointer lands elsewhere', async () => {
    render(<Host />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(popover()).toBeNull();
  });

  it('can refuse outside clicks', async () => {
    render(<Host closeOnClickOutside={false} />);
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
    expect(popover()).not.toBeNull();
  });

  it('closes when focus moves on, because it is not a trap', async () => {
    render(<Host />);
    await userEvent.click(trigger());
    /* Bare .focus() is not act-wrapped; the close needs a beat to render. */
    screen.getByRole('button', { name: 'Elsewhere' }).focus();
    await waitFor(() => expect(popover()).toBeNull());
  });

  it('does not close while focus is inside its own content', async () => {
    render(<Host />);
    await userEvent.click(trigger());
    screen.getByRole('button', { name: 'WhatsApp' }).focus();
    expect(popover()).not.toBeNull();
  });

  describe('placement and arrow', () => {
    it('lands where asked in an uncramped viewport', async () => {
      render(<Host placement="bottom" />);
      await userEvent.click(trigger());
      expect(popover()!.getAttribute('data-placement')).toBe('bottom');
      expect(document.querySelector('.uh-popover__arrow')).not.toBeNull();
    });

    it('can drop the arrow', async () => {
      render(<Host arrow={false} />);
      await userEvent.click(trigger());
      expect(document.querySelector('.uh-popover__arrow')).toBeNull();
    });

    it('writes the arrow position for the stylesheet', async () => {
      render(<Host />);
      await userEvent.click(trigger());
      expect(popover()!.style.getPropertyValue('--uh-anchor-arrow')).not.toBe('');
    });
  });

  describe('controlled mode', () => {
    it('obeys the parent and reports intent', async () => {
      const onOpenChange = vi.fn();
      render(<Host open={false} onOpenChange={onOpenChange} />);
      await userEvent.click(trigger());
      expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(true);
      /* Parent ignored it: still closed. */
      expect(popover()).toBeNull();
    });

    it('round-trips through a controlled parent', async () => {
      function Controlled() {
        const [open, setOpen] = useState(false);
        return (
          <Popover
            trigger={<button type="button">Share package</button>}
            aria-label="Share options"
            content={<button type="button">Copy link</button>}
            open={open}
            onOpenChange={setOpen}
          />
        );
      }
      render(<Controlled />);
      await userEvent.click(trigger());
      expect(popover()).not.toBeNull();
    });
  });

  it('preserves the trigger element own onClick', async () => {
    const onClick = vi.fn();
    render(
      <Popover
        trigger={
          <button type="button" onClick={onClick}>
            Share package
          </button>
        }
        aria-label="Share options"
        content={<span>Options</span>}
      />,
    );
    await userEvent.click(trigger());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(popover()).not.toBeNull();
  });

  describe('accessibility', () => {
    it('has no violations open with interactive content', async () => {
      render(<Host />);
      await userEvent.click(trigger());
      await expectNoA11yViolations(document.body);
    });
  });
});
