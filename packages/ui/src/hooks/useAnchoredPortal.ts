import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

export interface AnchoredPortalOptions {
  open: boolean;
  /** The element the panel is measured against. */
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  /** Off for the mobile forms, where the panel is not anchored to anything. */
  enabled?: boolean;
  /** Makes the panel exactly as wide as the anchor, for a listbox under a field. */
  matchWidth?: boolean;
  /**
   * Fired when the popup loses the user: a pointer landing outside both the
   * anchor and the panel, or focus moving out of both.
   */
  onOutside?: (() => void) | undefined;
}

/**
 * Attributes a portal loses by leaving its subtree. Both drive custom
 * properties the panel needs, so they are carried across by hand.
 */
export interface InheritedContext {
  theme?: string | undefined;
  lang?: string | undefined;
}

/**
 * How close a panel may come to the edge of the viewport. Mirrors `spacing.8`;
 * applied in script rather than CSS because it clamps a computed coordinate.
 */
const VIEWPORT_INSET = 8;

/**
 * The part every portalled popup shares: measuring the anchor, carrying the
 * inherited attributes across, and closing on an outside pointer.
 *
 * Extracted because three components needed the same twenty lines and had
 * begun to disagree about them. What each one renders into the portal is its
 * own business; this only decides where it goes.
 *
 * Position is written straight to the node. A coordinate that changes on every
 * scroll frame has no business going through state.
 */
export function useAnchoredPortal(options: AnchoredPortalOptions): InheritedContext {
  const { open, anchorRef, panelRef, enabled = true, matchWidth = false, onOutside } = options;
  const [inherited, setInherited] = useState<InheritedContext>({});

  useLayoutEffect(() => {
    if (!open) return;
    const node = anchorRef.current;
    setInherited({
      theme: node?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined,
      lang: node?.closest('[lang]')?.getAttribute('lang') ?? undefined,
    });
  }, [open, anchorRef]);

  useLayoutEffect(() => {
    if (!open || !enabled) return undefined;

    function place() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const rect = anchor.getBoundingClientRect();
      if (matchWidth) panel.style.width = `${rect.width}px`;

      const height = panel.offsetHeight;
      const width = panel.offsetWidth;
      const roomBelow = window.innerHeight - rect.bottom;
      /* Flip above only when there is genuinely more room up there. */
      const flip = roomBelow < height && rect.top > roomBelow;

      panel.style.left = `${Math.max(
        VIEWPORT_INSET,
        Math.min(rect.left, window.innerWidth - width - VIEWPORT_INSET),
      )}px`;
      panel.style.top = `${flip ? rect.top - height : rect.bottom}px`;
      panel.dataset.placement = flip ? 'top' : 'bottom';
    }

    place();
    /* `true` catches scrolling in any ancestor, not only the window. */
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, enabled, matchWidth, anchorRef, panelRef]);

  useEffect(() => {
    if (!open || !onOutside) return undefined;

    const outside = (node: Node | null) =>
      !!node && !panelRef.current?.contains(node) && !anchorRef.current?.contains(node);

    function onPointerDown(event: PointerEvent) {
      if (outside(event.target as Node)) onOutside?.();
    }

    /*
     * Tabbing out of a non-modal popup closes it. Without this, Tab from the
     * last control inside walks on to the next field and leaves the popup
     * hanging open over the page with focus nowhere near it, and a second
     * popup can then open on top of the first.
     *
     * Watching focusin rather than focusout: focusin fires on the element
     * focus arrived at, which is the thing being asked about. focusout would
     * mean reading relatedTarget, and that is null in jsdom and in several
     * browsers, leaving nothing to test against.
     */
    function onFocusIn(event: FocusEvent) {
      if (outside(event.target as Node)) onOutside?.();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [open, anchorRef, panelRef, onOutside]);

  return inherited;
}
