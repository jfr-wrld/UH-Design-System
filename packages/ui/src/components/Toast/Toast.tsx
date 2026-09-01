import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { useAutoDismiss } from '../../hooks/useAutoDismiss.js';
import { useInheritedContext } from '../../hooks/useInheritedContext.js';
import { usePresence } from '../../hooks/usePresence.js';
import { announce } from '../../lib/announcer.js';
import { CloseIcon, StatusIcon } from '../../lib/icons.js';
import {
  ToastContext,
  type ToastContextValue,
  type ToastHandle,
  type ToastOptions,
  type ToastPosition,
  type ToastVariant,
} from './useToastContext.js';

export interface ToastProviderProps {
  children?: ReactNode | undefined;
  position?: ToastPosition | undefined;
  /** Toasts visible at once; the oldest active one is dismissed to make room. */
  limit?: number | undefined;
}

interface ToastRecord {
  id: string;
  options: ToastOptions;
  duration: number | null;
  dismissed: boolean;
}

/**
 * default/success/info read and go: five seconds is enough for a sentence.
 * warning gets three more - it is usually asking for a decision. error does
 * not time out: "Payment failed" disappearing on its own is how a person
 * loses track of RM 12,500. Every duration is still adjustable by hover or
 * focus regardless (see useAutoDismiss) - a fixed number is a default, not
 * a guarantee the reader had that long.
 */
const DEFAULT_DURATION: Record<ToastVariant, number | null> = {
  default: 5000,
  success: 4000,
  info: 5000,
  warning: 8000,
  error: null,
};

interface ToastItemProps {
  toast: ToastRecord;
  onExited: (id: string) => void;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onExited, onDismiss }: ToastItemProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const phase = usePresence(!toast.dismissed, panelRef);

  const dismissThis = useCallback(() => onDismiss(toast.id), [onDismiss, toast.id]);
  const { hold, release } = useAutoDismiss(toast.duration, phase === 'open', dismissThis);

  /* Removing the record is a side effect on a sibling's state, not this
     component's own render output - it belongs in an effect, not inline
     during render, even though the outcome (this instance renders nothing
     once closed) is decided synchronously below. */
  useEffect(() => {
    if (phase === 'closed') onExited(toast.id);
  }, [phase, onExited, toast.id]);

  if (phase === 'closed') return null;

  const { title, description, variant = 'default', action, closeLabel = 'Dismiss' } = toast.options;

  return (
    <div
      ref={panelRef}
      className="uh-toast"
      data-state={phase}
      data-variant={variant}
      onMouseEnter={() => hold('hover')}
      onMouseLeave={() => release('hover')}
      onFocus={() => hold('focus')}
      onBlur={() => release('focus')}
    >
      {variant !== 'default' ? (
        <span className="uh-toast__icon" aria-hidden="true">
          <StatusIcon variant={variant} />
        </span>
      ) : null}

      <div className="uh-toast__body">
        {title ? <p className="uh-toast__title">{title}</p> : null}
        <p className="uh-toast__description">{description}</p>
        {action ? (
          <button type="button" className="uh-toast__action" onClick={action.onClick}>
            {action.label}
          </button>
        ) : null}
      </div>

      <button
        type="button"
        className="uh-close-button uh-toast__close"
        data-size="sm"
        aria-label={closeLabel}
        onClick={dismissThis}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function announcement(options: ToastOptions): string {
  return options.title ? `${options.title}. ${options.description}` : options.description;
}

export function ToastProvider(props: ToastProviderProps) {
  const { children, position = 'bottom-center', limit = 4 } = props;

  const providerId = useId();
  const counterRef = useRef(0);
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const sentinelRef = useRef<HTMLSpanElement | null>(null);
  const inherited = useInheritedContext(toasts.length > 0, sentinelRef);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.map((t) => (t.id === id ? { ...t, dismissed: true } : t)));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts((current) => current.map((t) => ({ ...t, dismissed: true })));
  }, []);

  const onExited = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions): ToastHandle => {
      counterRef.current += 1;
      const id = `${providerId}-toast-${counterRef.current}`;
      const variant = options.variant ?? 'default';
      const duration =
        options.duration !== undefined ? options.duration : DEFAULT_DURATION[variant];

      setToasts((current) => {
        const next = [...current, { id, options, duration, dismissed: false }];
        const active = next.filter((t) => !t.dismissed);
        if (active.length <= limit) return next;
        const overflow = new Set(active.slice(0, active.length - limit).map((t) => t.id));
        return next.map((t) => (overflow.has(t.id) ? { ...t, dismissed: true } : t));
      });

      announce(announcement(options), variant === 'error' ? 'assertive' : 'polite');
      return { id, dismiss: () => dismiss(id) };
    },
    [providerId, limit, dismiss],
  );

  const variantShorthand = useCallback(
    (variant: ToastVariant) =>
      (description: string, options?: Omit<ToastOptions, 'description' | 'variant'>) =>
        show({ ...options, description, variant }),
    [show],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: variantShorthand('success'),
      warning: variantShorthand('warning'),
      error: variantShorthand('error'),
      info: variantShorthand('info'),
      dismiss,
      dismissAll,
    }),
    [show, variantShorthand, dismiss, dismissAll],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />
      {toasts.length > 0
        ? createPortal(
            <div
              className="uh-toast-viewport"
              data-position={position}
              data-theme={inherited.theme}
              lang={inherited.lang}
            >
              {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onExited={onExited} onDismiss={dismiss} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
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
  ToastProvider.displayName = 'ToastProvider';
}
