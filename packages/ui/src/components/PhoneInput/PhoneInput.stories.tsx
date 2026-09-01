import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { PhoneInput } from './PhoneInput.js';
import { COUNTRY_RULES, type PhoneCountry } from './phone.js';
import type { FieldSize } from '../Field/FieldShell.js';

const COUNTRIES: PhoneCountry[] = ['MY', 'ID', 'SG', 'BN', 'other'];

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
          'Four markets and a manual option, so the picker is a popover rather than a ' +
          'searchable dropdown. Whatever gets typed or pasted, the value emitted is always ' +
          'E.164 — the display formatting is per country, the stored value is not.',
      },
    },
  },
  args: { label: 'Mobile number' },
} satisfies Meta<typeof PhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The story the brief asks for: one Malaysian mobile entered four ways, each
 * landing on the same stored value.
 */
export const Normalisation: Story = {
  name: 'One number, four formats',
  render: () => {
    const INPUTS = ['0123456789', '+60123456789', '60123456789', '012-345 6789'];

    function Row({ raw }: { raw: string }) {
      const [value, setValue] = useState('');
      return (
        <tr>
          <td style={{ padding: 'var(--uh-spacing-8)' }}>
            <code className="uh-type-web-caption">{raw}</code>
          </td>
          <td style={{ padding: 'var(--uh-spacing-8)', width: '18rem' }}>
            <PhoneInput label="Mobile number" value={value} onChange={setValue} />
          </td>
          <td style={{ padding: 'var(--uh-spacing-8)' }}>
            <span
              className="uh-type-numeric-table"
              style={{
                color:
                  value === '+60123456789'
                    ? 'var(--uh-color-feedback-success-text)'
                    : 'var(--uh-color-text-tertiary)',
              }}
            >
              {value || '(paste the value on the left)'}
            </span>
          </td>
        </tr>
      );
    }

    return (
      <Page>
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-16)' }}
        >
          Paste each string on the left into the field beside it. All four are the same Malaysian
          mobile, and all four have to come out as <code>+60123456789</code>.
        </p>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
                <Caption>pasted</Caption>
              </th>
              <th style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
                <Caption>field</Caption>
              </th>
              <th style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
                <Caption>emitted value</Caption>
              </th>
            </tr>
          </thead>
          <tbody>
            {INPUTS.map((raw) => (
              <Row key={raw} raw={raw} />
            ))}
          </tbody>
        </table>
      </Page>
    );
  },
};

export const Countries: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        {COUNTRIES.map((country) => (
          <div key={country}>
            <Caption>
              {country === 'other'
                ? 'Other, manual code'
                : `${COUNTRY_RULES[country].name} +${COUNTRY_RULES[country].dial}`}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <PhoneInput
                label="Mobile number"
                defaultCountry={country}
                {...(country === 'other'
                  ? { defaultValue: '' }
                  : { defaultValue: `+${COUNTRY_RULES[country].dial}${sample(country)}` })}
                helperText={country === 'other' ? 'Enter the country code yourself' : undefined}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

function sample(country: Exclude<PhoneCountry, 'other'>): string {
  return { MY: '123456789', ID: '81234567890', SG: '91234567', BN: '7123456' }[country];
}

export const StateMatrix: Story = {
  render: () => (
    <Page>
      {(['sm', 'md', 'lg'] as FieldSize[]).map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-32)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
              gap: 'var(--uh-spacing-20)',
            }}
          >
            {(
              [
                ['Empty', {}],
                ['Filled', { defaultValue: '+60123456789' }],
                ['Hover', { defaultValue: '+60123456789', className: 'pseudo-hover-all' }],
                ['Focus', { defaultValue: '+60123456789', className: 'pseudo-focus-within-all' }],
                ['Required', { defaultValue: '+60123456789', required: true }],
                ['Error', { defaultValue: '+601', errorMessage: 'Number is too short' }],
                ['Disabled', { defaultValue: '+60123456789', disabled: true }],
                ['Read only', { defaultValue: '+60123456789', readOnly: true }],
              ] as const
            ).map(([label, props]) => (
              <div key={label}>
                <Caption>{label}</Caption>
                <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
                  <PhoneInput label="Mobile number" size={size} {...props} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
          minHeight: '22rem',
        }}
      >
        <div>
          <Caption>Open the picker</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <PhoneInput label="Mobile number" defaultValue="+60123456789" />
          </div>
        </div>
        <div>
          <Caption>Error</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <PhoneInput
              label="Mobile number"
              defaultValue="+601"
              errorMessage="Number is too short"
            />
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
    field: 'Mobile number',
    helper: 'We send trip updates here',
    country: 'Country',
    other: 'Other',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    field: 'Nombor telefon bimbit',
    helper: 'Kemas kini perjalanan dihantar ke sini',
    country: 'Negara',
    other: 'Lain-lain',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    field: 'Nomor telepon seluler',
    helper: 'Pembaruan perjalanan dikirim ke sini',
    country: 'Negara',
    other: 'Lainnya',
  },
] as const;

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Fixed 280px column. The picker takes a fixed bite out of the field, so a longer label and
        helper are where the squeeze shows. Brunei is selected because +673 is the widest dial code.
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
                gap: 'var(--uh-spacing-16)',
                marginTop: 'var(--uh-spacing-8)',
              }}
            >
              <PhoneInput
                label={locale.field}
                defaultValue="+60123456789"
                helperText={locale.helper}
                countryLabel={(name) => `${locale.country}: ${name}`}
                otherLabel={locale.other}
                required
              />
              <PhoneInput
                label={locale.field}
                defaultValue="+6737123456"
                countryLabel={(name) => `${locale.country}: ${name}`}
                otherLabel={locale.other}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for PhoneInput.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<PhoneInput ... />` JSX instead of a render function
 * body. Kept separate from Normalisation/Countries above, which exist to
 * prove the whole surface works, not to be copied verbatim.
 */

export const Default: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Mobile number', defaultValue: '+60123456789' },
};

export const IndonesianNumber: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Nomor telepon', defaultCountry: 'ID', defaultValue: '+6281234567890' },
};

export const WithErrorMessage: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Mobile number', defaultValue: '+601', errorMessage: 'Number is too short' },
};
