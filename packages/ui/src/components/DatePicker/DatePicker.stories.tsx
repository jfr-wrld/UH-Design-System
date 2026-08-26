import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { DatePicker } from './DatePicker.js';
import { addDays, startOfDay } from './date.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  /* Room for the popover to open into inside the story frame. */
  minHeight: '520px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--uh-spacing-24)',
  maxWidth: '360px',
};

const today = startOfDay(new Date());
const departure = addDays(today, 21);

/** Fully booked departures, the way an agency would supply them. */
const fullyBooked = [3, 4, 5, 11, 18, 19].map((offset) => addDays(today, offset));

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A single date. The calendar is portalled, so no `overflow: hidden` ancestor can ' +
          'clip it, and it opens as a popover on a desktop and as a modal bottom sheet on a ' +
          'phone. Which one it is gets decided in script from the breakpoint token, because ' +
          'a backdrop, a focus trap and a held page are not styling.\n\n' +
          'Every month name, weekday name and date string comes from `Intl.DateTimeFormat`. ' +
          'Nothing is assembled from a table, so a locale nobody planned for still reads ' +
          'correctly.\n\n' +
          'Keyboard: arrows move a day, up and down move a week, Page Up and Page Down move ' +
          'a month, Home and End reach the ends of the week, Enter or Space chooses, Escape ' +
          'closes. Days the consumer has ruled out are skipped rather than landed on, and ' +
          'they never hold the tab stop.\n\n' +
          'The trigger is a button, not a text field: parsing a typed date is a separate ' +
          'problem with its own locale traps, and this component does not pretend to solve it.',
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Departure date' },
  render: function Single(args) {
    const [value, setValue] = useState<Date | null>(departure);
    return (
      <Page>
        <div style={stack}>
          <DatePicker
            {...args}
            value={value}
            onChange={setValue}
            helperText="Departures are confirmed once the group reaches twenty pilgrims."
          />
        </div>
      </Page>
    );
  },
};

export const WithDisabledDates: Story = {
  args: { label: 'Departure date' },
  parameters: {
    docs: {
      description: {
        story:
          'Three ways of ruling a date out, all folded into one predicate so every part of ' +
          'the calendar gives the same answer: a lower bound, an upper bound, and a list of ' +
          'fully booked departures. Ruled-out days are struck through as well as dimmed, ' +
          'because colour alone is not a state.',
      },
    },
  },
  render: function Bounded(args) {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <Page>
        <div style={stack}>
          <DatePicker
            {...args}
            value={value}
            onChange={setValue}
            minDate={addDays(today, 2)}
            maxDate={addDays(today, 60)}
            disabledDates={fullyBooked}
            helperText="Struck through dates are fully booked. Bookings close two days ahead."
          />
        </div>
      </Page>
    );
  },
};

const LOCALES = [
  { code: 'en', label: 'English', field: 'Departure date' },
  { code: 'ms', label: 'Bahasa Melayu', field: 'Tarikh berlepas' },
  { code: 'id', label: 'Bahasa Indonesia', field: 'Tanggal keberangkatan' },
] as const;

export const Locales: Story = {
  args: { label: 'Departure date' },
  parameters: {
    docs: {
      description: {
        story:
          'The same date in three locales. Note the first column: Intl reports Monday as the ' +
          'first day of the week for Malay and Sunday for English and Indonesian, so these ' +
          'three grids genuinely do not line up. That is the locale being honoured, not a ' +
          'bug. A product that wants one shape everywhere pins `weekStartsOn`.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        {LOCALES.map((locale) => (
          <div
            key={locale.code}
            lang={locale.code}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--uh-spacing-8)',
              width: '280px',
            }}
          >
            <Caption>{locale.label}</Caption>
            <DatePicker label={locale.field} locale={locale.code} defaultValue={departure} />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const Mobile: Story = {
  args: { label: 'Departure date' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'Below 768px the calendar is a modal bottom sheet: a backdrop, a focus trap, the ' +
          'page behind held still, and a labelled close button. The grid is seven equal ' +
          'fractions of whatever width it is given, so it fits a 320px phone without a ' +
          'horizontal scrollbar.',
      },
    },
  },
  render: function Sheet(args) {
    const [value, setValue] = useState<Date | null>(departure);
    return (
      <Page>
        <div style={stack}>
          <DatePicker
            {...args}
            value={value}
            onChange={setValue}
            helperText="Tap to open the calendar."
          />
        </div>
      </Page>
    );
  },
};

export const Matrix: Story = {
  args: { label: 'Departure date' },
  parameters: {
    docs: {
      description: {
        story: 'Every state of the closed trigger, which is what a form page actually shows.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={stack}>
        <div>
          <Caption>empty</Caption>
          <DatePicker label="Departure date" />
        </div>
        <div>
          <Caption>chosen</Caption>
          <DatePicker label="Departure date" defaultValue={departure} />
        </div>
        <div>
          <Caption>with helper text</Caption>
          <DatePicker label="Departure date" helperText="Departures run every Tuesday." />
        </div>
        <div>
          <Caption>error</Caption>
          <DatePicker
            label="Departure date"
            errorMessage="Choose a departure date before continuing to payment."
          />
        </div>
        <div>
          <Caption>required</Caption>
          <DatePicker label="Departure date" required defaultValue={departure} />
        </div>
        <div>
          <Caption>disabled</Caption>
          <DatePicker label="Departure date" disabled defaultValue={departure} />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { label: 'Departure date' },
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <div>
          <Caption>empty</Caption>
          <DatePicker label="Departure date" />
        </div>
        <div>
          <Caption>chosen</Caption>
          <DatePicker
            label="Departure date"
            defaultValue={departure}
            minDate={addDays(today, 2)}
            disabledDates={fullyBooked}
            helperText="Open the calendar to see the ruled-out days in dark mode."
          />
        </div>
        <div>
          <Caption>error</Caption>
          <DatePicker label="Departure date" errorMessage="Choose a departure date." />
        </div>
      </div>
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    label: 'Departure date',
    helper: 'Departures are confirmed once the group reaches twenty pilgrims.',
    placeholder: 'Select a date',
  },
  {
    lang: 'ms',
    label: 'Tarikh berlepas',
    helper: 'Perlepasan disahkan setelah kumpulan mencapai dua puluh jemaah.',
    placeholder: 'Pilih tarikh',
  },
  {
    lang: 'id',
    label: 'Tanggal keberangkatan',
    helper: 'Keberangkatan dikonfirmasi setelah rombongan mencapai dua puluh jemaah.',
    placeholder: 'Pilih tanggal',
  },
] as const;

export const TextExpansion: Story = {
  args: { label: 'Departure date' },
  parameters: {
    docs: {
      description: {
        story:
          'The calendar itself does not grow: its width comes from the grid, not from the ' +
          'copy. What grows is the label, the placeholder and the helper text, so those are ' +
          'what these 280px columns are testing. The chosen date is the longest string the ' +
          'trigger has to hold, and it truncates rather than wrapping the field.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        {COPY.map((copy) => (
          <div
            key={copy.lang}
            lang={copy.lang}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--uh-spacing-24)',
              width: '280px',
            }}
          >
            <Caption>{copy.lang}</Caption>
            <DatePicker
              label={copy.label}
              locale={copy.lang}
              placeholder={copy.placeholder}
              helperText={copy.helper}
            />
            <DatePicker label={copy.label} locale={copy.lang} defaultValue={departure} />
          </div>
        ))}
      </div>
    </Page>
  ),
};
