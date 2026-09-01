import { forwardRef, useId, useMemo, useRef, useState, type ForwardedRef } from 'react';

import { FieldShell } from '../Field/FieldShell.js';
import { Calendar, type DayState } from './Calendar.js';
import { PickerLayer, type CloseReason } from './PickerLayer.js';
import { CalendarIcon } from './icons.js';
import {
  addDays,
  compareDay,
  dayCount,
  formatDate,
  formatDateRange,
  isSameDay,
  makeIsDisabled,
  openingDate,
  startOfDay,
  type DisabledDates,
} from './date.js';

export interface DateRangeStatusLabels {
  chooseStart: string;
  chooseEnd: (start: string) => string;
  chosen: (range: string, days: number) => string;
}

export interface DateRangePickerProps {
  label: string;
  startDate?: Date | null | undefined;
  endDate?: Date | null | undefined;
  defaultStartDate?: Date | null | undefined;
  defaultEndDate?: Date | null | undefined;
  /** Fires on both clicks: once with the start alone, then with both ends. */
  onChange?: ((start: Date | null, end: Date | null) => void) | undefined;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  disabledDates?: DisabledDates | undefined;
  /** Shortest allowed stay, counted in days including both ends. */
  minRange?: number | undefined;
  /** Longest allowed stay, counted the same way. */
  maxRange?: number | undefined;
  locale?: string | undefined;
  /** Pins the first column of the grid; by default the locale decides. */
  weekStartsOn?: number | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  previousMonthLabel?: string | undefined;
  nextMonthLabel?: string | undefined;
  closeLabel?: string | undefined;
  statusLabels?: DateRangeStatusLabels | undefined;
  className?: string | undefined;
}

interface Range {
  start: Date | null;
  end: Date | null;
}

const DEFAULT_STATUS: DateRangeStatusLabels = {
  chooseStart: 'Choose a departure date.',
  chooseEnd: (start) => `Departure ${start}. Now choose a return date.`,
  chosen: (range, days) => `${range}. ${days} days.`,
};

function DateRangePickerImpl(props: DateRangePickerProps, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    label,
    startDate,
    endDate,
    defaultStartDate,
    defaultEndDate,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    minRange,
    maxRange,
    locale = 'en',
    weekStartsOn,
    helperText,
    errorMessage,
    disabled = false,
    required = false,
    placeholder = 'Select dates',
    previousMonthLabel = 'Previous month',
    nextMonthLabel = 'Next month',
    closeLabel = 'Close',
    statusLabels = DEFAULT_STATUS,
    className,
  } = props;

  const reactId = useId();
  const controlId = `${reactId}-trigger`;
  const messageId = `${reactId}-message`;
  const valueId = `${reactId}-value`;

  const controlled = startDate !== undefined || endDate !== undefined;
  const [internal, setInternal] = useState<Range>({
    start: defaultStartDate ?? null,
    end: defaultEndDate ?? null,
  });
  /* Memoised: a fresh object on every render would change the identity of the
     dependency lists below it, and the range scans would rerun on every move of
     the pointer. */
  const range: Range = useMemo(
    () => (controlled ? { start: startDate ?? null, end: endDate ?? null } : internal),
    [controlled, startDate, endDate, internal],
  );

  const [open, setOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(new Date()));
  const [hovered, setHovered] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const outOfBounds = useMemo(
    () => makeIsDisabled({ minDate, maxDate, disabledDates }),
    [minDate, maxDate, disabledDates],
  );

  /* Half-chosen: a start is down and the return is still open. */
  const pickingEnd = range.start !== null && range.end === null;

  /*
   * The first ruled-out day after the start. A stay cannot jump over a day the
   * consumer has closed, so everything from here on is out for this start, and
   * finding it once is cheaper than re-walking the gap for all forty-two cells.
   */
  const firstBlocked = useMemo(() => {
    const { start } = range;
    if (!pickingEnd || !start) return null;
    const limit = maxRange ?? 366;
    for (let offset = 1; offset <= limit; offset += 1) {
      const day = addDays(start, offset);
      if (outOfBounds(day)) return day;
    }
    return null;
  }, [pickingEnd, range, maxRange, outOfBounds]);

  const isDisabled = useMemo(() => {
    const { start } = range;
    return (date: Date): boolean => {
      if (outOfBounds(date)) return true;
      if (!pickingEnd || !start) return false;
      /* Anything before the start stays live: clicking there starts over
         rather than being a dead cell the pilgrim has to puzzle over. */
      if (compareDay(date, start) < 0) return false;

      const span = dayCount(start, date);
      if (minRange !== undefined && span < minRange) return true;
      if (maxRange !== undefined && span > maxRange) return true;
      if (firstBlocked && compareDay(date, firstBlocked) >= 0) return true;
      return false;
    };
  }, [range, pickingEnd, outOfBounds, minRange, maxRange, firstBlocked]);

  const state = errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;

  function emit(next: Range) {
    if (!controlled) setInternal(next);
    onChange?.(next.start, next.end);
  }

  function openCalendar() {
    if (disabled) return;
    setFocusedDate(openingDate(range.start, { minDate, maxDate, disabledDates }, outOfBounds));
    setHovered(null);
    setOpen(true);
  }

  function close(reason: CloseReason) {
    setOpen(false);
    setHovered(null);
    if (reason !== 'outside') triggerRef.current?.focus();
  }

  function pick(date: Date) {
    const { start } = range;
    if (!pickingEnd || !start || compareDay(date, start) < 0) {
      emit({ start: date, end: null });
      setHovered(null);
      return;
    }
    emit({ start, end: date });
    setOpen(false);
    setHovered(null);
    triggerRef.current?.focus();
  }

  /* While the return is open, the hovered day stands in for it, so the band
     between the two fills in as the pointer moves. */
  const previewEnd =
    pickingEnd && hovered && range.start && compareDay(hovered, range.start) > 0 ? hovered : null;
  const bandEnd = range.end ?? previewEnd;

  function dayState(date: Date): DayState {
    const { start } = range;
    if (!start) return 'none';
    if (!bandEnd) return isSameDay(date, start) ? 'start' : 'none';
    if (isSameDay(date, start) && isSameDay(date, bandEnd)) return 'single';
    if (isSameDay(date, start)) return 'start';
    if (isSameDay(date, bandEnd)) return 'end';
    if (compareDay(date, start) > 0 && compareDay(date, bandEnd) < 0) return 'middle';
    return 'none';
  }

  const triggerText =
    range.start && range.end
      ? formatDateRange(range.start, range.end, locale)
      : range.start
        ? formatDate(range.start, locale)
        : placeholder;

  /*
   * The band between the two ends is drawn, which says nothing to a screen
   * reader. This says it in words, and updates as each end is chosen.
   */
  const status =
    range.start && range.end
      ? statusLabels.chosen(
          formatDateRange(range.start, range.end, locale),
          dayCount(range.start, range.end),
        )
      : range.start
        ? statusLabels.chooseEnd(formatDate(range.start, locale))
        : statusLabels.chooseStart;

  return (
    <div className={['uh-picker', className].filter(Boolean).join(' ')}>
      <FieldShell
        label={label}
        controlId={controlId}
        size="md"
        state={state}
        required={required}
        disabled={disabled}
        filled={range.start !== null}
        labelAsText
        message={message}
        messageId={messageId}
      >
        <button
          ref={(element) => {
            triggerRef.current = element;
            if (typeof ref === 'function') ref(element);
            else if (ref) ref.current = element;
          }}
          type="button"
          id={controlId}
          className="uh-picker__trigger"
          aria-labelledby={`${controlId}-label ${valueId}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={state === 'error' || undefined}
          disabled={disabled}
          onClick={() => (open ? close('button') : openCalendar())}
        >
          <span
            id={valueId}
            className="uh-picker__value"
            data-placeholder={range.start ? undefined : 'true'}
          >
            {triggerText}
          </span>
          <span className="uh-picker__icon" aria-hidden="true">
            <CalendarIcon />
          </span>
        </button>
      </FieldShell>

      <PickerLayer
        open={open}
        onClose={close}
        anchorRef={triggerRef}
        label={label}
        closeLabel={closeLabel}
        footer={
          <p className="uh-picker__status" role="status">
            {status}
          </p>
        }
      >
        <Calendar
          focusedDate={focusedDate}
          onFocusedDateChange={setFocusedDate}
          onSelect={pick}
          isDisabled={isDisabled}
          dayState={dayState}
          locale={locale}
          gridLabel={label}
          weekStartsOn={weekStartsOn}
          labels={{ previousMonth: previousMonthLabel, nextMonth: nextMonthLabel }}
          onHover={setHovered}
          autoFocus
        />
      </PickerLayer>
    </div>
  );
}

export const DateRangePicker = /* @__PURE__ */ forwardRef(DateRangePickerImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  DateRangePicker.displayName = 'DateRangePicker';
}
