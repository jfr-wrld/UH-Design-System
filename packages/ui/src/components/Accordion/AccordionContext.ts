import { createContext, useContext } from 'react';

export interface AccordionContextValue {
  isOpen: (itemValue: string) => boolean;
  toggle: (itemValue: string) => void;
  /** `1`-`6`, matching `Accordion`'s own `headingLevel` prop - every
      `AccordionTrigger` renders inside an `h{headingLevel}`, so every item
      in the same accordion shares one level. */
  headingLevel: 1 | 2 | 3 | 4 | 5 | 6;
}

/*
 * Split from Accordion.tsx so that file exports only components: Fast
 * Refresh cannot hot-reload a module that mixes components with other
 * exports (see RadioGroupContext.ts for the same rule applied first).
 */
export const AccordionContext = /* @__PURE__ */ createContext<AccordionContextValue | null>(null);

export function useAccordionContext(component: string): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be rendered inside <Accordion>.`);
  }
  return ctx;
}

export interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
  open: boolean;
  triggerId: string;
  contentId: string;
}

export const AccordionItemContext = /* @__PURE__ */ createContext<AccordionItemContextValue | null>(
  null,
);

export function useAccordionItemContext(component: string): AccordionItemContextValue {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be rendered inside <AccordionItem>.`);
  }
  return ctx;
}
