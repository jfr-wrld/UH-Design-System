import { forwardRef, type ForwardedRef } from 'react';

import { Rating } from '../Rating/Rating.js';
import { Tooltip } from '../Tooltip/Tooltip.js';
import { formatCount, formatDistance } from '../../lib/units.js';
import { AmenityGlyph, type Amenity } from './amenities.js';
import { DEFAULT_LABELS, type HotelCardLabels } from './labels.js';

export type HotelCity = 'Makkah' | 'Madinah';
export type HotelCardVariant = 'compact' | 'full';

export interface HotelCardProps {
  image?: string | undefined;
  name: string;
  /** The hotel's star class, 1 to 5. A classification, not a review score. */
  starRating?: number | undefined;
  city: HotelCity;
  /**
   * Metres to the city's holy mosque: the Haram in Makkah, the Prophet's
   * Mosque in Madinah. The headline of the card either way - it is the number
   * pilgrims choose hotels on.
   */
  distanceToHaram?: number | undefined;
  nights?: number | undefined;
  amenities?: readonly Amenity[] | undefined;
  variant?: HotelCardVariant | undefined;
  locale?: string | undefined;
  labels?: Partial<HotelCardLabels> | undefined;
  className?: string | undefined;
}

/** Icons the compact row shows before it folds the rest into "+N". */
const COMPACT_AMENITIES = 4;

function HotelCardImpl(props: HotelCardProps, ref: ForwardedRef<HTMLElement>) {
  const {
    image,
    name,
    starRating,
    city,
    distanceToHaram,
    nights,
    amenities = [],
    variant = 'compact',
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;

  const labels: HotelCardLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const compact = variant === 'compact';

  const hasDistance = distanceToHaram !== undefined && Number.isFinite(distanceToHaram);
  const distanceLine = hasDistance
    ? (city === 'Madinah' ? labels.fromNabawi : labels.fromHaram)(
        formatDistance(distanceToHaram, locale),
      )
    : null;

  const shown = compact ? amenities.slice(0, COMPACT_AMENITIES) : amenities;
  const folded = amenities.length - shown.length;

  const stars =
    starRating !== undefined && Number.isFinite(starRating) && starRating > 0 ? (
      <Rating
        className="uh-hotel__stars"
        value={starRating}
        showValue={false}
        locale={locale}
        label={() => labels.stars(formatCount(starRating, locale))}
      />
    ) : null;

  return (
    <article
      ref={ref}
      className={['uh-card', 'uh-hotel', className].filter(Boolean).join(' ')}
      data-card-variant="outlined"
      data-variant={variant}
    >
      <div className="uh-hotel__media">
        {image ? (
          /* Decorative: the name beside it says which hotel this is. */
          <img className="uh-hotel__image" src={image} alt="" loading="lazy" />
        ) : (
          <div className="uh-hotel__image-fallback" aria-hidden="true" />
        )}
      </div>

      <div className="uh-hotel__body">
        <div className="uh-hotel__head">
          <h3 className="uh-hotel__name">{name}</h3>
          {stars}
        </div>

        {/*
         * The distance is the headline, not a footnote: it is the number a
         * pilgrim actually chooses a hotel on, so it is set a full type step
         * above the name, in tabular figures.
         */}
        {distanceLine ? <p className="uh-hotel__distance">{distanceLine}</p> : null}

        {nights !== undefined && Number.isFinite(nights) && nights > 0 ? (
          <p className="uh-hotel__nights">{labels.nights(formatCount(nights, locale))}</p>
        ) : null}

        {shown.length > 0 ? (
          <ul className="uh-hotel__amenities">
            {shown.map((amenity) => (
              <li key={amenity.id} className="uh-hotel__amenity">
                {/*
                 * A focusable control, so the tooltip opens from the keyboard
                 * as well as the pointer - and the label is the accessible
                 * name, so nothing here is conveyed by tooltip alone.
                 */}
                <Tooltip content={amenity.label}>
                  <button
                    type="button"
                    className="uh-hotel__amenity-button"
                    aria-label={amenity.label}
                  >
                    <AmenityGlyph id={amenity.id} />
                  </button>
                </Tooltip>
              </li>
            ))}
            {folded > 0 ? (
              <li className="uh-hotel__amenity-more">
                {labels.moreAmenities(formatCount(folded, locale))}
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export const HotelCard = /* @__PURE__ */ forwardRef(HotelCardImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  HotelCard.displayName = 'HotelCard';
}
