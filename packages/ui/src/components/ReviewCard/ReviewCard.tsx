import { forwardRef, useLayoutEffect, useRef, useState, type ForwardedRef } from 'react';

import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { Rating } from '../Rating/Rating.js';
import { formatCount } from '../../lib/units.js';
import { formatReviewDate } from './reviewDate.js';
import { DEFAULT_LABELS, type ReviewCardLabels } from './labels.js';

export interface ReviewAuthor {
  name: string;
  avatar?: string | undefined;
  /** True only when the platform can vouch the reviewer bought the package. */
  verified?: boolean | undefined;
}

export interface ReviewPhoto {
  src: string;
  /** What the photo shows, for assistive technology and the lightbox. */
  alt?: string | undefined;
}

export interface ReviewCardProps {
  author: ReviewAuthor;
  rating?: number | undefined;
  date?: Date | undefined;
  content: string;
  photos?: readonly ReviewPhoto[] | undefined;
  helpfulCount?: number | undefined;
  /** Marks the count as pressable; without it the count is a statement. */
  onHelpful?: (() => void) | undefined;
  /**
   * Opens the photo the pilgrim tapped. The lightbox itself is the consumer's:
   * it is a modal dialog, and there is no Modal primitive in the system yet -
   * reported rather than re-invented here.
   */
  onPhotoClick?: ((index: number) => void) | undefined;
  packageName?: string | undefined;
  locale?: string | undefined;
  labels?: Partial<ReviewCardLabels> | undefined;
  className?: string | undefined;
}

function ReviewCardImpl(props: ReviewCardProps, ref: ForwardedRef<HTMLElement>) {
  const {
    author,
    rating,
    date,
    content,
    photos = [],
    helpfulCount,
    onHelpful,
    onPhotoClick,
    packageName,
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;

  const labels: ReviewCardLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  const [expanded, setExpanded] = useState(false);
  /* Whether the clamp is actually cutting anything: measured, not guessed. */
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLParagraphElement | null>(null);

  /*
   * scrollHeight against clientHeight on the clamped element is the only
   * honest answer to "did four lines fit" - a character-count threshold would
   * disagree with the truth in every language at once. Re-measured when the
   * text changes; while expanded there is nothing to measure and the button
   * must simply stay, or it could never be used to close again.
   */
  useLayoutEffect(() => {
    if (expanded) return;
    const node = contentRef.current;
    if (!node) return;
    setOverflowing(node.scrollHeight > node.clientHeight + 1);
  }, [content, expanded]);

  const showHelpful = helpfulCount !== undefined && Number.isFinite(helpfulCount);
  const helpfulText = showHelpful ? labels.helpful(formatCount(helpfulCount, locale)) : '';

  return (
    <article
      ref={ref}
      className={['uh-card', 'uh-review', className].filter(Boolean).join(' ')}
      data-card-variant="outlined"
    >
      <header className="uh-review__head">
        <Avatar size="sm" name={author.name} {...(author.avatar ? { src: author.avatar } : {})} />
        <div className="uh-review__who">
          <span className="uh-review__author">
            <span className="uh-review__name">{author.name}</span>
            {author.verified ? (
              <Badge variant="success" size="sm">
                {labels.verifiedPurchase}
              </Badge>
            ) : null}
          </span>
          <span className="uh-review__context">
            {rating !== undefined && Number.isFinite(rating) ? (
              <Rating
                value={rating}
                size="sm"
                showValue={false}
                locale={locale}
                label={labels.rating}
              />
            ) : null}
            {date ? (
              <time className="uh-review__date" dateTime={date.toISOString()}>
                {formatReviewDate(date, locale)}
              </time>
            ) : null}
          </span>
        </div>
      </header>

      {packageName ? <p className="uh-review__package">{packageName}</p> : null}

      <p
        ref={contentRef}
        className="uh-review__content"
        data-clamped={expanded ? undefined : 'true'}
      >
        {content}
      </p>

      {overflowing || expanded ? (
        <button
          type="button"
          className="uh-review__toggle"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? labels.showLess : labels.readMore}
        </button>
      ) : null}

      {photos.length > 0 ? (
        <ul className="uh-review__photos">
          {photos.map((photo, index) => (
            <li key={`${photo.src}-${index}`}>
              {onPhotoClick ? (
                <button
                  type="button"
                  className="uh-review__photo-button"
                  aria-label={
                    photo.alt ??
                    labels.photo(formatCount(index + 1, locale), formatCount(photos.length, locale))
                  }
                  onClick={() => onPhotoClick(index)}
                >
                  <img className="uh-review__photo" src={photo.src} alt="" loading="lazy" />
                </button>
              ) : (
                <img
                  className="uh-review__photo"
                  src={photo.src}
                  alt={photo.alt ?? ''}
                  loading="lazy"
                />
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {showHelpful ? (
        onHelpful ? (
          <button type="button" className="uh-review__helpful" onClick={onHelpful}>
            {helpfulText}
          </button>
        ) : (
          <p className="uh-review__helpful" data-static="true">
            {helpfulText}
          </p>
        )
      ) : null}
    </article>
  );
}

export const ReviewCard = /* @__PURE__ */ forwardRef(ReviewCardImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  ReviewCard.displayName = 'ReviewCard';
}
