/** Every word the card can put on screen. */
export interface AgencyCardLabels {
  verified: string;
  licenseNumber: string;
  yearsOperating: (years: string) => string;
  packages: (count: string) => string;
  rating: (value: string, max: string, reviewCount: number | undefined) => string;
}

export const DEFAULT_LABELS: AgencyCardLabels = {
  verified: 'Verified Agency',
  licenseNumber: 'License No.',
  yearsOperating: (years) => `${years} years in operation`,
  packages: (count) => `${count} packages`,
  rating: (value, max, reviewCount) =>
    reviewCount === undefined
      ? `${value} out of ${max}`
      : `${value} out of ${max}, ${reviewCount} reviews`,
};
