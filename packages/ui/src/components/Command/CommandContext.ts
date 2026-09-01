import { createContext, useContext, type Dispatch, type SetStateAction } from 'react';

export interface RegisteredItem {
  value: string;
  keywords?: readonly string[] | undefined;
  disabled: boolean;
  groupId: string | undefined;
  onSelect?: (() => void) | undefined;
}

export interface CommandContextValue {
  query: string;
  /** Not a full `Dispatch` - the query may be externally controlled via
      `Command`'s own `value` prop, and `useControllableState`'s setter
      only ever takes a plain next value, never a functional updater. */
  setQuery: (value: string) => void;
  activeId: string | null;
  setActiveId: Dispatch<SetStateAction<string | null>>;
  /** Every item currently matching the filter, disabled or not - what a
      group or CommandEmpty checks to decide "is there anything here". */
  visibleIds: string[];
  /** The subset of `visibleIds` that is also enabled - what Up/Down and
      the initial highlight actually walk. */
  navigableIds: string[];
  getItem: (id: string) => RegisteredItem | undefined;
  registerItem: (id: string, item: RegisteredItem) => () => void;
  runItem: (id: string) => void;
  listId: string;
  inputId: string;
  listLabel: string;
}

export const CommandContext = createContext<CommandContextValue | null>(null);

export function useCommandContext(component: string): CommandContextValue {
  const ctx = useContext(CommandContext);
  if (!ctx) {
    throw new Error(`<${component} /> must be rendered inside <Command>.`);
  }
  return ctx;
}

export interface CommandGroupContextValue {
  groupId: string;
}

export const CommandGroupContext = createContext<CommandGroupContextValue | null>(null);
