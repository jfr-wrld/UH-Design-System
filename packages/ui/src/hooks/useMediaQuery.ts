import { useCallback, useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query.
 *
 * Written against useSyncExternalStore rather than an effect that calls
 * setState: matchMedia is an external store, and going through the store API
 * means the first render already knows the answer instead of flashing the
 * desktop layout on a phone.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return () => {};
      }
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia(query).matches;
  }, [query]);

  /* Server rendering has no viewport; the popover is the safer guess there. */
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
