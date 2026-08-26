import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { DatePicker } from './DatePicker.js';

/* March 2026 begins on a Sunday, which makes both week starts interesting. */
const MARCH_2 = new Date(2026, 2, 2);

const trigger = () => screen.getByRole('button', { name: /Departure date/ });
const dialog = () => screen.queryByRole('dialog');
const cell = (name: string) => screen.getByRole('gridcell', { name });
const open = async () => {
  await userEvent.click(trigger());
  return screen.getByRole('dialog');
};

/** jsdom has no matchMedia, so the layer defaults to the popover. */
function stubViewport(mobile: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: mobile,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

beforeEach(() => {
  /* See DateRangePicker.test.tsx: only Date is faked, so userEvent keeps its
     real timers. */
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 2, 15, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('DatePicker', () => {
  it('shows the placeholder until a date is chosen', () => {
    render(<DatePicker label="Departure date" placeholder="Select a date" />);
    expect(trigger().textContent).toContain('Select a date');
  });

  it('names the trigger with both the label and the current value', () => {
    render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
    expect(screen.getByRole('button', { name: 'Departure date March 2, 2026' })).toBeDefined();
  });

  it('starts closed', () => {
    render(<DatePicker label="Departure date" />);
    expect(dialog()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  describe('opening and closing', () => {
    it('opens the calendar and says so', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    });

    it('closes on Escape and puts focus back on the trigger', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.keyboard('{Escape}');
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('closes when the pointer goes elsewhere', async () => {
      render(
        <div>
          <DatePicker label="Departure date" defaultValue={MARCH_2} />
          <button type="button">Somewhere else</button>
        </div>,
      );
      await open();
      await userEvent.click(screen.getByRole('button', { name: 'Somewhere else' }));
      expect(dialog()).toBeNull();
    });

    /*
     * Enter and Space are a button's own activation behaviour, so these guard
     * against the trigger ever becoming something other than a button.
     */
    it.each(['{Enter}', ' '])('opens from the keyboard with %s', async (key) => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await userEvent.tab();
      expect(document.activeElement).toBe(trigger());
      await userEvent.keyboard(key);
      expect(dialog()).not.toBeNull();
    });

    /*
     * A non-modal popover closes when it loses focus. Without this, Tab walks
     * on to the next field and leaves the calendar hanging open over the page,
     * with focus nowhere near it.
     */
    /*
     * A non-modal popover that has lost focus closes; the alternative is a
     * calendar left hanging over a form the pilgrim has already moved on from.
     *
     * Focus is moved here rather than tabbed. The panel is portalled to the
     * end of the document, so Tab out of it wraps to the top of the page, and
     * jsdom has nothing to wrap to and drops focus on the body instead - which
     * is the one case this deliberately ignores, since it is also what a window
     * change looks like. The Tab route is checked in a real browser.
     */
    it('closes when focus lands outside it', async () => {
      render(
        <div>
          <button type="button">Elsewhere</button>
          <DatePicker label="Departure date" defaultValue={MARCH_2} />
        </div>,
      );
      await open();
      expect(document.activeElement).toBe(cell('Monday, March 2, 2026'));

      screen.getByRole('button', { name: 'Elsewhere' }).focus();
      await waitFor(() => expect(dialog()).toBeNull());
    });

    it('stays open while focus moves about inside it', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      screen.getByRole('button', { name: 'Next month' }).focus();
      expect(dialog()).not.toBeNull();
    });

    it('closes again when the trigger is pressed a second time', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.click(trigger());
      expect(dialog()).toBeNull();
    });
  });

  describe('the grid', () => {
    it('is a grid named for the field and the month on show', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      expect(screen.getByRole('grid', { name: 'Departure date, March 2026' })).toBeDefined();
    });

    it('heads the columns with weekday names from the locale', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} weekStartsOn={1} />);
      await open();
      const headers = screen.getAllByRole('columnheader').map((h) => h.textContent);
      expect(headers).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it.each([
      ['ms', 'Mac 2026', 'Isn'],
      ['id', 'Maret 2026', 'Sen'],
    ])('names everything in %s', async (locale, month, monday) => {
      render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          locale={locale}
          weekStartsOn={1}
        />,
      );
      await open();
      expect(screen.getByRole('grid', { name: `Departure date, ${month}` })).toBeDefined();
      expect(screen.getAllByRole('columnheader')[0]!.textContent).toBe(monday);
    });

    it('gives every cell the full date as its accessible name', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      expect(cell('Monday, March 2, 2026')).toBeDefined();
      expect(cell('Tuesday, March 31, 2026')).toBeDefined();
    });

    it('always draws six weeks, so the panel height never jumps', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      const panel = await open();
      /* Six weeks plus the header row. */
      expect(within(panel).getAllByRole('row')).toHaveLength(7);
    });

    it('marks today', async () => {
      render(<DatePicker label="Departure date" />);
      const panel = await open();
      expect(
        within(panel)
          .getAllByRole('gridcell')
          .filter((c) => c.getAttribute('aria-current') === 'date'),
      ).toHaveLength(1);
    });
  });

  describe('keyboard', () => {
    it('lands on the chosen date when it opens', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      expect(document.activeElement).toBe(cell('Monday, March 2, 2026'));
    });

    it('moves a day at a time with left and right', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cell('Tuesday, March 3, 2026'));
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      expect(document.activeElement).toBe(cell('Sunday, March 1, 2026'));
    });

    it('moves a week at a time with up and down', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.keyboard('{ArrowDown}');
      expect(document.activeElement).toBe(cell('Monday, March 9, 2026'));
      await userEvent.keyboard('{ArrowUp}{ArrowUp}');
      expect(document.activeElement).toBe(cell('Monday, February 23, 2026'));
    });

    it('changes month with Page Up and Page Down', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.keyboard('{PageDown}');
      expect(screen.getByRole('grid', { name: /April 2026/ })).toBeDefined();
      await userEvent.keyboard('{PageUp}{PageUp}');
      expect(screen.getByRole('grid', { name: /February 2026/ })).toBeDefined();
    });

    it('goes to the ends of the week with Home and End', async () => {
      render(
        <DatePicker label="Departure date" defaultValue={new Date(2026, 2, 4)} weekStartsOn={1} />,
      );
      await open();
      await userEvent.keyboard('{Home}');
      expect(document.activeElement).toBe(cell('Monday, March 2, 2026'));
      await userEvent.keyboard('{End}');
      expect(document.activeElement).toBe(cell('Sunday, March 8, 2026'));
    });

    it('crosses into the next month by walking off the end of this one', async () => {
      render(<DatePicker label="Departure date" defaultValue={new Date(2026, 2, 31)} />);
      await open();
      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByRole('grid', { name: /April 2026/ })).toBeDefined();
      expect(document.activeElement).toBe(cell('Wednesday, April 1, 2026'));
    });

    it('selects with Enter and closes', async () => {
      const onChange = vi.fn();
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} onChange={onChange} />);
      await open();
      await userEvent.keyboard('{ArrowRight}{Enter}');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]![0].getDate()).toBe(3);
      expect(dialog()).toBeNull();
      expect(document.activeElement).toBe(trigger());
    });

    it('selects with Space as well', async () => {
      const onChange = vi.fn();
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} onChange={onChange} />);
      await open();
      await userEvent.keyboard('{ArrowDown} ');
      expect(onChange.mock.calls[0]![0].getDate()).toBe(9);
    });

    it('keeps one tab stop for the whole grid', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      const panel = await open();
      const stops = within(panel)
        .getAllByRole('gridcell')
        .filter((c) => c.getAttribute('tabindex') === '0');
      expect(stops).toHaveLength(1);
    });
  });

  describe('bounds', () => {
    it('marks a date outside the bounds as disabled', async () => {
      render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          minDate={MARCH_2}
          maxDate={new Date(2026, 2, 10)}
        />,
      );
      await open();
      expect(cell('Sunday, March 1, 2026').getAttribute('aria-disabled')).toBe('true');
      expect(cell('Wednesday, March 11, 2026').getAttribute('aria-disabled')).toBe('true');
      expect(cell('Monday, March 2, 2026').hasAttribute('aria-disabled')).toBe(false);
    });

    /* The specification is explicit: a ruled-out day is not a tab stop. */
    it('never gives a disabled date the tab stop', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} minDate={MARCH_2} />);
      const panel = await open();
      for (const day of within(panel).getAllByRole('gridcell')) {
        if (day.getAttribute('aria-disabled') === 'true') {
          expect(day.getAttribute('tabindex')).toBe('-1');
        }
      }
    });

    it('walks past disabled dates rather than landing on them', async () => {
      render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          disabledDates={[new Date(2026, 2, 3), new Date(2026, 2, 4)]}
        />,
      );
      await open();
      await userEvent.keyboard('{ArrowRight}');
      expect(document.activeElement).toBe(cell('Thursday, March 5, 2026'));
    });

    it('refuses to move when there is nowhere to go', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} minDate={MARCH_2} />);
      await open();
      await userEvent.keyboard('{ArrowLeft}');
      expect(document.activeElement).toBe(cell('Monday, March 2, 2026'));
    });

    it('does nothing when a disabled date is clicked', async () => {
      const onChange = vi.fn();
      render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          minDate={MARCH_2}
          onChange={onChange}
        />,
      );
      await open();
      await userEvent.click(cell('Sunday, March 1, 2026'));
      expect(onChange).not.toHaveBeenCalled();
      expect(dialog()).not.toBeNull();
    });

    it('stops the month buttons at the bounds', async () => {
      render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          minDate={new Date(2026, 2, 1)}
          maxDate={new Date(2026, 2, 31)}
        />,
      );
      await open();
      expect(
        (screen.getByRole('button', { name: 'Previous month' }) as HTMLButtonElement).disabled,
      ).toBe(true);
      expect(
        (screen.getByRole('button', { name: 'Next month' }) as HTMLButtonElement).disabled,
      ).toBe(true);
    });

    it('opens on a selectable day when the chosen one is ruled out', async () => {
      render(<DatePicker label="Departure date" minDate={new Date(2099, 0, 15)} />);
      const panel = await open();
      const focused = within(panel)
        .getAllByRole('gridcell')
        .find((c) => c.getAttribute('tabindex') === '0');
      expect(focused?.getAttribute('aria-disabled')).toBeNull();
    });
  });

  describe('value', () => {
    it('works uncontrolled', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      await userEvent.click(cell('Friday, March 6, 2026'));
      expect(trigger().textContent).toContain('March 6, 2026');
    });

    it('obeys a controlled value and does not move on its own', async () => {
      const onChange = vi.fn();
      render(<DatePicker label="Departure date" value={MARCH_2} onChange={onChange} />);
      await open();
      await userEvent.click(cell('Friday, March 6, 2026'));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(trigger().textContent).toContain('March 2, 2026');
    });

    it('round-trips through a controlled parent', async () => {
      function Host() {
        const [date, setDate] = useState<Date | null>(MARCH_2);
        return <DatePicker label="Departure date" value={date} onChange={setDate} />;
      }
      render(<Host />);
      await open();
      await userEvent.click(cell('Friday, March 6, 2026'));
      expect(trigger().textContent).toContain('March 6, 2026');
    });
  });

  describe('states', () => {
    it('does not open when disabled', async () => {
      render(<DatePicker label="Departure date" disabled />);
      await userEvent.click(trigger());
      expect(dialog()).toBeNull();
    });

    it('announces an error the consumer supplied', () => {
      render(<DatePicker label="Departure date" errorMessage="Choose a departure date." />);
      expect(screen.getByRole('alert').textContent).toBe('Choose a departure date.');
      expect(trigger().getAttribute('aria-invalid')).toBe('true');
    });

    it('describes the trigger with the helper text', () => {
      render(<DatePicker label="Departure date" helperText="Flights leave on Tuesdays." />);
      const described = trigger().getAttribute('aria-describedby');
      expect(document.getElementById(described!)?.textContent).toBe('Flights leave on Tuesdays.');
      expect(screen.queryByRole('alert')).toBeNull();
    });
  });

  describe('mobile', () => {
    it('opens as a modal sheet on a phone', async () => {
      stubViewport(true);
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      const panel = await open();
      expect(panel.getAttribute('aria-modal')).toBe('true');
      expect(panel.dataset.mobile).toBe('true');
      expect(within(panel).getByRole('button', { name: 'Close' })).toBeDefined();
    });

    it('opens as a plain popover on a wider screen', async () => {
      stubViewport(false);
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      const panel = await open();
      expect(panel.hasAttribute('aria-modal')).toBe(false);
      expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
    });

    it('holds the page still behind the sheet and lets go afterwards', async () => {
      stubViewport(true);
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} />);
      await open();
      expect(document.body.style.overflow).toBe('hidden');
      await userEvent.keyboard('{Escape}');
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('accessibility', () => {
    it('has no violations closed', async () => {
      const { container } = render(
        <DatePicker
          label="Departure date"
          defaultValue={MARCH_2}
          helperText="Flights leave on Tuesdays."
        />,
      );
      await expectNoA11yViolations(container);
    });

    it('has no violations with the calendar open', async () => {
      render(<DatePicker label="Departure date" defaultValue={MARCH_2} minDate={MARCH_2} />);
      await open();
      await expectNoA11yViolations(document.body);
    });
  });
});
