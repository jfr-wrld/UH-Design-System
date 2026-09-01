import { createContext, useContext } from 'react';

export interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  disabled: boolean;
  /** `undefined` means the trigger stays a plain button, no heading wrapper -
      see Collapsible.tsx's own comment on why that is the default rather
      than always assuming one, unlike `Accordion`. */
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  triggerId: string;
  contentId: string;
}

/*
 * Split from Collapsible.tsx so that file exports only components: Fast
 * Refresh cannot hot-reload a module that mixes components with other
 * exports (see RadioGroupContext.ts for the same rule applied first).
 */
export const CollapsibleContext = /* @__PURE__ */ createContext<CollapsibleContextValue | null>(
  null,
);

export function useCollapsibleContext(component: string): CollapsibleContextValue {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be rendered inside <Collapsible>.`);
  }
  return ctx;
}
