import { useId, useRef, useState, type KeyboardEvent } from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { clampWrap, daysInMonth, pad2, toNativeDateString, type DateValue } from './date.js';

export type { DateValue };

type SegmentKind = 'day' | 'month' | 'year';

interface Parts {
  day: number | null;
  month: number | null;
  year: number | null;
}

export interface DateFieldLabels {
  day: string;
  month: string;
  year: string;
}

const DEFAULT_LABELS: DateFieldLabels = {
  day: 'Day',
  month: 'Month',
  year: 'Year',
};

export interface DateFieldProps {
  label: string;
  value?: DateValue | null | undefined;
  defaultValue?: DateValue | null | undefined;
  onChange?: ((value: DateValue | null) => void) | undefined;
  size?: FieldSize | undefined;
  /** @default 1900 */
  minYear?: number | undefined;
  /** @default 2100 */
  maxYear?: number | undefined;
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
  /** Submits alongside a native `<form>`, as `YYYY-MM-DD` - the same shape
      `<input type="date">` would send, regardless of which order the
      segments themselves display in. Absent while the value is
      incomplete, same as a native date input left half-filled. */
  name?: string | undefined;
  form?: string | undefined;
  /** Accessible names for each segment; override to localise. */
  segmentLabels?: Partial<DateFieldLabels> | undefined;
  className?: string | undefined;
}

function valueToParts(value: DateValue | null | undefined): Parts {
  if (!value) return { day: null, month: null, year: null };
  return { day: value.day, month: value.month, year: value.year };
}

function partsToValue(parts: Parts): DateValue | null {
  if (parts.day === null || parts.month === null || parts.year === null) return null;
  return { day: parts.day, month: parts.month, year: parts.year };
}

/** Clamps `day` down when it no longer fits whichever month/year the field
    now holds - 31 January moving to February settles on the 28th (or 29th,
    a leap year), the same way a native date input resolves the conflict
    instead of leaving an impossible date sitting in the field. */
function clampDayToMonth(parts: Parts): Parts {
  if (parts.day === null || parts.month === null) return parts;
  const bound = daysInMonth(parts.year ?? 2000, parts.month);
  return parts.day > bound ? { ...parts, day: bound } : parts;
}

interface SegmentDef {
  kind: SegmentKind;
  min: number;
  max: number;
  maxDigits: number;
}

/** Matches `TimeField`'s own buffer window - see that file's comment for
    the reasoning; the same trade-off applies here digit for digit. */
const DIGIT_BUFFER_MS = 600;

/**
 * A segment-based date input: Day, Month, Year, each independently
 * focusable and editable - the same interaction native `<input
 * type="date">` offers, just scriptable and themeable, which the native
 * element is not. `TimeField`'s own sibling: the same hand-rolled
 * WAI-ARIA spinbutton pattern (`role="spinbutton"`, arrow keys to step,
 * digits to type a value), generalised from two-digit segments to a
 * `maxDigits`-aware one so a four-digit `year` buffers correctly too - a
 * "19" typed toward 1987 has to keep waiting (1900-1999 are all still
 * reachable) the same way "1" typed toward a 12-hour hour does, just one
 * digit longer.
 *
 * `value`/`defaultValue`/`onChange` always carry a *complete* date or
 * `null` - there is no partial value in the public API, same rule
 * `TimeField` holds itself to.
 *
 * Segment order is fixed at Day-Month-Year rather than configurable -
 * `en`/`ms`/`id`, every locale this product ships, reads a date that way;
 * `TimeField` makes the identical call not to expose its own segment
 * order as a prop.
 */
export function DateField(props: DateFieldProps) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    size = 'md',
    minYear = 1900,
    maxYear = 2100,
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

  const labels: DateFieldLabels = { ...DEFAULT_LABELS, ...segmentLabels };

  const reactId = useId();
  const controlId = `${reactId}-group`;
  const messageId = `${reactId}-message`;

  const isControlled = value !== undefined;
  const [uncontrolledParts, setUncontrolledParts] = useState<Parts>(() =>
    valueToParts(defaultValue ?? null),
  );
  const parts = isControlled ? valueToParts(value ?? null) : uncontrolledParts;

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;

  const segmentRefs = useRef<Partial<Record<SegmentKind, HTMLSpanElement | null>>>({});
  const pending = useRef<{ segment: SegmentKind; digits: string; timeoutId: number } | null>(null);

  const order: SegmentKind[] = ['day', 'month', 'year'];

  function defFor(kind: SegmentKind): SegmentDef {
    if (kind === 'month') return { kind, min: 1, max: 12, maxDigits: 2 };
    if (kind === 'year') return { kind, min: minYear, max: maxYear, maxDigits: 4 };
    // day - bounded by whichever month/year are currently entered; loosest
    // possible (31, a leap February) while month is still unknown.
    const bound = parts.month === null ? 31 : daysInMonth(parts.year ?? 2000, parts.month);
    return { kind, min: 1, max: bound, maxDigits: 2 };
  }

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
    const clamped = clampDayToMonth(next);
    if (!isControlled) setUncontrolledParts(clamped);
    onChange?.(partsToValue(clamped));
  }

  function onDigit(kind: SegmentKind, digit: string) {
    const def = defFor(kind);
    const buffering = pending.current?.segment === kind ? pending.current.digits : '';
    let digits = buffering + digit;

    /*
     * "Could the smallest possible completion still fit under max?" - if
     * not, the new digit cannot extend what was buffered, so it starts a
     * fresh buffer of its own instead (the same restart `TimeField` already
     * does, just checked against a completion padded out to this segment's
     * own digit count rather than always two).
     */
    if (digits.length > def.maxDigits || Number(digits.padEnd(def.maxDigits, '0')) > def.max) {
      digits = digit;
    }

    const num = Number(digits);

    /*
     * "Could even the LARGEST possible completion still reach min?" - if
     * not, there is no valid value this digit sequence could ever become;
     * ignore the keystroke rather than commit something out of range. A
     * "0" typed as the first digit of a year floored at 1900 has no
     * completion (0000-0999) that clears it.
     */
    if (Number(digits.padEnd(def.maxDigits, '9')) < def.min) {
      clearPending();
      return;
    }

    commit({ ...parts, [kind]: num });
    clearPending();

    const canExtend =
      digits.length < def.maxDigits && Number(digits.padEnd(def.maxDigits, '0')) <= def.max;
    if (canExtend) {
      const timeoutId = window.setTimeout(() => {
        pending.current = null;
        /*
         * Only auto-advance once the buffered digits have actually reached
         * a legitimate value on their own - a lone "0" typed into `day`
         * (floored at 1) is a valid *prefix* ("01"-"09" all still reach it)
         * but not a valid final day by itself. Abandoned mid-buffer with no
         * second digit, it stays put waiting rather than settling on an
         * impossible day 0 and silently moving on. `year`/`month` never
         * hit this in practice - both start low enough, or high enough
         * from a single digit, that this only ever matters for `day`.
         */
        if (num >= def.min) focusSegment(neighbor(kind, 1));
      }, DIGIT_BUFFER_MS);
      pending.current = { segment: kind, digits, timeoutId };
    } else {
      focusSegment(neighbor(kind, 1));
    }
  }

  function onSegmentKeyDown(kind: SegmentKind, event: KeyboardEvent) {
    const def = defFor(kind);
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

  const composed = partsToValue(parts);
  const nativeValue = composed ? toNativeDateString(composed) : '';

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
      className={['uh-date-field', className].filter(Boolean).join(' ')}
    >
      <div
        id={controlId}
        role="group"
        aria-labelledby={`${controlId}-label`}
        aria-describedby={message ? messageId : undefined}
        aria-disabled={disabled || undefined}
        className="uh-date-field__segments"
      >
        {order.map((kind, index) => {
          const def = defFor(kind);
          const current = parts[kind];
          /*
           * `year` is never zero-padded - unlike day/month's fixed two
           * digits, a year genuinely being typed passes through every
           * shorter length on the way to four ("1", "19", "198"), and
           * padding those out ("0001", "0019", "0198") would flash a
           * wrong-looking value on every single keystroke instead of the
           * digits actually typed so far.
           */
          const display =
            current === null ? null : kind === 'year' ? String(current) : pad2(current);
          return (
            <span key={kind} className="uh-date-field__group">
              {index > 0 ? (
                <span className="uh-date-field__separator" aria-hidden="true">
                  /
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
                aria-valuetext={display ?? 'Not set'}
                aria-readonly={readOnly || undefined}
                className="uh-date-field__segment"
                data-kind={kind}
                data-empty={current === null ? 'true' : undefined}
                autoFocus={autoFocus && index === 0}
                onKeyDown={
                  readOnly || disabled ? undefined : (event) => onSegmentKeyDown(kind, event)
                }
              >
                {display ?? (kind === 'year' ? 'yyyy' : kind[0]!.repeat(2))}
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
  DateField.displayName = 'DateField';
}
