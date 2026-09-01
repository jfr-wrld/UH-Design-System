import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Chip } from './Chip.js';

describe('Chip', () => {
  it('renders as plain text when neither onClick nor removable is given', () => {
    render(<Chip>Direct flights only</Chip>);
    expect(screen.getByText('Direct flights only')).toBeDefined();
    expect(screen.queryByRole('button')).toBeNull();
  });

  describe('as a toggle', () => {
    it('renders a button reporting aria-pressed', () => {
      render(<Chip onClick={() => {}}>Direct flights only</Chip>);
      const button = screen.getByRole('button', { name: 'Direct flights only' });
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('reports selected via aria-pressed and a data attribute', () => {
      render(
        <Chip onClick={() => {}} selected>
          Direct flights only
        </Chip>,
      );
      const button = screen.getByRole('button', { name: 'Direct flights only' });
      expect(button.getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelector('.uh-chip')?.getAttribute('data-selected')).toBe('true');
    });

    it('fires onClick and can be driven from the keyboard', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(<Chip onClick={onClick}>Direct flights only</Chip>);
      const button = screen.getByRole('button', { name: 'Direct flights only' });
      button.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('round-trips through a controlling parent', async () => {
      const user = userEvent.setup();
      function Toggle() {
        const [selected, setSelected] = useState(false);
        return (
          <Chip selected={selected} onClick={() => setSelected((current) => !current)}>
            Direct flights only
          </Chip>
        );
      }
      render(<Toggle />);
      const button = screen.getByRole('button', { name: 'Direct flights only' });
      await user.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('true');
      await user.click(button);
      expect(button.getAttribute('aria-pressed')).toBe('false');
    });

    it('does not fire onClick when disabled, and stays reachable', () => {
      const onClick = vi.fn();
      render(
        <Chip onClick={onClick} disabled>
          Direct flights only
        </Chip>,
      );
      const button = screen.getByRole('button', { name: 'Direct flights only' });
      expect(button.getAttribute('aria-disabled')).toBe('true');
      /* aria-disabled, not the disabled attribute - it must stay focusable. */
      expect(button).not.toHaveProperty('disabled', true);
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('with an icon', () => {
    it('renders the icon decoratively beside the label', () => {
      render(
        <Chip onClick={() => {}} icon={<svg aria-hidden="true" />}>
          Halal certified
        </Chip>,
      );
      expect(document.querySelector('.uh-chip__icon svg')).not.toBeNull();
    });
  });

  describe('removable', () => {
    it('renders the remove control as a sibling of the toggle, not nested in it', () => {
      render(
        <Chip onClick={() => {}} removable onRemove={() => {}}>
          Jakarta
        </Chip>,
      );
      const toggle = screen.getByRole('button', { name: 'Jakarta' });
      const remove = screen.getByRole('button', { name: 'Remove' });
      expect(toggle.contains(remove)).toBe(false);
      expect(remove.contains(toggle)).toBe(false);
      expect(toggle.parentElement).toBe(remove.parentElement);
    });

    it('fires onRemove without firing the toggle onClick', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const onRemove = vi.fn();
      render(
        <Chip onClick={onClick} removable onRemove={onRemove}>
          Jakarta
        </Chip>,
      );
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('works with no onClick at all - an applied filter tag with only a dismiss', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();
      render(
        <Chip removable onRemove={onRemove}>
          Jakarta
        </Chip>,
      );
      expect(screen.queryByRole('button', { name: 'Jakarta' })).toBeNull();
      await user.click(screen.getByRole('button', { name: 'Remove' }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('overrides the remove label for localisation', () => {
      render(
        <Chip removable onRemove={() => {}} removeLabel="Buang">
          Jakarta
        </Chip>,
      );
      expect(screen.getByRole('button', { name: 'Buang' })).toBeDefined();
    });

    it('disables the remove control too when the chip is disabled', () => {
      const onRemove = vi.fn();
      render(
        <Chip onClick={() => {}} removable onRemove={onRemove} disabled>
          Jakarta
        </Chip>,
      );
      const remove = screen.getByRole('button', { name: 'Remove' });
      expect(remove.getAttribute('aria-disabled')).toBe('true');
      fireEvent.click(remove);
      expect(onRemove).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('has no violations as a plain toggle', async () => {
      render(<Chip onClick={() => {}}>Direct flights only</Chip>);
      await expectNoA11yViolations(document.body);
    });

    it('has no violations selected, with an icon and a remove control', async () => {
      render(
        <Chip
          onClick={() => {}}
          selected
          icon={<svg aria-hidden="true" />}
          removable
          onRemove={() => {}}
        >
          Halal certified
        </Chip>,
      );
      await expectNoA11yViolations(document.body);
    });

    it('has no violations as a static, removable tag', async () => {
      render(
        <Chip removable onRemove={() => {}}>
          Jakarta
        </Chip>,
      );
      await expectNoA11yViolations(document.body);
    });
  });
});
