import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { DateRangePicker } from './DateRangePicker.js';

const MARCH_2 = new Date(2026, 2, 2);
const day = (n: number) => new Date(2026, 2, n);

const trigger = () => screen.getByRole('button', { name: /Travel dates/ });
const dialog = () => screen.queryByRole('dialog');
const cell = (name: string) => screen.getByRole('gridcell', { name });
const march = (n: number) =>
  cell(
    new Intl.DateTimeFormat('en', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(day(n)),
  );

const open = async () => {
  await userEvent.click(trigger());
  return screen.getByRole('dialog');
};

const states = (panel: HTMLElement) =>
  within(panel)
    .getAllByRole('gridcell')
    .filter((c) => c.dataset.state !== 'none')
    .map((c) => `${c.textContent}:${c.dataset.state}`);

/*
 * "Today" is pinned so that what the calendar opens on does not depend on the
 * day the suite happens to run. Only Date is faked: userEvent needs real
 * timers, and a suite that took those away would hang.
 */
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 2, 15, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DateRangePicker', () => {
  it('shows the placeholder until dates are chosen', () => {
    render(<DateRangePicker label="Travel dates" placeholder="Select dates" />);
    expect(trigger().textContent).toContain('Select dates');
  });

  it('shows both ends through Intl once the range is complete', () => {
    render(
      <DateRangePicker label="Travel dates" defaultStartDate={MARCH_2} defaultEndDate={day(12)} />,
    );
    /* Intl collapses the shared month, so the month appears once. */
    expect(trigger().textContent).toContain('March');
    expect(trigger().textContent!.match(/March/g)).toHaveLength(1);
  });

  it('shows the start alone while the return is still open', () => {
    render(<DateRangePicker label="Travel dates" defaultStartDate={MARCH_2} />);
    expect(trigger().textContent).toContain('March 2, 2026');
  });

  describe('choosing', () => {
    it('reports the start on the first click and stays open', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker label="Travel dates" onChange={onChange} />);
      await open();
      await userEvent.click(march(9));
      const [start, end] = onChange.mock.calls[0]!;
      expect(start.getDate()).toBe(9);
      /* The half-chosen range is reported straight away rather than being held
         back: the consumer's state and what is on screen never disagree. */
      expect(end).toBeNull();
      expect(dialog()).not.toBeNull();
    });

    it('completes the range when a start was already down', async () => {
      const onChange = vi.fn();
      render(
        <DateRangePicker label="Travel dates" defaultStartDate={MARCH_2} onChange={onChange} />,
      );
      await open();
      await userEvent.click(march(9));
      const [start, end] = onChange.mock.calls[0]!;
      expect(start.getDate()).toBe(2);
      expect(end.getDate()).toBe(9);
      expect(dialog()).toBeNull();
    });

    it('completes the range on the second click and closes', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker label="Travel dates" onChange={onChange} defaultStartDate={null} />);
      await open();
      await userEvent.click(march(9));
      await userEvent.click(march(16));
      const [start, end] = onChange.mock.calls[1]!;
      expect(start.getDate()).toBe(9);
      expect(end.getDate()).toBe(16);
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('starts over when the second click lands earlier than the first', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker label="Travel dates" onChange={onChange} />);
      await open();
      await userEvent.click(march(16));
      await userEvent.click(march(9));
      const [start, end] = onChange.mock.calls[1]!;
      expect(start.getDate()).toBe(9);
      expect(end).toBeNull();
      expect(dialog()).not.toBeNull();
    });

    it('starts over when a complete range is clicked again', async () => {
      const onChange = vi.fn();
      render(
        <DateRangePicker
          label="Travel dates"
          defaultStartDate={MARCH_2}
          defaultEndDate={day(12)}
          onChange={onChange}
        />,
      );
      await open();
      await userEvent.click(march(20));
      const [start, end] = onChange.mock.calls[0]!;
      expect(start.getDate()).toBe(20);
      expect(end).toBeNull();
    });

    it('allows a single day range', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker label="Travel dates" onChange={onChange} />);
      await open();
      await userEvent.click(march(9));
      await userEvent.click(march(9));
      const [start, end] = onChange.mock.calls[1]!;
      expect(start.getDate()).toBe(9);
      expect(end.getDate()).toBe(9);
    });
  });

  describe('keyboard', () => {
    it.each(['{Enter}', ' '])('opens from the keyboard with %s', async (key) => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={MARCH_2} />);
      await userEvent.tab();
      expect(document.activeElement).toBe(trigger());
      await userEvent.keyboard(key);
      expect(dialog()).not.toBeNull();
    });

    it('picks both ends without a pointer', async () => {
      const onChange = vi.fn();
      render(<DateRangePicker label="Travel dates" onChange={onChange} />);
      await open();
      /* Focus lands on today, the 15th; walk to the 16th and take it. */
      await userEvent.keyboard('{ArrowRight}{Enter}');
      await userEvent.keyboard('{ArrowDown}{Enter}');
      const [start, end] = onChange.mock.calls.at(-1)!;
      expect(start.getDate()).toBe(16);
      expect(end.getDate()).toBe(23);
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    /* See DatePicker.test.tsx for why focus is moved rather than tabbed. */
    it('closes when focus lands outside it', async () => {
      render(
        <div>
          <button type="button">Elsewhere</button>
          <DateRangePicker label="Travel dates" defaultStartDate={MARCH_2} />
        </div>,
      );
      await open();
      screen.getByRole('button', { name: 'Elsewhere' }).focus();
      await waitFor(() => expect(dialog()).toBeNull());
    });
  });

  describe('the band', () => {
    it('paints both ends and everything between them', async () => {
      render(
        <DateRangePicker label="Travel dates" defaultStartDate={day(9)} defaultEndDate={day(12)} />,
      );
      const panel = await open();
      expect(states(panel)).toEqual(['9:start', '10:middle', '11:middle', '12:end']);
    });

    it('previews the band under the pointer while the return is open', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} />);
      const panel = await open();
      expect(states(panel)).toEqual(['9:start']);
      await userEvent.hover(march(12));
      expect(states(panel)).toEqual(['9:start', '10:middle', '11:middle', '12:end']);
    });

    it('drops the preview when the pointer leaves the grid', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} />);
      const panel = await open();
      await userEvent.hover(march(12));
      await userEvent.unhover(within(panel).getByRole('grid'));
      expect(states(panel)).toEqual(['9:start']);
    });

    /*
     * A day inside the band is disabled as an endpoint but is not an
     * unavailable day, and the stylesheet drops the strike-through for exactly
     * this case. The band cannot span a genuinely closed day, so the two never
     * collide.
     */
    it('previews across days that are only disabled as endpoints', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} minRange={5} />);
      const panel = await open();
      await userEvent.hover(march(13));
      expect(states(panel)).toEqual(['9:start', '10:middle', '11:middle', '12:middle', '13:end']);
      expect(march(11).getAttribute('aria-disabled')).toBe('true');
    });

    it('does not preview backwards', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} />);
      const panel = await open();
      await userEvent.hover(march(5));
      expect(states(panel)).toEqual(['9:start']);
    });

    it('does not preview once the range is complete', async () => {
      render(
        <DateRangePicker label="Travel dates" defaultStartDate={day(9)} defaultEndDate={day(12)} />,
      );
      const panel = await open();
      await userEvent.hover(march(20));
      expect(states(panel)).toEqual(['9:start', '10:middle', '11:middle', '12:end']);
    });
  });

  describe('range limits', () => {
    it('rules out a stay shorter than minRange', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} minRange={3} />);
      await open();
      expect(march(9).getAttribute('aria-disabled')).toBe('true');
      expect(march(10).getAttribute('aria-disabled')).toBe('true');
      expect(march(11).hasAttribute('aria-disabled')).toBe(false);
    });

    it('rules out a stay longer than maxRange', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} maxRange={4} />);
      await open();
      expect(march(12).hasAttribute('aria-disabled')).toBe(false);
      expect(march(13).getAttribute('aria-disabled')).toBe('true');
    });

    /* Earlier days stay live, because clicking one starts the pick over rather
       than being a dead cell the pilgrim has to work out. */
    it('leaves the days before the start selectable', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} minRange={3} />);
      await open();
      expect(march(5).hasAttribute('aria-disabled')).toBe(false);
    });

    it('drops the limits again once the range is complete', async () => {
      render(
        <DateRangePicker
          label="Travel dates"
          defaultStartDate={day(9)}
          defaultEndDate={day(12)}
          minRange={3}
        />,
      );
      await open();
      expect(march(9).hasAttribute('aria-disabled')).toBe(false);
    });

    /*
     * A stay cannot jump over a closed day: if the 12th is unavailable then
     * nothing from the 12th onward can be the return for a departure before it.
     */
    it('will not let a stay span a ruled-out day', async () => {
      render(
        <DateRangePicker
          label="Travel dates"
          defaultStartDate={day(9)}
          disabledDates={[day(12)]}
        />,
      );
      await open();
      expect(march(11).hasAttribute('aria-disabled')).toBe(false);
      expect(march(12).getAttribute('aria-disabled')).toBe('true');
      expect(march(13).getAttribute('aria-disabled')).toBe('true');
    });

    it('still honours minDate and maxDate', async () => {
      render(<DateRangePicker label="Travel dates" minDate={day(5)} maxDate={day(20)} />);
      await open();
      expect(march(4).getAttribute('aria-disabled')).toBe('true');
      expect(march(21).getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('status', () => {
    it('asks for a departure date first', async () => {
      render(<DateRangePicker label="Travel dates" />);
      await open();
      expect(screen.getByRole('status').textContent).toBe('Choose a departure date.');
    });

    it('asks for the return once the departure is down', async () => {
      render(<DateRangePicker label="Travel dates" />);
      await open();
      await userEvent.click(march(9));
      expect(screen.getByRole('status').textContent).toContain('Now choose a return date');
    });

    /* The band is drawn, which says nothing out loud. This is what says it. */
    it('reads back the range and its length', async () => {
      render(
        <DateRangePicker label="Travel dates" defaultStartDate={day(9)} defaultEndDate={day(12)} />,
      );
      await open();
      expect(screen.getByRole('status').textContent).toContain('4 days');
    });

    it('takes translated status text', async () => {
      render(
        <DateRangePicker
          label="Travel dates"
          locale="ms"
          statusLabels={{
            chooseStart: 'Pilih tarikh berlepas.',
            chooseEnd: (start) => `Berlepas ${start}. Kini pilih tarikh pulang.`,
            chosen: (range, days) => `${range}. ${days} hari.`,
          }}
        />,
      );
      await open();
      expect(screen.getByRole('status').textContent).toBe('Pilih tarikh berlepas.');
    });
  });

  describe('value', () => {
    it('obeys a controlled pair', async () => {
      const onChange = vi.fn();
      render(
        <DateRangePicker
          label="Travel dates"
          startDate={day(9)}
          endDate={day(12)}
          onChange={onChange}
        />,
      );
      await open();
      await userEvent.click(march(20));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(trigger().textContent).toContain('9');
    });

    it('round-trips through a controlled parent', async () => {
      function Host() {
        const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({
          start: null,
          end: null,
        });
        return (
          <DateRangePicker
            label="Travel dates"
            startDate={range.start}
            endDate={range.end}
            onChange={(start, end) => setRange({ start, end })}
          />
        );
      }
      render(<Host />);
      await open();
      await userEvent.click(march(9));
      await userEvent.click(march(12));
      expect(trigger().textContent).toContain('March 9');
      expect(trigger().textContent).toContain('12');
    });
  });

  describe('accessibility', () => {
    it('has no violations with a range showing', async () => {
      render(
        <DateRangePicker
          label="Travel dates"
          defaultStartDate={day(9)}
          defaultEndDate={day(12)}
          minDate={day(1)}
        />,
      );
      await open();
      await expectNoA11yViolations(document.body);
    });

    it('has no violations while the return is being chosen', async () => {
      render(<DateRangePicker label="Travel dates" defaultStartDate={day(9)} minRange={3} />);
      await open();
      await expectNoA11yViolations(document.body);
    });
  });
});
