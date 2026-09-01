import { forwardRef, useId, type ForwardedRef, type InputHTMLAttributes } from 'react';

import { ChoiceField } from '../Choice/ChoiceField.js';
import { useRadioGroup } from './RadioGroupContext.js';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'children' | 'disabled' | 'value'
>;

export interface RadioProps extends NativeProps {
  label: string;
  description?: string;
  value: string;
  disabled?: boolean;
  error?: boolean;
  className?: string | undefined;
}

function DotGlyph() {
  return (
    <svg className="uh-choice__glyph" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="4.5" fill="currentColor" />
    </svg>
  );
}

function RadioImpl(props: RadioProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    description,
    value,
    disabled,
    error,
    className,
    id,
    name,
    checked,
    onChange,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-radio`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  /* A Radio works standalone, but inside a RadioGroup the group owns name,
     selection and disabled state. */
  const group = useRadioGroup();
  const resolvedName = name ?? group?.name;
  const resolvedDisabled = disabled ?? group?.disabled ?? false;
  const resolvedError = error ?? group?.error ?? false;
  const groupChecked = group ? group.value === value : undefined;
  const resolvedChecked = checked ?? groupChecked;

  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <ChoiceField
      shape="radio"
      controlId={inputId}
      label={label}
      description={description}
      descriptionId={descriptionId}
      disabled={resolvedDisabled}
      error={resolvedError}
      className={className}
      input={
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="radio"
          className="uh-choice__input"
          value={value}
          disabled={resolvedDisabled}
          aria-invalid={resolvedError || undefined}
          aria-describedby={describedBy}
          {...(resolvedName !== undefined ? { name: resolvedName } : {})}
          {...(resolvedChecked !== undefined ? { checked: resolvedChecked } : {})}
          onChange={onChange ?? group?.onChange}
        />
      }
      glyph={<DotGlyph />}
    />
  );
}

export const Radio = /* @__PURE__ */ forwardRef(RadioImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Radio.displayName = 'Radio';
}
