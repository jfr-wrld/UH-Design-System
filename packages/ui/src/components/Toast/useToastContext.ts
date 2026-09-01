import { createContext, useContext } from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ToastPosition = 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title?: string | undefined;
  description: string;
  variant?: ToastVariant | undefined;
  /** ms of unpaused time before it dismisses itself; null waits for a person. */
  duration?: number | null | undefined;
  action?: ToastAction | undefined;
  /** Accessible name for the close control; override to localise. */
  closeLabel?: string | undefined;
}

export interface ToastHandle {
  id: string;
  dismiss: () => void;
}

export interface ToastContextValue {
  show: (options: ToastOptions) => ToastHandle;
  success: (
    description: string,
    options?: Omit<ToastOptions, 'description' | 'variant'>,
  ) => ToastHandle;
  warning: (
    description: string,
    options?: Omit<ToastOptions, 'description' | 'variant'>,
  ) => ToastHandle;
  error: (
    description: string,
    options?: Omit<ToastOptions, 'description' | 'variant'>,
  ) => ToastHandle;
  info: (
    description: string,
    options?: Omit<ToastOptions, 'description' | 'variant'>,
  ) => ToastHandle;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

/*
 * Pure-annotated for the same reason as RadioGroupContext: without it, this
 * one `createContext` call pins the entire bundled library file together as
 * one inseparable unit for any consumer importing an unrelated component -
 * see `scripts/bundle-size.mjs`'s own comment for the full story.
 */
export const ToastContext = /* @__PURE__ */ createContext<ToastContextValue | null>(null);

/** Throws in development the same way every context-bound hook here does:
    a Toast fired outside its Provider is a wiring bug, not a graceful no-op. */
export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within a ToastProvider.');
  return value;
}
