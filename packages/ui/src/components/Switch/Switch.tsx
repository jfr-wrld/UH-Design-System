import { forwardRef, useId, type ForwardedRef, type InputHTMLAttributes } from 'react';

export type SwitchSize = 'sm' | 'md';

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'role' | 'children' | 'disabled'
>;

export interface SwitchProps extends NativeProps {
  label: string;
  description?: string;
  size?: SwitchSize;
  disabled?: boolean;
  className?: string | undefined;
}

function SwitchImpl(props: SwitchProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    description,
    size = 'md',
    disabled = false,
    className,
    id,
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-switch`;
  const descriptionId = description ? `${reactId}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={['uh-switch', className].filter(Boolean).join(' ')}
      data-size={size}
      data-disabled={disabled ? 'true' : undefined}
    >
      <span className="uh-switch__control">
        {/*
         * A checkbox with role="switch": the platform maps the native checked
         * state onto aria-checked, so the state stays in one place. Writing
         * aria-checked by hand would give the same element two sources of
         * truth, and they would eventually disagree.
         */}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type="checkbox"
          role="switch"
          className="uh-switch__input"
          disabled={disabled}
          aria-describedby={describedBy}
        />
        <span className="uh-switch__track" aria-hidden="true">
          <span className="uh-switch__thumb" />
        </span>
      </span>

      <span className="uh-switch__text">
        <label className="uh-switch__label" htmlFor={inputId}>
          {label}
        </label>
        {description ? (
          <span className="uh-switch__description" id={descriptionId}>
            {description}
          </span>
        ) : null}
      </span>
    </div>
  );
}

export const Switch = /* @__PURE__ */ forwardRef(SwitchImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Switch.displayName = 'Switch';
}
