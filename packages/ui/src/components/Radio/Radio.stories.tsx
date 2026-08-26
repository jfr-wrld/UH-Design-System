import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Radio } from './Radio.js';
import { RadioGroup } from './RadioGroup.js';

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
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A fieldset with a legend, so the group is named natively. Arrow-key navigation and ' +
          'the single tab stop are the browser’s own behaviour for same-name radios, not ' +
          'a reimplementation. `role="radiogroup"` is added only to carry `aria-orientation`.',
      },
    },
  },
  args: { label: 'Payment plan', children: null },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const PLANS = [
  { value: 'full', label: 'Full Payment', description: 'Pay the whole amount today' },
  { value: 'deposit', label: 'Deposit', description: 'Secure your seat with 20% now' },
  { value: 'monthly', label: 'Monthly Installment', description: 'Spread it over six months' },
];

function Plans() {
  return (
    <>
      {PLANS.map((plan) => (
        <Radio
          key={plan.value}
          value={plan.value}
          label={plan.label}
          description={plan.description}
        />
      ))}
    </>
  );
}

export const Vertical: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '24rem' }}>
        <RadioGroup label="Payment plan" defaultValue="deposit" required>
          <Plans />
        </RadioGroup>
      </div>
    </Page>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Page>
      <RadioGroup label="Room sharing" orientation="horizontal" defaultValue="quad">
        <Radio value="double" label="Double" />
        <Radio value="triple" label="Triple" />
        <Radio value="quad" label="Quad" />
      </RadioGroup>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-16)' }}
      >
        The horizontal gap is 24px on purpose: the boxes are 20px and their hit areas are 44px, so
        anything tighter would make neighbouring targets overlap and the wrong option would take the
        tap.
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
          gap: 'var(--uh-spacing-24)',
        }}
      >
        <div>
          <Caption>Unselected and selected</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <RadioGroup label="Payment plan" defaultValue="deposit">
              <Radio value="full" label="Full Payment" />
              <Radio value="deposit" label="Deposit" />
            </RadioGroup>
          </div>
        </div>

        <div>
          <Caption>Focus</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <RadioGroup label="Payment plan" defaultValue="full">
              <Radio value="full" label="Full Payment" className="pseudo-focus-visible-all" />
              <Radio value="deposit" label="Deposit" />
            </RadioGroup>
          </div>
        </div>

        <div>
          <Caption>Error</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <RadioGroup label="Payment plan" required errorMessage="Choose how you want to pay">
              <Radio value="full" label="Full Payment" />
              <Radio value="deposit" label="Deposit" />
            </RadioGroup>
          </div>
        </div>

        <div>
          <Caption>Disabled</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <RadioGroup label="Payment plan" disabled defaultValue="deposit">
              <Radio value="full" label="Full Payment" />
              <Radio value="deposit" label="Deposit" />
            </RadioGroup>
          </div>
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '24rem' }}>
        <RadioGroup
          label="Payment plan"
          defaultValue="monthly"
          required
          helperText="You can change this until the deposit deadline"
        >
          <Plans />
        </RadioGroup>
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    legend: 'Payment plan',
    helper: 'You can change this until the deposit deadline',
    plans: [
      { value: 'full', label: 'Full Payment', description: 'Pay the whole amount today' },
      { value: 'deposit', label: 'Deposit', description: 'Secure your seat with 20% now' },
      { value: 'monthly', label: 'Monthly Installment', description: 'Spread it over six months' },
    ],
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    legend: 'Pelan pembayaran',
    helper: 'Anda boleh menukarnya sehingga tarikh akhir deposit',
    plans: [
      { value: 'full', label: 'Bayaran Penuh', description: 'Bayar keseluruhan jumlah hari ini' },
      { value: 'deposit', label: 'Deposit', description: 'Tempah tempat anda dengan 20% sekarang' },
      { value: 'monthly', label: 'Ansuran Bulanan', description: 'Bahagikan kepada enam bulan' },
    ],
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    legend: 'Rencana pembayaran',
    helper: 'Anda dapat mengubahnya sampai batas waktu uang muka',
    plans: [
      { value: 'full', label: 'Pembayaran Penuh', description: 'Bayar seluruh jumlah hari ini' },
      {
        value: 'deposit',
        label: 'Uang Muka',
        description: 'Amankan kursi Anda dengan 20% sekarang',
      },
      { value: 'monthly', label: 'Cicilan Bulanan', description: 'Bagi menjadi enam bulan' },
    ],
  },
] as const;

/**
 * The three payment plans in all three languages. Indonesian runs longest,
 * and the descriptions wrap, which is where the box would drift out of line
 * with the first line of the label if the alignment were wrong.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Fixed 280px column, each carrying its own <code>lang</code> so wrapping labels and
        descriptions pick up the per-language line-height correction.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <RadioGroup
                label={locale.legend}
                defaultValue="deposit"
                required
                helperText={locale.helper}
              >
                {locale.plans.map((plan) => (
                  <Radio
                    key={plan.value}
                    value={plan.value}
                    label={plan.label}
                    description={plan.description}
                  />
                ))}
              </RadioGroup>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
