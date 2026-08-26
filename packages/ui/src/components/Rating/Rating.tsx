import { forwardRef, type ForwardedRef } from 'react';

import { formatCount } from '../../lib/units.js';

export type RatingSize = 'sm' | 'md';

export interface RatingProps {
  /** Between 0 and `max`. Anything outside is clamped; anything unreal draws nothing. */
  value: number;
  max?: number | undefined;
  reviewCount?: number | undefined;
  locale?: string | undefined;
  size?: RatingSize | undefined;
  /** The number beside the stars. On in a card, off where space is tight. */
  showValue?: boolean | undefined;
  /**
   * The sentence a screen reader hears. The stars are decoration; this is the
   * rating. Override it to translate.
   */
  label?: ((value: string, max: string, reviewCount: number | undefined) => string) | undefined;
  className?: string | undefined;
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3.5l2.6 5.35 5.9.83-4.28 4.13 1.02 5.86L12 16.9l-5.24 2.77 1.02-5.86L3.5 9.68l5.9-.83z"
        fill="currentColor"
      />
    </svg>
  );
}

const defaultLabel = (value: string, max: string, reviewCount: number | undefined) =>
  reviewCount === undefined
    ? `${value} out of ${max}`
    : `${value} out of ${max}, ${reviewCount} reviews`;

function RatingImpl(props: RatingProps, ref: ForwardedRef<HTMLSpanElement>) {
  const {
    value,
    max = 5,
    reviewCount,
    locale = 'en',
    size = 'sm',
    showValue = true,
    label = defaultLabel,
    className,
  } = props;

  /* A rating we do not have is not a rating to draw. The caller decides what
     goes in its place; guessing "0 stars" would libel the agency. */
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;

  const clamped = Math.min(Math.max(value, 0), max);
  const stars = Array.from({ length: Math.round(max) }, (_, index) => <Star key={index} />);
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

export const Rating = forwardRef(RatingImpl);
Rating.displayName = 'Rating';
