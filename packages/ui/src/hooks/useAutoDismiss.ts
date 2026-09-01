import { useCallback, useEffect, useRef } from 'react';

export interface AutoDismiss {
  /** A reason to stay open: `'hover'`, `'focus'`. Multiple sources can hold at once. */
  hold: (source: string) => void;
  release: (source: string) => void;
}

/**
 * Fires `onDismiss` once `duration` ms of *unpaused* time have elapsed.
 * `duration: null` disables the timer entirely - a payment failure stays
 * until a person dismisses it, not until the clock does.
 *
 * `hold`/`release` take a source key rather than being bare pause/resume:
 * a toast can be both hovered and internally focused (Tab onto its action
 * button while the pointer is still over it), and resuming the instant
 * either one lets go - while the other still holds - would restart the
 * clock underneath a reader who has not looked away. The timer resumes only
 * once every source has released. This satisfies WCAG 2.2.1 (Timing
 * Adjustable): the reader's attention is what extends the limit.
 */
export function useAutoDismiss(
  duration: number | null,
  active: boolean,
  onDismiss: () => void,
): AutoDismiss {
  const remainingRef = useRef(duration ?? 0);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | undefined>(undefined);
  const holdsRef = useRef(new Set<string>());
  const onDismissRef = useRef(onDismiss);
  /* Keeps the latest callback without retriggering the timer effect below on
     every render - writing a ref belongs in an effect, not render itself. */
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const clearTimer = useCallback(() => {
    if (timerRef.current === undefined) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = undefined;
  }, []);

  const resume = useCallback(() => {
    if (duration === null || !active || remainingRef.current <= 0) return;
    if (holdsRef.current.size > 0) return;
    startedAtRef.current = Date.now();
    clearTimer();
    timerRef.current = window.setTimeout(() => onDismissRef.current(), remainingRef.current);
  }, [duration, active, clearTimer]);

  const pause = useCallback(() => {
    if (duration === null || timerRef.current === undefined) return;
    clearTimer();
    remainingRef.current = Math.max(remainingRef.current - (Date.now() - startedAtRef.current), 0);
  }, [duration, clearTimer]);

  const hold = useCallback(
    (source: string) => {
      holdsRef.current.add(source);
      pause();
    },
    [pause],
  );

  const release = useCallback(
    (source: string) => {
      holdsRef.current.delete(source);
      if (holdsRef.current.size === 0) resume();
    },
    [resume],
  );

  useEffect(() => {
    remainingRef.current = duration ?? 0;
    holdsRef.current.clear();
    resume();
    return clearTimer;
  }, [duration, active, resume, clearTimer]);

  return { hold, release };
}
