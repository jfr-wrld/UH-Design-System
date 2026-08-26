import { useId, type ChangeEvent, type ReactNode } from 'react';

import { RadioGroupContext, type RadioOrientation } from './RadioGroupContext.js';
import { useControllableState } from '../../hooks/useControllableState.js';

export type { RadioOrientation };

export interface RadioGroupProps {
  label: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation?: RadioOrientation;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  errorMessage?: string;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * A fieldset, so the legend names the group natively and every browser and
 * screen reader already agrees on the relationship. `role="radiogroup"` is
 * added on top only to carry `aria-orientation`, which a plain group has no
 * way to express.
 *
 * Arrow-key navigation is not implemented here: native radios sharing a `name`
 * already do it, including the roving tab stop.
 */
export function RadioGroup({
  label,
  name,
  value,
  defaultValue,
  onChange,
  orientation = 'vertical',
  required = false,
  disabled = false,
  helperText,
  errorMessage,
  children,
  className,
}: RadioGroupProps) {
  const reactId = useId();
  const groupName = name ?? `${reactId}-radio-group`;
  const messageId = `${reactId}-message`;

  const [current, setCurrent] = useControllableState<string | undefined>({
    value,
    defaultValue,
  });

  const message = errorMessage ?? helperText;
  const state = errorMessage ? 'error' : 'default';

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setCurrent(event.target.value);
    onChange?.(event.target.value, event);
  }

  return (
    <fieldset
      className={['uh-choice-group', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-orientation={orientation}
      aria-required={required || undefined}
      aria-invalid={state === 'error' || undefined}
      aria-describedby={message ? messageId : undefined}
      data-orientation={orientation}
      data-state={state}
      disabled={disabled}
    >
      <legend className="uh-choice-group__legend">
        {label}
        {required ? (
          <span className="uh-choice-group__required" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>

      <div className="uh-choice-group__items">
        <RadioGroupContext.Provider
          value={{
            name: groupName,
            value: current,
            disabled,
            error: state === 'error',
            onChange: handleChange,
          }}
        >
          {children}
        </RadioGroupContext.Provider>
      </div>

      {message ? (
        <p
          id={messageId}
          className="uh-choice-group__message"
          role={state === 'error' ? 'alert' : undefined}
        >
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
