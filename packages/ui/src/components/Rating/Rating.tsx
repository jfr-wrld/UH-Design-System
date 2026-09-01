import { forwardRef, useId, useState, type ForwardedRef } from 'react';
import { StarFat } from '@tailgrids/icons';

import { useControllableState } from '../../hooks/useControllableState.js';
import { formatCount } from '../../lib/units.js';

export type RatingSize = 'sm' | 'md';

export interface RatingProps {
  /**
   * Display mode: the score, 0..max, required to draw anything - a rating
   * you do not have is not a rating to draw. Input mode: the controlled
   * value; leave undefined and pass `defaultValue` to run uncontrolled.
   */
  value?: number | undefined;
  /** Uncontrolled starting value. Presence alone switches Rating into input
      mode, the same rule useControllableState applies everywhere else. */
  defaultValue?: number | undefined;
  /** Presence switches Rating from a decorative score into a star picker:
      role="radiogroup", one native radio per star, arrow keys native. */
  onChange?: ((value: number) => void) | undefined;
  /** Shows the picker's shape but blocks changing it - `aria-readonly`, not
      the `disabled` attribute a radio group has no reliable readonly of its
      own for, so it stays reachable and legible rather than looking broken. */
  readOnly?: boolean | undefined;
  disabled?: boolean | undefined;
  /** Accessible name for the radiogroup in input mode. */
  groupLabel?: string | undefined;
  max?: number | undefined;
  reviewCount?: number | undefined;
  locale?: string | undefined;
  size?: RatingSize | undefined;
  /** The number beside the stars. On in a card, off where space is tight.
      Display mode only - an input has nothing settled yet to show a value for. */
  showValue?: boolean | undefined;
  /**
   * The sentence a screen reader hears in display mode. The stars are
   * decoration; this is the rating. Override it to translate.
   */
  label?: ((value: string, max: string, reviewCount: number | undefined) => string) | undefined;
  className?: string | undefined;
}

/*
 * @tailgrids/icons has no separate "solid" glyph the way iconoir did
 * (StarSolid vs. an implied outline) - every icon in this pack draws its
 * path with `fill: none` by default and leaves colour to `stroke`. Passing
 * `fill="currentColor"` here overrides that on the outer <svg> (the inner
 * <path> sets no fill of its own, so it inherits), which is what actually
 * makes the star read as filled rather than a thin outline - matching the
 * always-solid look this component had before, active or not.
 */
function Star() {
  return <StarFat fill="currentColor" aria-hidden="true" focusable="false" />;
}

const defaultLabel = (value: string, max: string, reviewCount: number | undefined) =>
  reviewCount === undefined
    ? `${value} out of ${max}`
    : `${value} out of ${max}, ${reviewCount} reviews`;

const starWord = (n: number) => `${n} star${n === 1 ? '' : 's'}`;

function RatingImpl(props: RatingProps, ref: ForwardedRef<HTMLSpanElement>) {
  const {
    value,
    defaultValue,
    onChange,
    readOnly = false,
    disabled = false,
    groupLabel = 'Rating',
    max = 5,
    reviewCount,
    locale = 'en',
    size = 'sm',
    showValue = true,
    label = defaultLabel,
    className,
  } = props;

  const interactive = onChange !== undefined || defaultValue !== undefined || readOnly;
  const starCount = Number.isFinite(max) && max > 0 ? Math.round(max) : 5;

  /* Hooks must run every render regardless of which mode this is, so both
     live here rather than being called from inside a branch below. */
  const reactId = useId();
  const [current, setCurrent] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? 0,
    onChange,
  });
  const [previewed, setPreviewed] = useState<number | null>(null);

  if (interactive) {
    const shown = previewed ?? current;

    return (
      <span
        ref={ref}
        role="radiogroup"
        aria-label={groupLabel}
        aria-readonly={readOnly || undefined}
        className={['uh-rating', 'uh-rating--input', className].filter(Boolean).join(' ')}
        data-size={size}
        onMouseLeave={() => setPreviewed(null)}
      >
        {Array.from({ length: starCount }, (_, index) => {
          const starValue = index + 1;
          const inputId = `${reactId}-star-${starValue}`;
          return (
            <span key={starValue} className="uh-rating__input-star">
              <input
                id={inputId}
                type="radio"
                className="uh-sr-only"
                name={reactId}
                checked={current === starValue}
                disabled={disabled}
                onChange={() => {
                  /* Belt and suspenders: a disabled native input should
                     already swallow the click before any event fires, but
                     the guard does not assume that held in every runtime. */
                  if (readOnly || disabled) return;
                  setCurrent(starValue);
                }}
                onMouseEnter={() => !readOnly && setPreviewed(starValue)}
              />
              <label
                htmlFor={inputId}
                className="uh-rating__input-label"
                data-filled={starValue <= shown ? 'true' : undefined}
              >
                <span className="uh-sr-only">{starWord(starValue)}</span>
                <Star />
              </label>
            </span>
          );
        })}
      </span>
    );
  }

  /* A rating we do not have is not a rating to draw. The caller decides what
     goes in its place; guessing "0 stars" would libel the agency. */
  if (value === undefined || !Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return null;
  }

  const clamped = Math.min(Math.max(value, 0), max);
  const stars = Array.from({ length: starCount }, (_, index) => <Star key={index} />);
  const readableValue = formatCount(clamped, locale, 1);
  const readableCount = reviewCount === undefined ? undefined : formatCount(reviewCount, locale);

  return (
    <span
      ref={ref}
      className={['uh-rating', className].filter(Boolean).join(' ')}
      data-size={size}
      role="img"
      aria-label={label(readableValue, formatCount(max, locale), reviewCount)}
    >
      {/*
       * Two identical rows, the filled one clipped to the score. That gives a
       * true fraction of a star rather than rounding 4.3 up to four and a half,
       * and it needs no half-star artwork.
       */}
      <span className="uh-rating__stars" aria-hidden="true">
        <span className="uh-rating__layer">{stars}</span>
        <span
          className="uh-rating__layer"
          data-filled="true"
          style={{ inlineSize: `${(clamped / max) * 100}%` }}
        >
          {stars}
        </span>
      </span>

      {showValue ? (
        <span className="uh-rating__value" aria-hidden="true">
          {readableValue}
        </span>
      ) : null}

      {readableCount !== undefined ? (
        <span className="uh-rating__count" aria-hidden="true">
          ({readableCount})
        </span>
      ) : null}
    </span>
  );
}

export const Rating = /* @__PURE__ */ forwardRef(RatingImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Rating.displayName = 'Rating';
}
