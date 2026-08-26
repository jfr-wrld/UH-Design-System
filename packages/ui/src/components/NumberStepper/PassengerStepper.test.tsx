import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { PassengerStepper, type PassengerCounts } from './PassengerStepper.js';

const field = (name: string) => screen.getByRole('spinbutton', { name }) as HTMLInputElement;
const inc = (name: string) => screen.getByRole('button', { name: `Increase ${name}` });
const dec = (name: string) => screen.getByRole('button', { name: `Decrease ${name}` });

describe('PassengerStepper', () => {
  it('starts at one adult and nobody else', () => {
    render(<PassengerStepper />);
    expect(field('Adults').value).toBe('1');
    expect(field('Children').value).toBe('0');
    expect(field('Infants').value).toBe('0');
  });

  it('groups the three under one legend', () => {
    render(<PassengerStepper legend="Jemaah" />);
    expect(screen.getByRole('group', { name: /Jemaah/ })).toBeDefined();
  });

  it('announces a running total', async () => {
    render(<PassengerStepper />);
    expect(screen.getByRole('status').textContent).toContain('1 travelling in total');
    await userEvent.click(inc('Children'));
    expect(screen.getByRole('status').textContent).toContain('2 travelling in total');
  });

  it('will not go below one adult', () => {
    render(<PassengerStepper />);
    expect((dec('Adults') as HTMLButtonElement).disabled).toBe(true);
  });

  describe('the infant rule', () => {
    it('caps infants at the number of adults', async () => {
      render(<PassengerStepper defaultValue={{ adults: 2, children: 0, infants: 0 }} />);
      await userEvent.click(inc('Infants'));
      await userEvent.click(inc('Infants'));

      expect(field('Infants').value).toBe('2');
      expect((inc('Infants') as HTMLButtonElement).disabled).toBe(true);
      expect(field('Infants').getAttribute('aria-valuemax')).toBe('2');
    });

    it('explains the cap once it is reached, without calling it an error', async () => {
      render(<PassengerStepper defaultValue={{ adults: 1, children: 0, infants: 0 }} />);
      await userEvent.click(inc('Infants'));

      const id = field('Infants').getAttribute('aria-describedby');
      const text = (id ?? '')
        .split(' ')
        .map((i) => document.getElementById(i)?.textContent)
        .join(' ');
      expect(text).toContain('One infant per adult');
      expect(field('Infants').getAttribute('aria-invalid')).toBeNull();
    });

    it('does NOT silently drop an infant when adults are reduced', async () => {
      const onChange = vi.fn();
      render(
        <PassengerStepper
          defaultValue={{ adults: 2, children: 0, infants: 2 }}
          onChange={onChange}
        />,
      );
      await userEvent.click(dec('Adults'));

      // Both numbers stay exactly as the person set them.
      expect(field('Adults').value).toBe('1');
      expect(field('Infants').value).toBe('2');
      expect(onChange).toHaveBeenLastCalledWith({ adults: 1, children: 0, infants: 2 });
    });

    it('reports the conflict instead', async () => {
      render(<PassengerStepper defaultValue={{ adults: 2, children: 0, infants: 2 }} />);
      await userEvent.click(dec('Adults'));

      expect(field('Infants').getAttribute('aria-invalid')).toBe('true');
      expect(screen.getByRole('alert').textContent).toContain('Add an adult or remove an infant');
    });

    it('clears the conflict when it is resolved either way', async () => {
      render(<PassengerStepper defaultValue={{ adults: 2, children: 0, infants: 2 }} />);
      await userEvent.click(dec('Adults'));
      expect(screen.queryByRole('alert')).not.toBeNull();

      await userEvent.click(inc('Adults'));
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('drives every stepper with the arrow keys', async () => {
      render(<PassengerStepper defaultValue={{ adults: 2, children: 0, infants: 0 }} />);
      field('Children').focus();
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(field('Children').value).toBe('2');

      field('Adults').focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(field('Adults').value).toBe('1');
    });

    it('honours the infant cap from the keyboard too', async () => {
      render(<PassengerStepper defaultValue={{ adults: 1, children: 0, infants: 0 }} />);
      field('Infants').focus();
      await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
      expect(field('Infants').value).toBe('1');
    });

    it('reaches the three fields in visual order', async () => {
      render(<PassengerStepper />);
      const reached: string[] = [];

      for (let i = 0; i < 12 && reached.length < 3; i += 1) {
        await userEvent.tab();
        const el = document.activeElement as HTMLElement | null;
        if (el?.getAttribute('role') !== 'spinbutton') continue;
        const labelId = el.getAttribute('aria-labelledby');
        reached.push(document.getElementById(labelId ?? '')?.textContent ?? '');
      }

      expect(reached).toEqual(['Adults', 'Children', 'Infants']);
    });
  });

  describe('controlled and uncontrolled', () => {
    it('works uncontrolled', async () => {
      render(<PassengerStepper />);
      await userEvent.click(inc('Children'));
      expect(field('Children').value).toBe('1');
    });

    it('works controlled', async () => {
      function Controlled() {
        const [counts, setCounts] = useState<PassengerCounts>({
          adults: 1,
          children: 0,
          infants: 0,
        });
        return <PassengerStepper value={counts} onChange={setCounts} />;
      }
      render(<Controlled />);
      await userEvent.click(inc('Children'));
      expect(field('Children').value).toBe('1');
    });
  });

  it('takes localised copy for every visible string', () => {
    render(
      <PassengerStepper
        legend="Jemaah"
        labels={{
          adults: 'Dewasa',
          children: 'Kanak-kanak',
          infants: 'Bayi',
          adultsDescription: 'Umur 12 tahun ke atas',
          infantLimitReached: 'Seorang bayi bagi setiap dewasa.',
          infantsExceedAdults: () => 'Bayi melebihi dewasa.',
        }}
      />,
    );
    expect(screen.getByRole('spinbutton', { name: 'Dewasa' })).toBeDefined();
    expect(screen.getByRole('spinbutton', { name: 'Kanak-kanak' })).toBeDefined();
    expect(screen.getByRole('spinbutton', { name: 'Bayi' })).toBeDefined();
  });

  it('has no axe violations, including while in conflict', async () => {
    const { container } = render(
      <PassengerStepper defaultValue={{ adults: 1, children: 2, infants: 2 }} />,
    );
    await expectNoA11yViolations(container);
  });
});
