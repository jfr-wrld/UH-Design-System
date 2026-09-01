import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Checkbox } from './Checkbox.js';

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

/** Every state the brief asks for, including all three disabled combinations. */
const STATES = [
  { key: 'unchecked', label: 'Unchecked', props: {} },
  { key: 'checked', label: 'Checked', props: { defaultChecked: true } },
  { key: 'indeterminate', label: 'Indeterminate', props: { indeterminate: true } },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-visible-all' },
  { key: 'error', label: 'Error', props: { error: true } },
  { key: 'disabled', label: 'Disabled, unchecked', props: { disabled: true } },
  {
    key: 'disabled-checked',
    label: 'Disabled, checked',
    props: { disabled: true, defaultChecked: true },
  },
  {
    key: 'disabled-indeterminate',
    label: 'Disabled, indeterminate',
    props: { disabled: true, indeterminate: true },
  },
] as const;

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The box is 20px so a column of options reads as a list, but the pointer target is ' +
          'a full 44px, laid over the box rather than inflating it. The focus ring sits on ' +
          'the box: a ring around the whole label would be a large empty rectangle that says ' +
          'nothing about what is focused.',
      },
    },
  },
  args: { label: 'Travel insurance' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

function Matrix({ withDescription }: { withDescription?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gap: 'var(--uh-spacing-20)',
      }}
    >
      {STATES.map((state) => (
        <div key={state.key}>
          <Caption>{state.label}</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Checkbox
              label="Travel insurance"
              className={'pseudo' in state ? state.pseudo : undefined}
              {...(withDescription
                ? { description: 'Covers medical costs and trip cancellation' }
                : {})}
              {...state.props}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const StateMatrix: Story = {
  render: () => (
    <Page>
      <section style={{ marginBottom: 'var(--uh-spacing-40)' }}>
        <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
          Label only
        </h3>
        <Matrix />
      </section>
      <section>
        <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
          With description
        </h3>
        <Matrix withDescription />
      </section>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Matrix withDescription />
    </Page>
  ),
};

/**
 * The real reason indeterminate exists: a parent that is neither all-on nor
 * all-off. The parent drives the children, and reflects them back.
 */
export const ParentAndChildren: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '24rem' }}>
        <Caption>Trip add-ons</Caption>
        <div style={{ marginTop: 'var(--uh-spacing-12)' }}>
          <Checkbox label="All add-ons" indeterminate description="Two of three selected" />
          <div
            style={{
              display: 'grid',
              gap: 'var(--uh-spacing-4)',
              marginTop: 'var(--uh-spacing-8)',
              paddingInlineStart: 'var(--uh-spacing-32)',
            }}
          >
            <Checkbox label="Travel insurance" defaultChecked />
            <Checkbox label="Extra baggage allowance" defaultChecked />
            <Checkbox label="Airport transfer" />
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    terms: 'I agree to the booking terms',
    description: 'Cancellation and refund rules apply from the date of deposit',
    insurance: 'Travel insurance',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    terms: 'Saya bersetuju dengan terma tempahan',
    description: 'Peraturan pembatalan dan bayaran balik terpakai dari tarikh deposit',
    insurance: 'Insurans perjalanan',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    terms: 'Saya menyetujui ketentuan pemesanan',
    description: 'Aturan pembatalan dan pengembalian dana berlaku sejak tanggal uang muka',
    insurance: 'Asuransi perjalanan',
  },
] as const;

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Fixed 280px column. The box must stay aligned to the first line of the label when the text
        wraps, not drift to the middle of the block.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div
              style={{
                display: 'grid',
                gap: 'var(--uh-spacing-12)',
                marginTop: 'var(--uh-spacing-8)',
              }}
            >
              <Checkbox label={locale.terms} description={locale.description} defaultChecked />
              <Checkbox label={locale.insurance} />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Checkbox.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<Checkbox ... />` JSX instead of a render function body.
 * Kept separate from StateMatrix/ParentAndChildren above, which exist to
 * prove the whole surface works, not to be copied verbatim.
 */

export const Unchecked: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Travel insurance' },
};

export const Checked: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Travel insurance', defaultChecked: true },
};

export const Indeterminate: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'All add-ons', indeterminate: true, description: 'Two of three selected' },
};
