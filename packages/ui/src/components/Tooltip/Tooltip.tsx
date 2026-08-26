import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';

import { mergeRefs } from './mergeRefs.js';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
export type TooltipAlign = 'start' | 'center' | 'end';
export type TooltipPlacement = TooltipSide | `${TooltipSide}-${'start' | 'end'}`;

export interface TooltipProps {
  content: ReactNode;
  /** The trigger. Must accept a ref and spread the props it is given. */
  children: ReactElement;
  placement?: TooltipPlacement;
  /** Milliseconds before it opens on hover. Focus always opens immediately. */
  delay?: number;
  disabled?: boolean;
}

/** Distance from the trigger, leaving room for the arrow. */
const OFFSET = 8;
const VIEWPORT_PADDING = 8;

function parse(placement: TooltipPlacement): { side: TooltipSide; align: TooltipAlign } {
  const [side, align] = placement.split('-') as [TooltipSide, 'start' | 'end' | undefined];
  return { side, align: align ?? 'center' };
}

function opposite(side: TooltipSide): TooltipSide {
  return { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[side] as TooltipSide;
}

function place(
  trigger: DOMRect,
  tip: DOMRect,
  side: TooltipSide,
  align: TooltipAlign,
): { top: number; left: number } {
  const vertical = side === 'top' || side === 'bottom';
  const main =
    side === 'top'
      ? trigger.top - tip.height - OFFSET
      : side === 'bottom'
        ? trigger.bottom + OFFSET
        : side === 'left'
          ? trigger.left - tip.width - OFFSET
          : trigger.right + OFFSET;

  const start = vertical ? trigger.left : trigger.top;
  const triggerSize = vertical ? trigger.width : trigger.height;
  const tipSize = vertical ? tip.width : tip.height;
  const cross =
    align === 'start'
      ? start
      : align === 'end'
        ? start + triggerSize - tipSize
        : start + triggerSize / 2 - tipSize / 2;

  return vertical ? { top: main, left: cross } : { top: cross, left: main };
}

function fits(top: number, left: number, tip: DOMRect): boolean {
  return (
    top >= VIEWPORT_PADDING &&
    left >= VIEWPORT_PADDING &&
    top + tip.height <= window.innerHeight - VIEWPORT_PADDING &&
    left + tip.width <= window.innerWidth - VIEWPORT_PADDING
  );
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 200,
  disabled = false,
}: TooltipProps) {
  const id = useId();
  const tooltipId = `${id}-tooltip`;

  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const cancel = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const show = useCallback(
    (immediate: boolean) => {
      if (disabled) return;
      cancel();
      if (immediate || delay <= 0) setOpen(true);
      else timer.current = setTimeout(() => setOpen(true), delay);
    },
    [cancel, delay, disabled],
  );

  const hide = useCallback(() => {
    cancel();
    setOpen(false);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  /*
   * Derived, not an effect. Closing via setState in an effect would render the
   * tooltip once and then immediately unrender it; `disabled` simply means it
   * is not shown.
   */
  const visible = open && !disabled;

  /*
   * Measure, flip if the preferred side does not fit, clamp to the viewport,
   * then write straight to the node. Routing this through state would re-render
   * the whole subtree on every scroll frame to move one absolutely positioned
   * box, and would trip the hooks rule against setState inside an effect.
   */
  useLayoutEffect(() => {
    if (!visible) return undefined;

    function update() {
      const triggerNode = triggerRef.current;
      const tipNode = tipRef.current;
      if (!triggerNode || !tipNode) return;

      const trigger = triggerNode.getBoundingClientRect();
      const tip = tipNode.getBoundingClientRect();
      const { side, align } = parse(placement);

      let chosen = side;
      let next = place(trigger, tip, side, align);

      if (!fits(next.top, next.left, tip)) {
        const flipped = place(trigger, tip, opposite(side), align);
        if (fits(flipped.top, flipped.left, tip)) {
          chosen = opposite(side);
          next = flipped;
        }
      }

      tipNode.dataset.side = chosen;
      tipNode.style.top = `${clamp(next.top, VIEWPORT_PADDING, window.innerHeight - tip.height - VIEWPORT_PADDING)}px`;
      tipNode.style.left = `${clamp(next.left, VIEWPORT_PADDING, window.innerWidth - tip.width - VIEWPORT_PADDING)}px`;
      // Revealed only once it has somewhere to be, so it never flashes at 0,0.
      tipNode.style.visibility = 'visible';
    }

    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [visible, placement, content]);

  /* Escape closes without moving focus, per the APG tooltip pattern. */
  useEffect(() => {
    if (!visible) return undefined;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') hide();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible, hide]);

  if (!isValidElement(children)) return children;

  const child = children as ReactElement<Record<string, unknown>>;
  const childProps = child.props;
  const childRef = childProps['ref'] as Ref<HTMLElement> | undefined;

  /*
   * The rule forbids touching a ref during render, and it is right to. Nothing
   * is touched here: mergeRefs builds a callback that React invokes after
   * commit, and every write happens inside it.
   *
   * Merging rather than replacing is not optional. cloneElement overwrites the
   * child's ref, so without this `<Tooltip><Button ref={mine} /></Tooltip>`
   * would silently stop populating the caller's ref.
   */
  /* eslint-disable react-hooks/refs -- see the note above. */
  const trigger = cloneElement(child, {
    ref: mergeRefs<HTMLElement>(triggerRef, childRef),
    /*
     * describedby, not labelledby: a tooltip supplements the trigger's own
     * name. Replacing that name would lose whatever the control actually says.
     */
    'aria-describedby': visible ? tooltipId : undefined,
    onMouseEnter: (event: MouseEvent) => {
      (childProps.onMouseEnter as ((e: MouseEvent) => void) | undefined)?.(event);
      show(false);
    },
    onMouseLeave: (event: MouseEvent) => {
      (childProps.onMouseLeave as ((e: MouseEvent) => void) | undefined)?.(event);
      hide();
    },
    /* Focus opens with no delay: a keyboard user has already committed. */
    onFocus: (event: FocusEvent) => {
      (childProps.onFocus as ((e: FocusEvent) => void) | undefined)?.(event);
      show(true);
    },
    onBlur: (event: FocusEvent) => {
      (childProps.onBlur as ((e: FocusEvent) => void) | undefined)?.(event);
      hide();
    },
  } as Record<string, unknown>);
  /* eslint-enable react-hooks/refs */

  return (
    <>
      {trigger}
      {visible
        ? createPortal(
            <div
              ref={tipRef}
              id={tooltipId}
              role="tooltip"
              className="uh-tooltip"
              data-side={parse(placement).side}
              style={{ top: 0, left: 0, visibility: 'hidden' }}
            >
              {content}
              <span className="uh-tooltip__arrow" aria-hidden="true" />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

Tooltip.displayName = 'Tooltip';
