import { act, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { expectNoA11yViolations } from '../../test/a11y.js';
import { resetAnnouncer } from '../../lib/announcer.js';
import { ToastProvider, useToast, type ToastContextValue } from './index.js';

/* Every closing toast still needs its animationend to fire, same as Modal
   and BottomSheet - jsdom never dispatches it on its own. */
const settle = (node: Element | null) => {
  if (node) fireEvent(node, new Event('animationend'));
};
const settleAll = () => {
  document.querySelectorAll('.uh-toast[data-state="closing"]').forEach(settle);
};

/* A plain mutable box the tests read from between renders. Written in an
   effect, never inline during render - the same rule Modal's phase sync and
   BottomSheet's reopen reset both had to respect earlier in this package. */
const capturedRef: { current: ToastContextValue | null } = { current: null };

function Capture() {
  const toast = useToast();
  useEffect(() => {
    capturedRef.current = toast;
  });
  return null;
}

function stack() {
  return within(document.querySelector('.uh-toast-viewport') as HTMLElement);
}

/** True once the described toast text is nowhere in the stack - including
    the case where the whole viewport has unmounted because nothing is left. */
function goneFromStack(text: string): boolean {
  const viewport = document.querySelector('.uh-toast-viewport');
  if (!viewport) return true;
  return within(viewport as HTMLElement).queryByText(text) === null;
}

function renderProvider(props: Partial<Parameters<typeof ToastProvider>[0]> = {}) {
  return render(
    <ToastProvider {...props}>
      <Capture />
    </ToastProvider>,
  );
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetAnnouncer();
  });

  it('throws when useToast is called outside a ToastProvider', () => {
    function Bare() {
      useToast();
      return null;
    }
    /* Expected error is still logged by React; suppress the console noise. */
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow('useToast must be used within a ToastProvider.');
    spy.mockRestore();
  });

  it('renders nothing extra until a toast is shown', () => {
    renderProvider();
    expect(document.querySelector('.uh-toast-viewport')).toBeNull();
  });

  it('shows a description, portalled to the body', () => {
    renderProvider();
    act(() => {
      capturedRef.current!.show({ description: 'Booking confirmed.' });
    });
    const toast = stack().getByText('Booking confirmed.').closest('.uh-toast')!;
    expect(toast.closest('.uh-toast-viewport')?.parentElement).toBe(document.body);
  });

  it('renders an optional title above the description', () => {
    renderProvider();
    act(() => {
      capturedRef.current!.show({ title: 'Saved', description: 'Your changes were saved.' });
    });
    expect(stack().getByText('Saved')).toBeDefined();
    expect(stack().getByText('Your changes were saved.')).toBeDefined();
  });

  describe('variant shorthands', () => {
    it.each(['success', 'warning', 'error', 'info'] as const)(
      'stamps data-variant for %s',
      (variant) => {
        renderProvider();
        act(() => {
          capturedRef.current![variant]('A message.');
        });
        expect(document.querySelector(`.uh-toast[data-variant="${variant}"]`)).not.toBeNull();
      },
    );

    it('default has no status icon', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Plain.' });
      });
      expect(document.querySelector('.uh-toast__icon')).toBeNull();
    });
  });

  describe('dismissal', () => {
    it('closes on the close button', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Dismiss me.' });
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
      });
      settleAll();
      expect(goneFromStack('Dismiss me.')).toBe(true);
    });

    it('the returned handle dismisses its own toast', () => {
      renderProvider();
      let handle: ReturnType<ToastContextValue['show']>;
      act(() => {
        handle = capturedRef.current!.show({ description: 'Handled.' });
      });
      act(() => {
        handle.dismiss();
      });
      settleAll();
      expect(goneFromStack('Handled.')).toBe(true);
    });

    it('dismissAll clears every active toast', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'One.' });
        capturedRef.current!.show({ description: 'Two.' });
      });
      act(() => {
        capturedRef.current!.dismissAll();
      });
      settleAll();
      expect(goneFromStack('One.')).toBe(true);
      expect(goneFromStack('Two.')).toBe(true);
    });

    it('an action button fires its own handler without dismissing the toast', () => {
      const onClick = vi.fn();
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Undo?', action: { label: 'Undo', onClick } });
      });
      act(() => {
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      });
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(stack().queryByText('Undo?')).not.toBeNull();
    });
  });

  describe('auto-dismiss', () => {
    it('default dismisses itself after its duration', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Going away.' });
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      settleAll();
      expect(goneFromStack('Going away.')).toBe(true);
    });

    it('error never times out - a payment failure waits for a person', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.error('Payment failed.');
      });
      act(() => {
        vi.advanceTimersByTime(60_000);
      });
      expect(stack().queryByText('Payment failed.')).not.toBeNull();
    });

    it('a caller can override the default duration, including turning it off', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({
          description: 'Sticks around.',
          variant: 'success',
          duration: null,
        });
      });
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(stack().queryByText('Sticks around.')).not.toBeNull();
    });

    it('hovering holds the clock, and it resumes on mouseleave', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Read me.' });
      });
      const toast = stack().getByText('Read me.').closest('.uh-toast')!;

      fireEvent.mouseEnter(toast);
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(stack().queryByText('Read me.')).not.toBeNull();

      fireEvent.mouseLeave(toast);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      settleAll();
      expect(goneFromStack('Read me.')).toBe(true);
    });

    it('focus inside the toast holds the clock the same way hover does', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Focused.' });
      });
      const closeButton = screen.getByRole('button', { name: 'Dismiss' });
      fireEvent.focus(closeButton);
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(stack().queryByText('Focused.')).not.toBeNull();
      fireEvent.blur(closeButton);
    });

    it('only resumes once every hold - hover and focus together - has released', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'Double held.' });
      });
      const toast = stack().getByText('Double held.').closest<HTMLElement>('.uh-toast')!;
      const closeButton = within(toast).getByRole('button', { name: 'Dismiss' });

      fireEvent.mouseEnter(toast);
      fireEvent.focus(closeButton);
      fireEvent.blur(closeButton);
      /* Still hovered - releasing focus alone must not restart the clock. */
      act(() => {
        vi.advanceTimersByTime(10_000);
      });
      expect(stack().queryByText('Double held.')).not.toBeNull();

      fireEvent.mouseLeave(toast);
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      settleAll();
      expect(goneFromStack('Double held.')).toBe(true);
    });
  });

  describe('stacking', () => {
    it('keeps multiple toasts visible at once', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ description: 'First.' });
        capturedRef.current!.show({ description: 'Second.' });
      });
      expect(stack().getByText('First.')).toBeDefined();
      expect(stack().getByText('Second.')).toBeDefined();
    });

    it('dismisses the oldest active toast once the limit is exceeded', () => {
      renderProvider({ limit: 2 });
      act(() => {
        capturedRef.current!.show({ description: 'A.' });
        capturedRef.current!.show({ description: 'B.' });
        capturedRef.current!.show({ description: 'C.' });
      });
      settleAll();
      expect(stack().queryByText('A.')).toBeNull();
      expect(stack().getByText('B.')).toBeDefined();
      expect(stack().getByText('C.')).toBeDefined();
    });

    it('reads position through to the viewport', () => {
      renderProvider({ position: 'top-right' });
      act(() => {
        capturedRef.current!.show({ description: 'Positioned.' });
      });
      expect(document.querySelector('.uh-toast-viewport')?.getAttribute('data-position')).toBe(
        'top-right',
      );
    });
  });

  describe('announcements', () => {
    it('announces the description through the shared live region', async () => {
      renderProvider();
      act(() => {
        capturedRef.current!.show({ title: 'Saved', description: 'Your changes were saved.' });
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      const region = document.querySelector('[aria-live="polite"]');
      expect(region?.textContent).toBe('Saved. Your changes were saved.');
    });

    it('announces error toasts assertively', () => {
      renderProvider();
      act(() => {
        capturedRef.current!.error('Payment failed.');
      });
      act(() => {
        vi.advanceTimersByTime(50);
      });
      const region = document.querySelector('[aria-live="assertive"]');
      expect(region?.textContent).toBe('Payment failed.');
    });
  });

  describe('accessibility', () => {
    it('has no violations with a mixed stack, including an action button', async () => {
      vi.useRealTimers();
      renderProvider();
      act(() => {
        capturedRef.current!.show({ title: 'Saved', description: 'Your changes were saved.' });
        capturedRef.current!.error('Payment failed. Try another card.');
        capturedRef.current!.show({
          description: 'Seat released.',
          action: { label: 'Undo', onClick: () => {} },
        });
      });
      await expectNoA11yViolations(document.body);
    });
  });
});
