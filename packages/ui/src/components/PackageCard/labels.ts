export type PackageBadge = 'bestSeller' | 'promo' | 'almostFull';

/**
 * Every word the card can put on screen.
 *
 * The distance lines are functions rather than a prefix and a suffix: Malay
 * and Indonesian both put "dari" before the landmark, and English wants "from"
 * after the number, so only the translator can say where the pieces go.
 */
export interface PackageCardLabels {
  badges: Record<PackageBadge, string>;
  verified: string;
  makkahDistance: (distance: string) => string;
  madinahDistance: (distance: string) => string;
  seatsLeft: (count: string) => string;
  soldOut: string;
  addToWishlist: (title: string) => string;
  removeFromWishlist: (title: string) => string;
  rating: (value: string, max: string, reviewCount: number | undefined) => string;
  loading: string;
}

export const DEFAULT_LABELS: PackageCardLabels = {
  badges: {
    bestSeller: 'Best seller',
    promo: 'Promo',
    almostFull: 'Almost full',
  },
  verified: 'Verified agency',
  makkahDistance: (distance) => `${distance} from Haram`,
  madinahDistance: (distance) => `${distance} from Nabawi`,
  seatsLeft: (count) => `${count} seats left`,
  soldOut: 'Sold out',
  addToWishlist: (title) => `Save ${title}`,
  removeFromWishlist: (title) => `Remove ${title} from saved`,
  rating: (value, max, reviewCount) =>
    reviewCount === undefined
      ? `${value} out of ${max}`
      : `${value} out of ${max}, ${reviewCount} reviews`,
  loading: 'Loading package',
};

/** Which Badge variant each package badge borrows. */
export const BADGE_VARIANT: Record<PackageBadge, 'primary' | 'secondary' | 'warning'> = {
  /* Teal: a fact about the package, not a call to action. */
  bestSeller: 'primary',
  /* The accent, spent once per card on the thing meant to be noticed. */
  promo: 'secondary',
  /* Scarcity is a warning, and shares its colour with the seat counter. */
  almostFull: 'warning',
};
