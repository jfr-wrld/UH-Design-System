import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from 'react';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { DEFAULT_COUNTRIES, type Country, type FlagComponent } from './countries.js';

export type { Country, FlagComponent };
export { DEFAULT_COUNTRIES };

type NativeProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'required' | 'disabled' | 'readOnly' | 'children' | 'value' | 'onChange'
>;

export interface PhoneInputProps extends NativeProps {
  label: string;
  size?: FieldSize;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  countries?: Country[];
  /** Controlled selected country, by ISO 3166-1 alpha-2 code. */
  country?: string;
  defaultCountry?: string;
  onCountryChange?: (country: Country) => void;
  /** The national number, without the dial code. */
  value?: string;
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Accessible name for the country selector and its listbox. The selected
   * country is announced as the combobox's *value*, so this stays static.
   */
  countryListLabel?: string;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function PhoneInputImpl(props: PhoneInputProps, ref: ForwardedRef<HTMLInputElement>) {
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
    countries = DEFAULT_COUNTRIES,
    country,
    defaultCountry = 'MY',
    onCountryChange,
    value,
    defaultValue,
    onChange,
    countryListLabel = 'Country calling code',
    className,
    id,
    ...rest
  } = props;

  const reactId = useId();
  const inputId = id ?? `${reactId}-input`;
  const messageId = `${reactId}-message`;
  const listId = `${reactId}-list`;
  const triggerId = `${reactId}-trigger`;

  const fallback = countries[0] as Country;
  const [uncontrolledIso, setUncontrolledIso] = useState(defaultCountry);
  const selectedIso = country ?? uncontrolledIso;
  const selected = countries.find((c) => c.iso2 === selectedIso) ?? fallback;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolledValue;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(
      0,
      countries.findIndex((c) => c.iso2 === selectedIso),
    ),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const typeAhead = useRef({ query: '', at: 0 });

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;
  const inactive = disabled || readOnly;

  /* Close on an outside press. Escape is handled on the trigger itself. */
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  /* Keep the active option in view while arrowing through a scrolled list. */
  useEffect(() => {
    if (!open) return;
    const option = listRef.current?.children[activeIndex];
    // Optional call: jsdom has no layout, and older engines lack the options form.
    option?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex]);

  function selectIndex(index: number) {
    const next = countries[index];
    if (!next) return;
    if (country === undefined) setUncontrolledIso(next.iso2);
    onCountryChange?.(next);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function openList() {
    if (inactive) return;
    setActiveIndex(
      Math.max(
        0,
        countries.findIndex((c) => c.iso2 === selectedIso),
      ),
    );
    setOpen(true);
  }

  /**
   * The APG select-only combobox pattern. The listbox never takes DOM focus:
   * focus stays on the combobox and `aria-activedescendant` points at the
   * active option, which avoids the focus-restoration bugs that come with
   * moving focus into a popup.
   *
   * The trigger is a div with `role="combobox"` rather than a button, because
   * `aria-activedescendant` is not a permitted attribute on `role="button"` -
   * axe rejects it outright.
   */
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
      case 'Tab':
        setOpen(false);
        return;
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((i) => (i + 1) % countries.length);
        return;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((i) => (i - 1 + countries.length) % countries.length);
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(countries.length - 1);
        return;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectIndex(activeIndex);
        return;
      default:
        break;
    }

    /* Type-ahead by country name, the way a native select behaves. */
    if (event.key.length === 1 && /\S/.test(event.key)) {
      const now = event.timeStamp;
      const query =
        now - typeAhead.current.at < 800 ? typeAhead.current.query + event.key : event.key;
      typeAhead.current = { query, at: now };
      const match = countries.findIndex((c) =>
        c.name.toLowerCase().startsWith(query.toLowerCase()),
      );
      if (match >= 0) setActiveIndex(match);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
  }

  const { Flag } = selected;

  return (
    <div ref={rootRef} className="uh-phone">
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
        {...(className !== undefined ? { className } : {})}
      >
        <div className="uh-phone__country">
          <div
            ref={triggerRef}
            id={triggerId}
            className="uh-phone__trigger"
            role="combobox"
            /* Not tabbable while the field is disabled, matching the input
               beside it, but still programmatically focusable. */
            tabIndex={inactive ? -1 : 0}
            aria-label={countryListLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
            aria-disabled={inactive || undefined}
            onClick={() => (open ? setOpen(false) : openList())}
            onKeyDown={onTriggerKeyDown}
          >
            <span className="uh-phone__flag" aria-hidden="true">
              <Flag />
            </span>
            {/* The combobox's value, so it is announced after the name. */}
            <span className="uh-sr-only">{selected.name}</span>
            <span className="uh-phone__dial">{selected.dialCode}</span>
            <span className="uh-phone__chevron" aria-hidden="true">
              <ChevronIcon />
            </span>
          </div>

          {open ? (
            <ul
              ref={listRef}
              id={listId}
              className="uh-phone__list"
              role="listbox"
              aria-label={countryListLabel}
            >
              {countries.map((item, index) => {
                const ItemFlag = item.Flag;
                return (
                  <li
                    key={item.iso2}
                    id={`${listId}-${index}`}
                    role="option"
                    className="uh-phone__option"
                    aria-selected={item.iso2 === selected.iso2}
                    data-active={index === activeIndex ? 'true' : undefined}
                    /* pointerdown, not click: the outside-press listener fires
                       on pointerdown and would close the list first. */
                    onPointerDown={(event) => {
                      event.preventDefault();
                      selectIndex(index);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                  >
                    <span className="uh-phone__flag" aria-hidden="true">
                      <ItemFlag />
                    </span>
                    <span className="uh-phone__option-name">{item.name}</span>
                    <span className="uh-phone__option-dial">{item.dialCode}</span>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <span className="uh-phone__divider" aria-hidden="true" />

        <input
          {...rest}
          ref={ref}
          id={inputId}
          className="uh-field__input uh-phone__number"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          readOnly={readOnly}
          aria-required={required || undefined}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={message ? messageId : undefined}
          value={currentValue}
          onChange={handleChange}
        />
      </FieldShell>
    </div>
  );
}

export const PhoneInput = forwardRef(PhoneInputImpl);
PhoneInput.displayName = 'PhoneInput';
