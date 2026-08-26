import { forwardRef, type ForwardedRef } from 'react';

import { Avatar } from '../Avatar/Avatar.js';
import { Badge } from '../Badge/Badge.js';
import { Rating } from '../Rating/Rating.js';
import { formatCount } from '../../lib/units.js';
import { yearsInOperation } from './years.js';
import { DEFAULT_LABELS, type AgencyCardLabels } from './labels.js';

export type AgencyCardVariant = 'compact' | 'full';

/**
 * TOB is Malaysia's outbound licence, PPIU Indonesia's Umrah operator permit.
 * Any other authority's scheme arrives as a plain string and is printed as
 * given.
 */
export type LicenseType = 'TOB' | 'PPIU' | (string & {});

export interface AgencyCardProps {
  logo?: string | undefined;
  name: string;
  licenseNumber?: string | undefined;
  licenseType?: LicenseType | undefined;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  /**
   * The year operations began, e.g. 2014 - never a pre-counted "12". The count
   * is worked out at render time, because a stored count is right for one year
   * and silently wrong for every year after it.
   */
  operatingSince?: number | undefined;
  packageCount?: number | undefined;
  verified?: boolean | undefined;
  /** Free-form marks the platform awards: "Halal certified", "Top rated 2026". */
  badges?: readonly string[] | undefined;
  variant?: AgencyCardVariant | undefined;
  onClick?: (() => void) | undefined;
  locale?: string | undefined;
  labels?: Partial<AgencyCardLabels> | undefined;
  className?: string | undefined;
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

function AgencyCardImpl(props: AgencyCardProps, ref: ForwardedRef<HTMLElement>) {
  const {
    logo,
    name,
    licenseNumber,
    licenseType,
    rating,
    reviewCount,
    operatingSince,
    packageCount,
    verified = false,
    badges,
    variant = 'compact',
    onClick,
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;

  const labels: AgencyCardLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const compact = variant === 'compact';

  const years = operatingSince === undefined ? null : yearsInOperation(operatingSince);
  const showPackages =
    packageCount !== undefined && Number.isFinite(packageCount) && packageCount > 0;

  /*
   * The licence line is the point of the card. A span, not a p: the card body
   * also renders inside a <button>, which only admits phrasing content, and an
   * invalid nesting would be silently re-parented by the browser.
   */
  const license =
    licenseNumber !== undefined && licenseNumber !== '' ? (
      <span className="uh-agency__license">
        {licenseType ? <span className="uh-agency__license-type">{licenseType}</span> : null}
        <span className="uh-agency__license-label">{labels.licenseNumber}</span>{' '}
        <span className="uh-agency__license-number">{licenseNumber}</span>
      </span>
    ) : null;

  const verifiedMark = verified ? (
    <span className="uh-agency__verified">
      <VerifiedIcon />
      {labels.verified}
    </span>
  ) : null;

  const body = (
    <>
      <Avatar
        className="uh-agency__logo"
        size={compact ? 'md' : 'xl'}
        shape="square"
        name={name}
        {...(logo ? { src: logo } : {})}
      />

      <span className="uh-agency__detail">
        <span className="uh-agency__head">
          <span className="uh-agency__name">{name}</span>
          {verifiedMark}
        </span>

        {license}

        {rating !== undefined && Number.isFinite(rating) ? (
          <Rating
            className="uh-agency__rating"
            value={rating}
            locale={locale}
            label={labels.rating}
            {...(reviewCount !== undefined ? { reviewCount } : {})}
          />
        ) : null}

        {!compact && (years !== null || showPackages) ? (
          <span className="uh-agency__facts">
            {years !== null ? (
              <span className="uh-agency__fact">
                {labels.yearsOperating(formatCount(years, locale))}
              </span>
            ) : null}
            {showPackages ? (
              <span className="uh-agency__fact">
                {labels.packages(formatCount(packageCount, locale))}
              </span>
            ) : null}
          </span>
        ) : null}

        {!compact && badges && badges.length > 0 ? (
          <span className="uh-agency__badges">
            {badges.map((badge) => (
              <Badge key={badge} variant="neutral" size="sm">
                {badge}
              </Badge>
            ))}
          </span>
        ) : null}
      </span>
    </>
  );

  /*
   * With a handler the card is a button; without one it is a plain article.
   * The compact form rides inside PackageCard, whose whole surface is already
   * clickable - a second interactive layer there would fight the first, so the
   * consumer simply leaves onClick off.
   */
  if (onClick) {
    return (
      <button
        ref={ref as ForwardedRef<HTMLButtonElement>}
        type="button"
        className={['uh-agency', className].filter(Boolean).join(' ')}
        data-variant={variant}
        onClick={onClick}
      >
        {body}
      </button>
    );
  }

  return (
    <article
      ref={ref}
      className={['uh-agency', className].filter(Boolean).join(' ')}
      data-variant={variant}
    >
      {body}
    </article>
  );
}

export const AgencyCard = forwardRef(AgencyCardImpl);
AgencyCard.displayName = 'AgencyCard';
