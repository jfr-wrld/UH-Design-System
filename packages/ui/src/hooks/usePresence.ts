import { useEffect, useState, type RefObject } from 'react';

export type PresencePhase = 'closed' | 'open' | 'closing';

/**
 * The overlay lifecycle: `open` flips false, the element stays mounted while
 * its exit animation plays, and `animationend` is what actually settles it.
 *
 * Extracted from Modal for BottomSheet and Drawer. Animations rather than
 * transitions on purpose: a zero-duration animation under reduced motion
 * still fires animationend, so the choreography survives it. The timeout is
 * the net for an animation that never ends (display:none ancestor, aborted
 * paint), sized so it can only ever fire late, never early.
 *
 * The listener is native on the element, not React's onAnimationEnd:
 * delegated animation events do not reliably cross the portal boundary.
 */
export function usePresence(
  open: boolean,
  elementRef: RefObject<HTMLElement | null>,
  exitFallbackMs = 400,
): PresencePhase {
  const [phase, setPhase] = useState<PresencePhase>(open ? 'open' : 'closed');

  /* Adjusted during render: React re-renders immediately with the settled
     phase, and open going false demotes only from 'open', so a close that is
     already animating cannot be restarted. */
  if (open && phase !== 'open') setPhase('open');
  if (!open && phase === 'open') setPhase('closing');

  useEffect(() => {
    if (phase !== 'closing') return undefined;
    const node = elementRef.current;
    const settle = () => setPhase('closed');

    node?.addEventListener('animationend', settle);
    const fallback = window.setTimeout(settle, exitFallbackMs);
    return () => {
      node?.removeEventListener('animationend', settle);
      window.clearTimeout(fallback);
    };
  }, [phase, elementRef, exitFallbackMs]);

  return phase;
}
