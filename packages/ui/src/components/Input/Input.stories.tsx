import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Input, type InputSize } from './Input.js';
import { PhoneInput } from '../PhoneInput/PhoneInput.js';

const SIZES: InputSize[] = ['sm', 'md', 'lg'];

/** The eight states the field has to hold. */
const STATES = [
  { key: 'default', label: 'Default', props: {} },
  /*
   * The `-all` suffix is what makes these reach a descendant: the state lives
   * on .uh-field__control, but className lands on the .uh-field wrapper.
   */
  { key: 'hover', label: 'Hover', props: {}, pseudo: 'pseudo-hover-all' },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-within-all' },
  { key: 'filled', label: 'Filled', props: { defaultValue: 'A1234567' } },
  { key: 'disabled', label: 'Disabled', props: { disabled: true, defaultValue: 'A1234567' } },
  { key: 'readonly', label: 'Read only', props: { readOnly: true, defaultValue: 'A1234567' } },
  {
    key: 'error',
    label: 'Error',
    props: { defaultValue: 'A12', errorMessage: 'Passport number must be 8 characters' },
  },
  {
    key: 'success',
    label: 'Success',
    props: { defaultValue: 'A1234567', successMessage: 'Passport number verified' },
  },
] as const;

/* ------------------------------------------------------------- scaffolding */

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

function PassportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M9 16h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The label always sits above the field. Floating labels look tidy and take the ' +
          'label away the moment someone starts typing — this audience is often reading a ' +
          'passport number off the document while they type it.',
      },
    },
  },
  args: { label: 'Passport Number' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------------------------------------------------------------- matrix */

function Matrix({ size, theme }: { size: InputSize; theme: 'light' | 'dark' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
        gap: 'var(--uh-spacing-20)',
      }}
    >
      {STATES.map((state) => (
        <div key={`${theme}-${size}-${state.key}`}>
          <Caption>{state.label}</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input
              size={size}
              label="Passport Number"
              placeholder="A1234567"
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
          <Matrix size={size} theme="light" />
        </section>
      ))}
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      {SIZES.slice(1, 2).map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-40)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <Matrix size={size} theme="dark" />
        </section>
      ))}
    </Page>
  ),
};

export const Types: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        <Input label="Full Name" type="text" placeholder="Ahmad bin Abdullah" required />
        <Input
          label="Email Address"
          type="email"
          placeholder="ahmad@example.com"
          helperText="Booking confirmation is sent here"
          required
        />
        <Input
          label="Number of Pilgrims"
          type="number"
          defaultValue="2"
          helperText="Adults sharing one room"
        />
        <Input label="Password" type="password" defaultValue="verysecret" />
      </div>

      {/*
       * Answered here rather than in a doc nobody opens: this is where someone
       * looking for "the phone one" will actually be.
       */}
      <div
        style={{
          maxWidth: '34rem',
          marginTop: 'var(--uh-spacing-32)',
          padding: 'var(--uh-spacing-16)',
          border: 'var(--uh-border-width-1) solid var(--uh-color-feedback-info-border-strong)',
          borderRadius: 'var(--uh-radius-md)',
          background: 'var(--uh-color-feedback-info-bg)',
        }}
      >
        {/* feedback.info.text, not text.tertiary: neutral-500 drops to 4.37:1
            on this tinted ground even though it clears 4.5:1 on white. */}
        <div
          className="uh-type-web-overline"
          style={{ color: 'var(--uh-color-feedback-info-text)' }}
        >
          There is no type=&quot;tel&quot;
        </div>
        <p
          className="uh-type-web-body-s"
          style={{ color: 'var(--uh-color-feedback-info-text)', margin: 'var(--uh-spacing-8) 0' }}
        >
          Every phone number this platform collects crosses a border, so the country code is
          structured data, not a prefix typed into a free-text field. Reach for{' '}
          <code>PhoneInput</code>:
        </p>
        <div style={{ maxWidth: '20rem' }}>
          {/* No placeholder needed: it shows the selected country's own format. */}
          <PhoneInput label="Mobile Number" required />
        </div>
      </div>
    </Page>
  ),
};

export const Adornments: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        <div>
          <Caption>Left icon</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input label="Passport Number" leftIcon={<PassportIcon />} placeholder="A1234567" />
          </div>
        </div>
        <div>
          <Caption>Clearable</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input label="Passport Number" clearable defaultValue="A1234567" />
          </div>
        </div>
        <div>
          <Caption>Password toggle</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input label="Password" type="password" defaultValue="verysecret" />
          </div>
        </div>
        <div>
          <Caption>Counter</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input
              label="Special Requests"
              maxLength={40}
              defaultValue="Wheelchair access at the airport"
              helperText="Shared with your travel agency"
            />
          </div>
        </div>
        <div>
          <Caption>Clearable + counter + left icon</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Input
              label="Emergency Contact"
              leftIcon={<PassportIcon />}
              clearable
              maxLength={20}
              defaultValue="Fatimah binti Ali"
              required
            />
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const EXPANSION = [
  { en: 'Passport Number', ms: 'Nombor Pasport', id: 'Nomor Paspor' },
  { en: 'Departure Date', ms: 'Tarikh Berlepas', id: 'Tanggal Keberangkatan' },
  { en: 'Emergency Contact', ms: 'Hubungan Kecemasan', id: 'Kontak Darurat' },
] as const;

const HELPER = {
  en: 'As printed on your passport',
  ms: 'Seperti tercetak pada pasport anda',
  id: 'Seperti tertera pada paspor Anda',
} as const;

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'id', label: 'Bahasa Indonesia' },
] as const;

/**
 * Fields are pinned to 280px, which is roughly a form column on a small phone.
 * Malay and Indonesian labels run longer than English, so this is where a label
 * would wrap awkwardly or collide with the required asterisk if it were going to.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Field width fixed at 280px. Each column carries its own <code>lang</code>, so labels and
        helper text that wrap pick up the per-language line-height correction.
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
              {EXPANSION.map((row) => (
                <Input
                  key={row.en}
                  label={row[locale.code]}
                  required
                  placeholder="A1234567"
                  helperText={HELPER[locale.code]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
