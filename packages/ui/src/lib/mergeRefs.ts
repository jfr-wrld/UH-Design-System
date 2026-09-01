import type { Ref } from 'react';

/**
 * Fans one node out to several refs.
 *
 * Lives outside the component because assigning to `ref.current` inside a
 * render body is exactly what the hooks lint rules forbid, and rightly: doing
 * it during render rather than in a callback is a real bug. Here the write
 * only ever happens inside the ref callback React invokes after commit.
 */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}
