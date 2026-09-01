import { forwardRef, type ForwardedRef, type MouseEvent } from 'react';
import { Heart } from '@tailgrids/icons';

import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay.js';
import { Rating } from '../Rating/Rating.js';
import { Skeleton } from '../Skeleton/Skeleton.js';
import { formatDateShort } from '../DatePicker/date.js';
import { formatCount, formatDistance, formatDuration } from '../../lib/units.js';
import type { Currency } from '../../lib/money.js';
import { VerifiedIcon } from '../../lib/icons.js';
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

interface PackageCardCommonProps {
  /** An array because the card will carry a carousel; today it shows the first. */
  image?: readonly string[] | undefined;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  departureDate?: Date | undefined;
  durationDays?: number | undefined;
  hotelDistance?: HotelDistance | undefined;
  originalPrice?: number | undefined;
  seatsRemaining?: number | undefined;
  badge?: PackageBadge | null | undefined;
  isWishlisted?: boolean | undefined;
  onWishlist?: ((next: boolean) => void) | undefined;
  onClick?: (() => void) | undefined;
  variant?: PackageCardVariant | undefined;
  soldOut?: boolean | undefined;
  labels?: Partial<PackageCardLabels> | undefined;
  className?: string | undefined;
}

/*
 * The skeleton branch renders none of title/agency/price - a caller building
 * a loading grid before real data has arrived had to invent a title="" and
 * an empty agency just to satisfy the type. Split on `loading` instead: true
 * makes the content props optional, and TypeScript still requires them the
 * moment `loading` is false or left out, which is when they are read.
 */
interface PackageCardLoadingProps extends PackageCardCommonProps {
  loading: true;
  title?: string | undefined;
  agency?: PackageAgency | undefined;
  price?: number | undefined;
  currency?: Currency | undefined;
  locale?: string | undefined;
}

interface PackageCardLoadedProps extends PackageCardCommonProps {
  loading?: false | undefined;
  title: string;
  agency: PackageAgency;
  price: number;
  currency: Currency;
  locale: string;
}

export type PackageCardProps = PackageCardLoadingProps | PackageCardLoadedProps;

/** Seats stop being reassuring and start being useful at ten. */
const SEATS_VISIBLE_AT = 10;
/** Below this it is a warning rather than a note. */
const SEATS_URGENT_AT = 5;

/*
 * @tailgrids/icons has no separate solid glyph - one Heart, outline by
 * default. `fill="currentColor"` overrides the outer <svg>'s own
 * `fill: none` (the <path> sets no fill of its own, so it inherits), which
 * is what actually makes the wishlisted state read as filled.
 */
function HeartIcon({ filled }: { filled: boolean }) {
  return <Heart fill={filled ? 'currentColor' : 'none'} aria-hidden="true" focusable="false" />;
}

function CardSkeleton({ variant, label }: { variant: PackageCardVariant; label: string }) {
  return (
    <article
      className="uh-card uh-package"
      data-card-variant="outlined"
      data-hoverable="true"
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
  const { variant = 'grid', labels: labelOverrides, className } = props;
  const labels: PackageCardLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  /*
   * Checked on `props.loading`, not a destructured local - only that keeps
   * TypeScript's discriminated-union narrowing linked to `props`, so the
   * destructure below can require title/agency/price/currency/locale again
   * once this returns.
   */
  if (props.loading) return <CardSkeleton variant={variant} label={labels.loading} />;

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
    soldOut = false,
  } = props;

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
      className={['uh-card', 'uh-package', className].filter(Boolean).join(' ')}
      data-card-variant="outlined"
      data-hoverable="true"
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

export const PackageCard = /* @__PURE__ */ forwardRef(PackageCardImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  PackageCard.displayName = 'PackageCard';
}
