import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type ForwardedRef,
  type InputHTMLAttributes,
} from 'react';
import { Check, Minus } from '@tailgrids/icons';

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
  return <Check className="uh-choice__glyph" aria-hidden="true" focusable="false" />;
}

function DashGlyph() {
  return <Minus className="uh-choice__glyph" aria-hidden="true" focusable="false" />;
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

export const Checkbox = /* @__PURE__ */ forwardRef(CheckboxImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Checkbox.displayName = 'Checkbox';
}
