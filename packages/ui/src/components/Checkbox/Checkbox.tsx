import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ForwardedRef,
  type InputHTMLAttributes,
} from 'react';

import { ChoiceField } from '../Choice/ChoiceField.js';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'children' | 'disabled'
>;

export interface CheckboxProps extends NativeProps {
  label: string;
  description?: string;
  /** Renders a dash and reports aria-checked="mixed". */
  indeterminate?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string | undefined;
}

function CheckGlyph() {
  return (
    <svg
      className="uh-choice__glyph"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M5.5 10.5l3 3 6-6.5"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashGlyph() {
  return (
    <svg
      className="uh-choice__glyph"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 10h9" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
    </svg>
  );
}

function CheckboxImpl(props: CheckboxProps, forwarded: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    description,
    indeterminate = false,
    disabled = false,
    error = false,
    className,
    id,
    checked,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-checkbox`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const innerRef = useRef<HTMLInputElement>(null);

  /*
   * `indeterminate` has no HTML attribute - it is a DOM property only - so it
   * has to be written after render. Setting it is what makes the platform
   * report aria-checked="mixed"; adding that attribute by hand would instead
   * conflict with the native state.
   */
  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate, checked]);

  function setRefs(node: HTMLInputElement | null) {
    innerRef.current = node;
    if (typeof forwarded === 'function') forwarded(node);
    else if (forwarded) forwarded.current = node;
  }

  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <ChoiceField
      shape="checkbox"
      controlId={inputId}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={disabled}
      error={error}
      className={className}
      input={
        <input
          {...rest}
          ref={setRefs}
          id={inputId}
          type="checkbox"
          className="uh-choice__input"
          disabled={disabled}
          aria-invalid={error || undefined}
          aria-describedby={describedBy}
          {...(checked !== undefined ? { checked } : {})}
        />
      }
      /*
       * Always rendered; CSS reveals it from the input's real state. Driving
       * visibility from the React prop would leave an uncontrolled checkbox
       * showing a tick it does not have.
       */
      glyph={indeterminate ? <DashGlyph /> : <CheckGlyph />}
    />
  );
}

export const Checkbox = forwardRef(CheckboxImpl);
Checkbox.displayName = 'Checkbox';
