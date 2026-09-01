import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';
import { ClockThree } from '@tailgrids/icons';

import { FieldShell } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { PickerLayer, type CloseReason } from '../DatePicker/PickerLayer.js';
import { formatTimeValue, pad2, to12Hour, to24Hour, type TimeValue } from '../TimeField/time.js';

export type { TimeValue };
export type TimePickerHourCycle = 12 | 24;

interface Column {
  key: 'hour' | 'minute' | 'period';
  label: string;
  options: readonly { value: number | 'am' | 'pm'; text: string }[];
  selected: number | 'am' | 'pm' | null;
  onSelect: (value: number | 'am' | 'pm') => void;
}

export interface TimePickerProps {
  label: string;
  value?: TimeValue | null | undefined;
  defaultValue?: TimeValue | null | undefined;
  onChange?: ((value: TimeValue | null) => void) | undefined;
  /** @default 12 */
  hourCycle?: TimePickerHourCycle | undefined;
  /** The minute column lists multiples of this - a scrollable list of 60
      single minutes is a worse way to pick a time than typing it (see
      `TimeField` for that), so this defaults coarser.
      @default 5 */
  minuteStep?: number | undefined;
  /** Drives the trigger's displayed value. Never derived from the browser. */
  locale?: string | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  placeholder?: string | undefined;
  closeLabel?: string | undefined;
  className?: string | undefined;
}

function useRovingIndex(length: number, initial: number) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initial, 0), length - 1));
  return [index, setIndex] as const;
}

/** The picker's in-progress selection, one independent piece per column -
    `hour` in whatever cycle is showing (1-12 or 0-23), never yet folded into
    a 24-hour `TimeValue`. Mirrors `TimeField`'s own `Parts`: nothing here
    composes into a real value, and nothing fires `onChange`, until every
    column the current `hourCycle` requires has been touched. */
interface DraftParts {
  hour: number | null;
  minute: number | null;
  period: 'am' | 'pm' | null;
}

function selectedToDraft(value: TimeValue | null, hourCycle: TimePickerHourCycle): DraftParts {
  if (!value) return { hour: null, minute: null, period: null };
  if (hourCycle === 12) {
    const { hour12, period } = to12Hour(value.hour);
    return { hour: hour12, minute: value.minute, period };
  }
  return { hour: value.hour, minute: value.minute, period: null };
}

function draftToValue(draft: DraftParts, hourCycle: TimePickerHourCycle): TimeValue | null {
  if (draft.hour === null || draft.minute === null) return null;
  if (hourCycle === 12 && draft.period === null) return null;
  const hour = hourCycle === 12 ? to24Hour(draft.hour, draft.period as 'am' | 'pm') : draft.hour;
  return { hour, minute: draft.minute };
}

function TimePickerColumn({ column }: { column: Column }) {
  const initial = Math.max(
    column.options.findIndex((o) => o.value === column.selected),
    0,
  );
  const [active, setActive] = useRovingIndex(column.options.length, initial);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /*
   * `PickerLayer` unmounts its children while closed, so this column
   * remounts fresh on every open - meaning this runs exactly once per open,
   * right when a pre-selected value near the bottom (hour 11 or 12, say)
   * would otherwise sit scrolled out of view in the ~5-row-tall column,
   * both visually and as the roving-tabindex focus target. Same convention
   * `Select`'s own listbox already follows for the identical scenario.
   */
  useLayoutEffect(() => {
    itemRefs.current[active]?.scrollIntoView?.({ block: 'nearest' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only, must run before paint
  }, []);

  function move(delta: number) {
    const next = Math.max(0, Math.min(active + delta, column.options.length - 1));
    setActive(next);
    itemRefs.current[next]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Home':
        event.preventDefault();
        setActive(0);
        itemRefs.current[0]?.focus();
        return;
      case 'End':
        event.preventDefault();
        setActive(column.options.length - 1);
        itemRefs.current[column.options.length - 1]?.focus();
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        column.onSelect(column.options[active]!.value);
        return;
      default:
    }
  }

  return (
    <div className="uh-time-picker__column" role="listbox" aria-label={column.label}>
      {column.options.map((option, index) => (
        <button
          key={option.value}
          ref={(el) => {
            itemRefs.current[index] = el;
          }}
          type="button"
          role="option"
          aria-selected={option.value === column.selected}
          tabIndex={index === active ? 0 : -1}
          className="uh-time-picker__option"
          onKeyDown={onKeyDown}
          onClick={() => {
            setActive(index);
            column.onSelect(option.value);
          }}
        >
          {option.text}
        </button>
      ))}
    </div>
  );
}

function TimePickerImpl(props: TimePickerProps, ref: ForwardedRef<HTMLButtonElement>) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    hourCycle = 12,
    minuteStep = 5,
    locale = 'en',
    helperText,
    errorMessage,
    disabled = false,
    required = false,
    placeholder = 'Select a time',
    closeLabel = 'Close',
    className,
  } = props;

  const reactId = useId();
  const controlId = `${reactId}-trigger`;
  const messageId = `${reactId}-message`;
  const valueId = `${reactId}-value`;

  const [selected, setSelected] = useControllableState<TimeValue | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });

  /*
   * `selected` only ever holds a *complete* time (or null) - it is what
   * `onChange` reports and what the trigger displays. `draft` is the
   * columns' own in-progress state: which hour/minute/period a pilgrim has
   * clicked so far this session, independent of whether that's enough yet
   * to compose a real `TimeValue`. Same split `TimeField` makes between its
   * segments and its public value - see `draftToValue` below.
   */
  const isControlled = value !== undefined;
  const [uncontrolledDraft, setUncontrolledDraft] = useState<DraftParts>(() =>
    selectedToDraft(defaultValue ?? null, hourCycle),
  );
  const draft = isControlled ? selectedToDraft(value ?? null, hourCycle) : uncontrolledDraft;

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const state = errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;

  function openPicker() {
    if (disabled) return;
    setOpen(true);
  }

  function close(reason: CloseReason) {
    setOpen(false);
    if (reason !== 'outside') triggerRef.current?.focus();
  }

  const hourValue = draft.hour;
  const minuteValue = draft.minute;
  const periodValue = draft.period;

  function commitPart(part: 'hour' | 'minute' | 'period', partValue: number | 'am' | 'pm') {
    const nextDraft: DraftParts =
      part === 'hour'
        ? { ...draft, hour: partValue as number }
        : part === 'minute'
          ? { ...draft, minute: partValue as number }
          : { ...draft, period: partValue as 'am' | 'pm' };

    if (!isControlled) setUncontrolledDraft(nextDraft);

    /*
     * Only compose and commit once every column the current hourCycle
     * needs has actually been touched - picking just the minute out of an
     * empty picker used to fabricate a default hour (1 AM / midnight) and
     * fire `onChange` with a time nobody chose. Now it waits, the same way
     * `TimeField` withholds a value until every segment is real.
     */
    const composed = draftToValue(nextDraft, hourCycle);
    if (composed) setSelected(composed);
  }

  const hourOptions =
    hourCycle === 12
      ? Array.from({ length: 12 }, (_, i) => ({ value: i + 1, text: pad2(i + 1) }))
      : Array.from({ length: 24 }, (_, i) => ({ value: i, text: pad2(i) }));
  const minuteOptions = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => ({
    value: i * minuteStep,
    text: pad2(i * minuteStep),
  }));
  const periodOptions = [
    { value: 'am' as const, text: 'AM' },
    { value: 'pm' as const, text: 'PM' },
  ];

  const columns: Column[] = [
    {
      key: 'hour',
      label: 'Hour',
      options: hourOptions,
      selected: hourValue,
      onSelect: (v) => commitPart('hour', v),
    },
    {
      key: 'minute',
      label: 'Minute',
      options: minuteOptions,
      selected: minuteValue,
      onSelect: (v) => commitPart('minute', v),
    },
    ...(hourCycle === 12
      ? [
          {
            key: 'period' as const,
            label: 'AM/PM',
            options: periodOptions,
            selected: periodValue,
            onSelect: (v: number | 'am' | 'pm') => commitPart('period', v),
          },
        ]
      : []),
  ];

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
          aria-labelledby={`${controlId}-label ${valueId}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-describedby={message ? messageId : undefined}
          aria-invalid={state === 'error' || undefined}
          disabled={disabled}
          onClick={() => (open ? close('button') : openPicker())}
        >
          <span
            id={valueId}
            className="uh-picker__value"
            data-placeholder={selected ? undefined : 'true'}
          >
            {selected ? formatTimeValue(selected, hourCycle, locale) : placeholder}
          </span>
          <span className="uh-picker__icon" aria-hidden="true">
            <ClockThree />
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
        <div className="uh-time-picker__columns">
          {columns.map((column) => (
            <TimePickerColumn key={column.key} column={column} />
          ))}
        </div>
      </PickerLayer>
    </div>
  );
}

export const TimePicker = /* @__PURE__ */ forwardRef(TimePickerImpl);

if (process.env.NODE_ENV !== 'production') {
  TimePicker.displayName = 'TimePicker';
}
