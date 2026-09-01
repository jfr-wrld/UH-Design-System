import {
  isValidElement,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import {
  useAnchoredPortal,
  type AnchorAlign,
  type AnchorPlacement,
} from '../../hooks/useAnchoredPortal.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cloneWithMergedRef } from '../../lib/cloneWithRef.js';
import { DropdownContext, DropdownGroupContext, useDropdownContext } from './DropdownContext.js';

/* ----------------------------------------------------------------- root */

export interface DropdownProps {
  /** A `DropdownTrigger` and a `DropdownContent`. */
  children?: ReactNode | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}

/**
 * A trigger that opens a floating menu of actions - "..." on a card, an
 * account menu, anywhere a click should offer a short list of things to do
 * next rather than navigate somewhere or fill in a value. That distinction
 * is what separates this from `Select` (picks a *value*) and `Command`
 * (searches a list): every `DropdownItem` here just runs something.
 *
 * Built the same way `Popover` is - directly on `useAnchoredPortal`, not
 * wrapping `Popover` itself - because a menu needs `role="menu"` and real,
 * roving DOM focus between `role="menuitem"` children (the WAI-ARIA Menu
 * Button Pattern), which is a genuinely different shape from `Popover`'s
 * own non-modal `role="dialog"` with arbitrary, freely-tabbable content.
 */
export function Dropdown(props: DropdownProps): ReactElement {
  const { children, open: openProp, defaultOpen = false, onOpenChange } = props;

  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;
  const anchorRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  return (
    <DropdownContext.Provider value={{ open, setOpen, anchorRef, triggerId, contentId }}>
      {children}
    </DropdownContext.Provider>
  );
}

/* -------------------------------------------------------------- trigger */

export interface DropdownTriggerProps {
  /**
   * The element that opens the menu. Cloned, not wrapped, the same way
   * `Popover`'s own trigger is - it keeps its own semantics (a `Button`, an
   * icon-only `Button`, whatever it already was) and only gains the
   * `aria-haspopup`/`aria-expanded`/`aria-controls` wiring and the toggle.
   */
  children: ReactElement<{
    onClick?: (event: unknown) => void;
    onKeyDown?: (event: unknown) => void;
  }>;
}

export function DropdownTrigger(props: DropdownTriggerProps): ReactElement | null {
  const { children } = props;
  const ctx = useDropdownContext('DropdownTrigger');

  if (!isValidElement(children)) return null;

  const childProps = children.props as Record<string, unknown> & {
    onClick?: (event: unknown) => void;
    onKeyDown?: (event: unknown) => void;
  };

  /* Safe by construction - see the note in lib/cloneWithRef. */
  return cloneWithMergedRef(children as ReactElement<Record<string, unknown>>, ctx.anchorRef, {
    id: ctx.triggerId,
    onClick: (event: unknown) => {
      childProps.onClick?.(event);
      ctx.setOpen(!ctx.open);
    },
    onKeyDown: (event: ReactKeyboardEvent) => {
      childProps.onKeyDown?.(event);
      /* Down/Up opens the menu straight into keyboard navigation, matching
         every native menu button - Enter/Space already open it for free
         via the click each one already fires. */
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        ctx.setOpen(true);
      }
    },
    'aria-haspopup': 'menu',
    'aria-expanded': ctx.open,
    ...(ctx.open ? { 'aria-controls': ctx.contentId } : {}),
  });
}

/* -------------------------------------------------------------- content */

export interface DropdownContentProps {
  children?: ReactNode | undefined;
  /** Names the menu for assistive tech. Defaults to the trigger's own
      accessible name (`aria-labelledby`) - a menu almost always belongs to
      the button that opened it, so an override is only worth reaching for
      when the menu genuinely needs a different name than its trigger. */
  'aria-label'?: string | undefined;
  placement?: AnchorPlacement | undefined;
  align?: AnchorAlign | undefined;
  /** Gap to the trigger in px. Mirrors spacing.4. */
  offset?: number | undefined;
  className?: string | undefined;
}

const DEFAULT_OFFSET = 4;

function queryItems(panel: HTMLElement | null): HTMLElement[] {
  return Array.from(
    panel?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
  );
}

export function DropdownContent(props: DropdownContentProps): ReactNode {
  const {
    children,
    'aria-label': ariaLabel,
    placement = 'bottom',
    align = 'start',
    offset = DEFAULT_OFFSET,
    className,
  } = props;
  const ctx = useDropdownContext('DropdownContent');
  const panelRef = useRef<HTMLDivElement | null>(null);

  const inherited = useAnchoredPortal({
    open: ctx.open,
    anchorRef: ctx.anchorRef,
    panelRef,
    placement,
    align,
    offset,
    onOutside: () => ctx.setOpen(false),
  });

  /* First enabled item takes focus the moment the menu opens - the WAI-ARIA
     pattern's own baseline (opening via ArrowUp to land on the *last* item
     instead is a real refinement some native menus make, skipped here as a
     deliberate simplification rather than an oversight). */
  useEffect(() => {
    if (!ctx.open) return;
    queryItems(panelRef.current)[0]?.focus();
  }, [ctx.open]);

  useEffect(() => {
    if (!ctx.open) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      ctx.setOpen(false);
      ctx.anchorRef.current?.focus();
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
    // `ctx` itself isn't a dependency: it's a fresh object literal every
    // `Dropdown` render (its Provider `value` isn't memoized), so depending
    // on it would tear down and re-add this listener on every such render
    // instead of only when what it actually reads - open, anchorRef, setOpen
    // - changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.open, ctx.anchorRef, ctx.setOpen]);

  function move(delta: 1 | -1) {
    const items = queryItems(panelRef.current);
    if (items.length === 0) return;
    const current = document.activeElement;
    const index = items.indexOf(current as HTMLElement);
    const next =
      index === -1
        ? delta === 1
          ? 0
          : items.length - 1
        : (index + delta + items.length) % items.length;
    items[next]?.focus();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
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
        event.preventDefault();
        queryItems(panelRef.current)[0]?.focus();
        return;
      case 'End': {
        event.preventDefault();
        const items = queryItems(panelRef.current);
        items[items.length - 1]?.focus();
        return;
      }
      default:
    }
  }

  if (!ctx.open) return null;

  return createPortal(
    <div
      ref={panelRef}
      id={ctx.contentId}
      role="menu"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? undefined : ctx.triggerId}
      data-theme={inherited.theme}
      lang={inherited.lang}
      className={['uh-dropdown__content', className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ----------------------------------------------------------------- item */

export interface DropdownItemProps {
  children?: ReactNode | undefined;
  onSelect?: (() => void) | undefined;
  disabled?: boolean | undefined;
  /** Styling hint for an item that removes or cancels something - "Cancel
      booking", "Remove passenger" - the same red `Button` variant="destructive"
      already reads as elsewhere in this package. */
  destructive?: boolean | undefined;
  className?: string | undefined;
}

export function DropdownItem(props: DropdownItemProps): ReactElement {
  const { children, onSelect, disabled = false, destructive = false, className } = props;
  const ctx = useDropdownContext('DropdownItem');

  function run() {
    if (disabled) return;
    onSelect?.();
    ctx.setOpen(false);
    ctx.anchorRef.current?.focus();
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      run();
    }
  }

  return (
    <div
      role="menuitem"
      /* Never in the Tab order - Arrow keys move focus here, the same way
         Tab never walks between items in a native menu; `useAnchoredPortal`
         already closes the menu the moment Tab carries focus elsewhere. */
      tabIndex={-1}
      aria-disabled={disabled || undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-destructive={destructive ? 'true' : undefined}
      className={['uh-dropdown__item', className].filter(Boolean).join(' ')}
      onClick={disabled ? undefined : run}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- group */

export interface DropdownGroupProps {
  heading?: ReactNode | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function DropdownGroup(props: DropdownGroupProps): ReactElement {
  const { heading, children, className } = props;
  const reactId = useId();
  const groupId = `group-${reactId}`;
  const headingId = heading ? `${groupId}-heading` : undefined;

  return (
    <DropdownGroupContext.Provider value={{ groupId }}>
      <div
        role="group"
        aria-labelledby={headingId}
        className={['uh-dropdown__group', className].filter(Boolean).join(' ')}
      >
        {heading ? (
          <div id={headingId} className="uh-dropdown__group-heading">
            {heading}
          </div>
        ) : null}
        {children}
      </div>
    </DropdownGroupContext.Provider>
  );
}

/* ------------------------------------------------------------ separator */

export interface DropdownSeparatorProps {
  className?: string | undefined;
}

/* `role="presentation"`, not `role="separator"` - a menu's own required
   children are only menuitem/menuitemcheckbox/menuitemradio/group, so a
   real separator role sitting directly among them is invalid ARIA
   structure. Same fix `CommandSeparator` already documents for the
   identical listbox constraint. */
export function DropdownSeparator(props: DropdownSeparatorProps): ReactElement {
  return (
    <div
      role="presentation"
      className={['uh-dropdown__separator', props.className].filter(Boolean).join(' ')}
    />
  );
}

if (process.env.NODE_ENV !== 'production') {
  Dropdown.displayName = 'Dropdown';
  DropdownTrigger.displayName = 'DropdownTrigger';
  DropdownContent.displayName = 'DropdownContent';
  DropdownItem.displayName = 'DropdownItem';
  DropdownGroup.displayName = 'DropdownGroup';
  DropdownSeparator.displayName = 'DropdownSeparator';
}
