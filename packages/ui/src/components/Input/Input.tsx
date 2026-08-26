import {
  forwardRef,
  useId,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import { FieldShell } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';

/**
 * `tel` is deliberately absent. Every phone number this product collects
 * crosses a border - Malaysian, Indonesian and Singaporean pilgrims all book
 * on the same platform - so the country code is structured data, not a prefix
 * someone types into a free-text field. Use `PhoneInput`.
 *
 * If a field genuinely needs a bare telephone keypad with no country (an
 * internal extension, say), pass `type="text"` with `inputMode="tel"`. That
 * has to be a deliberate choice, not the path of least resistance.
 */
export type InputType = 'text' | 'email' | 'number' | 'password';
export type InputSize = 'sm' | 'md' | 'lg';

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'required' | 'disabled' | 'readOnly' | 'children'
>;

export interface InputProps extends NativeInputProps {
  label: string;
  type?: InputType;
  size?: InputSize;
  helperText?: string;
  /** Presence switches the field into its error state. */
  errorMessage?: string;
  /** Presence switches the field into its success state, unless there is an error. */
  successMessage?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  clearable?: boolean;
  fullWidth?: boolean;
  /** Accessible names for the adornment buttons; override to localise. */
  clearLabel?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  /** Announced once via aria-describedby when maxLength is set. */
  characterLimitLabel?: (max: number) => string;
  onClear?: () => void;
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      {off ? (
        <path d="M4 20L20 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

function InputImpl(props: InputProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    type = 'text',
    size = 'md',
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    readOnly = false,
    leftIcon,
    rightIcon,
    clearable = false,
    fullWidth = false,
    clearLabel = 'Clear',
    showPasswordLabel = 'Show password',
    hidePasswordLabel = 'Hide password',
    characterLimitLabel = (max) => `Maximum ${max} characters`,
    onClear,
    maxLength,
    className,
    id,
    value,
    defaultValue,
    onChange,
    ...rest
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-input`;
  const messageId = `${reactId}-message`;
  const limitId = `${reactId}-limit`;

  const [passwordVisible, setPasswordVisible] = useState(false);

  /*
   * The input is always controlled by React, even when the caller does not own
   * the value. Left uncontrolled, clearing would update this component's mirror
   * but never the DOM node, and the field would appear to ignore the button.
   */
  const [currentValue, setValue] = useControllableState<string>({
    value: value === undefined ? undefined : String(value),
    defaultValue: String(defaultValue ?? ''),
  });

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;

  const describedBy =
    [message ? messageId : undefined, maxLength !== undefined ? limitId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
    onChange?.(event);
  }

  const isPassword = type === 'password';
  const showClear = clearable && !disabled && !readOnly && currentValue.length > 0;

  return (
    <FieldShell
      label={label}
      controlId={inputId}
      size={size}
      state={state}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      filled={currentValue.length > 0}
      fullWidth={fullWidth}
      message={message}
      messageId={messageId}
      limitId={limitId}
      limitLabel={maxLength !== undefined ? characterLimitLabel(maxLength) : undefined}
      counter={
        maxLength !== undefined ? { length: currentValue.length, max: maxLength } : undefined
      }
      {...(className !== undefined ? { className } : {})}
    >
      {leftIcon ? (
        <span className="uh-field__icon" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}

      <input
        {...rest}
        ref={ref}
        id={inputId}
        className="uh-field__input"
        type={isPassword && passwordVisible ? 'text' : type}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={describedBy}
        value={currentValue}
        onChange={handleChange}
      />

      {showClear ? (
        <button
          type="button"
          className="uh-field__action"
          aria-label={clearLabel}
          aria-controls={inputId}
          onClick={() => {
            setValue('');
            onClear?.();
          }}
        >
          <ClearIcon />
        </button>
      ) : null}

      {isPassword ? (
        <button
          type="button"
          className="uh-field__action"
          /* The name changes with the state, so it always describes what the
             next press will do rather than what is currently true. */
          aria-label={passwordVisible ? hidePasswordLabel : showPasswordLabel}
          aria-controls={inputId}
          onClick={() => setPasswordVisible((visible) => !visible)}
          disabled={disabled}
        >
          <EyeIcon off={passwordVisible} />
        </button>
      ) : null}

      {rightIcon && !isPassword ? (
        <span className="uh-field__icon" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </FieldShell>
  );
}

export const Input = forwardRef(InputImpl);
Input.displayName = 'Input';
