import { useEffect, type RefObject } from 'react';

/** What Tab can land on. Shared by the trap and by anyone walking a panel. */
export const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), ' +
  'textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface FocusTrapOptions {
  /**
   * Where focus lands when the trap engages. Left out, the first focusable
   * element takes it; an empty container falls back to the container itself.
   */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Where focus returns when the trap releases. Defaults to whatever had it. */
  returnFocus?: RefObject<HTMLElement | null> | undefined;
}

/**
 * Keeps Tab inside a modal surface, and gives focus back when it ends.
 *
 * Extracted from PickerLayer's sheet mode so Modal, BottomSheet and Drawer do
 * not each grow their own trap. Deliberately Tab-only: pointer events outside
 * are the owner's business (close, or ignore), and aria-modal already tells
 * assistive tech the rest of the page is inert.
 */
export function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  options: FocusTrapOptions = {},
): void {
  const { initialFocus, returnFocus } = options;

  useEffect(() => {
    if (!active) return undefined;
    const container = containerRef.current;
    if (!container) return undefined;

    const previous =
      returnFocus?.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    const target =
      initialFocus?.current ?? container.querySelector<HTMLElement>(FOCUSABLE) ?? container;
    target.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Tab') return;
      const node = containerRef.current;
      if (!node) return;
      const stops = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (stops.length === 0) {
        event.preventDefault();
        return;
      }
      const first = stops[0]!;
      const last = stops[stops.length - 1]!;
      const current = document.activeElement;
      /* Focus that escaped (a portal inside the modal, a programmatic move)
         is pulled back to the edge it left from rather than left loose. */
      if (event.shiftKey && (current === first || !node.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !node.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previous?.focus();
    };
    /* Ref objects are stable by contract (useRef identity); listing them
       satisfies the linter without ever re-engaging a live trap. */
  }, [active, containerRef, initialFocus, returnFocus]);
}
