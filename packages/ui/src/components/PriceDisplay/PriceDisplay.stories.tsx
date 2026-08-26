import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { PriceDisplay, type PriceSize } from './PriceDisplay.js';
import type { PriceDisplayLabels } from './labels.js';
import { Badge } from '../Badge/Badge.js';
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

/** A card-shaped box, so the price is seen in the width it will really get. */
function Cell({ width = '220px', children }: { width?: string; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        padding: 'var(--uh-spacing-12)',
        border: 'var(--uh-border-width-1) solid var(--uh-color-border-subtle)',
        borderRadius: 'var(--uh-radius-md)',
        background: 'var(--uh-color-bg-surface)',
      }}
    >
      {children}
    </div>
  );
}

interface Money {
  amount: number;
  original: number;
  monthly: number;
}

/** Realistic package prices, so the widths on screen are the real widths. */
const PRICES: Record<Currency, Money> = {
  MYR: { amount: 9800, original: 12500, monthly: 817 },
  IDR: { amount: 38500000, original: 45000000, monthly: 3208333 },
  SGD: { amount: 3600, original: 4200, monthly: 300 },
};

const CURRENCIES: Currency[] = ['MYR', 'IDR', 'SGD'];

const VARIANTS = [
  { key: 'plain', caption: '1. price' },
  { key: 'discount', caption: '2. discounted' },
  { key: 'perPax', caption: '3. per pax' },
  { key: 'from', caption: '4. from' },
  { key: 'instalment', caption: '5. instalment' },
] as const;

type VariantKey = (typeof VARIANTS)[number]['key'];

function variantProps(key: VariantKey, money: Money) {
  switch (key) {
    case 'discount':
      return { originalAmount: money.original };
    case 'perPax':
      return { showPerPax: true };
    case 'from':
      return { prefix: 'from' as const };
    case 'instalment':
      return { installment: { monthly: money.monthly, months: 12 } };
    default:
      return {};
  }
}

const meta = {
  title: 'Components/PriceDisplay',
  component: PriceDisplay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The one place a price is drawn. Every amount goes through ' +
          '`Intl.NumberFormat`, with the symbol taken from `currency` and the grouping from ' +
          '`locale`; neither is derived from the other, so an Indonesian price read in ' +
          'English stays "Rp 45,000,000" rather than becoming "IDR 45,000,000".\n\n' +
          'The amount is `text.primary`, never the orange accent. Orange belongs to the ' +
          'badge and the call to action; a grid of thirty cards each shouting its price in ' +
          'accent colour is noise rather than hierarchy, so size carries the emphasis and ' +
          'colour stays quiet.\n\n' +
          'A discount percentage is not part of this. It is a `Badge` placed beside the ' +
          'price by whatever is composing them, which keeps this component about the number.',
      },
    },
  },
} satisfies Meta<typeof PriceDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------- matrix */

export const Matrix: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'Three currencies against all five variants, each in a 220px card so the widths ' +
          'are the widths a package grid actually gives them.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        {CURRENCIES.map((currency) => (
          <div
            key={currency}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
          >
            <Caption>{currency}</Caption>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
              {VARIANTS.map((variant) => (
                <div
                  key={variant.key}
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}
                >
                  <Caption>{variant.caption}</Caption>
                  <Cell>
                    <PriceDisplay
                      amount={PRICES[currency].amount}
                      currency={currency}
                      locale="en"
                      {...variantProps(variant.key, PRICES[currency])}
                    />
                  </Cell>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ----------------------------------------------------------------- sizes */

const SIZES: PriceSize[] = ['sm', 'md', 'lg', 'xl'];

export const Sizes: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {SIZES.map((size) => (
          <div
            key={size}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}
          >
            <Caption>{size}</Caption>
            <PriceDisplay
              amount={9800}
              originalAmount={12500}
              currency="MYR"
              locale="en"
              size={size}
              showPerPax
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const LongestCurrencyAtSmallest: Story = {
  args: { amount: 38500000, currency: 'IDR', locale: 'id-ID' },
  parameters: {
    docs: {
      description: {
        story:
          'The hardest case in the set: Indonesian rupiah is the longest string, `sm` is the ' +
          'least room, and the discounted variant asks for two of them at once. The row ' +
          'wraps rather than overflowing, so a narrow card gets a second line instead of a ' +
          'horizontal scrollbar. Every column is shown at 220px, 180px and 140px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', alignItems: 'flex-start' }}>
        {['220px', '180px', '140px'].map((width) => (
          <div
            key={width}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
          >
            <Caption>{width}</Caption>
            {VARIANTS.map((variant) => (
              <Cell key={variant.key} width={width}>
                <PriceDisplay
                  amount={PRICES.IDR.amount}
                  currency="IDR"
                  locale="id-ID"
                  size="sm"
                  {...variantProps(variant.key, PRICES.IDR)}
                />
              </Cell>
            ))}
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------- incomplete data */

export const IncompleteData: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'What arrives from a half-filled agency record. A missing discount simply draws no ' +
          'strike. A discount that is not actually lower, or a plan with no months in it, is ' +
          'a data error rather than a variant: drawing a struck price beside an identical ' +
          'one, or an instalment plan of nothing, would be worse than drawing neither. An ' +
          'amount that is not a number draws nothing at all, because "NaN" is what Intl ' +
          'would otherwise print into a card.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
        {[
          { caption: 'no discount', props: {} },
          { caption: 'original equals price', props: { originalAmount: 9800 } },
          { caption: 'original below price', props: { originalAmount: 8000 } },
          { caption: 'plan with no months', props: { installment: { monthly: 817, months: 0 } } },
          { caption: 'zero price', props: { amount: 0 } },
          { caption: 'amount missing', props: { amount: Number.NaN } },
        ].map((testCase) => (
          <div
            key={testCase.caption}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}
          >
            <Caption>{testCase.caption}</Caption>
            <Cell>
              <PriceDisplay amount={9800} currency="MYR" locale="en" {...testCase.props} />
            </Cell>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------------- in a grid */

export const InAGrid: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'Height consistency, which is what a grid of package cards needs. Variants one to ' +
          'four are a single row whatever they contain, so cards with a discount sit level ' +
          'with cards without one. An instalment plan is genuinely a second line; where a ' +
          'grid mixes the two, the card that composes them pins its price block to the ' +
          'bottom, which is the card’s job rather than this component’s.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--uh-spacing-16)',
          alignItems: 'start',
        }}
      >
        {[
          { caption: 'plain', props: {} },
          { caption: 'discounted', props: { originalAmount: 12500 } },
          { caption: 'per pax', props: { showPerPax: true } },
          { caption: 'from', props: { prefix: 'from' as const } },
        ].map((testCase) => (
          <Cell key={testCase.caption} width="auto">
            <Caption>{testCase.caption}</Caption>
            <PriceDisplay amount={9800} currency="MYR" locale="en" {...testCase.props} />
          </Cell>
        ))}
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------ composed with Badge */

export const WithDiscountBadge: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'The discount percentage is a `Badge` beside the price, not a part of it. That is ' +
          'where the orange lives: one accent on the surface, on the thing that is meant to ' +
          'be noticed, while the number itself stays quiet.\n\n' +
          'The variant is `secondary` rather than `accent`: Badge names its variants after ' +
          'the action scale, and `secondary` is the one that resolves to the orange tokens.',
      },
    },
  },
  render: () => (
    <Page>
      <Cell width="260px">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--uh-spacing-8)' }}>
          <PriceDisplay amount={9800} originalAmount={12500} currency="MYR" locale="en" size="lg" />
          <Badge variant="secondary" size="md">
            22% off
          </Badge>
        </div>
      </Cell>
    </Page>
  ),
};

/* ------------------------------------------------------------- dark mode */

export const DarkMode: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
        {VARIANTS.map((variant) => (
          <div
            key={variant.key}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}
          >
            <Caption>{variant.caption}</Caption>
            <Cell>
              <PriceDisplay
                amount={PRICES.MYR.amount}
                currency="MYR"
                locale="en"
                size="lg"
                {...variantProps(variant.key, PRICES.MYR)}
              />
            </Cell>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- text expansion */

const MS: Partial<PriceDisplayLabels> = {
  from: 'dari',
  perPax: 'setiap orang',
  perMonth: '/bulan',
  or: 'atau',
  originalPrice: 'Harga asal',
};

const ID: Partial<PriceDisplayLabels> = {
  from: 'mulai',
  perPax: 'per orang',
  perMonth: '/bulan',
  or: 'atau',
  originalPrice: 'Harga asli',
};

export const TextExpansion: Story = {
  args: { amount: 9800, currency: 'MYR', locale: 'en' },
  parameters: {
    docs: {
      description: {
        story:
          'The number does not grow; the words around it do. Malay "setiap orang" is more ' +
          'than twice the length of "per pax", which is why the per-pax label sits on the ' +
          'price’s baseline in a wrapping row rather than being pinned beside it.\n\n' +
          'Each column is 220px, and the locale is held at ms-MY throughout so the grouping ' +
          'does not move while the wording does.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
        {[
          { lang: 'en', labels: undefined, locale: 'en' },
          { lang: 'ms', labels: MS, locale: 'ms-MY' },
          { lang: 'id', labels: ID, locale: 'id-ID' },
        ].map((copy) => (
          <div
            key={copy.lang}
            lang={copy.lang}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
          >
            <Caption>{copy.lang}</Caption>
            {VARIANTS.map((variant) => (
              <Cell key={variant.key}>
                <PriceDisplay
                  amount={PRICES.MYR.amount}
                  currency="MYR"
                  locale={copy.locale}
                  {...(copy.labels ? { labels: copy.labels } : {})}
                  {...variantProps(variant.key, PRICES.MYR)}
                />
              </Cell>
            ))}
          </div>
        ))}
      </div>
    </Page>
  ),
};
