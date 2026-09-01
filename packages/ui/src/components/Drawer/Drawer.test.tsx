import { useRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Drawer, type DrawerProps } from './Drawer.js';

const dialog = () => screen.queryByRole('dialog');
const panel = () => document.querySelector('.uh-drawer__panel') as HTMLElement;
const root = () => document.querySelector('.uh-drawer') as HTMLElement;

const finishExit = () => {
  const node = panel();
  if (node) fireEvent(node, new Event('animationend'));
};

function Host(props: Partial<DrawerProps> & { defaultOpen?: boolean }) {
  const { defaultOpen = true, ...rest } = props;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open drawer
      </button>
      <Drawer title="Booking summary" {...rest} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe('Drawer', () => {
  it('renders nothing while closed', () => {
    render(<Host defaultOpen={false} />);
    expect(dialog()).toBeNull();
  });

  it('is a labelled modal dialog portalled to the body', () => {
    render(<Host />);
    const node = screen.getByRole('dialog', { name: 'Booking summary' });
    expect(node.getAttribute('aria-modal')).toBe('true');
    expect(node.closest('.uh-drawer')?.parentElement).toBe(document.body);
  });

  it('takes aria-label when there is no visible title', () => {
    render(<Host title={undefined} aria-label="Notifications" />);
    expect(screen.getByRole('dialog', { name: 'Notifications' })).toBeDefined();
  });

  describe('the modal contract', () => {
    it('closes on Escape and returns focus to the trigger', async () => {
      render(<Host defaultOpen={false} />);
      const trigger = screen.getByRole('button', { name: 'Open drawer' });
      await userEvent.click(trigger);
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });

    it('can refuse Escape and the backdrop', async () => {
      render(<Host closeOnEsc={false} closeOnOverlayClick={false} />);
      await userEvent.keyboard('{Escape}');
      await userEvent.click(document.querySelector('.uh-drawer__backdrop')!);
      expect(dialog()).not.toBeNull();
    });

    it('closes on the backdrop by default', async () => {
      render(<Host />);
      await userEvent.click(document.querySelector('.uh-drawer__backdrop')!);
      finishExit();
      expect(dialog()).toBeNull();
    });

    it('locks the body and releases after the exit', async () => {
      render(<Host />);
      expect(document.body.style.overflow).toBe('hidden');
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(document.body.style.overflow).not.toBe('hidden');
    });

    it('traps Tab and honours initialFocus', async () => {
      function WithInitial() {
        const [open, setOpen] = useState(true);
        const primary = useRef<HTMLButtonElement | null>(null);
        return (
          <Drawer
            open={open}
            onClose={() => setOpen(false)}
            title="Booking summary"
            initialFocus={primary}
            footer={
              <button type="button" ref={primary}>
                Continue to payment
              </button>
            }
          />
        );
      }
      render(<WithInitial />);
      const primary = screen.getByRole('button', { name: 'Continue to payment' });
      expect(document.activeElement).toBe(primary);

      await userEvent.tab();
      expect(panel().contains(document.activeElement)).toBe(true);
    });

    it('stays mounted through the exit, then unmounts', async () => {
      render(<Host />);
      await userEvent.keyboard('{Escape}');
      expect(root().getAttribute('data-state')).toBe('closing');
      finishExit();
      expect(document.querySelector('.uh-drawer')).toBeNull();
    });
  });

  describe('sides and sizes', () => {
    it('defaults to the right at md', () => {
      render(<Host />);
      expect(root().dataset.side).toBe('right');
      expect(root().dataset.size).toBe('md');
    });

    it.each(['left', 'right'] as const)('carries side %s through', (side) => {
      render(<Host side={side} />);
      expect(root().dataset.side).toBe(side);
    });

    it.each(['sm', 'md', 'lg'] as const)('carries size %s through', (size) => {
      render(<Host size={size} />);
      expect(root().dataset.size).toBe(size);
    });
  });

  describe('accessibility', () => {
    it('has no violations with header, body and footer', async () => {
      render(
        <Host footer={<button type="button">Continue to payment</button>}>
          <p>Summary content</p>
        </Host>,
      );
      await expectNoA11yViolations(document.body);
    });
  });
});
