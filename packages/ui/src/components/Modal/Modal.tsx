import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useInheritedContext } from '../../hooks/useInheritedContext.js';
import { usePresence } from '../../hooks/usePresence.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import { CloseIcon, StatusIcon } from '../../lib/icons.js';

export type ModalSize = 'sm' | 'md' | 'lg' | 'fullscreen';
export type ModalVariant = 'default' | 'confirmation' | 'destructive';

export interface ModalProps {
  open: boolean;
  /**
   * Fired for every way out: the close button, Escape, the overlay. A dialog
   * is controlled by definition - there is no uncontrolled mode to reach for.
   */
  onClose: () => void;
  /** Required: a dialog with no name is a box that interrupts. */
  title: string;
  /** Wired to `aria-describedby`; omit it and the attribute is left off entirely. */
  description?: string | undefined;
  children?: ReactNode | undefined;
  /** The action row. Consumers pass their own Buttons; the modal owns none. */
  footer?: ReactNode | undefined;
  /** `fullscreen` drops the max-width and border-radius - the panel becomes the page. */
  size?: ModalSize | undefined;
  /**
   * confirmation and destructive render as alertdialog: a question that must
   * be answered, not a surface to browse. destructive additionally marks the
   * title so the stylesheet can warn.
   */
  variant?: ModalVariant | undefined;
  /** Default `true`. Set `false` for a destructive step the pilgrim must answer explicitly. */
  closeOnOverlayClick?: boolean | undefined;
  /** Default `true`. Set `false` alongside `closeOnOverlayClick` to force an explicit choice. */
  closeOnEsc?: boolean | undefined;
  /** Where focus lands on open; default is the first focusable element. */
  initialFocus?: RefObject<HTMLElement | null> | undefined;
  /** Accessible name of the header close button. Default `'Close'`. */
  closeLabel?: string | undefined;
  /** Appended to the panel's own class list. */
  className?: string | undefined;
}

export function Modal(props: ModalProps) {
  const {
    open,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    variant = 'default',
    closeOnOverlayClick = true,
    closeOnEsc = true,
    initialFocus,
    closeLabel = 'Close',
    className,
  } = props;

  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descriptionId = `${reactId}-description`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  /*
   * A sentinel left in the modal's own tree position, purely to read the
   * ambient data-theme/lang before the panel leaves for document.body. A
   * portalled node's ancestors are document.body's, not this component's
   * JSX parents - without this, an app or story themed via a wrapper div
   * would render the panel in whatever the page root falls back to instead.
   */
  const sentinelRef = useRef<HTMLSpanElement | null>(null);

  /* The exit choreography lives in usePresence; see the hook. */
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

  const alert = variant !== 'default';

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />
      {createPortal(
        <div
          className="uh-modal"
          data-state={phase}
          data-size={size}
          data-theme={inherited.theme}
          lang={inherited.lang}
        >
          {/*
           * The scrim is a sibling, not the click target's parent: pointer-down
           * on the panel that ends outside (a missed drag) must not close.
           */}
          <div
            className="uh-modal__backdrop"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />

          <div
            ref={panelRef}
            role={alert ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={['uh-modal__panel', className].filter(Boolean).join(' ')}
            data-variant={variant}
          >
            <header className="uh-modal__header">
              {variant === 'destructive' ? (
                <span className="uh-modal__warning" aria-hidden="true">
                  <StatusIcon variant="warning" />
                </span>
              ) : null}
              <h2 id={titleId} className="uh-modal__title">
                {title}
              </h2>
              <button
                type="button"
                className="uh-close-button uh-modal__close"
                aria-label={closeLabel}
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </header>

            {description ? (
              <p id={descriptionId} className="uh-modal__description">
                {description}
              </p>
            ) : null}

            {children ? <div className="uh-modal__body">{children}</div> : null}

            {footer ? <footer className="uh-modal__footer">{footer}</footer> : null}
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
  Modal.displayName = 'Modal';
}
