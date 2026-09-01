import {
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';

import {
  useAnchoredPortal,
  type AnchorAlign,
  type AnchorPlacement,
} from '../../hooks/useAnchoredPortal.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { cloneWithMergedRef } from '../../lib/cloneWithRef.js';

export interface PopoverProps {
  /**
   * The element that owns the popover. It is cloned, not wrapped: the trigger
   * keeps its own semantics and gains the toggle, aria-haspopup, aria-expanded
   * and aria-controls wiring.
   */
  trigger: ReactElement<{
    onClick?: (event: unknown) => void;
    ref?: Ref<HTMLElement>;
    'aria-haspopup'?: string;
    'aria-expanded'?: boolean;
    'aria-controls'?: string;
  }>;
  content: ReactNode;
  /** Names the popup for assistive tech; required because content is arbitrary. */
  'aria-label': string;
  placement?: AnchorPlacement | undefined;
  align?: AnchorAlign | undefined;
  /** Gap to the trigger in px. The default mirrors spacing.8. */
  offset?: number | undefined;
  arrow?: boolean | undefined;
  closeOnClickOutside?: boolean | undefined;
  /** Controlled mode; leave undefined to let the trigger own it. */
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  className?: string | undefined;
}

/** Mirrors spacing.8: the hook clamps computed coordinates, so this is data. */
const DEFAULT_OFFSET = 8;

/**
 * The interactive cousin of Tooltip: same anchoring, opposite contract. A
 * tooltip repeats what its owner already says and vanishes on any movement; a
 * popover *contains* things - buttons, links, a small form - so it opens on
 * click, holds focus without trapping it, and closes on Escape, an outside
 * pointer, or focus moving on. It is not modal: the page keeps scrolling.
 */
export function Popover(props: PopoverProps) {
  const {
    trigger,
    content,
    placement = 'bottom',
    align = 'center',
    offset = DEFAULT_OFFSET,
    arrow = true,
    closeOnClickOutside = true,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    className,
  } = props;

  const reactId = useId();
  const panelId = `${reactId}-popover`;

  const anchorRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const close = useCallback(() => setOpen(false), [setOpen]);

  const inherited = useAnchoredPortal({
    open,
    anchorRef,
    panelRef,
    placement,
    align,
    offset,
    ...(closeOnClickOutside ? { onOutside: close } : {}),
  });

  useEffect(() => {
    if (!open) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      close();
      anchorRef.current?.focus();
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, close]);

  if (!isValidElement(trigger)) return null;

  const triggerProps = trigger.props as Record<string, unknown> & {
    onClick?: (event: unknown) => void;
  };
  /* Safe by construction - see the note in lib/cloneWithRef. */
  // eslint-disable-next-line react-hooks/refs
  const anchor = cloneWithMergedRef(trigger as ReactElement<Record<string, unknown>>, anchorRef, {
    onClick: (event: unknown) => {
      triggerProps.onClick?.(event);
      setOpen(!open);
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    /* Only while there is a popup to point at. */
    ...(open ? { 'aria-controls': panelId } : {}),
  });

  return (
    <>
      {anchor}
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={panelId}
              /* Non-modal dialog: focus may enter, nothing is trapped. */
              role="dialog"
              aria-label={props['aria-label']}
              className={['uh-popover', className].filter(Boolean).join(' ')}
              data-arrow={arrow ? 'true' : undefined}
              data-theme={inherited.theme}
              lang={inherited.lang}
            >
              {arrow ? <span className="uh-popover__arrow" aria-hidden="true" /> : null}
              <div className="uh-popover__content">{content}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Popover.displayName = 'Popover';
}
