import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Chart, type ChartSeries } from './Chart.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      <div style={{ maxWidth: '640px' }}>{children}</div>
    </div>
  );
}

/* An agency's own bookings and revenue, month by month - the reference use
   case Chart was built for (see the "Continue" thread in the design
   system's own history for why: the admin/agency portals needed a trend
   view, not a general-purpose charting toolkit). */
const BOOKINGS_BY_MONTH = [
  { month: 'Jan', bookings: 42 },
  { month: 'Feb', bookings: 58 },
  { month: 'Mar', bookings: 65 },
  { month: 'Apr', bookings: 51 },
  { month: 'May', bookings: 73 },
  { month: 'Jun', bookings: 89 },
];

const BOOKINGS_AND_REVENUE = [
  { month: 'Jan', bookings: 42, revenue: 210000 },
  { month: 'Feb', bookings: 58, revenue: 289500 },
  { month: 'Mar', bookings: 65, revenue: 324750 },
  { month: 'Apr', bookings: 51, revenue: 255600 },
  { month: 'May', bookings: 73, revenue: 366430 },
  { month: 'Jun', bookings: 89, revenue: 448210 },
];

const REVENUE_BY_PACKAGE = [
  { pkg: '9-Day Istanbul Transit', revenue: 875000 },
  { pkg: '14-Day Ramadan Umrah', revenue: 612000 },
  { pkg: '12-Day Family Umrah', revenue: 540500 },
  { pkg: '7-Day Express Umrah', revenue: 398200 },
];

const BOOKINGS_SERIES: ChartSeries[] = [{ key: 'bookings', label: 'Bookings' }];
const BOOKINGS_AND_REVENUE_SERIES: ChartSeries[] = [
  { key: 'bookings', label: 'Bookings' },
  { key: 'revenue', label: 'Revenue (RM)' },
];
const REVENUE_SERIES: ChartSeries[] = [{ key: 'revenue', label: 'Revenue' }];

const meta = {
  title: 'Components/Chart',
  component: Chart,
  args: {
    data: BOOKINGS_BY_MONTH,
    xKey: 'month',
    series: BOOKINGS_SERIES,
    label: 'Bookings per month',
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A line or bar chart over categorical data - built for the admin/agency ' +
          "portals' trend views (bookings or revenue over time, revenue by package), " +
          'not a general-purpose charting toolkit. `recharts` does the actual drawing ' +
          '(a peer dependency, never bundled into this package - see the `external` ' +
          'comment in vite.config.ts); this component owns the token-driven styling, ' +
          'the currency/locale-aware formatting every axis and tooltip value goes ' +
          'through, and the screen-reader-accessible data table every chart ships ' +
          'beside its (aria-hidden) visual.',
      },
    },
  },
} satisfies Meta<typeof Chart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BookingsTrend: Story = {
  render: (args) => (
    <Page>
      <Chart {...args} />
    </Page>
  ),
};

export const RevenueByPackage: Story = {
  args: {
    type: 'bar',
    data: REVENUE_BY_PACKAGE,
    xKey: 'pkg',
    series: REVENUE_SERIES,
    currency: 'MYR',
    label: 'Revenue by package, this quarter',
  },
  render: (args) => (
    <Page>
      <Chart {...args} />
    </Page>
  ),
};

export const MultiSeries: Story = {
  args: {
    data: BOOKINGS_AND_REVENUE,
    series: BOOKINGS_AND_REVENUE_SERIES,
    label: 'Bookings and revenue per month',
  },
  render: (args) => (
    <Page>
      <Chart {...args} />
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <div>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            type=&quot;line&quot;
          </span>
          <Chart
            data={BOOKINGS_BY_MONTH}
            xKey="month"
            series={BOOKINGS_SERIES}
            label="Bookings per month"
            type="line"
            height={220}
          />
        </div>
        <div>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            type=&quot;bar&quot;
          </span>
          <Chart
            data={BOOKINGS_BY_MONTH}
            xKey="month"
            series={BOOKINGS_SERIES}
            label="Bookings per month"
            type="bar"
            height={220}
          />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Chart
        data={BOOKINGS_AND_REVENUE}
        xKey="month"
        series={BOOKINGS_AND_REVENUE_SERIES}
        label="Bookings and revenue per month"
      />
    </Page>
  ),
};

/** The visual plot is aria-hidden - a screen reader reads the same data as
    a real table instead. Text length is not a concern for the plot itself
    (there is no label text to wrap), but the sr-only table's column
    headers and row labels still have to hold Malay/Indonesian's 15-30%
    longer text without breaking, since it is a real table a screen reader
    user can navigate cell by cell. */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <Chart
        data={[
          { bulan: 'Jan', tempahan: 42 },
          { bulan: 'Feb', tempahan: 58 },
        ]}
        xKey="bulan"
        series={[{ key: 'tempahan', label: 'Jumlah tempahan bulanan' }]}
        label="Jumlah tempahan bulanan, dibandingkan bulan sebelumnya"
        locale="ms"
      />
    </Page>
  ),
};
