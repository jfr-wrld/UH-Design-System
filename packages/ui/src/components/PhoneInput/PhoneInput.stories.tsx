import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { PhoneInput } from './PhoneInput.js';
import { DEFAULT_COUNTRIES } from './countries.js';
import type { FieldSize } from '../Field/FieldShell.js';

const SIZES: FieldSize[] = ['sm', 'md', 'lg'];

const STATES = [
  { key: 'default', label: 'Default', props: {} },
  { key: 'hover', label: 'Hover', props: {}, pseudo: 'pseudo-hover-all' },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-within-all' },
  { key: 'filled', label: 'Filled', props: { defaultValue: '12-345 6789' } },
  { key: 'disabled', label: 'Disabled', props: { disabled: true, defaultValue: '12-345 6789' } },
  { key: 'readonly', label: 'Read only', props: { readOnly: true, defaultValue: '12-345 6789' } },
  {
    key: 'error',
    label: 'Error',
    props: { defaultValue: '12-34', errorMessage: 'Enter a valid mobile number' },
  },
  {
    key: 'success',
    label: 'Success',
    props: { defaultValue: '12-345 6789', successMessage: 'Number verified by SMS' },
  },
] as const;

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
  title: 'Components/PhoneInput',
  component: PhoneInput,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Country calling code on the left, national number on the right. Flags are real ' +
          'SVGs rather than emoji: regional-indicator emoji have no glyphs in Segoe UI Emoji, ' +
          'so Chrome and Edge on Windows render them as bare letters. The selector follows the ' +
          'APG select-only combobox pattern — focus stays put and aria-activedescendant tracks ' +
          'the active option.',
      },
    },
  },
  args: { label: 'Mobile Number' },
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Matrix({ size }: { size: FieldSize }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
        gap: 'var(--uh-spacing-20)',
      }}
    >
      {STATES.map((state) => (
        <div key={`${size}-${state.key}`}>
          <Caption>{state.label}</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <PhoneInput
              size={size}
              label="Mobile Number"
              placeholder="12-345 6789"
              className={'pseudo' in state ? state.pseudo : undefined}
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
      {SIZES.map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-40)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <Matrix size={size} />
        </section>
      ))}
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Matrix size="md" />
    </Page>
  ),
};

/** The list is open so the flags, names and dial codes can be inspected. */
export const CountryList: Story = {
  parameters: { pseudo: { focusVisible: true } },
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-16)', maxWidth: '22rem' }}>
        <Caption>Press the code on the left, or focus it and press ArrowDown</Caption>
        <PhoneInput
          label="Mobile Number"
          required
          helperText="We send trip updates and departure reminders here"
          placeholder="12-345 6789"
        />
        <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
          {DEFAULT_COUNTRIES.length} countries by default — the markets the platform sells in, the
          pilgrimage destinations, and the origins that actually appear in bookings. Pass your own{' '}
          <code>countries</code> to replace the list entirely.
        </p>
      </div>
    </Page>
  ),
};

export const Countries: Story = {
  name: 'Dial codes and flags',
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
          gap: 'var(--uh-spacing-12)',
        }}
      >
        {DEFAULT_COUNTRIES.map((country) => {
          const { Flag } = country;
          return (
            <div
              key={country.iso2}
              className="uh-type-web-body-s"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--uh-spacing-12)',
                padding: 'var(--uh-spacing-8)',
                border: 'var(--uh-border-width-1) solid var(--uh-color-border-default)',
                borderRadius: 'var(--uh-radius-md)',
              }}
            >
              <span
                className="uh-phone__flag"
                aria-hidden="true"
                style={{ width: 'var(--uh-size-icon-lg)' }}
              >
                <Flag />
              </span>
              <span style={{ flex: '1 1 auto' }}>{country.name}</span>
              <span className="uh-type-numeric-table">{country.dialCode}</span>
            </div>
          );
        })}
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    field: 'Mobile Number',
    helper: 'We send trip updates here',
    selector: 'Country calling code',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    field: 'Nombor Telefon Bimbit',
    helper: 'Kemas kini perjalanan dihantar ke sini',
    selector: 'Kod panggilan negara',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    field: 'Nomor Telepon Seluler',
    helper: 'Pembaruan perjalanan dikirim ke sini',
    selector: 'Kode panggilan negara',
  },
] as const;

/**
 * The country trigger takes a fixed bite out of the field, so a longer label
 * plus a long dial code is where the number would get squeezed. 280px is
 * roughly a form column on a small phone.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Field width fixed at 280px, with the longest dial code in the default list (Bangladesh,
        +880) selected in the second row.
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
                gap: 'var(--uh-spacing-20)',
                marginTop: 'var(--uh-spacing-8)',
              }}
            >
              <PhoneInput
                label={locale.field}
                countryListLabel={locale.selector}
                helperText={locale.helper}
                required
                defaultValue="12-345 6789"
              />
              <PhoneInput
                label={locale.field}
                countryListLabel={locale.selector}
                defaultCountry="BD"
                helperText={locale.helper}
                required
                defaultValue="1712-345678"
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
