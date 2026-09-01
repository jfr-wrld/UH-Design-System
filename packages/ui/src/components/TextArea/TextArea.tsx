import {
  forwardRef,
  useId,
  type ChangeEvent,
  type ForwardedRef,
  type TextareaHTMLAttributes,
} from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';

type NativeTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'size' | 'required' | 'disabled' | 'readOnly'
>;

export interface TextAreaProps extends NativeTextAreaProps {
  label: string;
  size?: FieldSize;
  helperText?: string;
  /** Presence switches the field into its error state. */
  errorMessage?: string;
  /** Presence switches the field into its success state, unless there is an error. */
  successMessage?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  /** Visible row count. Unlike an input, a text area's height is part of
      telling the person how much room there is to write.
      @default 4 */
  rows?: number;
  /** Announced once via aria-describedby when maxLength is set. */
  characterLimitLabel?: (max: number) => string;
}

/**
 * The multi-line sibling of `Input` - same `FieldShell` chrome (label,
 * bordered control, message/counter footer), same controlled/uncontrolled
 * wiring, so a form mixing the two never drifts on focus ring, error
 * colour, or required-field styling. It carries none of `Input`'s
 * adornment logic (clear button, password toggle, left/right icons):
 * nothing in this design system's forms puts an icon inside a multi-line
 * field, and a clear button would fight the resize handle for the same
 * corner.
 */
function TextAreaImpl(props: TextAreaProps, ref: ForwardedRef<HTMLTextAreaElement>) {
  const {
    label,
    size = 'md',
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    readOnly = false,
    fullWidth = false,
    rows = 4,
    characterLimitLabel = (max) => `Maximum ${max} characters`,
    maxLength,
    className,
    id,
    value,
    defaultValue,
    onChange,
    ...rest
  } = props;

  const reactId = useId();
  const fieldId = id ?? `${reactId}-textarea`;
  const messageId = `${reactId}-message`;
  const limitId = `${reactId}-limit`;

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

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setValue(event.target.value);
    onChange?.(event);
  }

  return (
    <FieldShell
      label={label}
      controlId={fieldId}
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
      className={['uh-field--multiline', className].filter(Boolean).join(' ')}
    >
      <textarea
        {...rest}
        ref={ref}
        id={fieldId}
        className="uh-field__input"
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        aria-required={required || undefined}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={describedBy}
        value={currentValue}
        onChange={handleChange}
      />
    </FieldShell>
  );
}

export const TextArea = /* @__PURE__ */ forwardRef(TextAreaImpl);

if (process.env.NODE_ENV !== 'production') {
  TextArea.displayName = 'TextArea';
}
