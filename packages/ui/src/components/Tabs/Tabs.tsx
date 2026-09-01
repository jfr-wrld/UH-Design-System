import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';

import { useControllableState } from '../../hooks/useControllableState.js';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean | undefined;
}

export interface TabsProps {
  items: readonly TabItem[];
  /** Present makes this controlled. */
  value?: string | undefined;
  /** Uncontrolled starting tab. Defaults to the first enabled item. */
  defaultValue?: string | undefined;
  onChange?: ((id: string) => void) | undefined;
  /** Accessible name for the tablist - not painted, read on the group itself. */
  label: string;
  className?: string | undefined;
}

/**
 * Built for Fase 6 (see FASE6-REPORT.md - PackageDetail's Overview / Itinerary /
 * Hotel / Reviews switcher was reported missing, not stacked as a fallback).
 *
 * Automatic activation: moving focus with the arrow keys also selects the tab,
 * rather than requiring a separate Enter/Space. This is the simpler of the two
 * patterns WAI-ARIA's Tabs practice allows, and the right one here - nothing
 * about switching a package's section is expensive enough to warrant asking
 * twice.
 *
 * Only the selected panel is rendered. Every panel in this design system's
 * current use is static per-package content with nothing to preserve across a
 * switch, so mounting the other three for no reader ever to reach them was
 * pure cost. A consumer who does need to keep a panel alive underneath -
 * a form mid-edit - keeps its state itself and passes it back in as `content`.
 */
export function Tabs(props: TabsProps) {
  const { items, value, defaultValue, onChange, label, className } = props;

  const reactId = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const firstEnabled = items.find((item) => !item.disabled)?.id;
  /*
   * `onChange` is not handed to the hook: its value type is `string |
   * undefined` (an empty `items` list has no tab to default to), but the
   * public callback only ever fires with a real id, one the caller picked or
   * clicked - never the empty-list case. `select` below is that narrower
   * caller.
   */
  const [active, setActive] = useControllableState<string | undefined>({
    value,
    defaultValue: defaultValue ?? firstEnabled,
  });

  const enabledIds = items.filter((item) => !item.disabled).map((item) => item.id);

  function select(id: string, focus: boolean) {
    setActive(id);
    onChange?.(id);
    if (focus) tabRefs.current.get(id)?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (enabledIds.length === 0) return;
    const at = active ? enabledIds.indexOf(active) : -1;

    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight') nextIndex = at < 0 ? 0 : (at + 1) % enabledIds.length;
    else if (event.key === 'ArrowLeft') {
      nextIndex = at < 0 ? enabledIds.length - 1 : (at - 1 + enabledIds.length) % enabledIds.length;
    } else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = enabledIds.length - 1;

    if (nextIndex === null) return;
    event.preventDefault();
    select(enabledIds[nextIndex]!, true);
  }

  const activeItem = items.find((item) => item.id === active);

  return (
    <div className={['uh-tabs', className].filter(Boolean).join(' ')}>
      <div className="uh-tabs__list" role="tablist" aria-label={label}>
        {items.map((item) => {
          const tabId = `${reactId}-tab-${item.id}`;
          const panelId = `${reactId}-panel-${item.id}`;
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(element) => {
                if (element) tabRefs.current.set(item.id, element);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={tabId}
              className="uh-tabs__tab"
              aria-selected={selected}
              aria-controls={panelId}
              aria-disabled={item.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id, false)}
              onKeyDown={onKeyDown}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {activeItem ? (
        <div
          className="uh-tabs__panel"
          role="tabpanel"
          id={`${reactId}-panel-${activeItem.id}`}
          aria-labelledby={`${reactId}-tab-${activeItem.id}`}
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      ) : null}
    </div>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Tabs.displayName = 'Tabs';
}
