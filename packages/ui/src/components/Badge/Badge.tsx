import type { HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/** Mirrors the booking lifecycle in the token layer. */
export type BadgeStatus =
  'pending' | 'paid' | 'confirmed' | 'inProgress' | 'completed' | 'cancelled' | 'refunded';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  children: ReactNode;
  variant?: BadgeVariant | BadgeStatus;
  size?: BadgeSize;
  /** A dot carries the status when the badge sits among other text. */
  dot?: boolean;
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  /** Accessible name for the remove control; override to localise. */
  removeLabel?: string;
  className?: string | undefined;
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon,
  removable = false,
  onRemove,
  removeLabel = 'Remove',
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={['uh-badge', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-size={size}
    >
      {dot ? <span className="uh-badge__dot" aria-hidden="true" /> : null}
      {icon ? (
        <span className="uh-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="uh-badge__label">{children}</span>
      {removable ? (
        <button
          type="button"
          className="uh-badge__remove"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <CloseIcon />
        </button>
      ) : null}
    </span>
  );
}

Badge.displayName = 'Badge';
