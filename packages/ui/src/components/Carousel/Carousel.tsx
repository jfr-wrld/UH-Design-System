import { useEffect, useId, useLayoutEffect, useRef, type ReactNode, type UIEvent } from 'react';

import { useControllableState } from '../../hooks/useControllableState.js';
import { announce } from '../../lib/announcer.js';
import { ChevronDownIcon } from '../../lib/icons.js';

export interface CarouselSlide {
  id: string;
  content: ReactNode;
  /** Read as part of "N of M" - what the picture shows, not a caption. */
  label?: string | undefined;
}

export interface CarouselLabels {
  previous: string;
  next: string;
  goTo: (slideNumber: number) => string;
  status: (slideNumber: number, total: number, label?: string) => string;
}

const DEFAULT_LABELS: CarouselLabels = {
  previous: 'Previous slide',
  next: 'Next slide',
  goTo: (n) => `Go to slide ${n}`,
  status: (n, total, label) =>
    label ? `${label}, slide ${n} of ${total}` : `Slide ${n} of ${total}`,
};

export interface CarouselProps {
  slides: readonly CarouselSlide[];
  /** Accessible name for the carousel region as a whole. */
  label: string;
  index?: number | undefined;
  defaultIndex?: number | undefined;
  onChange?: ((index: number) => void) | undefined;
  labels?: Partial<CarouselLabels> | undefined;
  className?: string | undefined;
}

/**
 * Built for Fase 6 (see FASE6-REPORT.md - PackageDetail's photo gallery was
 * reported missing and stood in for with a single static frame).
 *
 * Swipe comes from CSS scroll-snap on the track, not a touch-event library:
 * a native horizontally-scrolling, snapping container already is a swipeable
 * carousel on every touch device, momentum and all, for free. The Prev/Next
 * buttons and the dots are the only JS-driven part - they call `scrollTo`
 * on the same track, so all three ways of moving stay in sync through one
 * source of truth (the track's own scroll position) rather than a duplicated
 * index the scroll handler and the buttons could disagree about.
 *
 * Does not loop. A package gallery is a fixed, ordered set of photos, not a
 * ticker - Prev disables at the first slide and Next at the last rather than
 * wrapping around to the other end.
 */
export function Carousel(props: CarouselProps) {
  const { slides, label, index, defaultIndex, onChange, labels: labelOverrides, className } = props;
  const labels: CarouselLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  const reactId = useId();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const programmaticScroll = useRef(false);

  const [active, setActive] = useControllableState<number>({
    value: index,
    defaultValue: defaultIndex ?? 0,
  });

  function scrollToIndex(next: number, behavior: ScrollBehavior) {
    const track = trackRef.current;
    /* jsdom has no scrollTo - guarded rather than polyfilled, since the tests
       that drive `go()` only assert on state, never on the resulting scroll
       position. */
    if (!track || typeof track.scrollTo !== 'function') return;
    programmaticScroll.current = true;
    track.scrollTo({ left: track.clientWidth * next, behavior });
  }

  function go(next: number) {
    const clamped = Math.min(Math.max(next, 0), slides.length - 1);
    if (clamped === active) return;
    setActive(clamped);
    onChange?.(clamped);
    scrollToIndex(clamped, 'smooth');
    const slide = slides[clamped];
    announce(labels.status(clamped + 1, slides.length, slide?.label));
  }

  /*
   * Positions the track on mount to wherever `active` already starts
   * (`defaultIndex`, or a controlled `index` handed in from the first
   * render) - without this, `active` state and the tap-target-disabled
   * state on Prev/Next were correct on first paint, but the track itself
   * sat at scroll position 0 showing slide one regardless. Instant, not
   * smooth: this is the page settling into its starting state, not a
   * navigation a pilgrim should see animate.
   */
  useLayoutEffect(() => {
    scrollToIndex(active, 'auto');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only, reads the ref/initial state once, and must run before paint
  }, []);

  /* Keeps the track in sync when a controlled `index` changes after mount. */
  useEffect(() => {
    if (index === undefined) return;
    scrollToIndex(index, 'smooth');
  }, [index]);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const track = event.currentTarget;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      /*
       * A scroll this handler itself started (the smooth `scrollTo` above)
       * fires the same event as a swipe. Only a swipe should update state
       * here - the button/dot path already has.
       */
      if (programmaticScroll.current) {
        programmaticScroll.current = false;
        return;
      }
      const width = track.clientWidth || 1;
      const next = Math.round(track.scrollLeft / width);
      if (next !== active && next >= 0 && next < slides.length) {
        setActive(next);
        onChange?.(next);
      }
    });
  }

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  if (slides.length === 0) return null;

  return (
    <div className={['uh-carousel', className].filter(Boolean).join(' ')}>
      <div
        className="uh-carousel__viewport"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
      >
        <div
          ref={trackRef}
          className="uh-carousel__track"
          onScroll={onScroll}
          tabIndex={slides.length > 1 ? 0 : -1}
        >
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className="uh-carousel__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${slides.length}${slide.label ? ` - ${slide.label}` : ''}`}
              id={`${reactId}-slide-${i}`}
            >
              {slide.content}
            </div>
          ))}
        </div>

        {slides.length > 1 ? (
          <>
            <button
              type="button"
              className="uh-carousel__nav"
              data-direction="prev"
              aria-label={labels.previous}
              disabled={active === 0}
              onClick={() => go(active - 1)}
            >
              <ChevronDownIcon />
            </button>
            <button
              type="button"
              className="uh-carousel__nav"
              data-direction="next"
              aria-label={labels.next}
              disabled={active === slides.length - 1}
              onClick={() => go(active + 1)}
            >
              <ChevronDownIcon />
            </button>
          </>
        ) : null}
      </div>

      {slides.length > 1 ? (
        <div className="uh-carousel__dots" role="tablist" aria-label={label}>
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              className="uh-carousel__dot"
              aria-selected={i === active}
              aria-label={labels.goTo(i + 1)}
              aria-controls={`${reactId}-slide-${i}`}
              data-active={i === active ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
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
  Carousel.displayName = 'Carousel';
}
