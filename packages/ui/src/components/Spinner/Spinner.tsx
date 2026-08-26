import type { HTMLAttributes } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'inherit' | 'primary' | 'white';

export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: SpinnerSize;
  color?: SpinnerColor;
  /** Announced while the spinner is on screen. */
  label?: string;
  /**
   * For a spinner inside a control that already announces its own busy state.
   * Renders it aria-hidden so the same thing is not said twice.
   */
  decorative?: boolean;
  className?: string | undefined;
}

export function Spinner({
  size = 'md',
  color = 'inherit',
  label = 'Loading',
  decorative = false,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      {...rest}
      className={['uh-spinner', className].filter(Boolean).join(' ')}
      data-size={size}
      data-color={color}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'status', 'aria-live': 'polite', 'aria-label': label })}
    >
      <svg
        className="uh-spinner__svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="42 14"
        />
      </svg>
    </span>
  );
}

Spinner.displayName = 'Spinner';
