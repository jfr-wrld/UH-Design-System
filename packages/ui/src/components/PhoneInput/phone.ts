export type PhoneCountry = 'MY' | 'ID' | 'SG' | 'BN' | 'other';

export interface CountryRule {
  iso2: PhoneCountry;
  name: string;
  /** Without the plus. */
  dial: string;
  /** Digit dropped when writing the number nationally, if the country uses one. */
  trunk: string;
  /** Digit-group sizes and the separators between them, for display only. */
  groups: number[];
  separators: string[];
  /** Plausible national significant number lengths, used to spot a dial code. */
  nationalLength: [min: number, max: number];
  example: string;
}

/**
 * Four countries, not a world list. The platform sells in these markets, and a
 * picker of five is a popover rather than a searchable dropdown.
 */
export const COUNTRY_RULES: Record<Exclude<PhoneCountry, 'other'>, CountryRule> = {
  MY: {
    iso2: 'MY',
    name: 'Malaysia',
    dial: '60',
    trunk: '0',
    groups: [2, 3, 4],
    separators: ['-', ' '],
    nationalLength: [9, 10],
    example: '012-345 6789',
  },
  ID: {
    iso2: 'ID',
    name: 'Indonesia',
    dial: '62',
    trunk: '0',
    groups: [3, 4, 4],
    separators: ['-', '-'],
    nationalLength: [9, 12],
    example: '0812-3456-7890',
  },
  SG: {
    iso2: 'SG',
    name: 'Singapore',
    dial: '65',
    trunk: '',
    groups: [4, 4],
    separators: [' '],
    nationalLength: [8, 8],
    example: '9123 4567',
  },
  BN: {
    iso2: 'BN',
    name: 'Brunei',
    dial: '673',
    trunk: '',
    groups: [3, 4],
    separators: [' '],
    nationalLength: [7, 7],
    example: '712 3456',
  },
};

/** Longest dial code first, so +673 is tested before +6. */
const BY_DIAL = Object.values(COUNTRY_RULES).sort((a, b) => b.dial.length - a.dial.length);

const digitsOf = (raw: string) => raw.replace(/\D/g, '');

export interface ParsedPhone {
  country: PhoneCountry;
  /** National significant number: no trunk digit, no dial code. */
  national: string;
  /** Only meaningful when country is 'other'. */
  dial: string;
}

/**
 * Works out what someone meant by what they typed or pasted.
 *
 * The same Malaysian mobile arrives as "0123456789", "+60123456789",
 * "60123456789" or "012-345 6789", and all four have to land on the same
 * stored value. A leading dial code is only stripped when what remains is a
 * plausible national length, so a number that genuinely begins with those
 * digits survives.
 */
export function parsePhone(raw: string, fallback: PhoneCountry, fallbackDial = ''): ParsedPhone {
  const trimmed = raw.trim();
  const explicitPlus = trimmed.startsWith('+');
  const digits = digitsOf(trimmed);

  if (digits === '') {
    return { country: fallback, national: '', dial: fallbackDial };
  }

  // An explicit + names the country outright.
  if (explicitPlus) {
    const match = BY_DIAL.find((rule) => digits.startsWith(rule.dial));
    if (match) {
      return {
        country: match.iso2,
        national: stripTrunk(digits.slice(match.dial.length), match),
        dial: match.dial,
      };
    }
    return { country: 'other', national: digits, dial: '' };
  }

  const rule = fallback === 'other' ? undefined : COUNTRY_RULES[fallback];
  if (!rule) return { country: 'other', national: digits, dial: fallbackDial };

  // Bare digits that open with this country's dial code, e.g. "60123456789".
  if (digits.startsWith(rule.dial)) {
    const rest = stripTrunk(digits.slice(rule.dial.length), rule);
    const [min, max] = rule.nationalLength;
    if (rest.length >= min && rest.length <= max) {
      return { country: rule.iso2, national: rest, dial: rule.dial };
    }
  }

  return { country: rule.iso2, national: stripTrunk(digits, rule), dial: rule.dial };
}

function stripTrunk(digits: string, rule: CountryRule): string {
  if (rule.trunk && digits.startsWith(rule.trunk)) return digits.slice(rule.trunk.length);
  return digits;
}

/** The stored form: plus, dial code, national digits, nothing else. */
export function toE164(country: PhoneCountry, national: string, otherDial = ''): string {
  const digits = digitsOf(national);
  const dial = country === 'other' ? digitsOf(otherDial) : COUNTRY_RULES[country].dial;
  if (dial === '' && digits === '') return '';
  return `+${dial}${digits}`;
}

/**
 * How the number is shown while it is being worked on. Grouping is per country
 * and tolerant: anything past the known pattern is appended rather than
 * dropped, because a half-typed or unusual number still has to be readable.
 */
export function formatNational(country: PhoneCountry, national: string): string {
  const digits = digitsOf(national);
  if (digits === '' || country === 'other') return digits;

  const rule = COUNTRY_RULES[country];
  const withTrunk = rule.trunk ? rule.trunk + digits : digits;

  const out: string[] = [];
  let index = 0;
  for (let g = 0; g < rule.groups.length && index < withTrunk.length; g += 1) {
    const size = rule.groups[g] as number;
    // The trunk digit rides along in the first group.
    const take = g === 0 && rule.trunk ? size + rule.trunk.length : size;
    out.push(withTrunk.slice(index, index + take));
    index += take;
    if (index < withTrunk.length && rule.separators[g]) out.push(rule.separators[g] as string);
  }
  if (index < withTrunk.length) out.push(withTrunk.slice(index));

  return out.join('');
}

/** Splits a stored E.164 value back into a country and a national number. */
export function fromE164(value: string, fallback: PhoneCountry): ParsedPhone {
  if (!value) return { country: fallback, national: '', dial: '' };
  return parsePhone(value.startsWith('+') ? value : `+${value}`, fallback);
}
