import { useId } from 'react';

import { Checkbox } from '../Checkbox/Checkbox.js';
import { Button } from '../Button/Button.js';
import { useControllableState } from '../../hooks/useControllableState.js';

export interface FilterOption {
  id: string;
  label: string;
  disabled?: boolean | undefined;
}

export interface FilterPanelLabels {
  /** Accessible name for the group, and its visible heading when `title`
      is not overridden. Falls back to English - override to localise. */
  title?: string | undefined;
  applyFilters?: string | undefined;
  clearAll?: string | undefined;
}

const DEFAULT_LABELS: Required<FilterPanelLabels> = {
  title: 'Filters',
  applyFilters: 'Apply filters',
  clearAll: 'Clear all',
};

export interface FilterPanelProps {
  /** The checkbox filters to show, in order. */
  options: FilterOption[];
  /** Controlled: ids of the currently checked options. */
  value?: string[] | undefined;
  /** Uncontrolled starting selection. Presence alone switches FilterPanel
      into uncontrolled mode, the same rule every other stateful component
      here follows. */
  defaultValue?: string[] | undefined;
  onChange?: ((value: string[]) => void) | undefined;
  /**
   * Called when Apply is pressed. Presence shows the Apply button -
   * FilterPanel only reports the selection; it never decides what applying
   * means (closing a sheet, refetching a list), that stays the consumer's.
   */
  onApply?: (() => void) | undefined;
  /** Called when Clear all is pressed, with every option unchecked already
      applied to `value`/`onChange` before this fires. Presence shows the
      Clear all action. */
  onClear?: (() => void) | undefined;
  /** Set false to hide the heading - e.g. inside a BottomSheet whose own
      title already says "Filters". @default true */
  showTitle?: boolean | undefined;
  disabled?: boolean | undefined;
  labels?: FilterPanelLabels | undefined;
  className?: string | undefined;
}

/**
 * A checkbox filter group with apply/clear actions - the shape every
 * `Patterns/*` list screen was reassembling from `Checkbox` and `Button`
 * by hand before this existed. FilterPanel decides none of its own
 * placement: put it inside a `Card` for a desktop rail, inside a
 * `BottomSheet` for mobile, or wherever else a screen's own layout calls
 * for - see the `rail` size token for the sidebar width this was
 * originally measured against.
 */
export function FilterPanel(props: FilterPanelProps) {
  const {
    options,
    value,
    defaultValue = [],
    onChange,
    onApply,
    onClear,
    showTitle = true,
    disabled = false,
    labels: labelOverrides,
    className,
  } = props;

  const labels: Required<FilterPanelLabels> = { ...DEFAULT_LABELS, ...labelOverrides };
  const reactId = useId();
  const titleId = `${reactId}-title`;

  const [checked, setChecked] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange,
  });

  function toggle(id: string, next: boolean) {
    setChecked(next ? [...checked, id] : checked.filter((existing) => existing !== id));
  }

  function clear() {
    setChecked([]);
    onClear?.();
  }

  return (
    <div className={['uh-filter-panel', className].filter(Boolean).join(' ')}>
      {showTitle ? (
        <h2 id={titleId} className="uh-filter-panel__title">
          {labels.title}
        </h2>
      ) : null}

      <div
        className="uh-filter-panel__options"
        role="group"
        {...(showTitle ? { 'aria-labelledby': titleId } : { 'aria-label': labels.title })}
      >
        {options.map((option) => (
          <Checkbox
            key={option.id}
            label={option.label}
            checked={checked.includes(option.id)}
            onChange={(event) => toggle(option.id, event.target.checked)}
            disabled={disabled || Boolean(option.disabled)}
          />
        ))}
      </div>

      {onApply || onClear ? (
        <div className="uh-filter-panel__actions">
          {onClear ? (
            <Button
              variant="outline"
              onClick={clear}
              disabled={disabled || checked.length === 0}
              fullWidth={!onApply}
            >
              {labels.clearAll}
            </Button>
          ) : null}
          {onApply ? (
            <Button variant="primary" onClick={onApply} disabled={disabled} fullWidth>
              {labels.applyFilters}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  FilterPanel.displayName = 'FilterPanel';
}
