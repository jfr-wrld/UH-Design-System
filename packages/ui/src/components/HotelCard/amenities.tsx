import type { ReactElement } from 'react';
import {
  WaveformLines,
  Cookies,
  TruckDeliveryFast,
  DoubleArrow,
  Chip2,
  RefreshCircle1Clockwise,
  Table2,
} from '@tailgrids/icons';

/**
 * An amenity is an id that picks an icon plus a label the consumer owns.
 *
 * The label is the accessible name and the tooltip, so it arrives already
 * translated; the id only chooses artwork. An id nobody drew falls back to a
 * generic mark and keeps its label, so a new amenity works before it has an
 * icon.
 *
 * `prayer` stays hand-drawn, same reason as always: no generic icon pack
 * carries a prayer-room glyph. The other seven below are a step down from
 * where this file stood on iconoir-react, which really did carry a wifi
 * symbol, a coffee cup, a bus - @tailgrids/icons is a much smaller
 * (~245-icon), generic UI set with none of that vocabulary, so every one of
 * these is the closest *available* shape, not a real match: a waveform for
 * wifi's radio signal, a cookie for breakfast, a delivery truck for the
 * shuttle, an up/down arrow pair for the elevator, a circuit chip for
 * air-conditioning, a clockwise spin for the washing machine, a table for
 * the restaurant. Each one is still paired with its own translated `label`
 * as the accessible name and tooltip, which is what actually carries the
 * meaning - the icon is reinforcement, not the only signal.
 */
export interface Amenity {
  id: string;
  label: string;
}

const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' } as const;

/* The set an Umrah hotel actually advertises; anything else gets the dot. */
const AMENITY_ICONS: Record<string, ReactElement> = {
  wifi: <WaveformLines aria-hidden="true" focusable="false" />,
  breakfast: <Cookies aria-hidden="true" focusable="false" />,
  shuttle: <TruckDeliveryFast aria-hidden="true" focusable="false" />,
  prayer: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M5.5 19.5v-7a6.5 6.5 0 0113 0v7" {...stroke} />
      <path d="M3.5 19.5h17M12 6V3.75" {...stroke} />
    </svg>
  ),
  elevator: <DoubleArrow aria-hidden="true" focusable="false" />,
  ac: <Chip2 aria-hidden="true" focusable="false" />,
  laundry: <RefreshCircle1Clockwise aria-hidden="true" focusable="false" />,
  restaurant: <Table2 aria-hidden="true" focusable="false" />,
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
