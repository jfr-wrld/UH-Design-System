import { forwardRef, type ForwardedRef } from 'react';

import { Rating } from '../Rating/Rating.js';
import { formatCount } from '../../lib/units.js';
import { BREAKDOWN_LABELS, type RatingBreakdownLabels } from './labels.js';

export type StarBucket = 1 | 2 | 3 | 4 | 5;

export interface RatingBreakdownProps {
  /** Review counts per star. A missing bucket is an empty one. */
  counts: Partial<Record<StarBucket, number>>;
  locale?: string | undefined;
  labels?: Partial<RatingBreakdownLabels> | undefined;
  className?: string | undefined;
}

const BUCKETS: StarBucket[] = [5, 4, 3, 2, 1];

function RatingBreakdownImpl(props: RatingBreakdownProps, ref: ForwardedRef<HTMLDivElement>) {
  const { counts, locale = 'en', labels: labelOverrides, className } = props;
  const labels: RatingBreakdownLabels = { ...BREAKDOWN_LABELS, ...labelOverrides };

  const clean = BUCKETS.map((stars) => {
    const raw = counts[stars];
    return {
      stars,
      count: raw !== undefined && Number.isFinite(raw) && raw > 0 ? Math.round(raw) : 0,
    };
  });
  const total = clean.reduce((sum, bucket) => sum + bucket.count, 0);

  /* An empty distribution is not a figure; the caller decides what stands in. */
  if (total === 0) return null;

  /*
   * The average IS computed, where money totals never are: a weighted mean of
   * the supplied counts has exactly one right answer, and asking the consumer
   * to send it separately is asking for the two to disagree.
   */
  const average = clean.reduce((sum, bucket) => sum + bucket.stars * bucket.count, 0) / total;

  return (
    <div
      ref={ref}
      className={['uh-ratings', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={labels.breakdown}
    >
      <div className="uh-ratings__summary">
        <span className="uh-ratings__average">{formatCount(average, locale, 1)}</span>
        <Rating value={average} size="sm" showValue={false} locale={locale} />
        <span className="uh-ratings__total">{labels.reviews(formatCount(total, locale))}</span>
      </div>

      <ul className="uh-ratings__rows">
        {clean.map(({ stars, count }) => (
          <li
            key={stars}
            className="uh-ratings__row"
            aria-label={labels.row(formatCount(stars, locale), formatCount(count, locale))}
          >
            <span className="uh-ratings__star" aria-hidden="true">
              {formatCount(stars, locale)}
            </span>
            <span className="uh-ratings__track" aria-hidden="true">
              <span
                className="uh-ratings__fill"
                style={{ inlineSize: `${(count / total) * 100}%` }}
              />
            </span>
            <span className="uh-ratings__count" aria-hidden="true">
              {formatCount(count, locale)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const RatingBreakdown = /* @__PURE__ */ forwardRef(RatingBreakdownImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  RatingBreakdown.displayName = 'RatingBreakdown';
}
