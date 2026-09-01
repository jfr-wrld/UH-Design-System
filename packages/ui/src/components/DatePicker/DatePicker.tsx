import { forwardRef, useId, useMemo, useRef, useState, type ForwardedRef } from 'react';

import { FieldShell } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { Calendar, type DayState } from './Calendar.js';
import { PickerLayer, type CloseReason } from './PickerLayer.js';
import { CalendarIcon } from './icons.js';
import {
  formatDate,
  isSameDay,
  makeIsDisabled,
  openingDate,
  startOfDay,
  type DisabledDates,
} from './date.js';

export interface DatePickerProps {
  label: string;
  value?: Date | null | undefined;
  defaultValue?: Date | null | undefined;
  onChange?: ((value: Date | null) => void) | undefined;
  minDate?: Date | undefined;
  maxDate?: Date | undefined;
  /** A list of days, or a predicate for rules like "no Fridays in Ramadan". */
  disabledDates?: DisabledDates | undefined;
  /** BCP 47 tag. Names every month and weekday through Intl; never a currency. */
  locale?: string | undefined;
  /** Pins the first column of the grid; by default the locale decides. */
  weekStartsOn?: number | undefined;
  helperText?: string | undefined;
  /** Set by the consumer. This component never decides a date is wrong. */
  errorMessage?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  previousMonthLabel?: string | undefined;
  nextMonthLabel?: string | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

function DatePickerImpl(props: DatePickerProps, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    minDate,
    maxDate,
    disabledDates,
    locale = 'en',
    weekStartsOn,
    helperText,
    errorMessage,
    disabled = false,
    required = false,
    placeholder = 'Select a date',
    previousMonthLabel = 'Previous month',
    nextMonthLabel = 'Next month',
    closeLabel = 'Close',
    className,
  } = props;

  const reactId = useId();
  const controlId = `${reactId}-trigger`;
  const messageId = `${reactId}-message`;
  const valueId = `${reactId}-value`;

  const [selected, setSelected] = useControllableState<Date | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });

  const [open, setOpen] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(() => startOfDay(new Date()));
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const isDisabled = useMemo(
    () => makeIsDisabled({ minDate, maxDate, disabledDates }),
    [minDate, maxDate, disabledDates],
  );

  const state = errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;

  function openCalendar() {
    if (disabled) return;
    setFocusedDate(openingDate(selected, { minDate, maxDate, disabledDates }, isDisabled));
    setOpen(true);
  }

  function close(reason: CloseReason) {
    setOpen(false);
    /* After Escape or the sheet's close button, focus belongs back on the
       trigger. After a click outside it belongs wherever the click landed. */
    if (reason !== 'outside') triggerRef.current?.focus();
  }

  function pick(date: Date) {
    setSelected(date);
    setOpen(false);
    triggerRef.current?.focus();
  }

  const dayState = (date: Date): DayState =>
    selected && isSameDay(date, selected) ? 'single' : 'none';

  return (
    <div className={['uh-picker', className].filter(Boolean).join(' ')}>
      <FieldShell
        label={label}
        controlId={controlId}
        size="md"
        state={state}
        required={required}
        disabled={disabled}
        filled={selected !== null}
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
          /* The label names it; the value says what it currently holds. */
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
            data-placeholder={selected ? undefined : 'true'}
          >
            {selected ? formatDate(selected, locale) : placeholder}
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
          autoFocus
        />
      </PickerLayer>
    </div>
  );
}

export const DatePicker = /* @__PURE__ */ forwardRef(DatePickerImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  DatePicker.displayName = 'DatePicker';
}
