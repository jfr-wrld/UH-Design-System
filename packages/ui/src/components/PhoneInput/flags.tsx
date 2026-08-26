import { BN, ID, MY, SG } from 'country-flag-icons/react/3x2';

import type { PhoneCountry } from './phone.js';

/**
 * Real SVG flags rather than emoji: regional-indicator emoji have no glyphs in
 * Segoe UI Emoji, so Chrome and Edge on Windows render them as bare letters.
 */
const FLAGS = { MY, ID, SG, BN } as const;

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

export function CountryMark({ country }: { country: PhoneCountry }) {
  if (country === 'other') {
    return (
      <span className="uh-phone__globe" aria-hidden="true">
        <GlobeIcon />
      </span>
    );
  }
  const Flag = FLAGS[country];
  return (
    <span className="uh-phone__flag" aria-hidden="true">
      <Flag />
    </span>
  );
}
