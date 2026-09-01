import { useCallback, useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

import { MOBILE_QUERY } from '../../hooks/breakpoints.js';
import { useAnchoredPortal } from '../../hooks/useAnchoredPortal.js';
import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import { CloseIcon } from '../../lib/icons.js';

/** Why the layer closed. The caller decides where focus belongs for each. */
export type CloseReason = 'escape' | 'outside' | 'button';

export interface PickerLayerProps {
  open: boolean;
  onClose: (reason: CloseReason) => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** Names the dialog. On a phone it is also the sheet's visible heading. */
  label: string;
  children: ReactNode;
  footer?: ReactNode | undefined;
  closeLabel: string;
}

/**
 * The surface a calendar opens onto.
 *
 * On a phone it is a modal bottom sheet: a backdrop, a focus trap, and the
 * page behind held still. On anything wider it is a popover anchored to the
 * trigger. These are genuinely different things rather than one thing
 * restyled, which is why the choice is made in script from the breakpoint
 * token instead of in a media query.
 *
 * Either way it is portalled to the body, so an `overflow: hidden` ancestor
 * cannot clip it.
 */
export function PickerLayer({
  open,
  onClose,
  anchorRef,
  label,
  children,
  footer,
  closeLabel,
}: PickerLayerProps) {
  const mobile = useMediaQuery(MOBILE_QUERY);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const closeFromOutside = useCallback(() => onClose('outside'), [onClose]);

  const inherited = useAnchoredPortal({
    open,
    anchorRef,
    panelRef,
    /* On a phone the sheet is pinned to the bottom of the screen and is not
       anchored to the trigger at all. */
    enabled: !mobile,
    onOutside: closeFromOutside,
  });

  /* The page behind a sheet must not scroll under the pilgrim's thumb. */
  useScrollLock(open && mobile);

  /* A modal sheet keeps Tab inside it; the desktop popover deliberately does
     not, so tabbing onward stays a way out rather than a trap. */
  useFocusTrap(open && mobile, panelRef);

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose('escape');
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  const panel = (
    <div
      ref={panelRef}
      className="uh-picker__panel"
      role="dialog"
      aria-label={label}
      aria-modal={mobile ? true : undefined}
      data-mobile={mobile ? 'true' : undefined}
    >
      {mobile ? (
        <div className="uh-picker__sheet-header">
          <span className="uh-picker__sheet-title">{label}</span>
          <button
            type="button"
            className="uh-close-button uh-picker__close"
            aria-label={closeLabel}
            onClick={() => onClose('button')}
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}

      <div className="uh-picker__body">{children}</div>
      {footer ? <div className="uh-picker__footer">{footer}</div> : null}
    </div>
  );

  return createPortal(
    <div
      className="uh-picker__layer"
      data-mobile={mobile ? 'true' : undefined}
      data-theme={inherited.theme}
      lang={inherited.lang}
    >
      {/* Decorative: closing is already on Escape and on the labelled button. */}
      {mobile ? <div className="uh-picker__backdrop" aria-hidden="true" /> : null}
      {panel}
    </div>,
    document.body,
  );
}
