import type { ReactElement } from 'react';

/**
 * One icon per activity kind. The kind only picks artwork; the words beside it
 * carry the meaning, so an unknown kind falls back to a plain dot and loses
 * nothing a reader needed.
 */
export type ActivityKind = 'flight' | 'hotel' | 'ziarah' | 'ibadah' | 'meal' | (string & {});

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' } as const;

const ICONS: Record<string, ReactElement> = {
  flight: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4 15l16-6.5-2 5.5-6.5 2L8 19l-1-3zM10.5 13.5L7 10"
        {...stroke}
        strokeLinejoin="round"
      />
    </svg>
  ),
  hotel: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3.5 18.5v-11M3.5 15.5h17v3M9.5 15.5V10a1.5 1.5 0 011.5-1.5h6a3.5 3.5 0 013.5 3.5v3.5"
        {...stroke}
      />
      <circle cx="6.5" cy="11" r="1.5" {...stroke} />
    </svg>
  ),
  ziarah: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M12 20.5s6.5-5.5 6.5-10.5a6.5 6.5 0 00-13 0c0 5 6.5 10.5 6.5 10.5z"
        {...stroke}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" {...stroke} />
    </svg>
  ),
  ibadah: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5.5 19.5v-7a6.5 6.5 0 0113 0v7M3.5 19.5h17M12 6V3.75" {...stroke} />
    </svg>
  ),
  meal: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 4v6a2 2 0 002 2v8M9 4v5M5 4v5M16.5 4c-1.5 1-2.5 3-2.5 5.5 0 1.5 1 2.5 2.5 2.5V20M16.5 4V20"
        {...stroke}
      />
    </svg>
  ),
};

export function ActivityGlyph({ kind }: { kind: string }) {
  return (
    ICONS[kind] ?? (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      </svg>
    )
  );
}
