import type { ReactElement } from 'react';
import {
  Xmark,
  ChevronDown,
  CertificateBadge1,
  CheckCircle1,
  ErrorHexagon,
  XmarkCircle,
  InfoCircle,
} from '@tailgrids/icons';

/**
 * The glyphs more than one component needs. Kept here instead of redrawn per
 * component: a hand-copied icon is exactly the local-version problem
 * Phase 5's composition rule was written against, just one layer down from
 * components into their pieces. The Phase 5.6 audit found this glyph alone
 * hand-drawn eight times under three different names (CloseIcon/ClearIcon/
 * RemoveIcon) before it was consolidated here.
 *
 * Every glyph here now comes from @tailgrids/icons - each icon is its own ES
 * module with no shared-scope side effect (see scripts/bundle-size.mjs's own
 * comment for why that property is what makes an icon safe to import
 * one-at-a-time), so pulling in one glyph here does not drag the other
 * ~240 icons into the bundle. Function names and props stay the same on
 * purpose: every call site across the package keeps importing
 * CloseIcon/ChevronDownIcon/VerifiedIcon/StatusIcon unchanged.
 *
 * `strokeWidth` is gone from every wrapper here (it used to default to 1.5
 * or 1.75 depending on the glyph): every @tailgrids/icons icon hardcodes its
 * own stroke width on the `<path>` itself rather than reading it from props,
 * so a `strokeWidth` passed to the outer `<svg>` had nothing left to
 * override - it was already a no-op the moment this package's icons render,
 * and keeping the parameter around would just misrepresent that as a real
 * lever. Every icon in this pack renders at the same ~1.5 weight, so this is
 * a wash instead of a per-glyph choice - there is nothing to tune here
 * anymore.
 *
 * A handful of glyphs below are the closest available shape rather than an
 * exact match - @tailgrids/icons is a small (~245-icon), generic UI set with
 * no dedicated "warning triangle" or "verified seal" glyph. `ErrorHexagon`
 * stands in for a warning triangle (both read as a caution sign in
 * practice), `CertificateBadge1` for the verified seal (a certificate/badge
 * shape carries the same "trust" meaning). Two glyphs elsewhere in this
 * package stay hand-drawn on purpose, not out of oversight: the "prayer"
 * amenity in HotelCard/amenities.tsx and the "ibadah" activity in
 * ItineraryTimeline/icons.tsx. No generic icon pack - this one included -
 * carries a worship/prayer-room glyph; forcing a near-match (a generic
 * building, a moon) would misrepresent what the icon means rather than
 * honestly stand in for it.
 */

export function CloseIcon(): ReactElement {
  return <Xmark aria-hidden="true" focusable="false" />;
}

/** A single downward chevron - a select trigger, an accordion, a dropdown
    affordance. Four components hand-drew this identical path before it
    moved here. */
export function ChevronDownIcon(): ReactElement {
  return <ChevronDown aria-hidden="true" focusable="false" />;
}

/**
 * The "verified" mark - an agency, a package, anywhere trust needs a glyph
 * rather than a sentence.
 */
export function VerifiedIcon(): ReactElement {
  return <CertificateBadge1 aria-hidden="true" focusable="false" />;
}

export type StatusVariant = 'success' | 'warning' | 'error' | 'info';

/*
 * One enclosed shape per variant - CheckCircle1/ErrorHexagon/XmarkCircle/
 * InfoCircle - rather than the mix of bare and enclosed marks the old
 * hand-drawn set had (success and info drew no boundary at all). Enclosing
 * all four is the more consistent reading, not a compromise.
 */
const STATUS_ICON: Record<StatusVariant, typeof CheckCircle1> = {
  success: CheckCircle1,
  warning: ErrorHexagon,
  error: XmarkCircle,
  info: InfoCircle,
};

export function StatusIcon({ variant }: { variant: StatusVariant }): ReactElement {
  const Glyph = STATUS_ICON[variant];
  return <Glyph aria-hidden="true" focusable="false" />;
}
