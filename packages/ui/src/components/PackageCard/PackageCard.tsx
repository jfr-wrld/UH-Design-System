import { forwardRef, type ForwardedRef, type MouseEvent } from 'react';

import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay.js';
import { Rating } from '../Rating/Rating.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { formatDateShort } from '../DatePicker/date.js';
import { formatCount, formatDistance, formatDuration } from '../../lib/units.js';
import type { Currency } from '../../lib/money.js';
import {
  BADGE_VARIANT,
  DEFAULT_LABELS,
  type PackageBadge,
  type PackageCardLabels,
} from './labels.js';

export type PackageCardVariant = 'grid' | 'list' | 'mobile';

export interface PackageAgency {
  name: string;
  verified?: boolean | undefined;
  logo?: string | undefined;
}

export interface HotelDistance {
  /** Metres to the Haram. */
  makkah?: number | undefined;
  /** Metres to the Prophet's Mosque. */
  madinah?: number | undefined;
}

export interface PackageCardProps {
  /** An array because the card will carry a carousel; today it shows the first. */
  image?: readonly string[] | undefined;
  title: string;
  agency: PackageAgency;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  departureDate?: Date | undefined;
  durationDays?: number | undefined;
  hotelDistance?: HotelDistance | undefined;
  price: number;
  originalPrice?: number | undefined;
  currency: Currency;
  locale: string;
  seatsRemaining?: number | undefined;
  badge?: PackageBadge | null | undefined;
  isWishlisted?: boolean | undefined;
  onWishlist?: ((next: boolean) => void) | undefined;
  onClick?: (() => void) | undefined;
  variant?: PackageCardVariant | undefined;
  loading?: boolean | undefined;
  soldOut?: boolean | undefined;
  labels?: Partial<PackageCardLabels> | undefined;
  className?: string | undefined;
}

/** Seats stop being reassuring and start being useful at ten. */
const SEATS_VISIBLE_AT = 10;
/** Below this it is a warning rather than a note. */
const SEATS_URGENT_AT = 5;

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 20.2l-1.35-1.23C6.4 15.13 4 12.95 4 9.9 4 7.4 5.9 5.5 8.4 5.5c1.4 0 2.75.65 3.6 1.68A4.75 4.75 0 0115.6 5.5C18.1 5.5 20 7.4 20 9.9c0 3.05-2.4 5.23-6.65 9.07z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 3l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.6 1 2.6-2.2 1.6-.9 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.9-2.6L4 15.4l1-2.6-1-2.6 2.2-1.6.9-2.6 2.7.2z"
        fill="currentColor"
      />
      <path
        d="M8.75 12.2l2.1 2.1 4.4-4.4"
        fill="none"
        stroke="var(--uh-color-bg-surface)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardSkeleton({ variant, label }: { variant: PackageCardVariant; label: string }) {
  return (
    <article
      className="uh-package"
      data-variant={variant}
      data-loading="true"
      aria-busy="true"
      aria-label={label}
    >
      <div className="uh-package__media">
        <Skeleton variant="rect" className="uh-package__media-skeleton" />
      </div>
      <div className="uh-package__body">
        {/* Two lines, because the real title reserves two lines. A skeleton
            that were shorter would make the grid jump as the data arrived. */}
        <div className="uh-package__title">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="70%" />
        </div>
        <Skeleton variant="text" width="55%" />
        <Skeleton variant="text" width="40%" />
        <div className="uh-package__price">
          <Skeleton variant="text" width="45%" />
        </div>
      </div>
    </article>
  );
}

function PackageCardImpl(props: PackageCardProps, ref: ForwardedRef<HTMLElement>) {
  const {
    image,
    title,
    agency,
    rating,
    reviewCount,
    departureDate,
    durationDays,
    hotelDistance,
    price,
    originalPrice,
    currency,
    locale,
    seatsRemaining,
    badge,
    isWishlisted = false,
    onWishlist,
    onClick,
    variant = 'grid',
    loading = false,
    soldOut = false,
    labels: labelOverrides,
    className,
  } = props;

  const labels: PackageCardLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  if (loading) return <CardSkeleton variant={variant} label={labels.loading} />;

  const cover = image?.[0];
  const showSeats =
    seatsRemaining !== undefined &&
    Number.isFinite(seatsRemaining) &&
    seatsRemaining > 0 &&
    seatsRemaining <= SEATS_VISIBLE_AT;
  const seatsUrgent = showSeats && seatsRemaining <= SEATS_URGENT_AT;

  /*
   * Two lists, not one. The trip facts are short enough to sit on a line with a
   * dot between them; the hotel distances are sentences and wrap. Run together,
   * a wrapped line began with an orphaned separator, which is the sort of thing
   * that only shows up once real Malay copy is in the card.
   */
  const trip: string[] = [];
  if (departureDate) trip.push(formatDateShort(departureDate, locale));
  if (durationDays !== undefined && Number.isFinite(durationDays)) {
    trip.push(formatDuration(durationDays, locale));
  }

  const hotels: string[] = [];
  if (hotelDistance?.makkah !== undefined && Number.isFinite(hotelDistance.makkah)) {
    hotels.push(labels.makkahDistance(formatDistance(hotelDistance.makkah, locale)));
  }
  if (hotelDistance?.madinah !== undefined && Number.isFinite(hotelDistance.madinah)) {
    hotels.push(labels.madinahDistance(formatDistance(hotelDistance.madinah, locale)));
  }

  function onWishlistClick(event: MouseEvent<HTMLButtonElement>) {
    /*
     * The wishlist control sits above the title's stretched hit area, so a tap
     * on it never reaches the card in the first place. This is for the layer
     * further out: a consumer wrapping the whole card in its own handler would
     * otherwise open the package every time someone saved it.
     */
    event.stopPropagation();
    onWishlist?.(!isWishlisted);
  }

  return (
    <article
      ref={ref}
      className={['uh-package', className].filter(Boolean).join(' ')}
      data-variant={variant}
      data-sold-out={soldOut ? 'true' : undefined}
    >
      <div className="uh-package__media">
        {cover ? (
          /* Decorative: the title beside it says what the package is, and a
             generated caption would only repeat it. */
          <img className="uh-package__image" src={cover} alt="" loading="lazy" />
        ) : (
          <div className="uh-package__image-fallback" aria-hidden="true" />
        )}

        {badge ? (
          <span className="uh-package__badge">
            <Badge variant={BADGE_VARIANT[badge]} size="sm">
              {labels.badges[badge]}
            </Badge>
          </span>
        ) : null}

        {/* Still live when the package is gone: a sold-out trip is exactly the
            one a pilgrim wants to keep an eye on for next season. */}
        <button
          type="button"
          className="uh-package__wishlist"
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? labels.removeFromWishlist(title) : labels.addToWishlist(title)}
          onClick={onWishlistClick}
        >
          <HeartIcon filled={isWishlisted} />
        </button>

        {soldOut ? (
          <span className="uh-package__sold-out">
            <span className="uh-package__sold-out-label">{labels.soldOut}</span>
          </span>
        ) : null}
      </div>

      <div className="uh-package__body">
        {/*
         * The whole card is clickable through this one button: its ::after
         * covers the card, so there is a single tab stop with the package name
         * as its accessible name, and no interactive element nested inside
         * another. The wishlist control sits above that layer.
         */}
        <h3 className="uh-package__title">
          <button
            type="button"
            className="uh-package__action"
            aria-disabled={soldOut || undefined}
            onClick={soldOut ? undefined : onClick}
          >
            {title}
          </button>
        </h3>

        <p className="uh-package__agency">
          <Avatar
            size="xs"
            shape="square"
            name={agency.name}
            {...(agency.logo ? { src: agency.logo } : {})}
          />
          <span className="uh-package__agency-name">{agency.name}</span>
          {agency.verified ? (
            <span className="uh-package__verified" title={labels.verified}>
              <span className="uh-sr-only">{labels.verified}</span>
              <VerifiedIcon />
            </span>
          ) : null}
        </p>

        {rating !== undefined && Number.isFinite(rating) ? (
          <Rating
            className="uh-package__rating"
            value={rating}
            locale={locale}
            label={labels.rating}
            {...(reviewCount !== undefined ? { reviewCount } : {})}
          />
        ) : null}

        {trip.length > 0 ? (
          <ul className="uh-package__meta">
            {trip.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {hotels.length > 0 ? (
          <ul className="uh-package__hotels">
            {hotels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}

        {showSeats ? (
          <p className="uh-package__seats" data-urgent={seatsUrgent ? 'true' : undefined}>
            {labels.seatsLeft(formatCount(seatsRemaining, locale))}
          </p>
        ) : null}

        <div className="uh-package__price">
          <PriceDisplay
            amount={price}
            currency={currency}
            locale={locale}
            size={variant === 'grid' ? 'md' : 'lg'}
            {...(originalPrice !== undefined ? { originalAmount: originalPrice } : {})}
          />
        </div>
      </div>
    </article>
  );
}

export const PackageCard = forwardRef(PackageCardImpl);
PackageCard.displayName = 'PackageCard';
