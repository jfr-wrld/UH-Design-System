import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { NumberStepper } from './NumberStepper.js';

const spin = () => screen.getByRole('spinbutton') as HTMLInputElement;
const minus = () => screen.getByRole('button', { name: /Decrease/ }) as HTMLButtonElement;
const plus = () => screen.getByRole('button', { name: /Increase/ }) as HTMLButtonElement;

describe('NumberStepper', () => {
  it('exposes spinbutton semantics with the current bounds', () => {
    render(<NumberStepper label="Adults" defaultValue={2} min={1} max={9} />);
    const field = spin();
    expect(field.getAttribute('aria-valuenow')).toBe('2');
    expect(field.getAttribute('aria-valuemin')).toBe('1');
    expect(field.getAttribute('aria-valuemax')).toBe('9');
  });

  it('omits aria-valuemax when unbounded', () => {
    render(<NumberStepper label="Adults" defaultValue={2} min={1} />);
    expect(spin().hasAttribute('aria-valuemax')).toBe(false);
  });

  it('is named by its label', () => {
    render(<NumberStepper label="Adults" />);
    expect(screen.getByRole('spinbutton', { name: 'Adults' })).toBeDefined();
  });

  describe('buttons', () => {
    it('steps up and down', async () => {
      render(<NumberStepper label="Adults" defaultValue={2} min={1} max={9} />);
      await userEvent.click(plus());
      expect(spin().value).toBe('3');
      await userEvent.click(minus());
      expect(spin().value).toBe('2');
    });

    it('respects step', async () => {
      render(<NumberStepper label="Rooms" defaultValue={0} step={5} max={20} />);
      await userEvent.click(plus());
      expect(spin().value).toBe('5');
    });

    it('disables minus at min and plus at max', async () => {
      render(<NumberStepper label="Adults" defaultValue={1} min={1} max={2} />);
      expect(minus().disabled).toBe(true);
      expect(plus().disabled).toBe(false);

      await userEvent.click(plus());
      expect(plus().disabled).toBe(true);
      expect(minus().disabled).toBe(false);
    });

    it('reports every change', async () => {
      const onChange = vi.fn();
      render(<NumberStepper label="Adults" defaultValue={1} onChange={onChange} max={5} />);
      await userEvent.click(plus());
      expect(onChange).toHaveBeenCalledWith(2);
    });
  });

  describe('keyboard', () => {
    it('changes value with arrow up and down', async () => {
      render(<NumberStepper label="Adults" defaultValue={2} min={1} max={9} />);
      spin().focus();

      await userEvent.keyboard('{ArrowUp}');
      expect(spin().value).toBe('3');
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(spin().value).toBe('1');
    });

    it('respects step on arrow keys', async () => {
      render(<NumberStepper label="Rooms" defaultValue={0} step={5} max={20} />);
      spin().focus();
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(spin().value).toBe('10');
    });

    it('stops at the bounds rather than wrapping', async () => {
      render(<NumberStepper label="Adults" defaultValue={1} min={1} max={2} />);
      spin().focus();
      await userEvent.keyboard('{ArrowDown}{ArrowDown}');
      expect(spin().value).toBe('1');

      await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
      expect(spin().value).toBe('2');
    });

    it('jumps to min with Home and max with End', async () => {
      render(<NumberStepper label="Adults" defaultValue={4} min={1} max={9} />);
      spin().focus();

      await userEvent.keyboard('{Home}');
      expect(spin().value).toBe('1');
      await userEvent.keyboard('{End}');
      expect(spin().value).toBe('9');
    });

    it('reaches both buttons and the field by Tab', async () => {
      render(<NumberStepper label="Adults" defaultValue={2} min={1} max={9} />);
      await userEvent.tab();
      expect(document.activeElement).toBe(minus());
      await userEvent.tab();
      expect(document.activeElement).toBe(spin());
      await userEvent.tab();
      expect(document.activeElement).toBe(plus());
    });

    it('settles a typed value on Enter without leaving the field', async () => {
      render(<NumberStepper label="Adults" defaultValue={1} min={1} max={9} />);
      const field = spin();
      await userEvent.clear(field);
      await userEvent.type(field, '30');
      await userEvent.keyboard('{Enter}');

      expect(field.value).toBe('9');
      expect(document.activeElement).toBe(field);
    });

    it('does nothing when disabled', async () => {
      const onChange = vi.fn();
      render(
        <NumberStepper label="Adults" defaultValue={2} onChange={onChange} disabled max={9} />,
      );
      spin().focus();
      await userEvent.keyboard('{ArrowUp}');
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('typing', () => {
    it('accepts a value that is already in range as it is typed', async () => {
      const onChange = vi.fn();
      render(<NumberStepper label="Adults" defaultValue={1} min={1} max={9} onChange={onChange} />);
      const field = spin();
      await userEvent.clear(field);
      await userEvent.type(field, '4');
      expect(onChange).toHaveBeenLastCalledWith(4);
    });

    it('clamps an over-range value on blur rather than fighting the caret', async () => {
      render(
        <>
          <NumberStepper label="Adults" defaultValue={1} min={1} max={9} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const field = spin();
      await userEvent.clear(field);
      await userEvent.type(field, '25');
      // Still showing what was typed; not yet clamped.
      expect(field.value).toBe('25');

      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field.value).toBe('9');
    });

    it('clamps up to min on blur', async () => {
      render(
        <>
          <NumberStepper label="Adults" defaultValue={4} min={2} max={9} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const field = spin();
      await userEvent.clear(field);
      await userEvent.type(field, '0');
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field.value).toBe('2');
    });

    it('restores the last value when the field is left empty', async () => {
      render(
        <>
          <NumberStepper label="Adults" defaultValue={3} min={1} max={9} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const field = spin();
      await userEvent.clear(field);
      await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(field.value).toBe('3');
    });
  });

  describe('controlled and uncontrolled', () => {
    it('works uncontrolled', async () => {
      render(<NumberStepper label="Adults" defaultValue={1} max={9} />);
      await userEvent.click(plus());
      expect(spin().value).toBe('2');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [n, setN] = useState(1);
        return <NumberStepper label="Adults" value={n} onChange={setN} min={1} max={9} />;
      }
      render(<Controlled />);
      await userEvent.click(plus());
      expect(spin().value).toBe('2');
    });

    it('a controlled value that ignores onChange does not move', async () => {
      render(<NumberStepper label="Adults" value={2} onChange={() => {}} min={1} max={9} />);
      await userEvent.click(plus());
      // The caller owns it; the component must not keep a shadow copy.
      expect(spin().value).toBe('2');
    });
  });

  it('never decides what is valid on its own', () => {
    render(
      <NumberStepper
        label="Adults"
        defaultValue={5}
        min={1}
        max={9}
        error
        errorMessage="Too many for this package"
      />,
    );
    expect(spin().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Too many for this package');
  });

  it('accepts localised button names', () => {
    render(
      <NumberStepper
        label="Dewasa"
        decrementLabel={(n) => `Kurangkan ${n}`}
        incrementLabel={(n) => `Tambah ${n}`}
      />,
    );
    expect(screen.getByRole('button', { name: 'Tambah Dewasa' })).toBeDefined();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <NumberStepper
          label="Adults"
          defaultValue={2}
          min={1}
          max={9}
          description="Age 12 and above"
        />
        <NumberStepper
          label="Infants"
          defaultValue={0}
          min={0}
          max={2}
          helperText="One infant per adult"
        />
        <NumberStepper label="Rooms" defaultValue={1} min={1} disabled />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
