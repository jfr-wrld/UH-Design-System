import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { Search1, RefreshCircle3Clockwise, ErrorCircle1 } from '@tailgrids/icons';

import { MOBILE_QUERY } from '../../hooks/breakpoints.js';
import { useAnchoredPortal } from '../../hooks/useAnchoredPortal.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { Spinner } from '../Spinner/Spinner.js';
import { DEFAULT_LABELS, defaultEmptyMessage, type SearchComboboxLabels } from './labels.js';
import { splitMatches } from './highlight.js';
import { CloseIcon } from '../../lib/icons.js';

export interface SearchOption {
  id: string;
  label: string;
  /** A second line: the country an agency is in, the region a destination is in. */
  description?: string | undefined;
  /** Puts the option under a heading. Agencies and destinations in one list. */
  group?: string | undefined;
}

export interface SearchComboboxProps {
  /** Names the combobox for assistive tech; also the accessible name of the listbox and, on mobile, of the trigger button. */
  label: string;
  /** Controlled query. Pair with `onChange`; omit both and the field manages its own text via `defaultValue`. */
  value?: string | undefined;
  /** Initial query for the uncontrolled case. Ignored once `value` is passed. */
  defaultValue?: string | undefined;
  /** Fires on every keystroke, controlled or not - this is the raw text, not the debounced search. */
  onChange?: ((value: string) => void) | undefined;
  /** Called once the typing settles, never on every keystroke. */
  onSearch?: ((query: string) => void) | undefined;
  /** Fires when a result is chosen by click, Enter, or tap. The field fills with the option's label and the popup closes. */
  onSelect?: ((option: SearchOption) => void) | undefined;
  /** The rows to show. The component never filters these itself - pass back whatever `onSearch` (or the initial `recentSearches`) turned up. */
  options?: readonly SearchOption[] | undefined;
  /** Set while a search request is in flight. Combines with the debounce's own "typing" state to decide what the status region announces. */
  loading?: boolean | undefined;
  /** Shown in the empty field and, on mobile, on the closed trigger. */
  placeholder?: string | undefined;
  /** Shown in place of results when the field is empty and focused. */
  recentSearches?: readonly string[] | undefined;
  /** Enables the "Clear recent searches" control in the popup header. Omit it and the control is not rendered at all. */
  onClearRecent?: (() => void) | undefined;
  /** A string, or a function of the query so it can name what was searched for. */
  emptyMessage?: string | ((query: string) => string) | undefined;
  /** Set by the consumer when the search itself failed. */
  errorMessage?: string | undefined;
  /** Persistent hint under the field. Replaced by `errorMessage` when one is set, never shown alongside it. */
  helperText?: string | undefined;
  /** Milliseconds to wait after the last keystroke before `onSearch` fires. `0` searches on every keystroke. */
  debounce?: number | undefined;
  /** Closes and locks the field; the popup cannot open while true. */
  disabled?: boolean | undefined;
  /** Overrides for the built-in English copy (recent-searches heading, clear buttons, loading and cancel text, result count). */
  labels?: Partial<SearchComboboxLabels> | undefined;
  /** Extra class merged onto the root `.uh-search` element. */
  className?: string | undefined;
}

type Entry = { kind: 'recent'; value: string } | { kind: 'option'; option: SearchOption };

function SearchIcon() {
  return <Search1 aria-hidden="true" focusable="false" />;
}

/*
 * @tailgrids/icons has no literal "clock with a history arrow" glyph -
 * RefreshCircle3Clockwise (a circular, clockwise-turning arrow) stands in
 * for the same "recent activity" idea.
 */
function HistoryIcon() {
  return <RefreshCircle3Clockwise aria-hidden="true" focusable="false" />;
}

function AlertIcon() {
  return <ErrorCircle1 aria-hidden="true" focusable="false" />;
}

function SearchComboboxImpl(props: SearchComboboxProps, ref: ForwardedRef<HTMLInputElement>) {
  const {
    label,
    value,
    defaultValue,
    onChange,
    onSearch,
    onSelect,
    options = [],
    loading = false,
    placeholder = 'Search agencies and destinations',
    recentSearches = [],
    onClearRecent,
    emptyMessage = defaultEmptyMessage,
    errorMessage,
    helperText,
    debounce = 300,
    disabled = false,
    labels: labelOverrides,
    className,
  } = props;

  const labels: SearchComboboxLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const mobile = useMediaQuery(MOBILE_QUERY);

  const reactId = useId();
  const inputId = `${reactId}-input`;
  const labelId = `${reactId}-label`;
  const listId = `${reactId}-list`;
  const statusId = `${reactId}-status`;
  const messageId = `${reactId}-message`;

  const [query, setQuery] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  });

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  /* True between the last keystroke and the debounced search actually firing. */
  const [pending, setPending] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const clearRecentRef = useRef<HTMLButtonElement | null>(null);
  /*
   * Focusing the field normally opens the popup. When focus is being handed
   * back on the way out of the popup, that would reopen the thing we just
   * closed, so the one deliberate return sets this first.
   */
  const skipOpenOnFocus = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Read through a ref so a consumer passing an inline arrow does not restart
     the timer on every render. */
  const searchRef = useRef(onSearch);
  useEffect(() => {
    searchRef.current = onSearch;
  });

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  const inherited = useAnchoredPortal({
    open,
    anchorRef: rootRef,
    panelRef,
    /* The mobile overlay covers the screen and is anchored to nothing. */
    enabled: !mobile,
    matchWidth: true,
    /* Covers a pointer landing elsewhere and focus tabbing away, including the
       Shift+Tab out of the clear-recents button that no key handler here sees. */
    onOutside: close,
  });

  const trimmed = query.trim();
  const showingRecents = trimmed === '' && recentSearches.length > 0;

  const entries: Entry[] = useMemo(
    () =>
      showingRecents
        ? recentSearches.map((recent) => ({ kind: 'recent', value: recent }) as Entry)
        : trimmed === ''
          ? []
          : options.map((option) => ({ kind: 'option', option }) as Entry),
    [showingRecents, recentSearches, options, trimmed],
  );

  /*
   * Options keep their own headings, but the keyboard walks one flat list. The
   * index carried here is the flat one, so arrow keys cross a heading without
   * noticing it is there.
   */
  const groups = useMemo(() => {
    if (showingRecents) {
      return [
        {
          name: labels.recentHeading,
          showLabel: false,
          items: entries.map((entry, index) => ({ entry, index })),
        },
      ];
    }
    const ordered: Array<{
      name: string;
      showLabel: boolean;
      items: Array<{ entry: Entry; index: number }>;
    }> = [];
    entries.forEach((entry, index) => {
      const name = entry.kind === 'option' ? (entry.option.group ?? '') : '';
      let bucket = ordered.find((group) => group.name === name);
      if (!bucket) {
        bucket = { name, showLabel: name !== '', items: [] };
        ordered.push(bucket);
      }
      bucket.items.push({ entry, index });
    });
    return ordered;
  }, [entries, showingRecents, labels.recentHeading]);

  const busy = loading || pending;
  const isEmpty = trimmed !== '' && !busy && !errorMessage && options.length === 0;
  const hasResults = entries.length > 0;

  const state = disabled
    ? 'disabled'
    : errorMessage
      ? 'error'
      : !open
        ? 'idle'
        : pending
          ? 'typing'
          : loading
            ? 'loading'
            : /* Recent searches are a focused, not-yet-searching field, even
                 though they fill the same list that results do. */
              showingRecents
              ? 'focused'
              : isEmpty
                ? 'empty'
                : hasResults
                  ? 'results'
                  : 'focused';

  const emptyText = typeof emptyMessage === 'function' ? emptyMessage(trimmed) : emptyMessage;
  const statusText = errorMessage ?? (busy ? labels.loading : isEmpty ? emptyText : '');
  /* The result count is spoken but not shown: the list itself already shows it. */
  const quietStatus = statusText === '';

  function runSearch(next: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPending(false);
    searchRef.current?.(next);
  }

  function scheduleSearch(next: string) {
    if (timer.current) clearTimeout(timer.current);
    if (next.trim() === '') {
      /* Nothing to search for; the recents take over and no request is made. */
      timer.current = null;
      setPending(false);
      return;
    }
    if (debounce <= 0) {
      runSearch(next);
      return;
    }
    setPending(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setPending(false);
      searchRef.current?.(next);
    }, debounce);
  }

  function onInput(next: string) {
    setQuery(next);
    setOpen(true);
    setActiveIndex(-1);
    scheduleSearch(next);
  }

  function choose(entry: Entry) {
    if (entry.kind === 'recent') {
      /* A recent search is already a query: fill the field and run it now
         rather than waiting out a debounce the pilgrim did not cause. */
      setQuery(entry.value);
      setActiveIndex(-1);
      runSearch(entry.value);
      inputRef.current?.focus();
      return;
    }
    setQuery(entry.option.label);
    close();
    onSelect?.(entry.option);
    if (mobile) triggerRef.current?.focus();
    else inputRef.current?.focus();
  }

  function move(delta: number) {
    if (entries.length === 0) return;
    setActiveIndex((current) => {
      const next = current + delta;
      if (next < 0) return entries.length - 1;
      if (next >= entries.length) return 0;
      return next;
    });
  }

  function clearQuery() {
    setQuery('');
    setActiveIndex(-1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setPending(false);
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (disabled) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      if (open) {
        close();
        if (mobile) triggerRef.current?.focus();
        return;
      }
      /* Already closed: a second Escape empties the field, which is what the
         key does in every other search box. */
      if (query !== '') clearQuery();
      return;
    }

    if (!open) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Home':
        if (entries.length === 0) return;
        event.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        if (entries.length === 0) return;
        event.preventDefault();
        setActiveIndex(entries.length - 1);
        return;
      case 'Enter': {
        const entry = entries[activeIndex];
        if (!entry) return;
        event.preventDefault();
        choose(entry);
        return;
      }
      case 'Tab': {
        /*
         * The clear-recents button lives in the popup, which is portalled to
         * the end of the document, so plain Tab order would reach it long after
         * everything else on the page. On a desktop, Tab hands focus to it
         * directly; Tab again closes the popup and comes back to the field, so
         * the next Tab leaves normally. Nothing is ever trapped: Escape closes,
         * and a closed popup tabs onward like any other input.
         */
        if (!mobile && showingRecents && clearRecentRef.current) {
          event.preventDefault();
          clearRecentRef.current.focus();
          return;
        }
        close();
        return;
      }
      default:
    }
  }

  const activeId =
    activeIndex >= 0 && entries[activeIndex] ? `${listId}-${activeIndex}` : undefined;
  const message = errorMessage ?? helperText;

  const field = (
    <div className="uh-search__control" data-disabled={disabled ? 'true' : undefined}>
      <span className="uh-search__icon" aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        ref={(element) => {
          inputRef.current = element;
          if (typeof ref === 'function') ref(element);
          else if (ref) ref.current = element;
        }}
        id={inputId}
        className="uh-search__input"
        type="text"
        role="combobox"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-labelledby={labelId}
        aria-expanded={open}
        /*
         * Only while there is something to control. A combobox is required to
         * name its popup, but naming one that is not in the document points
         * assistive technology at nothing at all.
         */
        {...(open ? { 'aria-controls': listId } : {})}
        aria-autocomplete="list"
        aria-describedby={message ? messageId : undefined}
        aria-invalid={errorMessage ? true : undefined}
        {...(activeId ? { 'aria-activedescendant': activeId } : {})}
        placeholder={placeholder}
        disabled={disabled}
        value={query}
        onChange={(event) => onInput(event.target.value)}
        onFocus={() => {
          if (skipOpenOnFocus.current) {
            skipOpenOnFocus.current = false;
            return;
          }
          if (!disabled) setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {query !== '' && !disabled ? (
        <button
          type="button"
          className="uh-search__clear"
          aria-label={labels.clearQuery}
          onClick={clearQuery}
        >
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );

  const panelContents = (
    <>
      {showingRecents ? (
        <div className="uh-search__header">
          <span className="uh-search__header-title" aria-hidden="true">
            {labels.recentHeading}
          </span>
          {onClearRecent ? (
            <button
              ref={clearRecentRef}
              type="button"
              className="uh-search__clear-recent"
              onClick={() => {
                onClearRecent();
                inputRef.current?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key !== 'Tab' || event.shiftKey) return;
                event.preventDefault();
                skipOpenOnFocus.current = true;
                close();
                inputRef.current?.focus();
              }}
            >
              {labels.clearRecent}
            </button>
          ) : null}
        </div>
      ) : null}

      {/*
       * The listbox is always rendered: role="combobox" requires aria-controls
       * to point at something, and a listbox may hold nothing but options and
       * groups. Loading, empty and error are therefore a sibling region, not a
       * row inside the list. An empty list is hidden by the stylesheet.
       */}
      <div
        id={listId}
        className="uh-search__list"
        role="listbox"
        aria-label={label}
        aria-busy={busy || undefined}
      >
        {groups.map((group) => {
          const rows = group.items.map(({ entry, index }) => (
            <div
              key={entry.kind === 'recent' ? `r-${entry.value}` : entry.option.id}
              id={`${listId}-${index}`}
              className="uh-search__option"
              role="option"
              aria-selected={index === activeIndex}
              data-active={index === activeIndex ? 'true' : undefined}
              onPointerDown={(event) => {
                /* Keeps focus in the field, so the popup does not close under
                   the pointer before the click lands. */
                event.preventDefault();
                choose(entry);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {entry.kind === 'recent' ? (
                <>
                  <span className="uh-search__option-icon" aria-hidden="true">
                    <HistoryIcon />
                  </span>
                  <span className="uh-search__option-label">{entry.value}</span>
                </>
              ) : (
                <span className="uh-search__option-text">
                  <span className="uh-search__option-label">
                    {splitMatches(entry.option.label, trimmed).map((part, partIndex) =>
                      part.match ? (
                        <mark key={partIndex} className="uh-search__match">
                          {part.text}
                        </mark>
                      ) : (
                        <span key={partIndex}>{part.text}</span>
                      ),
                    )}
                  </span>
                  {entry.option.description ? (
                    <span className="uh-search__option-description">
                      {entry.option.description}
                    </span>
                  ) : null}
                </span>
              )}
            </div>
          ));

          return group.name === '' ? (
            rows
          ) : (
            <div key={group.name} className="uh-search__group" role="group" aria-label={group.name}>
              {group.showLabel ? (
                <div className="uh-search__group-label" aria-hidden="true">
                  {group.name}
                </div>
              ) : null}
              {rows}
            </div>
          );
        })}
      </div>

      <div
        id={statusId}
        className={['uh-search__status', quietStatus ? 'uh-sr-only' : ''].filter(Boolean).join(' ')}
        role={errorMessage ? 'alert' : 'status'}
        data-error={errorMessage ? 'true' : undefined}
      >
        {errorMessage ? (
          <span className="uh-search__status-icon" aria-hidden="true">
            <AlertIcon />
          </span>
        ) : busy ? (
          /* Decorative: the region around it already speaks. */
          <Spinner decorative size="sm" />
        ) : null}
        <span>{quietStatus ? labels.resultCount(entries.length) : statusText}</span>
      </div>
    </>
  );

  return (
    <div
      ref={rootRef}
      className={['uh-search', className].filter(Boolean).join(' ')}
      data-state={state}
    >
      <span className="uh-search__label" id={labelId}>
        {label}
      </span>

      {/*
       * On a phone the inline element is a button and the real combobox lives
       * in a full-screen overlay. Moving one input between two parents would
       * remount it and drop focus mid-word; a button that opens a search screen
       * is also what every phone already does.
       */}
      {mobile ? (
        <button
          ref={triggerRef}
          type="button"
          className="uh-search__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={`${labelId} ${inputId}-trigger-value`}
          aria-describedby={message ? messageId : undefined}
          disabled={disabled}
          onClick={() => setOpen(true)}
        >
          <span className="uh-search__icon" aria-hidden="true">
            <SearchIcon />
          </span>
          <span
            id={`${inputId}-trigger-value`}
            className="uh-search__trigger-value"
            data-placeholder={query === '' ? 'true' : undefined}
          >
            {query === '' ? placeholder : query}
          </span>
        </button>
      ) : (
        field
      )}

      {message ? (
        <p id={messageId} className="uh-search__message" role={errorMessage ? 'alert' : undefined}>
          {message}
        </p>
      ) : null}

      {open && !disabled
        ? createPortal(
            <div
              className="uh-search__layer"
              data-mobile={mobile ? 'true' : undefined}
              data-theme={inherited.theme}
              lang={inherited.lang}
            >
              <div
                ref={panelRef}
                className="uh-search__panel"
                data-mobile={mobile ? 'true' : undefined}
                {...(mobile ? { role: 'dialog', 'aria-modal': true, 'aria-label': label } : {})}
              >
                {mobile ? (
                  <div className="uh-search__overlay-bar">
                    {field}
                    <button
                      type="button"
                      className="uh-search__cancel"
                      onClick={() => {
                        close();
                        triggerRef.current?.focus();
                      }}
                    >
                      {labels.cancel}
                    </button>
                  </div>
                ) : null}
                {panelContents}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export const SearchCombobox = /* @__PURE__ */ forwardRef(SearchComboboxImpl);
/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  SearchCombobox.displayName = 'SearchCombobox';
}
