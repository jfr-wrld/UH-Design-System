import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { CountryMark } from './flags.js';
import { ChevronDownIcon } from '../../lib/icons.js';
import {
  COUNTRY_RULES,
  formatNational,
  fromE164,
  parsePhone,
  toE164,
  type PhoneCountry,
} from './phone.js';

export type { PhoneCountry };

/** The four markets, then the manual escape hatch. */
const OPTIONS: PhoneCountry[] = ['MY', 'ID', 'SG', 'BN', 'other'];

const optionName = (country: PhoneCountry, otherLabel: string) =>
  country === 'other' ? otherLabel : COUNTRY_RULES[country].name;

const optionDial = (country: PhoneCountry, otherDial: string) =>
  country === 'other'
    ? otherDial
      ? `+${otherDial.replace(/\D/g, '')}`
      : '+'
    : `+${COUNTRY_RULES[country].dial}`;

export interface PhoneInputProps {
  label: string;
  /** Always E.164, e.g. "+60123456789". */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  defaultCountry?: PhoneCountry;
  /* Every optional prop admits an explicit undefined: with
     exactOptionalPropertyTypes on, a value computed at the call site as
     `cond ? x : undefined` is otherwise rejected, which is exactly how these
     get passed. */
  description?: string | undefined;
  helperText?: string | undefined;
  errorMessage?: string | undefined;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  size?: FieldSize;
  /** Accessible name for the picker; receives the selected country's name. */
  countryLabel?: ((country: string) => string) | undefined;
  otherLabel?: string | undefined;
  otherCodeLabel?: string | undefined;
  id?: string | undefined;
  className?: string | undefined;
}

function PhoneInputImpl(props: PhoneInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    defaultCountry = 'MY',
    description,
    helperText,
    errorMessage,
    required = false,
    disabled = false,
    readOnly = false,
    fullWidth = false,
    size = 'md',
    countryLabel = (name) => `Country: ${name}`,
    otherLabel = 'Other',
    otherCodeLabel = 'Country calling code',
    id,
    className,
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-number`;
  const messageId = `${reactId}-message`;
  const listId = `${reactId}-list`;
  const codeId = `${reactId}-code`;
  const descriptionId = description ? `${reactId}-description` : undefined;

  /*
   * One stored value, always E.164. Country and national digits are derived
   * from it rather than kept alongside, so the two can never disagree.
   */
  const [e164, setE164] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  /*
   * The selected country is state, not something re-derived from the value.
   * E.164 is ambiguous for an unlisted code: "+971501234567" gives no way to
   * tell where the dial code ends, so the split has to come from what is
   * selected. Re-parsing it every render fed the dial code back into the
   * national number and grew the value on every keystroke.
   */
  const initial = fromE164(defaultValue ?? value ?? '', defaultCountry);
  const [country, setCountry] = useState<PhoneCountry>(initial.country);
  const [otherDial, setOtherDial] = useState(initial.country === 'other' ? initial.dial : '');

  /* Raw digits while the caret is in the field; grouped when it is not. */
  const [draft, setDraft] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const state = errorMessage ? 'error' : 'default';
  const message = errorMessage ?? helperText;
  const inactive = disabled || readOnly;

  /* E.164 always carries the dial code at the front, so once the country is
     known the split is exact rather than a guess. */
  const activeDial =
    country === 'other' ? otherDial.replace(/\D/g, '') : COUNTRY_RULES[country].dial;
  const allDigits = e164.replace(/\D/g, '');
  const national =
    activeDial && allDigits.startsWith(activeDial) ? allDigits.slice(activeDial.length) : allDigits;

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  function emit(nextCountry: PhoneCountry, nextNational: string, nextDial: string) {
    setE164(toE164(nextCountry, nextNational, nextDial));
  }

  function chooseCountry(next: PhoneCountry) {
    setCountry(next);
    setOpen(false);
    triggerRef.current?.focus();
    emit(next, national, next === 'other' ? otherDial : '');
  }

  function openList() {
    if (inactive) return;
    setActiveIndex(Math.max(0, OPTIONS.indexOf(country)));
    setOpen(true);
  }

  function onTriggerKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (inactive) return;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setOpen(false);
        return;
      /* Tab closes and moves on. The picker must never hold focus hostage. */
      case 'Tab':
        setOpen(false);
        return;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % OPTIONS.length);
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + OPTIONS.length) % OPTIONS.length);
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(OPTIONS.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        chooseCountry(OPTIONS[activeIndex] as PhoneCountry);
        return;
      default:
    }
  }

  const display = draft ?? formatNational(country, national);

  return (
    <div ref={rootRef} className={['uh-phone', className].filter(Boolean).join(' ')}>
      <FieldShell
        label={label}
        controlId={inputId}
        size={size}
        state={state}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        filled={national.length > 0}
        fullWidth={fullWidth}
        {...(description ? { description, descriptionId } : {})}
        message={message}
        messageId={messageId}
      >
        <div className="uh-phone__country">
          <div
            ref={triggerRef}
            className="uh-phone__trigger"
            role="combobox"
            tabIndex={inactive ? -1 : 0}
            /* Names the country outright, so the picker is unambiguous even
               when read out of context. */
            aria-label={countryLabel(optionName(country, otherLabel))}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
            aria-disabled={inactive || undefined}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onTriggerKeyDown}
          >
            <CountryMark country={country} />
            <span className="uh-phone__dial">{optionDial(country, otherDial)}</span>
            <span className="uh-phone__chevron" aria-hidden="true" data-open={open || undefined}>
              <ChevronDownIcon />
            </span>
          </div>

          {open ? (
            <ul
              ref={listRef}
              id={listId}
              className="uh-phone__list"
              role="listbox"
              aria-label={label}
            >
              {OPTIONS.map((option, index) => (
                <li
                  key={option}
                  id={`${listId}-${index}`}
                  role="option"
                  className="uh-phone__option"
                  aria-selected={option === country}
                  data-active={index === activeIndex ? 'true' : undefined}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    chooseCountry(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <CountryMark country={option} />
                  <span className="uh-phone__option-name">{optionName(option, otherLabel)}</span>
                  <span className="uh-phone__option-dial">
                    {option === 'other' ? '' : `+${COUNTRY_RULES[option].dial}`}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <span className="uh-phone__divider" aria-hidden="true" />

        {country === 'other' ? (
          <input
            id={codeId}
            className="uh-field__input uh-phone__code"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-label={otherCodeLabel}
            disabled={disabled}
            readOnly={readOnly}
            placeholder="+971"
            value={otherDial ? `+${otherDial.replace(/\D/g, '')}` : ''}
            onChange={(event) => {
              const next = event.target.value.replace(/\D/g, '');
              setOtherDial(next);
              emit('other', national, next);
            }}
          />
        ) : null}

        <input
          ref={ref}
          id={inputId}
          className="uh-field__input uh-phone__number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          readOnly={readOnly}
          placeholder={country === 'other' ? undefined : COUNTRY_RULES[country].example}
          aria-required={required || undefined}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={
            [descriptionId, message ? messageId : undefined].filter(Boolean).join(' ') || undefined
          }
          value={display}
          onFocus={() => setDraft(national)}
          onChange={(event) => {
            const raw = event.target.value;
            setDraft(raw);
            /* Parsed on every keystroke, so a pasted "+65..." switches the
               picker immediately rather than waiting for blur. */
            const next = parsePhone(raw, country, otherDial);
            if (next.country !== country) setCountry(next.country);
            emit(next.country, next.national, next.country === 'other' ? next.dial : otherDial);
          }}
          onBlur={() => setDraft(null)}
        />
      </FieldShell>
    </div>
  );
}

export const PhoneInput = /* @__PURE__ */ forwardRef(PhoneInputImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  PhoneInput.displayName = 'PhoneInput';
}
