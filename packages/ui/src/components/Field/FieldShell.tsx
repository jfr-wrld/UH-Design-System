import type { ReactNode } from 'react';

export type FieldSize = 'sm' | 'md' | 'lg';
export type FieldState = 'default' | 'error' | 'success';

export interface FieldShellProps {
  /** Rendered inside the bordered control; the actual input(s) and adornments. */
  children: ReactNode;
  label: string;
  /** Id of the element the label points at. */
  controlId: string;
  size: FieldSize;
  state: FieldState;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  filled?: boolean;
  fullWidth?: boolean;
  className?: string | undefined;
  /** Helper, error or success text. Whichever applies has already been chosen. */
  message?: string | undefined;
  messageId: string;
  limitId?: string | undefined;
  limitLabel?: string | undefined;
  counter?: { length: number; max: number } | undefined;
  /** Set when the control is a composite that owns its own label wiring. */
  labelAsText?: boolean;
}

/**
 * The chrome every field shares: label row, bordered control box, and the
 * footer that carries the message and counter.
 *
 * Extracted so Input and PhoneInput cannot drift apart on the parts that
 * matter most — the aria wiring, the required indicator, and the state
 * attributes the stylesheet keys off.
 */
export function FieldShell({
  children,
  label,
  controlId,
  size,
  state,
  required = false,
  disabled = false,
  readOnly = false,
  filled = false,
  fullWidth = false,
  className,
  message,
  messageId,
  limitId,
  limitLabel,
  counter,
  labelAsText = false,
}: FieldShellProps) {
  return (
    <div
      className={['uh-field', className].filter(Boolean).join(' ')}
      data-size={size}
      data-state={state}
      data-full-width={fullWidth ? 'true' : undefined}
    >
      <div className="uh-field__label-row">
        {labelAsText ? (
          /* A composite control names itself through aria-labelledby, so this
             must not be a <label> pointing at a single input. */
          <span className="uh-field__label" id={`${controlId}-label`}>
            {label}
          </span>
        ) : (
          <label className="uh-field__label" htmlFor={controlId}>
            {label}
          </label>
        )}
        {required ? (
          /*
           * Outside the label on purpose. Accessible-name computation skips
           * aria-hidden nodes, but plenty of tooling just reads the label's
           * text - keeping the asterisk out means every reading agrees, and
           * aria-required carries the actual requirement.
           */
          <span className="uh-field__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </div>

      <div
        className="uh-field__control"
        data-disabled={disabled ? 'true' : undefined}
        data-readonly={readOnly ? 'true' : undefined}
        data-filled={filled ? 'true' : undefined}
      >
        {children}
      </div>

      {message || counter ? (
        <div className="uh-field__footer">
          {message ? (
            <p
              id={messageId}
              className="uh-field__message"
              /* Only an error interrupts; helper and success text are read in
                 turn via aria-describedby. */
              role={state === 'error' ? 'alert' : undefined}
            >
              {message}
            </p>
          ) : (
            <span className="uh-field__message" />
          )}

          {counter ? (
            <>
              {/* Stated once, rather than announcing on every keystroke. */}
              <span id={limitId} className="uh-sr-only">
                {limitLabel}
              </span>
              <span
                className="uh-field__counter"
                aria-hidden="true"
                data-over={counter.length > counter.max ? 'true' : undefined}
              >
                {counter.length}/{counter.max}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
