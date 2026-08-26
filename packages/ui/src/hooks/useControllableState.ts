import { useCallback, useState } from 'react';

/**
 * One value, owned either by the caller or by the component.
 *
 * A component is controlled when `value` is passed, and uncontrolled otherwise.
 * That decision is made per render from whether `value` is undefined, which is
 * the same rule React applies to its own inputs.
 *
 * Written once because it had been hand-rolled in four components already, and
 * every stateful component added since would have been a fifth copy of the same
 * three lines with slightly different names.
 */
export function useControllableState<T>(options: {
  /** Present means the caller owns the value. */
  value: T | undefined;
  defaultValue: T;
  onChange?: ((value: T) => void) | undefined;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = options;

  const [uncontrolled, setUncontrolled] = useState<T>(defaultValue);
  const isControlled = value !== undefined;
  const current = isControlled ? value : uncontrolled;

  const set = useCallback(
    (next: T) => {
      /*
       * The internal copy is only written when the caller does not own the
       * value. Writing it anyway would leave a stale shadow that resurfaces the
       * moment the component stops being controlled.
       */
      if (!isControlled) setUncontrolled(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [current, set];
}
