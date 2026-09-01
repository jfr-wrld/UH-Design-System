import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { FilterPanel, type FilterOption } from './FilterPanel.js';

const OPTIONS: FilterOption[] = [
  { id: 'direct', label: 'Direct flights only' },
  { id: 'halal', label: 'Halal certified' },
  { id: 'breakfast', label: 'Breakfast included' },
];

describe('FilterPanel', () => {
  it('renders every option as a checkbox', () => {
    render(<FilterPanel options={OPTIONS} />);
    for (const option of OPTIONS) {
      expect(screen.getByRole('checkbox', { name: option.label })).toBeDefined();
    }
  });

  it('renders a visible title by default, wired to the group via aria-labelledby', () => {
    render(<FilterPanel options={OPTIONS} />);
    const heading = screen.getByRole('heading', { name: 'Filters' });
    const group = screen.getByRole('group');
    expect(group.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('falls back to an aria-label on the group when the title is hidden', () => {
    render(<FilterPanel options={OPTIONS} showTitle={false} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByRole('group', { name: 'Filters' })).toBeDefined();
  });

  it('starts from defaultValue, uncontrolled', () => {
    render(<FilterPanel options={OPTIONS} defaultValue={['halal']} />);
    expect(screen.getByRole('checkbox', { name: 'Halal certified' })).toHaveProperty(
      'checked',
      true,
    );
    expect(screen.getByRole('checkbox', { name: 'Direct flights only' })).toHaveProperty(
      'checked',
      false,
    );
  });

  it('toggling a checkbox reports the new full selection through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel options={OPTIONS} defaultValue={['halal']} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Breakfast included' }));
    expect(onChange).toHaveBeenLastCalledWith(['halal', 'breakfast']);

    await user.click(screen.getByRole('checkbox', { name: 'Halal certified' }));
    expect(onChange).toHaveBeenLastCalledWith(['breakfast']);
  });

  it('is controlled when value is passed - clicking does not change what is checked without a re-render', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPanel options={OPTIONS} value={['direct']} onChange={onChange} />);

    await user.click(screen.getByRole('checkbox', { name: 'Halal certified' }));
    expect(onChange).toHaveBeenCalledWith(['direct', 'halal']);
    // Still reflects the prop, since the caller did not update it.
    expect(screen.getByRole('checkbox', { name: 'Halal certified' })).toHaveProperty(
      'checked',
      false,
    );
  });

  it('shows no action buttons when neither onApply nor onClear is passed', () => {
    render(<FilterPanel options={OPTIONS} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows Apply and calls it on click', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(<FilterPanel options={OPTIONS} onApply={onApply} />);

    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it('Clear all empties the selection, disables itself once empty, and fires onClear', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(
      <FilterPanel
        options={OPTIONS}
        defaultValue={['direct', 'halal']}
        onChange={onChange}
        onClear={onClear}
      />,
    );

    const clearButton = screen.getByRole('button', { name: 'Clear all' });
    expect(clearButton.getAttribute('aria-disabled')).toBeNull();

    await user.click(clearButton);
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(onClear).toHaveBeenCalledOnce();
    expect(clearButton.getAttribute('aria-disabled')).toBe('true');
  });

  // Button communicates disabled through aria-disabled, not the native
  // `disabled` attribute, so it stays reachable by keyboard - see Button.tsx.
  it('disabled disables every checkbox and both actions', () => {
    render(<FilterPanel options={OPTIONS} onApply={() => {}} onClear={() => {}} disabled />);
    for (const option of OPTIONS) {
      expect(screen.getByRole('checkbox', { name: option.label })).toHaveProperty('disabled', true);
    }
    expect(
      screen.getByRole('button', { name: 'Apply filters' }).getAttribute('aria-disabled'),
    ).toBe('true');
    expect(screen.getByRole('button', { name: 'Clear all' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
  });

  it('accepts overridden labels', () => {
    render(
      <FilterPanel
        options={OPTIONS}
        onApply={() => {}}
        onClear={() => {}}
        labels={{ title: 'Tapisan', applyFilters: 'Guna tapisan', clearAll: 'Kosongkan semua' }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Tapisan' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Guna tapisan' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Kosongkan semua' })).toBeDefined();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FilterPanel
        options={OPTIONS}
        defaultValue={['direct']}
        onApply={() => {}}
        onClear={() => {}}
      />,
    );
    await expectNoA11yViolations(container);
  });
});
