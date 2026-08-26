import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { FieldShell, type FieldSize } from '../Field/FieldShell.js';
import { Spinner } from '../Spinner/Spinner.js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
  errorMessage?: string;
  successMessage?: string;
  required?: boolean;
  disabled?: boolean;
  /** Turns the trigger into an editable combobox that filters the list. */
  searchable?: boolean;
  clearable?: boolean;
  /** Shows a busy row instead of the options, for async fetches. */
  loading?: boolean;
  size?: FieldSize;
  fullWidth?: boolean;
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string | null, option: SelectOption | null) => void;
  emptyMessage?: string;
  loadingMessage?: string;
  clearLabel?: string;
  /*
   * Explicitly `| undefined`: with exactOptionalPropertyTypes on, an optional
   * prop otherwise refuses a value that is computed as undefined at the call
   * site, which is exactly how conditional props get passed.
   */
  id?: string | undefined;
  className?: string | undefined;
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 7l10 10M17 7L7 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Where the portalled listbox should sit, in viewport coordinates. */
interface Anchor {
  top: number;
  left: number;
  width: number;
}

/**
 * A portal escapes more than overflow: it also escapes every inherited
 * attribute. `data-theme` and `lang` both drive custom properties the listbox
 * needs, so they are carried across explicitly.
 */
interface InheritedContext {
  theme?: string | undefined;
  lang?: string | undefined;
}

function SelectImpl(props: SelectProps, ref: ForwardedRef<HTMLDivElement>) {
  const {
    label,
    options,
    placeholder = 'Select an option',
    helperText,
    errorMessage,
    successMessage,
    required = false,
    disabled = false,
    searchable = false,
    clearable = false,
    loading = false,
    size = 'md',
    fullWidth = false,
    value,
    defaultValue,
    onValueChange,
    emptyMessage = 'No matches found',
    loadingMessage = 'Loading options',
    clearLabel = 'Clear selection',
    id,
    className,
  } = props;

  const reactId = useId();
  const controlId = id ?? `${reactId}-control`;
  const messageId = `${reactId}-message`;
  const listId = `${reactId}-list`;
  const statusId = `${reactId}-status`;

  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue ?? null);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : uncontrolled;
  const selected = options.find((o) => o.value === selectedValue) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [inherited, setInherited] = useState<InheritedContext>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement & HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeAhead = useRef({ query: '', at: 0 });

  const state = errorMessage ? 'error' : successMessage ? 'success' : 'default';
  const message = errorMessage ?? successMessage ?? helperText;

  /* Only a searchable select filters; a plain one always shows everything. */
  const visible = useMemo(() => {
    if (!searchable || !query) return options;
    const needle = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(needle));
  }, [options, query, searchable]);

  const selectable = visible.filter((o) => !o.disabled);
  const isEmpty = !loading && visible.length === 0;
  /* A listbox may only contain options, so loading and empty replace it entirely. */
  const hasOptions = !loading && !isEmpty;

  /*
   * The listbox is portalled to the body so an `overflow: hidden` ancestor -
   * a card, a table cell, a scroll container - cannot clip it. That trades
   * layout containment for manual positioning, so the anchor is re-measured
   * on scroll and resize.
   */
  const measure = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setAnchor({ top: rect.bottom, left: rect.left, width: rect.width });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    const node = rootRef.current;
    setInherited({
      theme: node?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined,
      lang: node?.closest('[lang]')?.getAttribute('lang') ?? undefined,
    });
    measure();
    // `true` catches scrolls in any ancestor, not just the window.
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open, measure]);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' });
  }, [open, activeIndex]);

  function indexOfValue(target: string | null) {
    const found = visible.findIndex((o) => o.value === target && !o.disabled);
    return found >= 0 ? found : visible.findIndex((o) => !o.disabled);
  }

  function openList() {
    if (disabled) return;
    setActiveIndex(Math.max(0, indexOfValue(selectedValue)));
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery('');
  }

  function commit(option: SelectOption | null) {
    if (option?.disabled) return;
    if (!isControlled) setUncontrolled(option?.value ?? null);
    onValueChange?.(option?.value ?? null, option);
    close();
    triggerRef.current?.focus();
  }

  /** Steps over disabled options rather than landing on them. */
  function move(delta: number) {
    if (!selectable.length) return;
    setActiveIndex((current) => {
      let next = current;
      for (let i = 0; i < visible.length; i += 1) {
        next = (next + delta + visible.length) % visible.length;
        if (!visible[next]?.disabled) return next;
      }
      return current;
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (disabled) return;

    if (!open) {
      if (
        ['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key) ||
        (!searchable && event.key === ' ')
      ) {
        event.preventDefault();
        openList();
      }
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        close();
        return;
      case 'Tab':
        close();
        return;
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Home':
        event.preventDefault();
        setActiveIndex(visible.findIndex((o) => !o.disabled));
        return;
      case 'End':
        event.preventDefault();
        setActiveIndex(visible.map((o) => !o.disabled).lastIndexOf(true));
        return;
      case 'Enter':
        event.preventDefault();
        commit(visible[activeIndex] ?? null);
        return;
      default:
        break;
    }

    /* A searchable select filters as you type; a plain one jumps like a native select. */
    if (!searchable && event.key.length === 1 && /\S/.test(event.key)) {
      const now = event.timeStamp;
      const next =
        now - typeAhead.current.at < 800 ? typeAhead.current.query + event.key : event.key;
      typeAhead.current = { query: next, at: now };
      const match = visible.findIndex(
        (o) => !o.disabled && o.label.toLowerCase().startsWith(next.toLowerCase()),
      );
      if (match >= 0) setActiveIndex(match);
    }
  }

  const activeId = open && visible[activeIndex] ? `${listId}-${activeIndex}` : undefined;
  const displayValue = selected?.label ?? '';

  const comboProps = {
    id: controlId,
    role: 'combobox' as const,
    'aria-expanded': open,
    /* Required by role=combobox, so the listbox always exists while open. */
    'aria-controls': open ? listId : undefined,
    'aria-activedescendant': activeId,
    'aria-haspopup': 'listbox' as const,
    'aria-required': required || undefined,
    'aria-invalid': state === 'error' || undefined,
    'aria-describedby': message ? messageId : undefined,
    onKeyDown,
  };

  const listbox =
    open && anchor
      ? createPortal(
          <div
            className="uh-select__portal"
            data-theme={inherited.theme}
            lang={inherited.lang}
            style={{ top: anchor.top, left: anchor.left, width: anchor.width }}
          >
            <div className="uh-select__panel">
              {/*
               * The listbox is always present: role=combobox requires
               * aria-controls, and it may only contain options - so loading
               * and empty are announced by a sibling status region instead
               * of a row inside the list.
               */}
              <ul
                ref={listRef}
                id={listId}
                className="uh-select__list"
                role="listbox"
                aria-label={label}
                aria-busy={loading || undefined}
              >
                {hasOptions &&
                  visible.map((option, index) => (
                    <li
                      key={option.value}
                      id={`${listId}-${index}`}
                      role="option"
                      className="uh-select__option"
                      aria-selected={option.value === selectedValue}
                      aria-disabled={option.disabled || undefined}
                      data-active={index === activeIndex ? 'true' : undefined}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        commit(option);
                      }}
                      onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    >
                      <span className="uh-select__option-label">{option.label}</span>
                      {/* Selection is marked twice: aria-selected for assistive
                          tech, and a tick for everyone else. Colour alone would
                          carry it for neither. */}
                      <span className="uh-select__check" aria-hidden="true">
                        {option.value === selectedValue ? <CheckIcon /> : null}
                      </span>
                    </li>
                  ))}
              </ul>
              {hasOptions ? null : (
                <div className="uh-select__status" role="status" id={statusId}>
                  {/* Decorative: the surrounding role="status" already speaks. */}
                  {loading ? <Spinner decorative size="sm" /> : null}
                  {loading ? loadingMessage : emptyMessage}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={ref} className={['uh-select', className].filter(Boolean).join(' ')}>
      <FieldShell
        label={label}
        controlId={controlId}
        size={size}
        state={state}
        required={required}
        disabled={disabled}
        filled={Boolean(selected)}
        fullWidth={fullWidth}
        message={message}
        messageId={messageId}
        labelAsText={searchable ? false : true}
      >
        <div ref={rootRef} className="uh-select__control">
          {searchable ? (
            <input
              {...comboProps}
              ref={triggerRef}
              className="uh-field__input"
              type="text"
              autoComplete="off"
              aria-autocomplete="list"
              disabled={disabled}
              placeholder={selected ? selected.label : placeholder}
              value={open ? query : displayValue}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                if (!open) setOpen(true);
              }}
              onClick={() => !open && openList()}
            />
          ) : (
            <div
              {...comboProps}
              ref={triggerRef}
              className="uh-select__value"
              tabIndex={disabled ? -1 : 0}
              aria-labelledby={`${controlId}-label ${controlId}`}
              aria-disabled={disabled || undefined}
              data-placeholder={selected ? undefined : 'true'}
              onClick={() => (open ? close() : openList())}
            >
              {selected ? selected.label : placeholder}
            </div>
          )}

          {clearable && selected && !disabled ? (
            <button
              type="button"
              className="uh-field__action"
              aria-label={clearLabel}
              onClick={() => commit(null)}
            >
              <ClearIcon />
            </button>
          ) : null}

          <span className="uh-select__chevron" aria-hidden="true" data-open={open || undefined}>
            <ChevronIcon />
          </span>
        </div>
      </FieldShell>
      {listbox}
    </div>
  );
}

export const Select = forwardRef(SelectImpl);
Select.displayName = 'Select';
