import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';

import { expectNoA11yViolations } from '../../test/a11y.js';
import { Chart, type ChartSeries } from './Chart.js';

const DATA = [
  { month: 'Jan', bookings: 42, revenue: 12500 },
  { month: 'Feb', bookings: 58, revenue: 17800 },
  { month: 'Mar', bookings: 65, revenue: 20100 },
];

const SERIES: ChartSeries[] = [{ key: 'bookings', label: 'Bookings' }];

describe('Chart', () => {
  it('renders an aria-hidden plot and a real accessible table with the same data', () => {
    render(<Chart data={DATA} xKey="month" series={SERIES} label="Bookings per month" />);

    const table = screen.getByRole('table', { name: 'Bookings per month' });
    expect(table.className).toContain('uh-sr-only');

    const plot = document.querySelector('.uh-chart__plot');
    expect(plot?.getAttribute('aria-hidden')).toBe('true');
  });

  it('the accessible table has one row per data point plus a header row', () => {
    render(<Chart data={DATA} xKey="month" series={SERIES} label="Bookings per month" />);

    const table = screen.getByRole('table', { name: 'Bookings per month' });
    expect(within(table).getAllByRole('row')).toHaveLength(DATA.length + 1);
    expect(within(table).getByRole('columnheader', { name: 'month' })).toBeDefined();
    expect(within(table).getByRole('columnheader', { name: 'Bookings' })).toBeDefined();
  });

  it('the accessible table carries every series and formats plain counts by locale', () => {
    render(
      <Chart
        data={DATA}
        xKey="month"
        series={[
          { key: 'bookings', label: 'Bookings' },
          { key: 'revenue', label: 'Revenue' },
        ]}
        label="Bookings and revenue per month"
        locale="en"
      />,
    );

    const table = screen.getByRole('table', { name: 'Bookings and revenue per month' });
    expect(within(table).getByRole('cell', { name: '58' })).toBeDefined();
  });

  it('formats series values as currency when currency is set', () => {
    render(
      <Chart
        data={DATA}
        xKey="month"
        series={[{ key: 'revenue', label: 'Revenue' }]}
        label="Revenue per month"
        currency="MYR"
        locale="en"
      />,
    );

    const table = screen.getByRole('table', { name: 'Revenue per month' });
    expect(within(table).getByRole('cell', { name: 'RM 12,500' })).toBeDefined();
  });

  it('formats large y-axis ticks compactly so they never wrap onto two lines', () => {
    const { container } = render(
      <Chart
        data={[
          { pkg: 'A', revenue: 1_000_000 },
          { pkg: 'B', revenue: 500_000 },
        ]}
        xKey="pkg"
        series={[{ key: 'revenue', label: 'Revenue' }]}
        label="Revenue by package"
        currency="MYR"
        locale="en"
        type="bar"
      />,
    );

    const tickTexts = [...container.querySelectorAll('.recharts-yAxis text')].map(
      (node) => node.textContent,
    );
    // Compact ("RM 1M"), never the full "RM 1,000,000" - that string is what
    // recharts previously wrapped across two <tspan> lines at ~56px wide.
    expect(tickTexts.some((text) => text?.includes('1,000,000'))).toBe(false);
  });

  it('a custom valueFormatter overrides currency and default formatting', () => {
    render(
      <Chart
        data={DATA}
        xKey="month"
        series={SERIES}
        label="Bookings per month"
        valueFormatter={(value) => `${value} pax`}
      />,
    );

    const table = screen.getByRole('table', { name: 'Bookings per month' });
    expect(within(table).getByRole('cell', { name: '42 pax' })).toBeDefined();
  });

  it('has no accessibility violations for line and bar types', async () => {
    const { container: lineContainer } = render(
      <Chart data={DATA} xKey="month" series={SERIES} label="Bookings per month" type="line" />,
    );
    await expectNoA11yViolations(lineContainer);

    const { container: barContainer } = render(
      <Chart data={DATA} xKey="month" series={SERIES} label="Bookings per month" type="bar" />,
    );
    await expectNoA11yViolations(barContainer);
  });
});
