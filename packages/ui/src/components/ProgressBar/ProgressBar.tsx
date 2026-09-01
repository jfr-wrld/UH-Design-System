import { useId } from 'react';

export type ProgressBarVariant = 'default' | 'success' | 'error';

export interface ProgressBarProps {
  /** Current amount, 0..max. Ignored - and safe to omit - when indeterminate. */
  value?: number | undefined;
  max?: number | undefined;
  /** Duration unknown: a stripe animates instead of a fixed width. */
  indeterminate?: boolean | undefined;
  variant?: ProgressBarVariant | undefined;
  /** Accessible name. Required: a bar with no label says nothing on its own. */
  label: string;
  /** Shows `label` above the track; otherwise it is still the accessible
      name, just not painted (aria-label instead of a visible node). */
  showLabel?: boolean | undefined;
  /** Shows a formatted percentage beside the label. No-op while indeterminate
      - there is no number to show. */
  showValue?: boolean | undefined;
  /** Drives the percentage format. Never derived from the browser. */
  locale?: string | undefined;
  className?: string | undefined;
}

/**
 * A determinate bar clamps `value` into [0, max] and reports it as
 * aria-valuenow *and* a formatted aria-valuetext - screen readers would
 * otherwise announce the raw pair ("34 of 220") instead of "15%", which is
 * what the visible track is actually showing. An indeterminate bar omits
 * aria-valuenow entirely, per the WAI-ARIA progressbar pattern: a number
 * that isn't real is worse than no number.
 *
 * The fill's width is computed separately from the displayed percentage
 * text: Intl's percent format is not a CSS length (some locales insert a
 * narrow no-break space before the sign, some place the sign first), so
 * reusing that string as `style.width` would only work in English.
 */
export function ProgressBar(props: ProgressBarProps) {
  const {
    value = 0,
    max = 100,
    indeterminate = false,
    variant = 'default',
    label,
    showLabel = false,
    showValue = false,
    locale = 'en',
    className,
  } = props;

  const reactId = useId();
  const labelId = `${reactId}-label`;

  const clamped = Math.min(Math.max(value, 0), max);
  const fraction = max > 0 ? clamped / max : 0;
  const percentText = new Intl.NumberFormat(locale, { style: 'percent' }).format(fraction);

  return (
    <div className={['uh-progress', className].filter(Boolean).join(' ')} data-variant={variant}>
      {showLabel ? (
        <div className="uh-progress__header">
          <span id={labelId} className="uh-progress__label">
            {label}
          </span>
          {showValue && !indeterminate ? (
            <span className="uh-progress__value">{percentText}</span>
          ) : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        {...(showLabel ? { 'aria-labelledby': labelId } : { 'aria-label': label })}
        aria-valuemin={0}
        aria-valuemax={max}
        {...(indeterminate ? {} : { 'aria-valuenow': clamped, 'aria-valuetext': percentText })}
        className="uh-progress__track"
        data-indeterminate={indeterminate ? 'true' : undefined}
      >
        <div
          className="uh-progress__fill"
          style={indeterminate ? undefined : { width: `${fraction * 100}%` }}
        />
      </div>
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
  ProgressBar.displayName = 'ProgressBar';
}
