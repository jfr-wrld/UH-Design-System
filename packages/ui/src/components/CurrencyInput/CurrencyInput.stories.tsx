import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { CurrencyInput } from './CurrencyInput.js';
import { formatMoney, type Currency } from '../../lib/money.js';
import type { FieldSize } from '../Field/FieldShell.js';

const CURRENCIES: Currency[] = ['MYR', 'IDR', 'SGD'];
const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ms-MY', label: 'Bahasa Melayu' },
  { code: 'id-ID', label: 'Bahasa Indonesia' },
] as const;

/** A realistic amount per currency, so the widths are the real widths. */
const AMOUNT: Record<Currency, number> = { MYR: 12500, IDR: 45000000, SGD: 4200 };

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

const meta = {
  title: 'Components/CurrencyInput',
  component: CurrencyInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The symbol comes from `currency`; the group separator comes from `locale`. They ' +
          'are never derived from each other, so an Indonesian price read in English stays ' +
          'Rp. Intl’s own `style: "currency"` cannot do this — it takes the symbol from the ' +
          'locale and would print "IDR 45,000,000".',
      },
    },
  },
  args: { label: 'Package price', currency: 'MYR' },
} satisfies Meta<typeof CurrencyInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The combination that matters. Reading down a column shows one currency keeping
 * its symbol across three languages; reading across a row shows one language
 * regrouping three different currencies.
 */
export const CurrencyLocaleMatrix: Story = {
  name: 'Matrix: 3 currency x 3 locale',
  render: () => (
    <Page>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '58rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
              <Caption>currency \ locale</Caption>
            </th>
            {LOCALES.map((locale) => (
              <th key={locale.code} style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
                <Caption>
                  {locale.label} · {locale.code}
                </Caption>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CURRENCIES.map((currency) => (
            <tr key={currency}>
              <td style={{ padding: 'var(--uh-spacing-8)', verticalAlign: 'top' }}>
                <code className="uh-type-web-caption">{currency}</code>
              </td>
              {LOCALES.map((locale) => (
                <td
                  key={locale.code}
                  lang={locale.code}
                  style={{ padding: 'var(--uh-spacing-8)', verticalAlign: 'top', width: '17rem' }}
                >
                  <CurrencyInput
                    label="Package price"
                    currency={currency}
                    locale={locale.code}
                    defaultValue={AMOUNT[currency]}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-24)' }}
      >
        IDR is the longest: eight digits plus two separators. It is shown at 45,000,000 rather than
        a token amount so the field is tested at the width it will really carry.
      </p>
    </Page>
  ),
};

export const States: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        {(
          [
            ['Empty', {}],
            ['Filled', { defaultValue: 12500 }],
            ['Hover', { defaultValue: 12500, className: 'pseudo-hover-all' }],
            ['Focus', { defaultValue: 12500, className: 'pseudo-focus-within-all' }],
            ['Required', { defaultValue: 12500, required: true }],
            ['Helper text', { defaultValue: 2500, helperText: '20% of the package price' }],
            ['Error', { defaultValue: 100, errorMessage: 'Below the minimum deposit' }],
            ['Disabled', { defaultValue: 12500, disabled: true }],
            ['Read only', { defaultValue: 12500, readOnly: true }],
            ['Small', { defaultValue: 12500, size: 'sm' as FieldSize }],
          ] as const
        ).map(([label, props]) => (
          <div key={label}>
            <Caption>{label}</Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <CurrencyInput label="Package price" currency="MYR" locale="ms-MY" {...props} />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const TypingAndPaste: Story = {
  render: () => {
    function Watched() {
      const [amount, setAmount] = useState<number | null>(12500);
      return (
        <div style={{ display: 'grid', gap: 'var(--uh-spacing-12)', maxWidth: '22rem' }}>
          <CurrencyInput
            label="Package price"
            currency="MYR"
            locale="ms-MY"
            value={amount}
            onChange={setAmount}
            helperText="Per pilgrim, quad sharing"
          />
          <div className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
            value in state:{' '}
            <span className="uh-type-numeric-table">{amount === null ? 'null' : amount}</span> (
            {amount === null ? 'nothing entered' : typeof amount})
          </div>
        </div>
      );
    }
    return (
      <Page>
        <Watched />
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-24)' }}
        >
          Click in: the separators disappear, because grouping under the caret moves it on every
          thousand. Paste <code>Rp 45.000.000</code> or <code>1 234 567</code> and it is read back
          as a number. Clearing the field reports <code>null</code>, not zero, so &ldquo;nothing
          entered&rdquo; stays distinguishable from a free package.
        </p>
      </Page>
    );
  },
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        {CURRENCIES.map((currency) => (
          <div key={currency}>
            <Caption>{currency}</Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <CurrencyInput
                label="Package price"
                currency={currency}
                locale={currency === 'IDR' ? 'id-ID' : 'ms-MY'}
                defaultValue={AMOUNT[currency]}
              />
            </div>
          </div>
        ))}
        <div>
          <Caption>Error</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <CurrencyInput
              label="Deposit"
              currency="MYR"
              locale="ms-MY"
              defaultValue={100}
              errorMessage="Below the minimum deposit"
            />
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const COPY = [
  { code: 'en', label: 'English', field: 'Package price', helper: 'Per pilgrim, quad sharing' },
  {
    code: 'ms-MY',
    label: 'Bahasa Melayu',
    field: 'Harga pakej',
    helper: 'Setiap jemaah, bilik berempat',
  },
  {
    code: 'id-ID',
    label: 'Bahasa Indonesia',
    field: 'Harga paket',
    helper: 'Per jemaah, kamar berempat',
  },
] as const;

/**
 * Label and helper text expand; the amount does not, because it is tabular.
 * IDR is shown in every column so the longest value is tested against the
 * longest copy.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Fixed 280px column, IDR at 45,000,000 in every one. The currency does not follow the
        language: each column shows the same Indonesian price, grouped the way that column&rsquo;s
        reader expects.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {COPY.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div
              style={{
                display: 'grid',
                gap: 'var(--uh-spacing-16)',
                marginTop: 'var(--uh-spacing-8)',
              }}
            >
              <CurrencyInput
                label={locale.field}
                currency="IDR"
                locale={locale.code}
                defaultValue={45000000}
                helperText={locale.helper}
                required
              />
              <div
                className="uh-type-web-caption"
                style={{ color: 'var(--uh-color-text-tertiary)' }}
              >
                formatted: {formatMoney(45000000, 'IDR', locale.code, 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for CurrencyInput.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<CurrencyInput ... />` JSX instead of a render function
 * body. Kept separate from CurrencyLocaleMatrix/States above, which exist to
 * prove the whole surface works, not to be copied verbatim.
 */

export const Default: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Package price', currency: 'MYR', locale: 'ms-MY', defaultValue: 12500 },
};

export const WholeAmountCurrency: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Harga paket', currency: 'IDR', locale: 'id-ID', defaultValue: 45000000 },
};

export const WithErrorMessage: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Deposit',
    currency: 'MYR',
    locale: 'ms-MY',
    defaultValue: 100,
    errorMessage: 'Below the minimum deposit',
  },
};
