import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ForwardedRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Search1 } from '@tailgrids/icons';

import {
  CommandContext,
  CommandGroupContext,
  useCommandContext,
  type RegisteredItem,
} from './CommandContext.js';
import { useControllableState } from '../../hooks/useControllableState.js';

export type CommandFilter = (
  value: string,
  search: string,
  keywords?: readonly string[] | undefined,
) => boolean;

/** Case-insensitive substring match against the item's `value` or any of
    its `keywords` - the same "contains" rule the reference documents as
    its own default. */
const defaultFilter: CommandFilter = (value, search, keywords) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  if (value.toLowerCase().includes(query)) return true;
  return keywords?.some((keyword) => keyword.toLowerCase().includes(query)) ?? false;
};

export interface CommandProps {
  children?: ReactNode | undefined;
  /** Accessible name of the item list. */
  label?: string | undefined;
  filter?: CommandFilter | undefined;
  /** @default true */
  shouldFilter?: boolean | undefined;
  /** The search query, controlled. Leave undefined (the common case) and
      `Command` owns it - reach for this only to seed or drive the query
      from outside, e.g. syncing it with a URL param. */
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  className?: string | undefined;
}

/**
 * The root of a command menu: a search box (`CommandInput`) filtering a
 * grouped, keyboard-navigable list (`CommandList`/`CommandGroup`/
 * `CommandItem`). No dependency behind it - filtering, the active
 * descendant, and Up/Down/Enter are all plain state and a `role="combobox"`
 * `aria-activedescendant` pairing, the same accessible pattern
 * `SearchCombobox` already uses elsewhere in this package, just with
 * grouped, execute-on-select items instead of query-filling ones.
 *
 * Every `CommandItem` registers its own `(value, keywords, disabled,
 * onSelect)` with the root on mount rather than the root inspecting its
 * children - which is what lets an item live inside a `CommandGroup`
 * without the group needing to know its own children's shape.
 */
export function Command(props: CommandProps) {
  const {
    children,
    label = 'Command menu',
    filter = defaultFilter,
    shouldFilter = true,
    value,
    defaultValue,
    onValueChange,
    className,
  } = props;

  const reactId = useId();
  const listId = `${reactId}-list`;
  const inputId = `${reactId}-input`;

  const [query, setQuery] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? '',
    onChange: onValueChange,
  });
  const [rawActiveId, setActiveId] = useState<string | null>(null);
  // Plain state, not a mutated Map - refs can't be read during render (the
  // `visibleIds`/`navigableIds` memos below do exactly that), and a value
  // merely returned from a hook (the old `useMemo`) may not be written to
  // directly either. Register/unregister each copy the map, the same
  // immutable-update shape any other list-of-things state in this package
  // already follows.
  const [items, setItems] = useState<Map<string, RegisteredItem>>(() => new Map());

  const registerItem = useCallback((id: string, item: RegisteredItem) => {
    setItems((prev) => new Map(prev).set(id, item));
    return () => {
      setItems((prev) => {
        if (!prev.has(id)) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    };
  }, []);

  const getItem = useCallback((id: string) => items.get(id), [items]);

  const matchesFilter = useCallback(
    (id: string) => {
      const item = items.get(id);
      if (!item) return false;
      if (!shouldFilter) return true;
      return filter(item.value, query, item.keywords);
    },
    [items, query, shouldFilter, filter],
  );

  /* Both lists share registration order (== render order), recomputed
     whenever the query changes or an item mounts/unmounts. `visibleIds` is
     what a disabled item still belongs to - filtering is a text match,
     independent of whether the item can be run - while `navigableIds` is the
     subset Up/Down and the initial highlight actually walk. */
  const visibleIds = useMemo(() => {
    const ids: string[] = [];
    for (const id of items.keys()) {
      if (matchesFilter(id)) ids.push(id);
    }
    return ids;
  }, [items, matchesFilter]);

  const navigableIds = useMemo(
    () => visibleIds.filter((id) => !items.get(id)?.disabled),
    [visibleIds, items],
  );

  // Derived, not stored-then-corrected: computing the fallback inline (rather
  // than committing `null`/a stale id and patching it up via a setState in an
  // effect afterward) keeps every render already consistent with the current
  // `navigableIds`, instead of painting one frame behind and cascading into a
  // second render to fix it up.
  const activeId =
    rawActiveId && navigableIds.includes(rawActiveId) ? rawActiveId : (navigableIds[0] ?? null);

  const runItem = useCallback(
    (id: string) => {
      const item = items.get(id);
      if (!item || item.disabled) return;
      item.onSelect?.();
    },
    [items],
  );

  const context = useMemo(
    () => ({
      query,
      setQuery,
      activeId,
      setActiveId,
      visibleIds,
      navigableIds,
      getItem,
      registerItem,
      runItem,
      listId,
      inputId,
      listLabel: label,
    }),
    [
      query,
      setQuery,
      activeId,
      visibleIds,
      navigableIds,
      getItem,
      registerItem,
      runItem,
      listId,
      inputId,
      label,
    ],
  );

  return (
    <CommandContext.Provider value={context}>
      <div className={['uh-command', className].filter(Boolean).join(' ')}>{children}</div>
    </CommandContext.Provider>
  );
}

/* ---------------------------------------------------------------- input */

export interface CommandInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'role'
> {
  className?: string | undefined;
}

function CommandInputImpl(props: CommandInputProps, ref: ForwardedRef<HTMLInputElement>) {
  const { className, ...rest } = props;
  const ctx = useCommandContext('CommandInput');

  /*
   * A `role="combobox"` needs a real accessible name of its own - relying on
   * `placeholder` alone (an HTML-AAM fallback, not a guarantee) meant an
   * author who left `placeholder` off shipped a nameless combobox with no
   * test catching it. Falls back to `Command`'s own `label` prop (the same
   * name `CommandList` already carries) unless the consumer supplied their
   * own `aria-label`/`aria-labelledby`, matching `SearchCombobox`'s input.
   */
  const accessibleName =
    rest['aria-label'] ?? (rest['aria-labelledby'] ? undefined : ctx.listLabel);

  function move(delta: 1 | -1) {
    const ids = ctx.navigableIds;
    if (ids.length === 0) return;
    const current = ctx.activeId ? ids.indexOf(ctx.activeId) : -1;
    const next = (((current + delta) % ids.length) + ids.length) % ids.length;
    ctx.setActiveId(ids[next]!);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        move(1);
        return;
      case 'ArrowUp':
        event.preventDefault();
        move(-1);
        return;
      case 'Enter':
        event.preventDefault();
        if (ctx.activeId) ctx.runItem(ctx.activeId);
        return;
      default:
    }
  }

  return (
    <div className="uh-command__input-row">
      <span className="uh-command__input-icon" aria-hidden="true">
        <Search1 />
      </span>
      <input
        {...rest}
        ref={ref}
        id={ctx.inputId}
        className={['uh-command__input', className].filter(Boolean).join(' ')}
        role="combobox"
        aria-expanded="true"
        aria-controls={ctx.listId}
        aria-activedescendant={ctx.activeId ?? undefined}
        aria-autocomplete="list"
        aria-label={accessibleName}
        autoComplete="off"
        spellCheck={false}
        value={ctx.query}
        onChange={(event) => ctx.setQuery(event.target.value)}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

export const CommandInput = /* @__PURE__ */ forwardRef(CommandInputImpl);

/* ----------------------------------------------------------------- list */

export interface CommandListProps extends HTMLAttributes<HTMLDivElement> {
  className?: string | undefined;
}

export function CommandList(props: CommandListProps) {
  const { children, className, ...rest } = props;
  const ctx = useCommandContext('CommandList');
  /*
   * role="listbox" only while there is at least one option to hold - ARIA
   * requires a listbox's children to be options (or groups of them), and an
   * empty query-with-no-matches state legitimately has none. CommandEmpty's
   * message still renders in the same place either way; it just is not
   * wearing a role that promises children it does not have. Matches
   * SearchCombobox's own reasoning for keeping its empty/error state a
   * sibling of the listbox rather than a row inside it.
   */
  return (
    <div
      {...rest}
      id={ctx.listId}
      role={ctx.visibleIds.length > 0 ? 'listbox' : undefined}
      aria-label={ctx.listLabel}
      className={['uh-command__list', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- empty */

export interface CommandEmptyProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

/** Renders only once nothing currently matches the query - never on first
    paint with an empty query, since an empty query matches everything. */
export function CommandEmpty(props: CommandEmptyProps) {
  const { children, className } = props;
  const ctx = useCommandContext('CommandEmpty');
  if (ctx.visibleIds.length > 0) return null;
  return (
    <div className={['uh-command__empty', className].filter(Boolean).join(' ')} role="presentation">
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- group */

export interface CommandGroupProps {
  heading?: ReactNode | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function CommandGroup(props: CommandGroupProps) {
  const { heading, children, className } = props;
  const ctx = useCommandContext('CommandGroup');
  const reactId = useId();
  const groupId = `group-${reactId}`;
  const headingId = heading ? `${groupId}-heading` : undefined;

  const hasVisibleItem = ctx.visibleIds.some((id) => ctx.getItem(id)?.groupId === groupId);

  /*
   * `children` always mounts, hidden or not - a CommandItem only learns its
   * own groupId (and registers itself at all) by actually rendering once,
   * which `return null` here would prevent from ever happening: a group
   * with no items registered yet reads as "nothing visible" and hides
   * itself, which stops its children from mounting, which is the only way
   * they could have registered in the first place. The native `hidden`
   * attribute breaks that deadlock - children always get to render and
   * register, and `hidden` both paints nothing and drops the group from
   * the accessibility tree once it is confirmed genuinely empty.
   */
  return (
    <CommandGroupContext.Provider value={{ groupId }}>
      <div
        className={['uh-command__group', className].filter(Boolean).join(' ')}
        role="group"
        aria-labelledby={headingId}
        hidden={!hasVisibleItem}
      >
        {/* `aria-labelledby` rather than a string-only `aria-label` above -
            `heading` is typed `ReactNode` (an icon plus text is a real,
            expected shape here), and a string-only check silently left any
            non-string heading with no accessible name at all even though
            sighted users still saw it rendered fine. Pointing at the
            heading's own id names the group from whatever is actually
            painted, string or not. */}
        {heading ? (
          <div id={headingId} className="uh-command__group-heading">
            {heading}
          </div>
        ) : null}
        {children}
      </div>
    </CommandGroupContext.Provider>
  );
}

/* ----------------------------------------------------------------- item */

export interface CommandItemProps {
  /** The text this item is matched against. Defaults to `children` when
      that is a plain string; required whenever `children` is not. */
  value?: string | undefined;
  /** Extra terms that also count as a match, invisible on screen - "vscode"
      for an item labelled "Visual Studio Code", say. */
  keywords?: readonly string[] | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function CommandItem(props: CommandItemProps) {
  const { value, keywords, onSelect, disabled = false, children, className } = props;
  const ctx = useCommandContext('CommandItem');
  const groupCtx = useContext(CommandGroupContext);
  const reactId = useId();
  const id = `item-${reactId}`;
  const resolvedValue = value ?? (typeof children === 'string' ? children : id);

  useEffect(
    () =>
      ctx.registerItem(id, {
        value: resolvedValue,
        keywords,
        disabled,
        groupId: groupCtx?.groupId,
        onSelect,
      }),
    // ctx.registerItem is stable (useCallback in Command); the rest are the
    // real dependencies that should re-register this item's metadata.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, resolvedValue, disabled, groupCtx?.groupId, onSelect],
  );

  if (!ctx.visibleIds.includes(id)) return null;

  const active = ctx.activeId === id;

  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-active={active ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={['uh-command__item', className].filter(Boolean).join(' ')}
      onMouseEnter={disabled ? undefined : () => ctx.setActiveId(id)}
      onClick={disabled ? undefined : () => ctx.runItem(id)}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ separator */

export interface CommandSeparatorProps {
  className?: string | undefined;
}

/*
 * `role="presentation"`, not `role="separator"` - a listbox's own required
 * children are only `option` and `group`, so a real separator role sitting
 * directly among them is invalid ARIA structure the moment it is placed
 * inside `CommandList`. Nobody lands "on" this in the accessibility tree
 * either way: arrow-key navigation moves between options, never through
 * decoration between them, so the stricter role bought nothing a plain
 * divider does not already give a sighted user.
 */
export function CommandSeparator(props: CommandSeparatorProps) {
  return (
    <div
      className={['uh-command__separator', props.className].filter(Boolean).join(' ')}
      role="presentation"
    />
  );
}

/* ------------------------------------------------------------- shortcut */

export interface CommandShortcutProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

/** A decorative keystroke hint ("⌘K") beside an item - not a live shortcut
    binding, the same way the reference describes it: this package draws no
    line between "the shortcut is shown" and "the shortcut does something",
    that wiring is the consumer's own `onSelect`/global listener. */
export function CommandShortcut(props: CommandShortcutProps) {
  return (
    <span
      className={['uh-command__shortcut', props.className].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      {props.children}
    </span>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Command.displayName = 'Command';
  CommandInput.displayName = 'CommandInput';
  CommandList.displayName = 'CommandList';
  CommandEmpty.displayName = 'CommandEmpty';
  CommandGroup.displayName = 'CommandGroup';
  CommandItem.displayName = 'CommandItem';
  CommandSeparator.displayName = 'CommandSeparator';
  CommandShortcut.displayName = 'CommandShortcut';
}
