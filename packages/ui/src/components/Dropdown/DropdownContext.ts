import { createContext, useContext, type RefObject } from 'react';

export interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  anchorRef: RefObject<HTMLElement | null>;
  triggerId: string;
  contentId: string;
}

/*
 * Split from Dropdown.tsx so that file exports only components: Fast
 * Refresh cannot hot-reload a module that mixes components with other
 * exports (see RadioGroupContext.ts for the same rule applied first).
 */
export const DropdownContext = /* @__PURE__ */ createContext<DropdownContextValue | null>(null);

export function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be rendered inside <Dropdown>.`);
  }
  return ctx;
}

export interface DropdownGroupContextValue {
  groupId: string;
}

export const DropdownGroupContext = /* @__PURE__ */ createContext<DropdownGroupContextValue | null>(
  null,
);
