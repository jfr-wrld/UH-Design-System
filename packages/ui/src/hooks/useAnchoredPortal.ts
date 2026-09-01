import { useEffect, useLayoutEffect, type RefObject } from 'react';

import { useInheritedContext, type InheritedContext } from './useInheritedContext.js';

export type { InheritedContext } from './useInheritedContext.js';

export type AnchorPlacement = 'top' | 'bottom' | 'left' | 'right';
export type AnchorAlign = 'start' | 'center' | 'end';

export interface AnchoredPortalOptions {
  open: boolean;
  /** The element the panel is measured against. */
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  /** Off for the mobile forms, where the panel is not anchored to anything. */
  enabled?: boolean;
  /** Which side of the anchor the panel prefers; it flips when space runs out. */
  placement?: AnchorPlacement;
  /** How the panel lines up along the anchor's other axis. */
  align?: AnchorAlign;
  /** Gap between anchor and panel, in px. Callers pass a spacing token's value. */
  offset?: number;
  /** Makes the panel exactly as wide as the anchor, for a listbox under a field. */
  matchWidth?: boolean;
  /**
   * Fired when the popup loses the user: a pointer landing outside both the
   * anchor and the panel, or focus moving out of both.
   */
  onOutside?: (() => void) | undefined;
}

/**
 * How close a panel may come to the edge of the viewport. Mirrors `spacing.8`;
 * applied in script rather than CSS because it clamps a computed coordinate.
 */
const VIEWPORT_INSET = 8;

/**
 * The one positioning brain for every portalled popup: measuring the anchor,
 * choosing and flipping a side, clamping into the viewport, carrying the
 * inherited attributes across, and closing on an outside pointer or focus.
 *
 * Position is written straight to the node - a coordinate that changes on
 * every scroll frame has no business going through state. Two extras land on
 * the panel for stylesheets to read: `data-placement` (the side actually
 * used, after any flip) and `--uh-anchor-arrow` (px along the panel's cross
 * axis where the anchor's centre sits, for an arrow to point from).
 */
export function useAnchoredPortal(options: AnchoredPortalOptions): InheritedContext {
  const {
    open,
    anchorRef,
    panelRef,
    enabled = true,
    placement = 'bottom',
    align = 'start',
    offset = 0,
    matchWidth = false,
    onOutside,
  } = options;
  const inherited = useInheritedContext(open, anchorRef);

  useLayoutEffect(() => {
    if (!open || !enabled) return undefined;

    function place() {
      const anchor = anchorRef.current;
      const panel = panelRef.current;
      if (!anchor || !panel) return;

      const rect = anchor.getBoundingClientRect();
      if (matchWidth) panel.style.width = `${rect.width}px`;

      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      /* Flip only when the preferred side lacks room AND the other has more. */
      const room = {
        top: rect.top,
        bottom: viewH - rect.bottom,
        left: rect.left,
        right: viewW - rect.right,
      };
      const need = placement === 'top' || placement === 'bottom' ? height + offset : width + offset;
      const opposite: Record<AnchorPlacement, AnchorPlacement> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left',
      };
      const side =
        room[placement] < need && room[opposite[placement]] > room[placement]
          ? opposite[placement]
          : placement;

      const alongCross = (start: number, span: number, panelSpan: number) => {
        if (align === 'center') return start + span / 2 - panelSpan / 2;
        if (align === 'end') return start + span - panelSpan;
        return start;
      };

      let top: number;
      let left: number;
      if (side === 'top' || side === 'bottom') {
        top = side === 'bottom' ? rect.bottom + offset : rect.top - height - offset;
        left = alongCross(rect.left, rect.width, width);
      } else {
        left = side === 'right' ? rect.right + offset : rect.left - width - offset;
        top = alongCross(rect.top, rect.height, height);
      }

      left = Math.max(VIEWPORT_INSET, Math.min(left, viewW - width - VIEWPORT_INSET));
      top = Math.max(VIEWPORT_INSET, Math.min(top, viewH - height - VIEWPORT_INSET));

      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.dataset.placement = side;

      /* Where the anchor's centre sits along the panel's cross axis, clamped
         inside the panel, so an arrow can point at the anchor even after the
         panel itself was clamped to the viewport. */
      const arrow =
        side === 'top' || side === 'bottom'
          ? rect.left + rect.width / 2 - left
          : rect.top + rect.height / 2 - top;
      const arrowMax = (side === 'top' || side === 'bottom' ? width : height) - VIEWPORT_INSET;
      panel.style.setProperty(
        '--uh-anchor-arrow',
        `${Math.max(VIEWPORT_INSET, Math.min(arrow, arrowMax))}px`,
      );
    }

    place();
    /* `true` catches scrolling in any ancestor, not only the window. */
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, enabled, placement, align, offset, matchWidth, anchorRef, panelRef]);

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
