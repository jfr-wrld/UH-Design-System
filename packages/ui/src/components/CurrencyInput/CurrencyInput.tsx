import { forwardRef, useId, useState, type ForwardedRef } from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import {
  currencyName,
  currencySymbol,
  formatMoney,
  parseAmount,
  type Currency,
} from '../../lib/money.js';

export type { Currency };

export interface CurrencyInputProps {
  label: string;
  /** The amount, always a number. Null means nothing has been entered. */
  value?: number | null;
  defaultValue?: number | null;
  onChange?: (value: number | null) => void;
  /** Decides the symbol and the fraction rule. Never derived from `locale`. */
  currency: Currency;
  /** Decides the group separator. Never derived from `currency`. */
  locale?: string;
  /**
   * Defaults to 0: package prices on this platform are whole amounts. This is
   * a product decision, not a currency one - IDR has no minor unit, but MYR and
   * SGD normally carry two. Pass 2 where cents matter.
   */
  fractionDigits?: number;
  description?: string;
  helperText?: string;
  errorMessage?: string;
  min?: number;
  max?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  size?: FieldSize;
  placeholder?: string;
  id?: string;
  className?: string | undefined;
}

const clamp = (n: number, min: number | undefined, max: number | undefined) =>
  Math.min(Math.max(n, min ?? -Infinity), max ?? Infinity);

function CurrencyInputImpl(props: CurrencyInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    currency,
    locale = 'en',
    fractionDigits = 0,
    description,
    helperText,
    errorMessage,
    min,
    max,
    required = false,
    disabled = false,
    readOnly = false,
    fullWidth = false,
    size = 'md',
    placeholder,
    id,
    className,
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-amount`;
  const messageId = `${reactId}-message`;
  const currencyId = `${reactId}-currency`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  const [amount, setAmount] = useControllableState<number | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange,
  });

  /*
   * Raw digits while the caret is in the field, the formatted amount when it is
   * not. Grouping separators appearing under the caret would move it on every
   * thousand, so formatting waits for blur.
   */
  const [draft, setDraft] = useState<string | null>(null);

  const state = errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;
  const symbol = currencySymbol(currency);

  const display =
    draft !== null
      ? draft
      : amount === null
        ? ''
        : formatMoney(amount, currency, locale, fractionDigits).slice(symbol.length + 1);

  function settle() {
    if (draft === null) return;
    const parsed = parseAmount(draft, locale, fractionDigits);
    setAmount(parsed === null ? null : clamp(parsed, min, max));
    setDraft(null);
  }

  return (
    <FieldShell
      label={label}
      controlId={inputId}
      size={size}
      state={state}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      filled={amount !== null}
      fullWidth={fullWidth}
      {...(description ? { description, descriptionId } : {})}
      message={message}
      messageId={messageId}
      className={className}
    >
      {/*
       * Outside the input on purpose: Ctrl+A then typing must replace the
       * amount, not the currency. Hidden from assistive tech because the
       * currency is named properly below rather than read as "R M".
       */}
      <span className="uh-currency__prefix" aria-hidden="true">
        {symbol}
      </span>

      <span id={currencyId} className="uh-sr-only">
        {currencyName(currency, locale)}
      </span>

      <input
        ref={ref}
        id={inputId}
        className="uh-field__input uh-currency__value"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        readOnly={readOnly}
        placeholder={placeholder}
        aria-required={required || undefined}
        aria-invalid={state === 'error' || undefined}
        aria-describedby={[currencyId, descriptionId, message ? messageId : undefined]
          .filter(Boolean)
          .join(' ')}
        value={display}
        onFocus={() => {
          /* Drop to raw digits so the caret has something stable to sit in. */
          setDraft(amount === null ? '' : String(amount));
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={settle}
      />
    </FieldShell>
  );
}

export const CurrencyInput = forwardRef(CurrencyInputImpl);
CurrencyInput.displayName = 'CurrencyInput';
