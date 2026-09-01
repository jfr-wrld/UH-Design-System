import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { clampWrap, pad2, to12Hour, to24Hour, toNativeTimeString, type TimeValue } from './time.js';

export type { TimeValue };
export type TimeFieldGranularity = 'minute' | 'second';
export type TimeFieldHourCycle = 12 | 24;

type Period = 'am' | 'pm';
type SegmentKind = 'hour' | 'minute' | 'second' | 'period';

interface Parts {
  hour: number | null;
  minute: number | null;
  second: number | null;
  period: Period | null;
}

export interface TimeFieldLabels {
  hour: string;
  minute: string;
  second: string;
  period: string;
}

const DEFAULT_LABELS: TimeFieldLabels = {
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
  period: 'AM/PM',
};

export interface TimeFieldProps {
  label: string;
  value?: TimeValue | null | undefined;
  defaultValue?: TimeValue | null | undefined;
  onChange?: ((value: TimeValue | null) => void) | undefined;
  size?: FieldSize | undefined;
  /** @default 'minute' */
  granularity?: TimeFieldGranularity | undefined;
  /** @default 12 */
  hourCycle?: TimeFieldHourCycle | undefined;
  helperText?: string | undefined;
  /** Presence switches the field into its error state. */
  errorMessage?: string | undefined;
  /** Presence switches the field into its success state, unless there is an error. */
  successMessage?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  fullWidth?: boolean | undefined;
  autoFocus?: boolean | undefined;
  /** Submits alongside a native `<form>`, as `HH:MM` (or `HH:MM:SS`) - the
      same shape `<input type="time">` would send. Absent while the value
      is incomplete, same as a native time input left half-filled. */
  name?: string | undefined;
  form?: string | undefined;
  /** Accessible names for each segment; override to localise. */
  segmentLabels?: Partial<TimeFieldLabels> | undefined;
  className?: string | undefined;
}

function valueToParts(value: TimeValue | null | undefined, hourCycle: TimeFieldHourCycle): Parts {
  if (!value) return { hour: null, minute: null, second: null, period: null };
  if (hourCycle === 12) {
    const { hour12, period } = to12Hour(value.hour);
    return { hour: hour12, minute: value.minute, second: value.second ?? null, period };
  }
  return { hour: value.hour, minute: value.minute, second: value.second ?? null, period: null };
}

function partsToValue(
  parts: Parts,
  hourCycle: TimeFieldHourCycle,
  granularity: TimeFieldGranularity,
): TimeValue | null {
  if (parts.hour === null || parts.minute === null) return null;
  if (hourCycle === 12 && parts.period === null) return null;
  if (granularity === 'second' && parts.second === null) return null;
  const hour = hourCycle === 12 ? to24Hour(parts.hour, parts.period as Period) : parts.hour;
  return granularity === 'second'
    ? { hour, minute: parts.minute, second: parts.second ?? 0 }
    : { hour, minute: parts.minute };
}

interface SegmentDef {
  kind: Exclude<SegmentKind, 'period'>;
  min: number;
  max: number;
}

/** How long a first digit waits for a possible second one before the field
    settles on it and moves on - long enough not to feel like a race against
    the clock, short enough that a single-digit entry (typing "5" for
    5 minutes) doesn't leave the field stuck waiting. */
const DIGIT_BUFFER_MS = 600;

/**
 * A segment-based time input: Hour, Minute, an optional Second, and (in
 * 12-hour mode) an AM/PM segment, each independently focusable and
 * editable - the same interaction native `<input type="time">` offers,
 * just scriptable and themeable, which the native element is not. No
 * dependency pulled in for this: each segment follows the WAI-ARIA
 * spinbutton pattern by hand (`role="spinbutton"`, arrow keys to step,
 * digits to type a value), the same way `OTPInput` hand-rolls its own
 * per-box keyboard handling instead of reaching for a library.
 *
 * `value`/`defaultValue`/`onChange` always carry a *complete* time or
 * `null` - there is no partial value in the public API. Typing a single
 * digit into an otherwise-empty field is still visible on screen (each
 * segment renders its own placeholder independently), but `onChange` only
 * fires once every segment the current `granularity`/`hourCycle` requires
 * has a real value.
 */
export function TimeField(props: TimeFieldProps) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    size = 'md',
    granularity = 'minute',
    hourCycle = 12,
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    readOnly = false,
    fullWidth = false,
    autoFocus = false,
    name,
    form,
    segmentLabels,
    className,
  } = props;

  const labels: TimeFieldLabels = { ...DEFAULT_LABELS, ...segmentLabels };

  const reactId = useId();
  const controlId = `${reactId}-group`;
  const messageId = `${reactId}-message`;

  const isControlled = value !== undefined;
  const [uncontrolledParts, setUncontrolledParts] = useState<Parts>(() =>
    valueToParts(defaultValue ?? null, hourCycle),
  );
  const parts = isControlled ? valueToParts(value ?? null, hourCycle) : uncontrolledParts;

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;

  const segmentRefs = useRef<Partial<Record<SegmentKind, HTMLSpanElement | null>>>({});
  const pending = useRef<{ segment: SegmentKind; digits: string; timeoutId: number } | null>(null);

  const order: SegmentKind[] = [
    'hour',
    'minute',
    ...(granularity === 'second' ? (['second'] as const) : []),
    ...(hourCycle === 12 ? (['period'] as const) : []),
  ];

  const numericDefs: Record<Exclude<SegmentKind, 'period'>, SegmentDef> = {
    hour: { kind: 'hour', min: hourCycle === 12 ? 1 : 0, max: hourCycle === 12 ? 12 : 23 },
    minute: { kind: 'minute', min: 0, max: 59 },
    second: { kind: 'second', min: 0, max: 59 },
  };

  function focusSegment(kind: SegmentKind | undefined) {
    if (!kind) return;
    segmentRefs.current[kind]?.focus();
  }

  function neighbor(kind: SegmentKind, delta: 1 | -1): SegmentKind | undefined {
    const index = order.indexOf(kind);
    return order[index + delta];
  }

  function clearPending() {
    if (pending.current) window.clearTimeout(pending.current.timeoutId);
    pending.current = null;
  }

  function commit(next: Parts) {
    if (!isControlled) setUncontrolledParts(next);
    onChange?.(partsToValue(next, hourCycle, granularity));
  }

  function onDigit(kind: Exclude<SegmentKind, 'period'>, digit: string) {
    const def = numericDefs[kind];
    const buffering = pending.current?.segment === kind ? pending.current.digits : '';
    let digits = buffering + digit;
    let num = Number(digits);

    if (num > def.max) {
      digits = digit;
      num = Number(digits);
    }

    if (num < def.min) {
      /*
       * No valid value this digit could represent on its own - a "0" typed
       * into an hour segment whose minimum is 1 (12-hour mode), for
       * instance. Every two-digit hour that segment accepts (10/11/12)
       * starts with "1", never "0", so there is no continuation to buffer
       * for either - the keystroke is simply not a valid start and gets
       * ignored rather than committing an out-of-range hour.
       */
      clearPending();
      return;
    }

    commit({ ...parts, [kind]: num });
    clearPending();

    /*
     * "Could at least one second digit still keep this in range?" - not
     * "could every second digit". Typing "1" for an hour capped at 12 has
     * to keep buffering (10/11/12 are all still reachable) even though "19"
     * would overflow; appending the smallest digit, not the largest, is
     * the right test for "some valid continuation still exists".
     */
    const canExtend = digits.length < 2 && Number(`${digits}0`) <= def.max;
    if (canExtend) {
      const timeoutId = window.setTimeout(() => {
        pending.current = null;
        focusSegment(neighbor(kind, 1));
      }, DIGIT_BUFFER_MS);
      pending.current = { segment: kind, digits, timeoutId };
    } else {
      focusSegment(neighbor(kind, 1));
    }
  }

  function onNumericKeyDown(kind: Exclude<SegmentKind, 'period'>, event: KeyboardEvent) {
    const def = numericDefs[kind];
    const current = parts[kind];

    if (/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      onDigit(kind, event.key);
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        clearPending();
        commit({ ...parts, [kind]: clampWrap((current ?? def.min - 1) + 1, def.min, def.max) });
        return;
      case 'ArrowDown':
        event.preventDefault();
        clearPending();
        commit({ ...parts, [kind]: clampWrap((current ?? def.min + 1) - 1, def.min, def.max) });
        return;
      case 'ArrowLeft':
        event.preventDefault();
        // Leaving the segment mid-buffer (typed "1" for an hour, then
        // arrowed away before the second digit) must cancel the pending
        // auto-advance - otherwise it fires ~600ms later on whatever
        // segment the user has since moved to.
        clearPending();
        focusSegment(neighbor(kind, -1));
        return;
      case 'ArrowRight':
        event.preventDefault();
        clearPending();
        focusSegment(neighbor(kind, 1));
        return;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        clearPending();
        commit({ ...parts, [kind]: null });
        return;
      default:
    }
  }

  function onPeriodKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        commit({ ...parts, period: parts.period === 'am' ? 'pm' : 'am' });
        return;
      case 'a':
      case 'A':
        event.preventDefault();
        commit({ ...parts, period: 'am' });
        focusSegment(neighbor('period', 1));
        return;
      case 'p':
      case 'P':
        event.preventDefault();
        commit({ ...parts, period: 'pm' });
        focusSegment(neighbor('period', 1));
        return;
      case 'ArrowLeft':
        event.preventDefault();
        focusSegment(neighbor('period', -1));
        return;
      case 'ArrowRight':
        event.preventDefault();
        focusSegment(neighbor('period', 1));
        return;
      case 'Backspace':
      case 'Delete':
        event.preventDefault();
        commit({ ...parts, period: null });
        return;
      default:
    }
  }

  const composed = partsToValue(parts, hourCycle, granularity);
  const nativeValue = composed ? toNativeTimeString(composed) : '';

  return (
    <FieldShell
      label={label}
      controlId={controlId}
      size={size}
      state={state}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      filled={composed !== null}
      fullWidth={fullWidth}
      message={message}
      messageId={messageId}
      labelAsText
      className={['uh-time-field', className].filter(Boolean).join(' ')}
    >
      <div
        id={controlId}
        role="group"
        aria-labelledby={`${controlId}-label`}
        aria-describedby={message ? messageId : undefined}
        aria-disabled={disabled || undefined}
        className="uh-time-field__segments"
      >
        {order.map((kind, index) => {
          if (kind === 'period') {
            return (
              <span
                key={kind}
                ref={(el) => {
                  segmentRefs.current.period = el;
                }}
                role="spinbutton"
                tabIndex={disabled ? -1 : 0}
                aria-label={labels.period}
                aria-valuemin={0}
                aria-valuemax={1}
                aria-valuenow={parts.period === null ? undefined : parts.period === 'pm' ? 1 : 0}
                aria-valuetext={parts.period ? parts.period.toUpperCase() : 'Not set'}
                aria-readonly={readOnly || undefined}
                className="uh-time-field__segment"
                data-empty={parts.period === null ? 'true' : undefined}
                autoFocus={autoFocus && index === 0}
                onKeyDown={readOnly || disabled ? undefined : onPeriodKeyDown}
              >
                {parts.period ? parts.period.toUpperCase() : labels.period}
              </span>
            );
          }

          const def = numericDefs[kind];
          const current = parts[kind];
          return (
            <span key={kind} className="uh-time-field__group">
              {index > 0 ? (
                <span className="uh-time-field__separator" aria-hidden="true">
                  :
                </span>
              ) : null}
              <span
                ref={(el) => {
                  segmentRefs.current[kind] = el;
                }}
                role="spinbutton"
                tabIndex={disabled ? -1 : 0}
                aria-label={labels[kind]}
                aria-valuemin={def.min}
                aria-valuemax={def.max}
                aria-valuenow={current ?? undefined}
                aria-valuetext={current === null ? 'Not set' : pad2(current)}
                aria-readonly={readOnly || undefined}
                className="uh-time-field__segment"
                data-empty={current === null ? 'true' : undefined}
                autoFocus={autoFocus && index === 0}
                onKeyDown={
                  readOnly || disabled ? undefined : (event) => onNumericKeyDown(kind, event)
                }
              >
                {current === null ? kind[0]!.repeat(2) : pad2(current)}
              </span>
            </span>
          );
        })}
      </div>

      {name ? (
        <input type="hidden" name={name} form={form} value={nativeValue} disabled={disabled} />
      ) : null}
    </FieldShell>
  );
}

if (process.env.NODE_ENV !== 'production') {
  TimeField.displayName = 'TimeField';
}
