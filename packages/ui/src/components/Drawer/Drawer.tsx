import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useInheritedContext } from '../../hooks/useInheritedContext.js';
import { usePresence } from '../../hooks/usePresence.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import { CloseIcon } from '../../lib/icons.js';

export type DrawerSide = 'left' | 'right';
export type DrawerSize = 'sm' | 'md' | 'lg';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /**
   * Physical, not logical, on purpose: a drawer's side is usually anchored to
   * something on screen (the cart icon top-right, the nav top-left), and that
   * anchor does not move when the text direction does. An RTL layout that
   * wants the mirrored side passes the other value.
   */
  side?: DrawerSide | undefined;
  size?: DrawerSize | undefined;
  /** Names the dialog and heads the panel; aria-label replaces it when absent. */
  title?: string | undefined;
  'aria-label'?: string | undefined;
  children?: ReactNode | undefined;
  footer?: ReactNode | undefined;
  closeOnOverlayClick?: boolean | undefined;
  closeOnEsc?: boolean | undefined;
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

export function Drawer(props: DrawerProps) {
  const {
    open,
    onClose,
    side = 'right',
    size = 'md',
    title,
    children,
    footer,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    initialFocus,
    closeLabel = 'Close',
    className,
  } = props;

  const reactId = useId();
  const titleId = `${reactId}-title`;
  const panelRef = useRef<HTMLDivElement | null>(null);
  /* Reads the ambient data-theme/lang before the panel leaves for
     document.body; see the note on Modal's sentinelRef. */
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

  if (!present) {
    return <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />;
  }

  const ariaLabel = props['aria-label'];

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />
      {createPortal(
        <div
          className="uh-drawer"
          data-state={phase}
          data-side={side}
          data-size={size}
          data-theme={inherited.theme}
          lang={inherited.lang}
        >
          <div
            className="uh-drawer__backdrop"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            {...(ariaLabel && !title
              ? { 'aria-label': ariaLabel }
              : { 'aria-labelledby': titleId })}
            className={['uh-drawer__panel', className].filter(Boolean).join(' ')}
          >
            <header className="uh-drawer__header">
              {title ? (
                <h2 id={titleId} className="uh-drawer__title">
                  {title}
                </h2>
              ) : (
                <span id={titleId} className="uh-sr-only">
                  {ariaLabel}
                </span>
              )}
              <button
                type="button"
                className="uh-close-button uh-drawer__close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </header>

            <div className="uh-drawer__body">{children}</div>

            {footer ? <footer className="uh-drawer__footer">{footer}</footer> : null}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Drawer.displayName = 'Drawer';
}
