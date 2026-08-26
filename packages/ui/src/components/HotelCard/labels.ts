/** Every word the card can put on screen. */
export interface HotelCardLabels {
  /** The headline distance line; which one is used follows `city`. */
  fromHaram: (distance: string) => string;
  fromNabawi: (distance: string) => string;
  /** "3 nights". Intl has no night unit, so the word lives here. */
  nights: (count: string) => string;
  /** The star classification, read as one sentence: "5 out of 5 stars". */
  stars: (count: string) => string;
  /** The overflow counter on the compact amenity row. */
  moreAmenities: (count: string) => string;
}

export const DEFAULT_LABELS: HotelCardLabels = {
  fromHaram: (distance) => `${distance} from Haram`,
  fromNabawi: (distance) => `${distance} from Nabawi`,
  nights: (count) => (count === '1' ? '1 night' : `${count} nights`),
  stars: (count) => `${count} out of 5 stars`,
  moreAmenities: (count) => `+${count}`,
};
