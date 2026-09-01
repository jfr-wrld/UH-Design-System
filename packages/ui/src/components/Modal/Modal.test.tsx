import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Modal, type ModalProps } from './Modal.js';

const base: Omit<ModalProps, 'open' | 'onClose'> = {
  title: 'Cancel this booking?',
  description: 'The seat is released immediately and the refund follows the policy.',
};

const dialog = () => screen.queryByRole('dialog');
const panel = () => document.querySelector('.uh-modal__panel') as HTMLElement;
const backdrop = () => document.querySelector('.uh-modal__backdrop') as HTMLElement;

/**
 * The exit waits for animationend; jsdom fires nothing, so we do - and it
 * the listener is native on the panel itself, because delegated animation
 * events do not reliably cross the portal boundary.
 */
const finishExit = () => {
  const node = panel();
  if (node) fireEvent(node, new Event('animationend'));
};

function Host(props: Partial<ModalProps> & { defaultOpen?: boolean }) {
  const { defaultOpen = false, ...rest } = props;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open modal
      </button>
      <Modal {...base} {...rest} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(<Host />);
    expect(dialog()).toBeNull();
    expect(document.querySelector('.uh-modal')).toBeNull();
  });

  it('is a labelled, described, modal dialog portalled to the body', async () => {
    render(
      <div style={{ overflow: 'hidden' }}>
        <Host defaultOpen />
      </div>,
    );
    const node = screen.getByRole('dialog', { name: 'Cancel this booking?' });
    expect(node.getAttribute('aria-modal')).toBe('true');
    const described = node.getAttribute('aria-describedby')!;
    expect(document.getElementById(described)?.textContent).toContain('refund follows');
    /* Past any clipping ancestor. */
    expect(node.closest('.uh-modal')?.parentElement).toBe(document.body);
  });

  it('omits aria-describedby without a description', () => {
    render(<Host defaultOpen description={undefined} />);
    expect(dialog()!.hasAttribute('aria-describedby')).toBe(false);
  });

  describe('opening and closing', () => {
    it('opens from the trigger and focuses the first focusable element', async () => {
      render(<Host footer={<button type="button">Keep booking</button>} />);
      await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
      expect(dialog()).not.toBeNull();
      /* First focusable is the close button in the header. */
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
    });

    it('honours initialFocus', async () => {
      function WithInitial() {
        const [open, setOpen] = useState(false);
        const keep = useRef<HTMLButtonElement | null>(null);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              Open modal
            </button>
            <Modal
              {...base}
              open={open}
              onClose={() => setOpen(false)}
              initialFocus={keep}
              footer={
                <button type="button" ref={keep}>
                  Keep booking
                </button>
              }
            />
          </>
        );
      }
      render(<WithInitial />);
      await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Keep booking' }));
    });

    it('closes on Escape and returns focus to the trigger', async () => {
      render(<Host />);
      const trigger = screen.getByRole('button', { name: 'Open modal' });
      await userEvent.click(trigger);
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('can refuse Escape', async () => {
      render(<Host closeOnEsc={false} />);
      await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
      await userEvent.keyboard('{Escape}');
      expect(dialog()).not.toBeNull();
    });

    it('closes on the backdrop and can refuse that too', async () => {
      const { unmount } = render(<Host defaultOpen />);
      await userEvent.click(backdrop());
      finishExit();
      expect(dialog()).toBeNull();
      unmount();

      render(<Host defaultOpen closeOnOverlayClick={false} />);
      await userEvent.click(backdrop());
      expect(dialog()).not.toBeNull();
    });

    it('does not close from clicks inside the panel', async () => {
      render(<Host defaultOpen />);
      await userEvent.click(screen.getByText(/refund follows/));
      expect(dialog()).not.toBeNull();
    });

    it('stays mounted through the exit animation, then unmounts', async () => {
      render(<Host defaultOpen />);
      await userEvent.keyboard('{Escape}');
      /* Still present: the exit is playing. */
      expect(document.querySelector('.uh-modal')!.getAttribute('data-state')).toBe('closing');
      finishExit();
      expect(document.querySelector('.uh-modal')).toBeNull();
    });
  });

  describe('focus trap', () => {
    it('cycles Tab inside the dialog, both directions', async () => {
      render(
        <Host
          defaultOpen
          footer={
            <>
              <button type="button">Keep booking</button>
              <button type="button">Cancel booking</button>
            </>
          }
        />,
      );
      const close = screen.getByRole('button', { name: 'Close' });
      const last = screen.getByRole('button', { name: 'Cancel booking' });

      last.focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(close);

      await userEvent.tab({ shift: true });
      expect(document.activeElement).toBe(last);
    });

    it('never lets Tab reach the page behind', async () => {
      render(<Host defaultOpen />);
      for (let presses = 0; presses < 5; presses += 1) {
        await userEvent.tab();
        expect(panel().contains(document.activeElement)).toBe(true);
      }
    });
  });

  describe('scroll lock', () => {
    it('holds the body while open and releases after the exit', async () => {
      render(<Host />);
      await userEvent.click(screen.getByRole('button', { name: 'Open modal' }));
      expect(document.body.style.overflow).toBe('hidden');
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('variants', () => {
    it('is a plain dialog by default', () => {
      render(<Host defaultOpen />);
      expect(screen.getByRole('dialog')).toBeDefined();
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });

    /* A question that must be answered is an alertdialog, not a surface. */
    it.each(['confirmation', 'destructive'] as const)('%s is an alertdialog', (variant) => {
      render(<Host defaultOpen variant={variant} />);
      expect(screen.getByRole('alertdialog', { name: 'Cancel this booking?' })).toBeDefined();
    });

    it('marks destructive visually as well', () => {
      render(<Host defaultOpen variant="destructive" />);
      expect(panel().dataset.variant).toBe('destructive');
      expect(document.querySelector('.uh-modal__warning')).not.toBeNull();
    });
  });

  describe('sizes', () => {
    it.each(['sm', 'md', 'lg', 'fullscreen'] as const)('carries %s through', (size) => {
      render(<Host defaultOpen size={size} />);
      expect(document.querySelector('.uh-modal')!.getAttribute('data-size')).toBe(size);
    });
  });

  describe('accessibility', () => {
    it('has no violations open, footer and all', async () => {
      render(
        <Host
          defaultOpen
          footer={
            <>
              <button type="button">Keep booking</button>
              <button type="button">Cancel booking</button>
            </>
          }
        />,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations as a destructive alertdialog', async () => {
      render(<Host defaultOpen variant="destructive" />);
      await expectNoA11yViolations(document.body);
    });
  });
});
