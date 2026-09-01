import { useEffect } from 'react';

/**
 * Holds the page still while an overlay is up.
 *
 * Re-entrant: two overlays (a sheet opening a dialog) each take a claim, and
 * the body is released only when the last claim goes - otherwise the inner
 * overlay's cleanup would unlock the page while the outer one still stands.
 */
let claims = 0;
let previousOverflow = '';

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return undefined;
    claims += 1;
    if (claims === 1) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      claims -= 1;
      if (claims === 0) document.body.style.overflow = previousOverflow;
    };
  }, [active]);
}
