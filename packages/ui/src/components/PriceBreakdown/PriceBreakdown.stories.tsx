import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { PriceBreakdown, type PriceItem } from './PriceBreakdown.js';
import type { PriceBreakdownLabels } from './labels.js';
import type { Currency } from '../../lib/money.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
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

const column: CSSProperties = { maxWidth: '380px' };

const SHORT: PriceItem[] = [
  { label: 'Base Price', amount: 9800, type: 'base' },
  { label: 'Visa Processing', amount: 450, type: 'fee' },
  { label: 'Total', amount: 10250, type: 'total' },
];

const LONG: PriceItem[] = [
  { label: 'Base Price', amount: 19600, type: 'base', quantity: 2 },
  { label: 'Child fare', amount: 7300, type: 'base' },
  {
    label: 'Visa Processing',
    amount: 1350,
    type: 'fee',
    note: 'Handled by the agency; passports are needed 30 days before departure.',
  },
  {
    label: 'Travel Insurance',
    amount: 750,
    type: 'addon',
    note: 'Covers medical care and trip cancellation for every passenger.',
  },
  { label: 'Airport transfer', amount: 400, type: 'addon' },
  { label: 'Zam-zam water (10L)', amount: 90, type: 'addon' },
  {
    label: 'SST',
    amount: 1740,
    type: 'tax',
    note: 'Malaysian sales and service tax at 6 percent.',
  },
  { label: 'Total', amount: 31230, type: 'total' },
];

const DISCOUNTED: PriceItem[] = [
  { label: 'Base Price', amount: 19600, type: 'base', quantity: 2 },
  { label: 'Visa Processing', amount: 900, type: 'fee' },
  { label: 'Travel Insurance', amount: 500, type: 'addon' },
  {
    label: 'Early bird discount',
    amount: 1500,
    type: 'discount',
    note: 'For bookings made 90 days before departure.',
  },
  { label: 'Total', amount: 19500, type: 'total' },
];

const meta = {
  title: 'Components/PriceBreakdown',
  component: PriceBreakdown,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The last table a pilgrim reads before paying. Every amount goes through the ' +
          'shared money formatter - symbol from `currency`, grouping from `locale` - and is ' +
          'set in tabular figures in a right-aligned column, because this is the component ' +
          'where a wobbling column is most visible and least forgivable.\n\n' +
          'Amounts are always positive: the `discount` type is what says an amount is ' +
          'subtracted, and the component draws the minus and the success colour. Accepting ' +
          'negative amounts as well would be two ways to say one thing, which is how a ' +
          'discount ends up subtracted twice. A screen reader hears the word "Discount", ' +
          'because neither a sign nor a colour is reliably announced.\n\n' +
          'The details collapse - open on a desktop, closed on a phone, either overridable ' +
          'with `defaultExpanded` - but the total never collapses: hiding the one number the ' +
          'screen exists to show would make the collapse a trap.\n\n' +
          'The component adds nothing up. The total is a supplied item, because a display ' +
          'component has no business deciding how rounding, deposits or instalments settle; ' +
          'whether the arithmetic is right is the consumer’s contract with its own ' +
          'pricing service.',
      },
    },
  },
} satisfies Meta<typeof PriceBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Short: Story = {
  args: { items: SHORT, currency: 'MYR', locale: 'en' },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const Long: Story = {
  args: { items: LONG, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'Eight rows, three of them with notes. The info control opens the note on hover ' +
          'and on focus, so it works without a mouse; the control is 24px against the house ' +
          '44 because rows sit at line height and a 44px target would steal taps from the ' +
          'rows above and below - the same documented trade as the Badge remove control.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const WithDiscount: Story = {
  args: { items: DISCOUNTED, currency: 'MYR', locale: 'en' },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const MultiPassenger: Story = {
  args: {
    items: [
      { label: 'Adults', amount: 19600, type: 'base', quantity: 2 },
      { label: 'Children', amount: 7300, type: 'base', quantity: 1 },
      { label: 'Infants', amount: 980, type: 'base', quantity: 1 },
      { label: 'Visa Processing', amount: 1800, type: 'fee' },
      { label: 'Total', amount: 29680, type: 'total' },
    ],
    currency: 'MYR',
    locale: 'en',
    passengers: { adults: 2, children: 1, infants: 1 },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Per-category rows carry their own `quantity`, rendered as "Adults × 2" with the ' +
          'category total beside it; the summary line above says who the whole table ' +
          'covers, joined through `Intl.ListFormat` so the list reads the locale’s own ' +
          'way. The per-category amounts are supplied, not derived: child and infant fares ' +
          'are not fractions this component could know.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const Currencies: Story = {
  args: { items: SHORT, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'The same breakdown in the three currencies, each with realistic amounts. Rupiah ' +
          'is the width test: five digit-groups in the total, still one straight right edge.',
      },
    },
  },
  render: () => {
    const AMOUNTS: Record<Currency, PriceItem[]> = {
      MYR: DISCOUNTED,
      IDR: [
        { label: 'Base Price', amount: 77000000, type: 'base', quantity: 2 },
        { label: 'Visa Processing', amount: 3500000, type: 'fee' },
        { label: 'Travel Insurance', amount: 1900000, type: 'addon' },
        { label: 'Early bird discount', amount: 5500000, type: 'discount' },
        { label: 'Total', amount: 76900000, type: 'total' },
      ],
      SGD: [
        { label: 'Base Price', amount: 7200, type: 'base', quantity: 2 },
        { label: 'Visa Processing', amount: 320, type: 'fee' },
        { label: 'Travel Insurance', amount: 180, type: 'addon' },
        { label: 'Early bird discount', amount: 550, type: 'discount' },
        { label: 'Total', amount: 7150, type: 'total' },
      ],
    };
    return (
      <Page>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
          {(Object.keys(AMOUNTS) as Currency[]).map((currency) => (
            <div key={currency} style={{ width: '340px' }}>
              <Caption>{currency}</Caption>
              <PriceBreakdown
                items={AMOUNTS[currency]}
                currency={currency}
                locale={currency === 'IDR' ? 'id-ID' : 'en-MY'}
              />
            </div>
          ))}
        </div>
      </Page>
    );
  },
};

export const Inline: Story = {
  args: { items: SHORT, currency: 'MYR', locale: 'en', variant: 'inline' },
  parameters: {
    docs: {
      description: {
        story:
          'No border or background of its own: the form of the component that sits inside ' +
          'a checkout column that already has a surface.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const Collapsed: Story = {
  args: { items: LONG, currency: 'MYR', locale: 'en', defaultExpanded: false },
  parameters: {
    docs: {
      description: {
        story:
          'The phone default, forced here with `defaultExpanded`. The details are folded ' +
          'away; the total is not, because it is the one number the screen exists to show.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <PriceBreakdown {...args} />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { items: DISCOUNTED, currency: 'MYR', locale: 'en' },
  parameters: { backgrounds: { disable: true } },
  render: (args) => (
    <Page theme="dark">
      <div style={column}>
        <PriceBreakdown {...args} passengers={{ adults: 2, children: 0, infants: 0 }} />
      </div>
    </Page>
  ),
};

const MS: Partial<PriceBreakdownLabels> = {
  breakdown: 'Pecahan harga',
  showDetails: 'Tunjukkan butiran',
  hideDetails: 'Sembunyikan butiran',
  moreAbout: (label) => `Lanjut tentang ${label}`,
  discount: 'Diskaun',
  adults: (count) => `${count} Dewasa`,
  children: (count) => `${count} Kanak-kanak`,
  infants: (count) => `${count} Bayi`,
};

const ID_LABELS: Partial<PriceBreakdownLabels> = {
  breakdown: 'Rincian harga',
  showDetails: 'Tampilkan rincian',
  hideDetails: 'Sembunyikan rincian',
  moreAbout: (label) => `Selengkapnya tentang ${label}`,
  discount: 'Diskon',
  adults: (count) => `${count} Dewasa`,
  children: (count) => `${count} Anak`,
  infants: (count) => `${count} Bayi`,
};

export const TextExpansion: Story = {
  args: { items: SHORT, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'The spec’s own strings: Harga Asas, Pemprosesan Visa, Insurans Perjalanan. ' +
          'Labels are the flexible column - they wrap - while the amount column never does, ' +
          'so a long Indonesian label cannot push the numbers off their right edge. Columns ' +
          'are 300px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
        {(
          [
            {
              lang: 'en',
              locale: 'en-MY',
              labels: undefined,
              items: [
                { label: 'Base Price', amount: 19600, type: 'base', quantity: 2 },
                { label: 'Visa Processing', amount: 900, type: 'fee' },
                { label: 'Travel Insurance', amount: 500, type: 'addon' },
                { label: 'Total', amount: 21000, type: 'total' },
              ],
            },
            {
              lang: 'ms',
              locale: 'ms-MY',
              labels: MS,
              items: [
                { label: 'Harga Asas', amount: 19600, type: 'base', quantity: 2 },
                { label: 'Pemprosesan Visa', amount: 900, type: 'fee' },
                { label: 'Insurans Perjalanan', amount: 500, type: 'addon' },
                { label: 'Jumlah', amount: 21000, type: 'total' },
              ],
            },
            {
              lang: 'id',
              locale: 'id-ID',
              labels: ID_LABELS,
              items: [
                { label: 'Harga Dasar', amount: 19600, type: 'base', quantity: 2 },
                { label: 'Pengurusan Visa', amount: 900, type: 'fee' },
                { label: 'Asuransi Perjalanan', amount: 500, type: 'addon' },
                { label: 'Total', amount: 21000, type: 'total' },
              ],
            },
          ] as const
        ).map((copy) => (
          <div key={copy.lang} lang={copy.lang} style={{ width: '300px' }}>
            <Caption>{copy.lang}</Caption>
            <PriceBreakdown
              items={[...copy.items]}
              currency="MYR"
              locale={copy.locale}
              passengers={{ adults: 2, children: 0, infants: 0 }}
              {...(copy.labels ? { labels: copy.labels } : {})}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
