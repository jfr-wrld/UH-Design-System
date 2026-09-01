import type { ReactElement } from 'react';
import { Calendar as CalendarGlyph } from '@tailgrids/icons';

/** Shared between DatePicker and DateRangePicker - one calendar glyph, not
    two hand-drawn copies. Generic UI chrome, so it comes from @tailgrids/icons
    - see the comment in lib/icons.tsx for why that is tree-shake-safe. */
export function CalendarIcon(): ReactElement {
  return <CalendarGlyph aria-hidden="true" focusable="false" />;
}
