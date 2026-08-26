import type { ReactElement } from 'react';

/**
 * An amenity is an id that picks an icon plus a label the consumer owns.
 *
 * The label is the accessible name and the tooltip, so it arrives already
 * translated; the id only chooses artwork. An id nobody drew falls back to a
 * generic mark and keeps its label, so a new amenity works before it has an
 * icon.
 */
export interface Amenity {
  id: string;
  label: string;
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' } as const;

/* The set an Umrah hotel actually advertises; anything else gets the dot. */
const AMENITY_ICONS: Record<string, ReactElement> = {
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M4 10a12 12 0 0116 0M7 13.5a7.5 7.5 0 0110 0M10 17a3.5 3.5 0 014 0" {...stroke} />
      <circle cx="12" cy="19.25" r="1" fill="currentColor" />
    </svg>
  ),
  breakfast: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5 10h11v4.5a4.5 4.5 0 01-4.5 4.5H9.5A4.5 4.5 0 015 14.5z" {...stroke} />
      <path d="M16 11h1.5a2 2 0 010 4H16M7.5 4.5v2.25M10.5 4.5v2.25M13.5 4.5v2.25" {...stroke} />
    </svg>
  ),
  shuttle: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4.5 6.5h15v9a1.5 1.5 0 01-1.5 1.5H6a1.5 1.5 0 01-1.5-1.5zM4.5 11.5h15"
        {...stroke}
      />
      <circle cx="8" cy="18.5" r="1.25" {...stroke} />
      <circle cx="16" cy="18.5" r="1.25" {...stroke} />
    </svg>
  ),
  prayer: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5.5 19.5v-7a6.5 6.5 0 0113 0v7" {...stroke} />
      <path d="M3.5 19.5h17M12 6V3.75" {...stroke} />
    </svg>
  ),
  elevator: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="4.5" width="14" height="15" rx="1.5" {...stroke} />
      <path d="M9.5 11.5l-1.75 2h3.5zM14.5 13.5l1.75-2h-3.5z" fill="currentColor" />
    </svg>
  ),
  ac: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 4v16M4 12h16M6.5 6.5l11 11M17.5 6.5l-11 11" {...stroke} />
    </svg>
  ),
  laundry: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="4" width="14" height="16" rx="1.5" {...stroke} />
      <circle cx="12" cy="13" r="4" {...stroke} />
      <path d="M7.5 6.75h.5" {...stroke} />
    </svg>
  ),
  restaurant: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 4v6a2 2 0 002 2v8M9 4v5M5 4v5M16.5 4c-1.5 1-2.5 3-2.5 5.5 0 1.5 1 2.5 2.5 2.5V20M16.5 4V20"
        {...stroke}
      />
    </svg>
  ),
};

export function AmenityGlyph({ id }: { id: string }) {
  return (
    AMENITY_ICONS[id] ?? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="7.25" {...stroke} />
        <circle cx="12" cy="12" r="1.25" fill="currentColor" />
      </svg>
    )
  );
}
