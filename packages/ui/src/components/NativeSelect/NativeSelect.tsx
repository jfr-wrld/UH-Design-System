import {
  forwardRef,
  useId,
  type ForwardedRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { ChevronDownIcon } from '../../lib/icons.js';

type NativeSelectHTMLProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'size' | 'required' | 'disabled' | 'children' | 'className'
>;

export interface NativeSelectProps extends NativeSelectHTMLProps {
  label: string;
  size?: FieldSize;
  helperText?: string;
  /** Presence switches the field into its error state. */
  errorMessage?: string;
  /** Presence switches the field into its success state, unless there is an error. */
  successMessage?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  /** Rendered as a hidden, disabled first `<option>` - present but never a
      real choice, matching how every browser's own native select treats a
      placeholder. Omit it when every value is a genuine option. */
  placeholder?: string;
  /** Plain `<option>`/`<optgroup>` elements - `NativeSelect` renders a real
      `<select>`, so its children are exactly what a `<select>` already
      accepts. Nothing to translate. */
  children: ReactNode;
}

/**
 * The browser's own `<select>`, styled to match this system's other fields.
 *
 * `Select` (the searchable, custom-listbox component) is the right default
 * for most forms - it can show a leading icon per option, filter as the
 * pilgrim types, and paint consistently across every OS. Reach for
 * `NativeSelect` instead when the list is long and unstructured enough that
 * the platform's own picker genuinely serves the person better: a country
 * or city list on a phone gets the OS's native, familiar full-screen wheel
 * instead of a scrollable in-page panel, and the whole control keeps
 * working even before the page's own JavaScript has finished loading.
 */
function NativeSelectImpl(props: NativeSelectProps, ref: ForwardedRef<HTMLSelectElement>) {
  const {
    label,
    size = 'md',
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    fullWidth = false,
    placeholder,
    children,
    id,
    value,
    defaultValue,
    ...rest
  } = props;

  const reactId = useId();
  const selectId = id ?? `${reactId}-select`;
  const messageId = `${reactId}-message`;

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;

  const filled =
    value !== undefined ? value !== '' : defaultValue !== undefined && defaultValue !== '';

  return (
    <FieldShell
      label={label}
      controlId={selectId}
      size={size}
      state={state}
      required={required}
      disabled={disabled}
      filled={filled}
      fullWidth={fullWidth}
      message={message}
      messageId={messageId}
    >
      <select
        {...rest}
        ref={ref}
        id={selectId}
        className="uh-field__input uh-native-select__select"
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={message ? messageId : undefined}
        value={value}
        defaultValue={defaultValue}
      >
        {/*
         * `hidden`, not `disabled`: a disabled option is skipped as a
         * default candidate, so the browser would silently pre-select the
         * first real option underneath it instead of showing this text. A
         * merely hidden option stays out of the open dropdown list but is
         * still the value nothing-chosen-yet lands on.
         */}
        {placeholder ? (
          <option value="" hidden>
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>

      <span className="uh-native-select__chevron" aria-hidden="true">
        <ChevronDownIcon />
      </span>
    </FieldShell>
  );
}

export const NativeSelect = /* @__PURE__ */ forwardRef(NativeSelectImpl);
if (process.env.NODE_ENV !== 'production') {
  NativeSelect.displayName = 'NativeSelect';
}
