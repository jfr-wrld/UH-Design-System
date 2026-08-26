import { forwardRef, useId, useState, type ForwardedRef, type KeyboardEvent } from 'react';

import { useControllableState } from '../../hooks/useControllableState.js';

export type NumberStepperSize = 'sm' | 'md';

export interface NumberStepperProps {
  label: string;
  description?: string;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  size?: NumberStepperSize;
  disabled?: boolean;
  /** Set by the consumer. This component never decides what is valid. */
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  /** Accessible names for the two buttons; override to localise. */
  decrementLabel?: (label: string) => string;
  incrementLabel?: (label: string) => string;
  className?: string | undefined;
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/**
 * Rounds to the nearest step from `min`, so a step of 2 from a min of 1 yields
 * 1, 3, 5 rather than 0, 2, 4.
 */
function snap(value: number, min: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return value;
  return min + Math.round((value - min) / step) * step;
}

function NumberStepperImpl(props: NumberStepperProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    description,
    value,
    defaultValue,
    onChange,
    min = 0,
    max = Number.MAX_SAFE_INTEGER,
    step = 1,
    size = 'md',
    disabled = false,
    error = false,
    errorMessage,
    helperText,
    decrementLabel = (name) => `Decrease ${name}`,
    incrementLabel = (name) => `Increase ${name}`,
    className,
  } = props;

  const reactId = useId();
  const inputId = `${reactId}-value`;
  const labelId = `${reactId}-label`;
  const messageId = `${reactId}-message`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const [current, setCurrent] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? min,
    onChange,
  });

  /*
   * While the field is being typed into it holds a string, which may be empty
   * or out of range on the way to something valid. `null` means "not editing",
   * so the committed number is shown instead.
   */
  const [draft, setDraft] = useState<string | null>(null);

  const bounded = max === Number.MAX_SAFE_INTEGER ? undefined : max;
  const atMin = current <= min;
  const atMax = bounded !== undefined && current >= bounded;
  const state = error || errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;

  function commit(next: number) {
    const settled = clamp(snap(next, min, step), min, bounded ?? next);
    if (settled !== current) setCurrent(settled);
    return settled;
  }

  function nudge(direction: 1 | -1) {
    if (disabled) return;
    commit(current + direction * step);
    setDraft(null);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        nudge(1);
        return;
      case 'ArrowDown':
        event.preventDefault();
        nudge(-1);
        return;
      case 'Home':
        event.preventDefault();
        commit(min);
        setDraft(null);
        return;
      case 'End':
        if (bounded === undefined) return;
        event.preventDefault();
        commit(bounded);
        setDraft(null);
        return;
      case 'Enter':
        event.preventDefault();
        settle();
        return;
      default:
    }
  }

  /** Parse what was typed, clamp it, and stop editing. */
  function settle() {
    if (draft === null) return;
    const parsed = Number.parseInt(draft, 10);
    if (Number.isNaN(parsed)) setCurrent(current);
    else commit(parsed);
    setDraft(null);
  }

  return (
    <div
      className={['uh-stepper', className].filter(Boolean).join(' ')}
      data-size={size}
      data-state={state}
      data-disabled={disabled ? 'true' : undefined}
    >
      <span className="uh-stepper__header">
        <label className="uh-stepper__label" id={labelId} htmlFor={inputId}>
          {label}
        </label>
        {description ? (
          <span className="uh-stepper__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>

      <div className="uh-stepper__control">
        <button
          type="button"
          className="uh-stepper__button"
          aria-label={decrementLabel(label)}
          aria-controls={inputId}
          disabled={disabled || atMin}
          onClick={() => nudge(-1)}
        >
          <MinusIcon />
        </button>

        {/*
         * text, not number: input[type=number] accepts "e", "+" and "-",
         * reports an empty string for anything it deems invalid, and changes on
         * scroll. role="spinbutton" gives the same semantics without any of it.
         */}
        <input
          ref={ref}
          id={inputId}
          className="uh-stepper__value"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          role="spinbutton"
          /*
           * When a consumer lowers `max` below the current value, valuenow ends
           * up above valuemax. That is reported as it is rather than smoothed
           * over: the number really is 2 and the ceiling really is 1, and that
           * is precisely the conflict aria-invalid and the alert are describing.
           * Inflating valuemax to keep the pair tidy would hide the constraint
           * from exactly the person who most needs to hear it.
           */
          aria-valuenow={current}
          aria-valuemin={min}
          {...(bounded !== undefined ? { 'aria-valuemax': bounded } : {})}
          aria-labelledby={labelId}
          aria-describedby={
            [descriptionId, message ? messageId : undefined].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={state === 'error' || undefined}
          disabled={disabled}
          value={draft ?? String(current)}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            /* Emit while typing only when what is there is already in range;
               anything else waits for blur, so the caret is never fought. */
            const parsed = Number.parseInt(raw, 10);
            if (
              !Number.isNaN(parsed) &&
              parsed >= min &&
              (bounded === undefined || parsed <= bounded)
            ) {
              setCurrent(snap(parsed, min, step));
            }
          }}
          onBlur={settle}
          onKeyDown={onKeyDown}
        />

        <button
          type="button"
          className="uh-stepper__button"
          aria-label={incrementLabel(label)}
          aria-controls={inputId}
          disabled={disabled || atMax}
          onClick={() => nudge(1)}
        >
          <PlusIcon />
        </button>
      </div>

      {message ? (
        <p
          id={messageId}
          className="uh-stepper__message"
          role={state === 'error' ? 'alert' : undefined}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export const NumberStepper = forwardRef(NumberStepperImpl);
NumberStepper.displayName = 'NumberStepper';
