import type { MouseEvent, ReactNode } from 'react';

import { CloseIcon } from '../../lib/icons.js';

export interface ChipProps {
  children: ReactNode;
  /** Toggle state - filled brand when true, outlined neutral otherwise. */
  selected?: boolean | undefined;
  /**
   * Present: the label becomes a real button, aria-pressed carrying
   * `selected`. Absent: the label is plain text - the shape a chip takes
   * once it is only reporting an applied filter, not offering to change it.
   * (A chip with neither `onClick` nor `removable` is only a label; reach
   * for Badge instead - Chip's whole reason to exist is being interactive.)
   */
  onClick?: (() => void) | undefined;
  disabled?: boolean | undefined;
  /** Leading icon; decorative, so it never substitutes for the label. */
  icon?: ReactNode | undefined;
  removable?: boolean | undefined;
  onRemove?: (() => void) | undefined;
  /** Accessible name for the remove control; override to localise. */
  removeLabel?: string | undefined;
  className?: string | undefined;
}

/**
 * A tappable pill: a filter that toggles on and off, a choice among several,
 * an applied filter shown back with its own dismiss.
 *
 * The toggle and the remove control are siblings inside a plain wrapper, not
 * one nested inside the other - a button cannot legally contain a button, so
 * when both exist they are written the same way PackageCard's whole-card
 * action and its wishlist heart are: two independent controls under one
 * shared container, never one inside the other.
 *
 * `aria-disabled`, not the `disabled` attribute - same reasoning as Button -
 * so a disabled chip stays in the tab order and readable rather than
 * vanishing from it.
 */
export function Chip(props: ChipProps) {
  const {
    children,
    selected = false,
    onClick,
    disabled = false,
    icon,
    removable = false,
    onRemove,
    removeLabel = 'Remove',
    className,
  } = props;

  function handleRemove(event: MouseEvent<HTMLButtonElement>) {
    /* Independent of the chip's own click - removing a filter is not the
       same action as toggling it, and the two must never both fire. */
    event.stopPropagation();
    if (disabled) return;
    onRemove?.();
  }

  const body = (
    <>
      {icon ? (
        <span className="uh-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="uh-chip__label">{children}</span>
    </>
  );

  return (
    <span
      className={['uh-chip', className].filter(Boolean).join(' ')}
      data-selected={selected ? 'true' : undefined}
    >
      {onClick ? (
        <button
          type="button"
          className="uh-chip__toggle"
          aria-pressed={selected}
          aria-disabled={disabled || undefined}
          onClick={disabled ? undefined : onClick}
        >
          {body}
        </button>
      ) : (
        <span className="uh-chip__toggle" data-static="true">
          {body}
        </span>
      )}

      {removable ? (
        <button
          type="button"
          className="uh-chip__remove"
          aria-label={removeLabel}
          aria-disabled={disabled || undefined}
          onClick={handleRemove}
        >
          <CloseIcon />
        </button>
      ) : null}
    </span>
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
  Chip.displayName = 'Chip';
}
