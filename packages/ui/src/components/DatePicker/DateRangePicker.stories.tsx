import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { DateRangePicker, type DateRangeStatusLabels } from './DateRangePicker.js';
import { addDays, startOfDay } from './date.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '560px',
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
const start = addDays(today, 21);
const end = addDays(today, 30);
const fullyBooked = [24, 25, 26].map((offset) => addDays(today, offset));

interface Range {
  start: Date | null;
  end: Date | null;
}

const meta = {
  title: 'Components/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A departure and a return. The first click sets the departure and reports it ' +
          'straight away, so the consumer never holds a range the screen is not showing; the ' +
          'second completes it. A click earlier than the departure starts over rather than ' +
          'being refused.\n\n' +
          'The band between the two ends is drawn, which says nothing out loud, so a status ' +
          'line inside the panel says it in words and updates as each end is chosen.\n\n' +
          '`minRange` and `maxRange` are counted in days including both ends: a `minRange` ' +
          'of 3 makes a departure on the 9th and a return on the 11th the shortest allowed ' +
          'stay. Everything else here works exactly as `DatePicker` does.',
      },
    },
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Travel dates' },
  render: function Range(args) {
    const [range, setRange] = useState<Range>({ start, end });
    return (
      <Page>
        <div style={stack}>
          <DateRangePicker
            {...args}
            startDate={range.start}
            endDate={range.end}
            onChange={(from, to) => setRange({ start: from, end: to })}
            helperText="Pick the departure first, then the return."
          />
        </div>
      </Page>
    );
  },
};

export const WithLimits: Story = {
  args: { label: 'Travel dates' },
  parameters: {
    docs: {
      description: {
        story:
          'A nine to fourteen day Umrah package. Once the departure is down, anything that ' +
          'would make the stay too short or too long is ruled out, and the days before the ' +
          'departure stay live so a mistaken first pick can simply be redone.',
      },
    },
  },
  render: function Limited(args) {
    const [range, setRange] = useState<Range>({ start: null, end: null });
    return (
      <Page>
        <div style={stack}>
          <DateRangePicker
            {...args}
            startDate={range.start}
            endDate={range.end}
            onChange={(from, to) => setRange({ start: from, end: to })}
            minDate={addDays(today, 2)}
            minRange={9}
            maxRange={14}
            helperText="Packages run from nine to fourteen days."
          />
        </div>
      </Page>
    );
  },
};

export const WithDisabledDates: Story = {
  args: { label: 'Travel dates' },
  parameters: {
    docs: {
      description: {
        story:
          'Three days in the middle are fully booked. Choose a departure before them and ' +
          'every day from the first closed one onward is ruled out too: a stay cannot jump ' +
          'over a night with no beds in it, so the return has to fall on the near side.',
      },
    },
  },
  render: function Blocked(args) {
    const [range, setRange] = useState<Range>({ start: null, end: null });
    return (
      <Page>
        <div style={stack}>
          <DateRangePicker
            {...args}
            startDate={range.start}
            endDate={range.end}
            onChange={(from, to) => setRange({ start: from, end: to })}
            minDate={addDays(today, 2)}
            disabledDates={fullyBooked}
            helperText="Struck through dates are fully booked."
          />
        </div>
      </Page>
    );
  },
};

const MS_STATUS: DateRangeStatusLabels = {
  chooseStart: 'Pilih tarikh berlepas.',
  chooseEnd: (from) => `Berlepas ${from}. Kini pilih tarikh pulang.`,
  chosen: (range, days) => `${range}. ${days} hari.`,
};

const ID_STATUS: DateRangeStatusLabels = {
  chooseStart: 'Pilih tanggal keberangkatan.',
  chooseEnd: (from) => `Berangkat ${from}. Sekarang pilih tanggal kepulangan.`,
  chosen: (range, days) => `${range}. ${days} hari.`,
};

export const Locales: Story = {
  args: { label: 'Travel dates' },
  parameters: {
    docs: {
      description: {
        story:
          'The trigger reads the range through `Intl.DateTimeFormat.formatRange`, so the ' +
          'shared month is collapsed once and the separator is the locale’s own rather ' +
          'than a dash chosen here. The month buttons and the status line are translated ' +
          'through props, since neither is something Intl knows about.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        <div lang="en" style={{ width: '280px' }}>
          <Caption>English</Caption>
          <DateRangePicker
            label="Travel dates"
            locale="en"
            defaultStartDate={start}
            defaultEndDate={end}
          />
        </div>
        <div lang="ms" style={{ width: '280px' }}>
          <Caption>Bahasa Melayu</Caption>
          <DateRangePicker
            label="Tarikh perjalanan"
            locale="ms"
            defaultStartDate={start}
            defaultEndDate={end}
            previousMonthLabel="Bulan sebelumnya"
            nextMonthLabel="Bulan seterusnya"
            closeLabel="Tutup"
            statusLabels={MS_STATUS}
          />
        </div>
        <div lang="id" style={{ width: '280px' }}>
          <Caption>Bahasa Indonesia</Caption>
          <DateRangePicker
            label="Tanggal perjalanan"
            locale="id"
            defaultStartDate={start}
            defaultEndDate={end}
            previousMonthLabel="Bulan sebelumnya"
            nextMonthLabel="Bulan berikutnya"
            closeLabel="Tutup"
            statusLabels={ID_STATUS}
          />
        </div>
      </div>
    </Page>
  ),
};

export const Mobile: Story = {
  args: { label: 'Travel dates' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'The sheet form. The status line sits in the sheet footer, under the grid, where ' +
          'it is the last thing read before the return is chosen.',
      },
    },
  },
  render: function Sheet(args) {
    const [range, setRange] = useState<Range>({ start: null, end: null });
    return (
      <Page>
        <div style={stack}>
          <DateRangePicker
            {...args}
            startDate={range.start}
            endDate={range.end}
            onChange={(from, to) => setRange({ start: from, end: to })}
            minRange={9}
            maxRange={14}
            helperText="Tap to open the calendar."
          />
        </div>
      </Page>
    );
  },
};

export const Matrix: Story = {
  args: { label: 'Travel dates' },
  render: () => (
    <Page>
      <div style={stack}>
        <div>
          <Caption>empty</Caption>
          <DateRangePicker label="Travel dates" />
        </div>
        <div>
          <Caption>departure only</Caption>
          <DateRangePicker label="Travel dates" defaultStartDate={start} />
        </div>
        <div>
          <Caption>complete</Caption>
          <DateRangePicker label="Travel dates" defaultStartDate={start} defaultEndDate={end} />
        </div>
        <div>
          <Caption>error</Caption>
          <DateRangePicker
            label="Travel dates"
            defaultStartDate={start}
            errorMessage="Choose a return date to continue."
          />
        </div>
        <div>
          <Caption>disabled</Caption>
          <DateRangePicker
            label="Travel dates"
            disabled
            defaultStartDate={start}
            defaultEndDate={end}
          />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { label: 'Travel dates' },
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <div>
          <Caption>complete</Caption>
          <DateRangePicker
            label="Travel dates"
            defaultStartDate={start}
            defaultEndDate={end}
            helperText="Open the calendar to see the band in dark mode."
          />
        </div>
        <div>
          <Caption>departure only</Caption>
          <DateRangePicker
            label="Travel dates"
            defaultStartDate={start}
            minRange={9}
            maxRange={14}
          />
        </div>
        <div>
          <Caption>error</Caption>
          <DateRangePicker label="Travel dates" errorMessage="Choose your travel dates." />
        </div>
      </div>
    </Page>
  ),
};

export const TextExpansion: Story = {
  args: { label: 'Travel dates' },
  parameters: {
    docs: {
      description: {
        story:
          'The status line is the longest string in this component and it is the one that ' +
          'grows most between languages, which is why it sits on its own row in the footer ' +
          'rather than beside anything.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        <div lang="en" style={{ width: '280px' }}>
          <Caption>en</Caption>
          <DateRangePicker
            label="Travel dates"
            locale="en"
            placeholder="Select dates"
            helperText="Packages run from nine to fourteen days."
            minRange={9}
            maxRange={14}
          />
        </div>
        <div lang="ms" style={{ width: '280px' }}>
          <Caption>ms</Caption>
          <DateRangePicker
            label="Tarikh perjalanan"
            locale="ms"
            placeholder="Pilih tarikh"
            helperText="Pakej berlangsung dari sembilan hingga empat belas hari."
            minRange={9}
            maxRange={14}
            statusLabels={MS_STATUS}
          />
        </div>
        <div lang="id" style={{ width: '280px' }}>
          <Caption>id</Caption>
          <DateRangePicker
            label="Tanggal perjalanan"
            locale="id"
            placeholder="Pilih tanggal"
            helperText="Paket berlangsung dari sembilan hingga empat belas hari."
            minRange={9}
            maxRange={14}
            statusLabels={ID_STATUS}
          />
        </div>
      </div>
    </Page>
  ),
};
