import {
  AE,
  AU,
  BD,
  BN,
  EG,
  GB,
  ID,
  IN,
  MY,
  PH,
  PK,
  SA,
  SG,
  TH,
  TR,
} from 'country-flag-icons/react/3x2';

/**
 * Derived from the library's own export rather than re-declared: these flags
 * are typed against an `HTMLElement & SVGElement` intersection that does not
 * match a plain `SVGProps<SVGSVGElement>`.
 */
export type FlagComponent = typeof MY;

export interface Country {
  /** ISO 3166-1 alpha-2, uppercase. */
  iso2: string;
  name: string;
  /** Including the leading plus. */
  dialCode: string;
  Flag: FlagComponent;
}

/**
 * A focused default list rather than all 250 countries: the markets the
 * platform sells in, the pilgrimage destinations, and the origins that
 * actually appear in Malaysian and Indonesian bookings.
 *
 * Flags come from `country-flag-icons` (MIT). They are real SVGs, not emoji:
 * regional-indicator emoji are absent from Segoe UI Emoji, so Chrome and Edge
 * on Windows render them as bare letters. Drawing them by hand was not an
 * option either — the Saudi flag carries the shahada, and Malaysia's star has
 * fourteen points.
 *
 * Pass your own `countries` to PhoneInput to replace this entirely.
 */
export const DEFAULT_COUNTRIES: Country[] = [
  { iso2: 'MY', name: 'Malaysia', dialCode: '+60', Flag: MY },
  { iso2: 'ID', name: 'Indonesia', dialCode: '+62', Flag: ID },
  { iso2: 'SG', name: 'Singapore', dialCode: '+65', Flag: SG },
  { iso2: 'BN', name: 'Brunei', dialCode: '+673', Flag: BN },
  { iso2: 'TH', name: 'Thailand', dialCode: '+66', Flag: TH },
  { iso2: 'PH', name: 'Philippines', dialCode: '+63', Flag: PH },
  { iso2: 'IN', name: 'India', dialCode: '+91', Flag: IN },
  { iso2: 'PK', name: 'Pakistan', dialCode: '+92', Flag: PK },
  { iso2: 'BD', name: 'Bangladesh', dialCode: '+880', Flag: BD },
  { iso2: 'SA', name: 'Saudi Arabia', dialCode: '+966', Flag: SA },
  { iso2: 'AE', name: 'United Arab Emirates', dialCode: '+971', Flag: AE },
  { iso2: 'EG', name: 'Egypt', dialCode: '+20', Flag: EG },
  { iso2: 'TR', name: 'Türkiye', dialCode: '+90', Flag: TR },
  { iso2: 'GB', name: 'United Kingdom', dialCode: '+44', Flag: GB },
  { iso2: 'AU', name: 'Australia', dialCode: '+61', Flag: AU },
];
