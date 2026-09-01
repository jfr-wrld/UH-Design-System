import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LegendPayload,
  type TooltipContentProps,
  type TooltipValueType,
} from 'recharts';

import { formatCount } from '../../lib/units.js';
import { formatMoney, currencySymbol, type Currency } from '../../lib/money.js';

export type ChartType = 'line' | 'bar';
/** Which `color.chart.N` token a series draws in. Assigned by position in
    `series` when omitted, so a single-series chart never has to think
    about this at all. */
export type ChartSeriesColor = 1 | 2 | 3 | 4 | 5;

export interface ChartSeries {
  /** Field name in each row of `data`. */
  key: string;
  /** Legend and tooltip label. */
  label: string;
  color?: ChartSeriesColor | undefined;
}

export interface ChartProps {
  /** @default 'line' */
  type?: ChartType | undefined;
  /** One row per point on the x-axis. Every `series[].key` and `xKey` must
      resolve to a value in every row. */
  data: readonly Record<string, string | number>[];
  /** Field in each row that labels the x-axis (a month, a package name). */
  xKey: string;
  /** One or more values to plot from each row. */
  series: readonly ChartSeries[];
  /** @default 320 */
  height?: number | undefined;
  /** @default 'en' */
  locale?: string | undefined;
  /** Formats every value (axis ticks, tooltip, the sr-only table) as this
      currency instead of a plain number. */
  currency?: Currency | undefined;
  /** Overrides currency/plain-number formatting entirely. */
  valueFormatter?: ((value: number) => string) | undefined;
  /** @default series.length > 1 */
  showLegend?: boolean | undefined;
  /** @default true */
  showGrid?: boolean | undefined;
  /** What this chart is showing, in one sentence - read by a screen reader
      in place of the (otherwise purely visual) chart itself. */
  label: string;
  className?: string | undefined;
}

const CHART_COLOR = (n: ChartSeriesColor) => `var(--uh-color-chart-${n})`;

/**
 * A line or bar chart over categorical data - built for the admin/agency
 * portals' trend views (bookings or revenue over time, revenue by
 * package), not a general-purpose charting toolkit. `recharts` does the
 * actual drawing; this component owns the token-driven styling, the
 * currency/locale-aware formatting every axis and tooltip value goes
 * through, and the screen-reader-accessible data table every chart here
 * ships beside its (aria-hidden) visual.
 */
export function Chart(props: ChartProps) {
  const {
    type = 'line',
    data,
    xKey,
    series,
    height = 320,
    locale = 'en',
    currency,
    valueFormatter,
    showLegend = series.length > 1,
    showGrid = true,
    label,
    className,
  } = props;

  const reactId = useId();
  const captionId = `${reactId}-caption`;

  const format = (value: number): string =>
    valueFormatter
      ? valueFormatter(value)
      : currency
        ? formatMoney(value, currency, locale, 0)
        : formatCount(value, locale);

  /*
   * The y-axis gets a compact form ("RM 1.2M", not "RM 1,234,000") and
   * the tooltip/table above use `format` (full precision) - an axis
   * column is only ~56px wide, and a full formatted amount at that width
   * wraps onto two lines and reads as broken, not just long. Not used
   * anywhere accuracy matters: the tooltip and the sr-only table both
   * carry the real, unabbreviated number.
   */
  const formatAxisTick = (value: number): string => {
    if (valueFormatter) return valueFormatter(value);
    const compact = new Intl.NumberFormat(locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
    return currency ? `${currencySymbol(currency)} ${compact}` : compact;
  };

  function renderTooltip({
    active,
    payload,
    label: tooltipLabel,
  }: TooltipContentProps<TooltipValueType, number | string>) {
    if (!active || !payload?.length) return null;
    return (
      <div className="uh-chart__tooltip">
        <p className="uh-chart__tooltip-label">{tooltipLabel}</p>
        <ul className="uh-chart__tooltip-list">
          {payload.map((item, index) => (
            <li key={index} className="uh-chart__tooltip-row">
              <span
                className="uh-chart__tooltip-swatch"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="uh-chart__tooltip-name">{item.name}</span>
              <span className="uh-chart__tooltip-value">
                {typeof item.value === 'number' ? format(item.value) : item.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const ChartRoot = type === 'bar' ? BarChart : LineChart;

  return (
    <div className={['uh-chart', className].filter(Boolean).join(' ')}>
      {/*
       * `inert`, not only `aria-hidden`: recharts renders its own
       * focusable elements inside the SVG (part of its own, separate
       * keyboard-navigation support) - `aria-hidden` alone removes them
       * from the accessibility tree but not from tab order, which axe
       * correctly flags as "hidden but still focusable". `inert` removes
       * both at once, which is exactly right here: the real, complete
       * accessible experience is the sr-only table below, not a second,
       * partial one bolted onto the visual.
       */}
      <div
        className="uh-chart__plot"
        style={{ height }}
        aria-hidden="true"
        role="presentation"
        inert
      >
        <ResponsiveContainer width="100%" height="100%">
          {/*
           * A fresh copy, not `data` itself: recharts sorts/reorders its
           * `data` array in place, and React's development mode deep-
           * freezes props - handing it the caller's own (possibly frozen)
           * array throws "Cannot assign to read only property" the moment
           * recharts tries to mutate it. A shallow copy is never frozen,
           * whatever the caller passed in.
           */}
          <ChartRoot
            data={[...data] as Record<string, string | number>[]}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            {showGrid ? (
              <CartesianGrid stroke="var(--uh-color-chart-grid)" vertical={false} />
            ) : null}
            <XAxis
              dataKey={xKey}
              stroke="var(--uh-color-chart-tick)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--uh-color-chart-tick)' }}
            />
            <YAxis
              stroke="var(--uh-color-chart-tick)"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: 'var(--uh-color-chart-tick)' }}
              tickFormatter={(value: number) => formatAxisTick(value)}
              width={56}
            />
            <Tooltip content={renderTooltip} cursor={{ fill: 'var(--uh-color-chart-grid)' }} />
            {showLegend ? <Legend content={renderLegend} /> : null}
            {series.map((item, index) => {
              const color = CHART_COLOR(item.color ?? (((index % 5) + 1) as ChartSeriesColor));
              return type === 'bar' ? (
                <Bar
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              ) : (
                <Line
                  key={item.key}
                  dataKey={item.key}
                  name={item.label}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 3, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              );
            })}
          </ChartRoot>
        </ResponsiveContainer>
      </div>

      <table className="uh-sr-only">
        <caption id={captionId}>{label}</caption>
        <thead>
          <tr>
            <th scope="col">{xKey}</th>
            {series.map((item) => (
              <th key={item.key} scope="col">
                {item.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <th scope="row">{row[xKey]}</th>
              {series.map((item) => {
                const value = row[item.key];
                return <td key={item.key}>{typeof value === 'number' ? format(value) : value}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderLegend({ payload }: { payload?: readonly LegendPayload[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="uh-chart__legend">
      {payload.map((item, index) => (
        <li key={item.value ?? index} className="uh-chart__legend-item">
          <span
            className="uh-chart__legend-swatch"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          {item.value}
        </li>
      ))}
    </ul>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Chart.displayName = 'Chart';
}
