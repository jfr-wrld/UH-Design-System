import { createContext, useContext, type ChangeEvent } from 'react';

export type RadioOrientation = 'vertical' | 'horizontal';

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  disabled: boolean;
  error: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Split from RadioGroup.tsx so that file exports only components: Fast Refresh
 * cannot hot-reload a module that mixes components with other exports.
 *
 * The pure-annotation comment right before the call matters: a bundler
 * cannot know on its own that `createContext` has no side effects, and
 * without that mark this one line pins the whole bundled library file
 * together as one inseparable unit for anyone who imports a single,
 * unrelated component - see `scripts/bundle-size.mjs`'s own comment for the
 * full story of how this was found.
 */
export const RadioGroupContext = /* @__PURE__ */ createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
