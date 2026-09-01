import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { usePresence } from '../../hooks/usePresence.js';
import { CloseIcon, StatusIcon, type StatusVariant } from '../../lib/icons.js';

export type AlertVariant = StatusVariant;
export type AlertLayout = 'inline' | 'banner';

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertProps {
  variant?: AlertVariant | undefined;
  /**
   * inline: a bordered, radiused box that sits inside a card or a form -
   * a validation summary, a sold-out notice on a package page. banner:
   * edge-to-edge, square corners, meant to sit at the top of a page or
   * section - "You're offline", "Prices shown include tax".
   */
  layout?: AlertLayout | undefined;
  title?: string | undefined;
  children?: ReactNode | undefined;
  actions?: AlertAction[] | undefined;
  dismissible?: boolean | undefined;
  /** Fires once the exit animation finishes, not on the click itself. */
  onDismiss?: (() => void) | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

/**
 * error and warning interrupt (role="alert" - assertive); success and info
 * report (role="status" - polite). Unlike Toast, this role sits directly on
 * the rendered element rather than going through the shared announce()
 * utility: Alert is not portalled and is not part of a churning list, so a
 * role already present at insertion is the reliable, standard case role="
 * alert" was designed for - the double-announcement risk that pushed Toast
 * to a hidden live region does not apply here.
 */
export function Alert(props: AlertProps) {
  const {
    variant = 'info',
    layout = 'inline',
    title,
    children,
    actions,
    dismissible = false,
    onDismiss,
    closeLabel = 'Dismiss',
    className,
  } = props;

  const reactId = useId();
  const titleId = `${reactId}-title`;
  const rootRef = useRef<HTMLDivElement | null>(null);

  /* No open/onClose prop pair: unlike Modal, an Alert's presence is decided
     by whether the parent renders it at all. This local state exists only
     so a dismiss has somewhere to animate to before onDismiss tells the
     parent it is safe to stop rendering. */
  const [open, setOpen] = useState(true);
  const phase = usePresence(open, rootRef);

  useEffect(() => {
    if (phase === 'closed') onDismiss?.();
  }, [phase, onDismiss]);

  if (phase === 'closed') return null;

  return (
    <div
      ref={rootRef}
      role={variant === 'error' || variant === 'warning' ? 'alert' : 'status'}
      aria-labelledby={title ? titleId : undefined}
      className={['uh-alert', className].filter(Boolean).join(' ')}
      data-state={phase}
      data-variant={variant}
      data-layout={layout}
    >
      <span className="uh-alert__icon" aria-hidden="true">
        <StatusIcon variant={variant} />
      </span>

      <div className="uh-alert__body">
        {title ? (
          <p id={titleId} className="uh-alert__title">
            {title}
          </p>
        ) : null}
        {children ? <div className="uh-alert__description">{children}</div> : null}
        {actions && actions.length > 0 ? (
          <div className="uh-alert__actions">
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="uh-alert__action"
                onClick={action.onClick}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {dismissible ? (
        <button
          type="button"
          className="uh-close-button uh-alert__close"
          data-size="sm"
          aria-label={closeLabel}
          onClick={() => setOpen(false)}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
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
  Alert.displayName = 'Alert';
}
