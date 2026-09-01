import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

import { useFocusTrap } from '../../hooks/useFocusTrap.js';
import { useInheritedContext } from '../../hooks/useInheritedContext.js';
import { usePresence } from '../../hooks/usePresence.js';
import { useScrollLock } from '../../hooks/useScrollLock.js';
import { CloseIcon } from '../../lib/icons.js';

export interface BottomSheetLabels {
  close: string;
  /** Accessible name of the resize handle. */
  resize: string;
  /** What the slider announces per snap: "60% of the screen". */
  snapValue: (percent: string) => string;
}

const DEFAULT_LABELS: BottomSheetLabels = {
  close: 'Close',
  resize: 'Resize sheet',
  snapValue: (percent) => `${percent}% of the screen`,
};

export interface BottomSheetProps {
  open: boolean;
  /** Every way out lands here: Escape, backdrop, the close button, a drag past the end. */
  onClose: () => void;
  /** Names the dialog; also the visible heading unless `aria-label` replaces it. */
  title?: string | undefined;
  'aria-label'?: string | undefined;
  children?: ReactNode | undefined;
  /** Sticky action row: FilterPanel's Apply lives here. */
  footer?: ReactNode | undefined;
  /**
   * Heights the sheet rests at, as fractions of the viewport, ascending.
   * The token sheet-max-height (88vh) caps whatever these say: the strip of
   * page left above the sheet is what says the page still exists.
   */
  snapPoints?: readonly number[] | undefined;
  /** Index into snapPoints to open at. */
  initialSnap?: number | undefined;
  /** The grabber. Off, the sheet still resizes by keyboard and closes normally. */
  dragHandle?: boolean | undefined;
  /**
   * Marks the body as its own scroll area. Dragging then starts only from the
   * handle and header - a finger on scrolling content is scrolling, not
   * resizing - except that a drag down with the content already at its top is
   * unambiguous and falls through to the sheet.
   */
  scrollable?: boolean | undefined;
  labels?: Partial<BottomSheetLabels> | undefined;
  className?: string | undefined;
}

interface DragState {
  startY: number;
  lastY: number;
  lastT: number;
  velocity: number;
  delta: number;
}

/** Past this share of the current height, a release means close, not settle. */
const DISMISS_RATIO = 0.35;
/** px/ms downward that reads as a flick. */
const FLICK_VELOCITY = 0.5;

export function BottomSheet(props: BottomSheetProps) {
  const {
    open,
    onClose,
    title,
    children,
    footer,
    snapPoints = [0.6],
    initialSnap = 0,
    dragHandle = true,
    scrollable = false,
    labels: labelOverrides,
    className,
  } = props;

  const labels: BottomSheetLabels = { ...DEFAULT_LABELS, ...labelOverrides };
  const reactId = useId();
  const titleId = `${reactId}-title`;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<DragState | null>(null);
  /* Reads the ambient data-theme/lang before the panel leaves for
     document.body; see the note on Modal's sentinelRef. */
  const sentinelRef = useRef<HTMLSpanElement | null>(null);

  /* Sanitised once: ascending, clamped to (0, 1]. */
  const snaps = [...snapPoints]
    .filter((point) => Number.isFinite(point) && point > 0 && point <= 1)
    .sort((a, b) => a - b);
  const safeSnaps = snaps.length > 0 ? snaps : [0.6];

  const [snapIndex, setSnapIndex] = useState(() =>
    Math.min(Math.max(initialSnap, 0), safeSnaps.length - 1),
  );
  /* Live translateY while a finger is down; null when settled. */
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const phase = usePresence(open, panelRef);
  const present = phase !== 'closed';

  useScrollLock(present);
  useFocusTrap(phase === 'open', panelRef);
  const inherited = useInheritedContext(present, sentinelRef);

  /* Reopening starts back at initialSnap, not wherever the last visit ended.
     The prev-props pattern, adjusted during render: React re-renders at once
     with the settled index and nothing ever paints the stale one. */
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSnapIndex(Math.min(Math.max(initialSnap, 0), safeSnaps.length - 1));
  }

  useEffect(() => {
    if (phase !== 'open') return undefined;
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      onClose();
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [phase, onClose]);

  const beginDrag = useCallback((event: PointerEvent<HTMLElement>) => {
    drag.current = {
      startY: event.clientY,
      lastY: event.clientY,
      lastT: event.timeStamp,
      velocity: 0,
      delta: 0,
    };
    /* jsdom has no pointer capture; the browser needs it so a fast drag that
       leaves the handle keeps reporting. */
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }, []);

  function onHandlePointerDown(event: PointerEvent<HTMLElement>) {
    beginDrag(event);
  }

  function onBodyPointerDown(event: PointerEvent<HTMLElement>) {
    if (!scrollable) {
      beginDrag(event);
      return;
    }
    /* Scrollable content owns its gestures unless it is already at the top,
       where a downward drag cannot mean anything but the sheet. */
    if ((bodyRef.current?.scrollTop ?? 0) <= 0) beginDrag(event);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state) return;
    const dt = Math.max(event.timeStamp - state.lastT, 1);
    state.velocity = (event.clientY - state.lastY) / dt;
    state.lastY = event.clientY;
    state.lastT = event.timeStamp;
    state.delta = event.clientY - state.startY;
    /* Upward drag resists past the top snap rather than stretching. */
    setDragOffset(Math.max(state.delta, state.delta < 0 ? state.delta / 4 : 0));
  }

  function onPointerEnd() {
    const state = drag.current;
    drag.current = null;
    setDragOffset(null);
    if (!state) return;

    const height = panelRef.current?.offsetHeight ?? 0;
    const flickDown = state.velocity > FLICK_VELOCITY;
    const flickUp = state.velocity < -FLICK_VELOCITY;

    if (flickUp) {
      setSnapIndex((current) => Math.min(current + 1, safeSnaps.length - 1));
      return;
    }
    if (flickDown) {
      if (snapIndex === 0) onClose();
      else setSnapIndex((current) => current - 1);
      return;
    }
    if (height > 0 && state.delta > height * DISMISS_RATIO) {
      /* Dragged well past the lowest rest: the finger said close. */
      if (snapIndex === 0) onClose();
      else setSnapIndex(0);
      return;
    }
    /* Anything else settles back where it was. */
  }

  /* The handle is a slider over the snap points, so a keyboard resizes too. */
  function onHandleKeyDown(event: KeyboardEvent<HTMLElement>) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        setSnapIndex((current) => Math.min(current + 1, safeSnaps.length - 1));
        return;
      case 'ArrowDown':
        event.preventDefault();
        if (snapIndex === 0) onClose();
        else setSnapIndex((current) => current - 1);
        return;
      case 'Home':
        event.preventDefault();
        setSnapIndex(0);
        return;
      case 'End':
        event.preventDefault();
        setSnapIndex(safeSnaps.length - 1);
        return;
      default:
    }
  }

  if (!present) {
    return <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />;
  }

  const fraction = safeSnaps[snapIndex]!;
  const percent = Math.round(fraction * 100);
  const ariaLabel = props['aria-label'];

  return (
    <>
      <span ref={sentinelRef} aria-hidden="true" style={{ display: 'none' }} />
      {createPortal(
        <div
          className="uh-sheet"
          data-state={phase}
          data-theme={inherited.theme}
          lang={inherited.lang}
        >
          <div className="uh-sheet__backdrop" aria-hidden="true" onClick={onClose} />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            {...(ariaLabel ? { 'aria-label': ariaLabel } : { 'aria-labelledby': titleId })}
            className={['uh-sheet__panel', className].filter(Boolean).join(' ')}
            data-dragging={dragOffset !== null ? 'true' : undefined}
            style={{
              height: `min(${percent}dvh, var(--uh-size-sheet-max-height))`,
              transform:
                dragOffset !== null ? `translateY(${Math.max(dragOffset, 0)}px)` : undefined,
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerEnd}
            onPointerCancel={onPointerEnd}
          >
            {dragHandle ? (
              <div className="uh-sheet__grab" onPointerDown={onHandlePointerDown}>
                <button
                  type="button"
                  className="uh-sheet__handle"
                  role="slider"
                  aria-label={labels.resize}
                  aria-orientation="vertical"
                  aria-valuemin={0}
                  aria-valuemax={safeSnaps.length - 1}
                  aria-valuenow={snapIndex}
                  aria-valuetext={labels.snapValue(String(percent))}
                  onKeyDown={onHandleKeyDown}
                >
                  <span className="uh-sheet__handle-bar" aria-hidden="true" />
                </button>
              </div>
            ) : null}

            <div className="uh-sheet__header" onPointerDown={onHandlePointerDown}>
              {title ? (
                <h2 id={titleId} className="uh-sheet__title">
                  {title}
                </h2>
              ) : (
                <span id={titleId} className="uh-sr-only">
                  {ariaLabel}
                </span>
              )}
              <button
                type="button"
                className="uh-close-button uh-sheet__close"
                aria-label={labels.close}
                onClick={onClose}
              >
                <CloseIcon />
              </button>
            </div>

            <div
              ref={bodyRef}
              className="uh-sheet__body"
              data-scrollable={scrollable ? 'true' : undefined}
              onPointerDown={onBodyPointerDown}
            >
              {children}
            </div>

            {footer ? <div className="uh-sheet__footer">{footer}</div> : null}
          </div>
        </div>,
        document.body,
      )}
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
  BottomSheet.displayName = 'BottomSheet';
}
