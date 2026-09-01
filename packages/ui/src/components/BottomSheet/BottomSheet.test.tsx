import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { BottomSheet, type BottomSheetProps } from './BottomSheet.js';

const dialog = () => screen.queryByRole('dialog');
const panel = () => document.querySelector('.uh-sheet__panel') as HTMLElement;
const handle = () => screen.getByRole('slider', { name: 'Resize sheet' });

const finishExit = () => {
  const node = panel();
  if (node) fireEvent(node, new Event('animationend'));
};

/** A drag, as the browser reports one: down, moves with timestamps, up. */
function dragBy(target: Element, deltaY: number, options: { fast?: boolean } = {}) {
  const step = options.fast ? 2 : 40;
  fireEvent.pointerDown(target, { clientY: 300, timeStamp: 1000, pointerId: 1 });
  const moves = 4;
  for (let index = 1; index <= moves; index += 1) {
    fireEvent.pointerMove(panel(), {
      clientY: 300 + (deltaY * index) / moves,
      timeStamp: 1000 + step * index,
      pointerId: 1,
    });
  }
  fireEvent.pointerUp(panel(), { pointerId: 1 });
}

function Host(props: Partial<BottomSheetProps> & { defaultOpen?: boolean }) {
  const { defaultOpen = true, ...rest } = props;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <BottomSheet title="Filters" {...rest} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

describe('BottomSheet', () => {
  it('renders nothing while closed', () => {
    render(<Host defaultOpen={false} />);
    expect(dialog()).toBeNull();
  });

  it('is a labelled modal dialog portalled to the body', () => {
    render(<Host />);
    const node = screen.getByRole('dialog', { name: 'Filters' });
    expect(node.getAttribute('aria-modal')).toBe('true');
    expect(node.closest('.uh-sheet')?.parentElement).toBe(document.body);
  });

  it('takes aria-label when there is no visible title', () => {
    render(<Host title={undefined} aria-label="Filter packages" />);
    expect(screen.getByRole('dialog', { name: 'Filter packages' })).toBeDefined();
  });

  describe('modal contract, same as Modal', () => {
    it('closes on Escape', async () => {
      render(<Host />);
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(dialog()).toBeNull();
    });

    it('closes on the backdrop', async () => {
      render(<Host />);
      await userEvent.click(document.querySelector('.uh-sheet__backdrop')!);
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

    it('traps Tab inside the panel', async () => {
      render(<Host footer={<button type="button">Apply</button>} />);
      const apply = screen.getByRole('button', { name: 'Apply' });
      apply.focus();
      await userEvent.tab();
      expect(panel().contains(document.activeElement)).toBe(true);
    });

    it('returns focus to the trigger on close', async () => {
      render(<Host defaultOpen={false} />);
      const trigger = screen.getByRole('button', { name: 'Open sheet' });
      await userEvent.click(trigger);
      await userEvent.keyboard('{Escape}');
      finishExit();
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe('snap points', () => {
    it('opens at initialSnap and sizes from the fraction', () => {
      render(<Host snapPoints={[0.4, 0.9]} initialSnap={1} />);
      expect(handle().getAttribute('aria-valuenow')).toBe('1');
      expect(panel().style.height).toContain('90dvh');
      expect(panel().style.height).toContain('var(--uh-size-sheet-max-height)');
    });

    it('announces the snap as a value, not an index', () => {
      render(<Host snapPoints={[0.4, 0.9]} initialSnap={0} />);
      expect(handle().getAttribute('aria-valuetext')).toBe('40% of the screen');
    });

    it('resizes from the keyboard: arrows, Home, End', async () => {
      render(<Host snapPoints={[0.3, 0.6, 0.9]} initialSnap={0} />);
      handle().focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(handle().getAttribute('aria-valuenow')).toBe('1');
      await userEvent.keyboard('{End}');
      expect(handle().getAttribute('aria-valuenow')).toBe('2');
      await userEvent.keyboard('{Home}');
      expect(handle().getAttribute('aria-valuenow')).toBe('0');
    });

    it('ArrowDown at the lowest snap closes', async () => {
      render(<Host snapPoints={[0.5]} />);
      handle().focus();
      await userEvent.keyboard('{ArrowDown}');
      finishExit();
      expect(dialog()).toBeNull();
    });

    it('sanitises nonsense snap points instead of crashing', () => {
      render(<Host snapPoints={[Number.NaN, -1, 2, 0.5]} initialSnap={99} />);
      expect(handle().getAttribute('aria-valuemax')).toBe('0');
      expect(panel().style.height).toContain('50dvh');
    });
  });

  describe('drag', () => {
    it('follows the finger while dragging', () => {
      render(<Host />);
      fireEvent.pointerDown(handle(), { clientY: 300, timeStamp: 1000, pointerId: 1 });
      fireEvent.pointerMove(panel(), { clientY: 380, timeStamp: 1100, pointerId: 1 });
      expect(panel().dataset.dragging).toBe('true');
      expect(panel().style.transform).toBe('translateY(80px)');
    });

    it('a slow small drag settles back', () => {
      render(<Host />);
      Object.defineProperty(panel(), 'offsetHeight', { configurable: true, value: 500 });
      dragBy(handle(), 60);
      expect(dialog()).not.toBeNull();
      expect(panel().style.transform).toBe('');
    });

    it('dragging far past the rest closes from the lowest snap', () => {
      render(<Host />);
      Object.defineProperty(panel(), 'offsetHeight', { configurable: true, value: 500 });
      dragBy(handle(), 250);
      finishExit();
      expect(dialog()).toBeNull();
    });

    it('a downward flick steps down a snap before closing', () => {
      render(<Host snapPoints={[0.4, 0.9]} initialSnap={1} />);
      Object.defineProperty(panel(), 'offsetHeight', { configurable: true, value: 700 });
      dragBy(handle(), 120, { fast: true });
      expect(dialog()).not.toBeNull();
      expect(handle().getAttribute('aria-valuenow')).toBe('0');
    });

    it('an upward flick steps up a snap', () => {
      render(<Host snapPoints={[0.4, 0.9]} initialSnap={0} />);
      dragBy(handle(), -120, { fast: true });
      expect(handle().getAttribute('aria-valuenow')).toBe('1');
    });

    it('scrollable content keeps its gestures unless it sits at the top', () => {
      render(
        <Host scrollable>
          <p>Long content</p>
        </Host>,
      );
      const body = document.querySelector('.uh-sheet__body') as HTMLElement;

      /* Mid-scroll: a drag on content must not move the sheet. */
      Object.defineProperty(body, 'scrollTop', { configurable: true, value: 120 });
      fireEvent.pointerDown(body, { clientY: 300, timeStamp: 1000, pointerId: 1 });
      fireEvent.pointerMove(panel(), { clientY: 400, timeStamp: 1100, pointerId: 1 });
      expect(panel().dataset.dragging).toBeUndefined();

      /* At the top, a downward drag is unambiguous. */
      Object.defineProperty(body, 'scrollTop', { configurable: true, value: 0 });
      fireEvent.pointerDown(body, { clientY: 300, timeStamp: 2000, pointerId: 1 });
      fireEvent.pointerMove(panel(), { clientY: 400, timeStamp: 2100, pointerId: 1 });
      expect(panel().dataset.dragging).toBe('true');
    });
  });

  describe('reopening', () => {
    it('starts back at initialSnap', async () => {
      render(<Host defaultOpen={false} snapPoints={[0.4, 0.9]} initialSnap={0} />);
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));
      handle().focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(handle().getAttribute('aria-valuenow')).toBe('1');

      await userEvent.keyboard('{Escape}');
      finishExit();
      await userEvent.click(screen.getByRole('button', { name: 'Open sheet' }));
      expect(handle().getAttribute('aria-valuenow')).toBe('0');
    });
  });

  describe('without a handle', () => {
    it('still closes and renders, minus the slider', () => {
      render(<Host dragHandle={false} />);
      expect(screen.queryByRole('slider')).toBeNull();
      expect(dialog()).not.toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has no violations with footer and scrollable body', async () => {
      render(
        <Host scrollable footer={<button type="button">Apply filters</button>}>
          <p>Filter content</p>
        </Host>,
      );
      await expectNoA11yViolations(document.body);
    });

    it('takes translated labels', () => {
      render(
        <Host
          labels={{
            close: 'Tutup',
            resize: 'Ubah saiz helaian',
            snapValue: (p) => `${p}% daripada skrin`,
          }}
        />,
      );
      expect(screen.getByRole('button', { name: 'Tutup' })).toBeDefined();
      expect(
        screen.getByRole('slider', { name: 'Ubah saiz helaian' }).getAttribute('aria-valuetext'),
      ).toBe('60% daripada skrin');
    });
  });
});

/* The FilterPanel contract: sheet + sticky footer + scrollable content. */
describe('BottomSheet as the FilterPanel host', () => {
  it('holds header, scrollable filters and a sticky Apply row at once', () => {
    const onApply = vi.fn();
    render(
      <Host
        title="Filter packages"
        scrollable
        snapPoints={[0.5, 0.9]}
        footer={
          <button type="button" onClick={onApply}>
            Apply filters
          </button>
        }
      >
        <label>
          <input type="checkbox" /> Direct flights only
        </label>
      </Host>,
    );
    expect(screen.getByRole('dialog', { name: 'Filter packages' })).toBeDefined();
    expect(screen.getByRole('checkbox')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
