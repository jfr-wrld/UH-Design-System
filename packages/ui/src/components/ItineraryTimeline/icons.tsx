import type { ReactElement } from 'react';
import { Send1, Home, Pin, Table2 } from '@tailgrids/icons';

/**
 * One icon per activity kind. The kind only picks artwork; the words beside it
 * carry the meaning, so an unknown kind falls back to a plain dot and loses
 * nothing a reader needed.
 *
 * `ibadah` stays hand-drawn, same reason as always: no generic icon pack
 * carries a worship glyph. `flight` and `hotel` are loose stand-ins rather
 * than exact matches - @tailgrids/icons (a much smaller, ~245-icon generic
 * UI set than the iconoir-react library this file used to draw from) has no
 * dedicated airplane or bed glyph. `Send1` is a paper-plane silhouette
 * (close enough to read as flight), and `Home` stands in for the hotel-stay
 * activity (lodging, not literally a bed). `ziarah` and `meal` both map
 * onto real, if generic, shapes instead - a location pin and a dining table.
 */
export type ActivityKind = 'flight' | 'hotel' | 'ziarah' | 'ibadah' | 'meal' | (string & {});

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' } as const;

const ICONS: Record<string, ReactElement> = {
  flight: <Send1 aria-hidden="true" focusable="false" />,
  hotel: <Home aria-hidden="true" focusable="false" />,
  ziarah: <Pin aria-hidden="true" focusable="false" />,
  ibadah: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5.5 19.5v-7a6.5 6.5 0 0113 0v7M3.5 19.5h17M12 6V3.75" {...stroke} />
    </svg>
  ),
  meal: <Table2 aria-hidden="true" focusable="false" />,
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
