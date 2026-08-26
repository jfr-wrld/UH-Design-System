/** Every word the review card can put on screen. */
export interface ReviewCardLabels {
  readMore: string;
  showLess: string;
  verifiedPurchase: string;
  helpful: (count: string) => string;
  /** Accessible name of a photo thumbnail: "Photo 2 of 5". */
  photo: (position: string, total: string) => string;
  rating: (value: string, max: string, reviewCount: number | undefined) => string;
}

export const DEFAULT_LABELS: ReviewCardLabels = {
  readMore: 'Read more',
  showLess: 'Show less',
  verifiedPurchase: 'Verified purchase',
  helpful: (count) => `Helpful (${count})`,
  photo: (position, total) => `Photo ${position} of ${total}`,
  rating: (value, max) => `${value} out of ${max}`,
};

/** Every word the breakdown can put on screen. */
export interface RatingBreakdownLabels {
  /** Names the whole figure: "Rating breakdown". */
  breakdown: string;
  /** One row, read as a sentence: "5 stars: 128 reviews". */
  row: (stars: string, count: string) => string;
  /** Under the average: "1,284 reviews". */
  reviews: (count: string) => string;
}

export const BREAKDOWN_LABELS: RatingBreakdownLabels = {
  breakdown: 'Rating breakdown',
  row: (stars, count) =>
    `${stars} ${stars === '1' ? 'star' : 'stars'}: ${count} ${count === '1' ? 'review' : 'reviews'}`,
  reviews: (count) => (count === '1' ? '1 review' : `${count} reviews`),
};
