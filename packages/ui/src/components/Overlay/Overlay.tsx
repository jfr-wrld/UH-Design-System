import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useInheritedContext } from '../../hooks/useInheritedContext.js';
import { usePresence } from '../../hooks/usePresence.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';

export type OverlayRole = 'dialog' | 'alertdialog';

export interface OverlayProps {
  open: boolean;
  /** Fired for every way out: Escape, the backdrop. An overlay is controlled
      by definition - there is no uncontrolled mode to reach for. */
  onClose: () => void;
  /** Arbitrary content - a form, a photo, a confirmation strip. Unlike
      `Modal`, this owns no header, title, or footer of its own; the panel
      is bare, so whatever is put inside supplies its own chrome (wrap it in
      `Card` for a bordered surface, or leave it borderless for a lightbox). */
  children: ReactNode;
  /** Accessible name. Required: a dialog with no name is a box that
      interrupts and says nothing about why. */
  'aria-label': string;
  /** `alertdialog` for a question that must be answered rather than a
      surface to browse - same distinction `Modal`'s own `variant` draws.
      @default 'dialog' */
  role?: OverlayRole | undefined;
  /** Default `true`. Set `false` for a destructive step that must be
      answered explicitly rather than dismissed by a stray click. */
  closeOnOverlayClick?: boolean | undefined;
  /** Default `true`. */
  closeOnEsc?: boolean | undefined;
  /** Where focus lands on open; default is the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Appended to the panel's own class list. */
  className?: string | undefined;
}

/**
 * The bare mechanics an overlay needs - a portalled backdrop, a focus trap,
 * a scroll lock, Escape and backdrop-click dismissal - with no visual
 * chrome of its own beyond centering and the enter/exit animation every
 * overlay in this package shares. `Modal` is this same mechanism plus an
 * owned title/body/footer; reach for `Overlay` instead when the content
 * does not fit that shape - a custom form, an image, a bespoke confirmation
 * strip - and would otherwise mean hand-rolling backdrop and focus-trap
 * logic a second time.
 */
export function Overlay(props: OverlayProps) {
  const {
    open,
    onClose,
    children,
    role = 'dialog',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    initialFocus,
    className,
    ...rest
  } = props;

  const panelRef = useRef<HTMLDivElement | null>(null);
  /* Reads the ambient data-theme/lang before the panel leaves for
     document.body - see Modal's own identical sentinel for why. */
  const sentinelRef = useRef<HTMLSpanElement | null>(null);

  const phase = usePresence(open, panelRef);
  const present = phase !== 'closed';

  useScrollLock(present);
  useFocusTrap(phase === 'open', panelRef, { initialFocus });
  const inherited = useInheritedContext(present, sentinelRef);

  useEffect(() => {
    if (phase !== 'open' || !closeOnEsc) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [phase, closeOnEsc, onClose]);

  if (!present) return <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />;

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />
      {createPortal(
        <div
          className="uh-overlay"
          data-state={phase}
          data-theme={inherited.theme}
          lang={inherited.lang}
        >
          {/* The scrim is a sibling, not the click target's parent: pointer-down
              on the panel that ends outside (a missed drag) must not close. */}
          <div
            className="uh-overlay__backdrop"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <div
            ref={panelRef}
            role={role}
            aria-modal="true"
            {...rest}
            className={['uh-overlay__panel', className].filter(Boolean).join(' ')}
          >
            {children}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Overlay.displayName = 'Overlay';
}
