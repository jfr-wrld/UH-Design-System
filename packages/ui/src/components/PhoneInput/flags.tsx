import { BN, ID, MY, SG } from 'country-flag-icons/react/3x2';
import { Globe2 } from '@tailgrids/icons';

import type { PhoneCountry } from './phone.js';

/**
 * Real SVG flags rather than emoji: regional-indicator emoji have no glyphs in
 * Segoe UI Emoji, so Chrome and Edge on Windows render them as bare letters.
 * These stay on country-flag-icons regardless of the generic icon pack in
 * use elsewhere - national flags are not "icons" in the generic sense, and
 * no generic icon pack carries them.
 */
const FLAGS = { MY, ID, SG, BN } as const;

function GlobeIcon() {
  return <Globe2 aria-hidden="true" focusable="false" />;
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
