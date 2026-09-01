import { useEffect, useMemo, useRef, type KeyboardEvent } from 'react';
import {
  ChevronLeft as ChevronLeftGlyph,
  ChevronRight as ChevronRightGlyph,
} from '@tailgrids/icons';

import {
  addDays,
  addMonths,
  dayNumber,
  dayOfWeekIndex,
  fullDateLabel,
  isSameDay,
  monthGrid,
  monthYearLabel,
  nearestEnabledInMonth,
  nextEnabled,
  startOfDay,
  weekStart,
  weekdayNames,
} from './date.js';

/** How a day sits in the current selection. Drives the cell's paint. */
export type DayState = 'none' | 'single' | 'start' | 'end' | 'middle';

export interface CalendarLabels {
  previousMonth: string;
  nextMonth: string;
}

export interface CalendarProps {
  /** The day the roving tab stop is on. The visible month follows it. */
  focusedDate: Date;
  onFocusedDateChange: (date: Date) => void;
  onSelect: (date: Date) => void;
  isDisabled: (date: Date) => boolean;
  dayState: (date: Date) => DayState;
  locale: string;
  labels: CalendarLabels;
  gridLabel: string;
  /**
   * Overrides the locale's own first day of the week, 0 for Sunday through 6
   * for Saturday. Left alone, Intl decides: Malay weeks start on Monday while
   * English and Indonesian weeks start on Sunday, so a product that wants one
   * shape across all three has to say so.
   */
  weekStartsOn?: number | undefined;
  /** Range preview. Called with null when the pointer leaves the grid. */
  onHover?: ((date: Date | null) => void) | undefined;
  autoFocus?: boolean | undefined;
}

function ChevronLeft() {
  return <ChevronLeftGlyph aria-hidden="true" focusable="false" />;
}

function ChevronRight() {
  return <ChevronRightGlyph aria-hidden="true" focusable="false" />;
}

export function Calendar({
  focusedDate,
  onFocusedDateChange,
  onSelect,
  isDisabled,
  dayState,
  locale,
  labels,
  gridLabel,
  weekStartsOn,
  onHover,
  autoFocus = false,
}: CalendarProps) {
  const startsOn = useMemo(() => weekStartsOn ?? weekStart(locale), [weekStartsOn, locale]);
  const weekdays = useMemo(() => weekdayNames(locale, startsOn), [locale, startsOn]);
  const weeks = useMemo(() => monthGrid(focusedDate, startsOn), [focusedDate, startsOn]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const gridRef = useRef<HTMLTableElement | null>(null);
  const cells = useRef(new Map<number, HTMLTableCellElement>());

  const previous = nearestEnabledInMonth(addMonths(focusedDate, -1), isDisabled);
  const next = nearestEnabledInMonth(addMonths(focusedDate, 1), isDisabled);

  /*
   * Focus follows the roving tab stop, but only once focus is already inside
   * the grid. Without that guard, a consumer re-rendering the page would drag
   * the caret into a calendar nobody was looking at.
   */
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const inside = grid.contains(document.activeElement);
    if (!inside && !autoFocus) return;
    cells.current.get(startOfDay(focusedDate).getTime())?.focus();
  }, [focusedDate, autoFocus]);

  function moveTo(candidate: Date | null) {
    if (candidate) onFocusedDateChange(candidate);
  }

  /** Steps by `amount` days, then keeps walking until it finds a free day. */
  function step(amount: number) {
    const direction = amount < 0 ? -1 : 1;
    moveTo(nextEnabled(addDays(focusedDate, amount), direction, isDisabled));
  }

  function onKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        step(-1);
        return;
      case 'ArrowRight':
        event.preventDefault();
        step(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        step(-7);
        return;
      case 'ArrowDown':
        event.preventDefault();
        step(7);
        return;
      case 'PageUp':
        event.preventDefault();
        moveTo(previous);
        return;
      case 'PageDown':
        event.preventDefault();
        moveTo(next);
        return;
      case 'Home': {
        event.preventDefault();
        const index = dayOfWeekIndex(focusedDate, startsOn);
        moveTo(nextEnabled(addDays(focusedDate, -index), 1, isDisabled, 7));
        return;
      }
      case 'End': {
        event.preventDefault();
        const index = dayOfWeekIndex(focusedDate, startsOn);
        moveTo(nextEnabled(addDays(focusedDate, 6 - index), -1, isDisabled, 7));
        return;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isDisabled(focusedDate)) onSelect(focusedDate);
        return;
      default:
    }
  }

  return (
    <div className="uh-calendar">
      <div className="uh-calendar__header">
        <button
          type="button"
          className="uh-calendar__nav"
          aria-label={labels.previousMonth}
          disabled={!previous}
          onClick={() => moveTo(previous)}
        >
          <ChevronLeft />
        </button>

        {/* The grid is named by what is written here, so the two cannot disagree. */}
        <span className="uh-calendar__month" aria-live="polite">
          {monthYearLabel(focusedDate, locale)}
        </span>

        <button
          type="button"
          className="uh-calendar__nav"
          aria-label={labels.nextMonth}
          disabled={!next}
          onClick={() => moveTo(next)}
        >
          <ChevronRight />
        </button>
      </div>

      <table
        ref={gridRef}
        className="uh-calendar__grid"
        role="grid"
        aria-label={`${gridLabel}, ${monthYearLabel(focusedDate, locale)}`}
        onKeyDown={onKeyDown}
        onMouseLeave={() => onHover?.(null)}
      >
        <thead>
          <tr role="row">
            {weekdays.map((day) => (
              <th key={day.long} scope="col" className="uh-calendar__weekday">
                {/* The short name is what fits; the full one is what is read. */}
                <abbr title={day.long}>{day.short}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]!.date.getTime()} role="row">
              {week.map(({ date, outside }) => {
                const time = startOfDay(date).getTime();
                const disabled = isDisabled(date);
                const state = dayState(date);
                const focused = isSameDay(date, focusedDate);

                return (
                  <td
                    key={time}
                    ref={(element) => {
                      if (element) cells.current.set(time, element);
                      else cells.current.delete(time);
                    }}
                    role="gridcell"
                    className="uh-calendar__day"
                    /*
                     * One tab stop for the whole grid, and never a disabled
                     * day: arrow keys walk past those, so the only way to
                     * land on one would be to put it in the tab order.
                     */
                    tabIndex={focused && !disabled ? 0 : -1}
                    aria-label={fullDateLabel(date, locale)}
                    aria-selected={state !== 'none'}
                    aria-disabled={disabled || undefined}
                    aria-current={isSameDay(date, today) ? 'date' : undefined}
                    data-outside={outside ? 'true' : undefined}
                    data-state={state}
                    data-today={isSameDay(date, today) ? 'true' : undefined}
                    onClick={() => {
                      if (disabled) return;
                      onFocusedDateChange(date);
                      onSelect(date);
                    }}
                    onMouseEnter={() => !disabled && onHover?.(date)}
                  >
                    <span className="uh-calendar__number">{dayNumber(date, locale)}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
