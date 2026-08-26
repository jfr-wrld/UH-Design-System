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
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}
