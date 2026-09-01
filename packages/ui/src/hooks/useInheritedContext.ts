import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Attributes a portal loses by leaving its subtree. Custom properties and
 * `lang` are inherited through the DOM, not through JSX nesting - a node
 * appended to `document.body` sees only document.body's ancestors, not the
 * themed wrapper it was logically written inside. Both are carried across by
 * hand so the portal keeps looking like it never left.
 */
export interface InheritedContext {
  theme?: string | undefined;
  lang?: string | undefined;
}

/**
 * Reads `data-theme` and `lang` from the nearest ancestor of `sourceRef` at
 * the moment `active` becomes true, for a portalled panel to reapply on
 * itself. `sourceRef` must point at a node still living in its original,
 * unportalled position - an anchor the panel is attached to (Popover,
 * SearchCombobox), or a plain sentinel rendered alongside the portal call for
 * components with no anchor of their own (Modal, Drawer, BottomSheet).
 */
export function useInheritedContext(
  active: boolean,
  sourceRef: RefObject<HTMLElement | null>,
): InheritedContext {
  const [inherited, setInherited] = useState<InheritedContext>({});

  useLayoutEffect(() => {
    if (!active) return;
    const node = sourceRef.current;
    setInherited({
      theme: node?.closest('[data-theme]')?.getAttribute('data-theme') ?? undefined,
      lang: node?.closest('[lang]')?.getAttribute('lang') ?? undefined,
    });
  }, [active, sourceRef]);

  return inherited;
}
