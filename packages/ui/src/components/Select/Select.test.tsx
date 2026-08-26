import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Select, type SelectOption } from './Select.js';

const OPTIONS: SelectOption[] = [
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'BN', label: 'Brunei Darussalam' },
];

const combo = () => screen.getByRole('combobox', { name: /Nationality/ });

describe('Select', () => {
  it('shows the placeholder until something is chosen', () => {
    render(<Select label="Nationality" options={OPTIONS} placeholder="Choose a country" />);
    expect(combo().textContent).toBe('Choose a country');
  });

  it('starts collapsed', () => {
    render(<Select label="Nationality" options={OPTIONS} />);
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(combo().getAttribute('aria-expanded')).toBe('false');
  });

  describe('listbox', () => {
    it('opens on click and lists every option', async () => {
      render(<Select label="Nationality" options={OPTIONS} />);
      await userEvent.click(combo());

      expect(combo().getAttribute('aria-expanded')).toBe('true');
      expect(screen.getAllByRole('option')).toHaveLength(4);
    });

    it('renders in a portal, outside the field', async () => {
      const { container } = render(<Select label="Nationality" options={OPTIONS} />);
      await userEvent.click(combo());

      const list = screen.getByRole('listbox');
      // Escaping the container is the whole point: an overflow-hidden ancestor
      // must not be able to clip it.
      expect(container.contains(list)).toBe(false);
      expect(document.body.contains(list)).toBe(true);
    });

    it('marks the chosen option with aria-selected', async () => {
      render(<Select label="Nationality" options={OPTIONS} defaultValue="SG" />);
      await userEvent.click(combo());

      const selected = screen
        .getAllByRole('option')
        .filter((o) => o.getAttribute('aria-selected') === 'true');
      expect(selected).toHaveLength(1);
      expect(selected[0]?.textContent).toContain('Singapore');
    });

    it('selects with the pointer and reports value plus option', async () => {
      const onValueChange = vi.fn();
      render(<Select label="Nationality" options={OPTIONS} onValueChange={onValueChange} />);
      await userEvent.click(combo());
      await userEvent.click(screen.getByRole('option', { name: /Indonesia/ }));

      expect(onValueChange).toHaveBeenCalledWith('ID', expect.objectContaining({ value: 'ID' }));
      expect(combo().textContent).toBe('Indonesia');
      expect(screen.queryByRole('listbox')).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('opens on ArrowDown and commits with Enter', async () => {
      render(<Select label="Nationality" options={OPTIONS} />);
      combo().focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeDefined();

      await userEvent.keyboard('{ArrowDown}{Enter}');
      expect(combo().textContent).toBe('Indonesia');
    });

    it('keeps focus on the combobox and tracks aria-activedescendant', async () => {
      render(<Select label="Nationality" options={OPTIONS} />);
      combo().focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(document.activeElement).toBe(combo());
      const active = combo().getAttribute('aria-activedescendant');
      expect(document.getElementById(active as string)?.getAttribute('role')).toBe('option');
    });

    it('closes on Escape without changing the value', async () => {
      render(<Select label="Nationality" options={OPTIONS} defaultValue="MY" />);
      combo().focus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Escape}');

      expect(screen.queryByRole('listbox')).toBeNull();
      expect(combo().textContent).toBe('Malaysia');
    });

    it('jumps by type-ahead when not searchable', async () => {
      render(<Select label="Nationality" options={OPTIONS} />);
      combo().focus();
      await userEvent.keyboard('{ArrowDown}');
      await userEvent.keyboard('bru');
      await userEvent.keyboard('{Enter}');
      expect(combo().textContent).toBe('Brunei Darussalam');
    });

    it('steps over disabled options', async () => {
      const withDisabled: SelectOption[] = [
        { value: 'MY', label: 'Malaysia' },
        { value: 'ID', label: 'Indonesia', disabled: true },
        { value: 'SG', label: 'Singapore' },
      ];
      render(<Select label="Nationality" options={withDisabled} />);
      combo().focus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect(combo().textContent).toBe('Singapore');
    });
  });

  describe('searchable', () => {
    it('filters as you type', async () => {
      render(<Select label="Nationality" options={OPTIONS} searchable />);
      const input = screen.getByRole('combobox', { name: 'Nationality' });
      await userEvent.click(input);
      await userEvent.type(input, 'ind');

      expect(screen.getAllByRole('option')).toHaveLength(1);
      expect(screen.getByRole('option').textContent).toContain('Indonesia');
    });

    it('declares list autocomplete', async () => {
      render(<Select label="Nationality" options={OPTIONS} searchable />);
      expect(
        screen.getByRole('combobox', { name: 'Nationality' }).getAttribute('aria-autocomplete'),
      ).toBe('list');
    });

    it('shows the empty state when nothing matches', async () => {
      render(<Select label="Nationality" options={OPTIONS} searchable />);
      const input = screen.getByRole('combobox', { name: 'Nationality' });
      await userEvent.type(input, 'zzz');

      expect(screen.queryAllByRole('option')).toHaveLength(0);
      expect(screen.getByRole('status').textContent).toBe('No matches found');
    });
  });

  describe('loading', () => {
    it('announces a busy list instead of options', async () => {
      render(<Select label="Nationality" options={[]} loading />);
      await userEvent.click(combo());

      // The listbox stays present because role=combobox requires aria-controls,
      // but a listbox may only contain options - so the status sits beside it.
      expect(screen.getByRole('listbox').getAttribute('aria-busy')).toBe('true');
      expect(screen.getByRole('status').textContent).toContain('Loading options');
      expect(screen.queryAllByRole('option')).toHaveLength(0);
    });
  });

  describe('clearable', () => {
    it('appears only once something is selected, and resets to null', async () => {
      const onValueChange = vi.fn();
      render(
        <Select label="Nationality" options={OPTIONS} clearable onValueChange={onValueChange} />,
      );
      expect(screen.queryByRole('button', { name: 'Clear selection' })).toBeNull();

      await userEvent.click(combo());
      await userEvent.click(screen.getByRole('option', { name: /Malaysia/ }));
      await userEvent.click(screen.getByRole('button', { name: 'Clear selection' }));

      expect(onValueChange).toHaveBeenLastCalledWith(null, null);
    });
  });

  it('does not open when disabled', async () => {
    render(<Select label="Nationality" options={OPTIONS} disabled />);
    await userEvent.click(combo());
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('wires the error message', () => {
    render(<Select label="Nationality" options={OPTIONS} errorMessage="Select your nationality" />);
    expect(combo().getAttribute('aria-invalid')).toBe('true');
    const id = combo().getAttribute('aria-describedby');
    expect(document.getElementById(id as string)?.textContent).toBe('Select your nationality');
  });

  describe('accessibility', () => {
    it('has no axe violations: closed', async () => {
      const { container } = render(
        <Select
          label="Nationality"
          options={OPTIONS}
          required
          helperText="As shown on your passport"
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no axe violations: open', async () => {
      render(<Select label="Nationality" options={OPTIONS} defaultValue="MY" />);
      await userEvent.click(combo());
      // The listbox is portalled, so the whole document is the scope.
      await expectNoA11yViolations(document.body);
    });

    it('has no axe violations: searchable and open', async () => {
      render(<Select label="Nationality" options={OPTIONS} searchable />);
      await userEvent.click(screen.getByRole('combobox', { name: 'Nationality' }));
      await expectNoA11yViolations(document.body);
    });

    it('has no axe violations: loading', async () => {
      render(<Select label="Nationality" options={[]} loading />);
      await userEvent.click(combo());
      await expectNoA11yViolations(document.body);
    });
  });
});
