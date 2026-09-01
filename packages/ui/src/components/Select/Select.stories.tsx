import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Select, type SelectOption } from './Select.js';
import type { FieldSize } from '../Field/FieldShell.js';

const SIZES: FieldSize[] = ['sm', 'md', 'lg'];

const COUNTRIES: SelectOption[] = [
  { value: 'MY', label: 'Malaysia' },
  { value: 'ID', label: 'Indonesia' },
  { value: 'SG', label: 'Singapore' },
  { value: 'BN', label: 'Brunei Darussalam' },
];

/** Long enough to prove the 320px cap and the scroll inside it. */
const MANY: SelectOption[] = [
  ...COUNTRIES,
  { value: 'TH', label: 'Thailand' },
  { value: 'PH', label: 'Philippines' },
  { value: 'VN', label: 'Vietnam' },
  { value: 'IN', label: 'India' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'EG', label: 'Egypt' },
  { value: 'TR', label: 'Türkiye' },
  { value: 'MA', label: 'Morocco', disabled: true },
];

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
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The listbox is portalled to the body so an overflow-hidden ancestor cannot clip ' +
          'it. That escapes inherited attributes too, so `data-theme` and `lang` are carried ' +
          'across explicitly — otherwise a dropdown inside a dark panel would open in light.',
      },
    },
  },
  args: { label: 'Nationality', options: COUNTRIES },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const STATES = [
  { key: 'default', label: 'Default', props: {} },
  { key: 'hover', label: 'Hover', props: {}, pseudo: 'pseudo-hover-all' },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-within-all' },
  { key: 'selected', label: 'Selected', props: { defaultValue: 'MY' } },
  { key: 'disabled', label: 'Disabled', props: { disabled: true, defaultValue: 'MY' } },
  {
    key: 'error',
    label: 'Error',
    props: { errorMessage: 'Select your nationality' },
  },
  {
    key: 'success',
    label: 'Success',
    props: { defaultValue: 'MY', successMessage: 'Nationality confirmed' },
  },
] as const;

export const StateMatrix: Story = {
  render: () => (
    <Page>
      {SIZES.map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-40)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
              gap: 'var(--uh-spacing-20)',
            }}
          >
            {STATES.map((state) => (
              <div key={`${size}-${state.key}`}>
                <Caption>{state.label}</Caption>
                <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
                  <Select
                    size={size}
                    label="Nationality"
                    options={COUNTRIES}
                    className={'pseudo' in state ? state.pseudo : undefined}
                    {...state.props}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </Page>
  ),
};

/**
 * The two states that only exist while the list is open. Both replace the
 * options rather than sitting among them: a listbox may only contain options.
 */
export const OpenStates: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(17rem, 1fr))',
          gap: 'var(--uh-spacing-24)',
          minHeight: '24rem',
        }}
      >
        <div>
          <Caption>Open — press to expand</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Select label="Nationality" options={MANY} defaultValue="SG" />
          </div>
          <p
            className="uh-type-web-body-s"
            style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-8)' }}
          >
            15 options, capped at 320px with scroll inside. Morocco is disabled and is skipped by
            the arrow keys.
          </p>
        </div>

        <div>
          <Caption>Loading — async fetch</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Select label="Nationality" options={[]} loading />
          </div>
        </div>

        <div>
          <Caption>Empty — searchable, no match</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Select label="Nationality" options={COUNTRIES} searchable />
          </div>
          <p
            className="uh-type-web-body-s"
            style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-8)' }}
          >
            Type something that matches nothing, e.g. &ldquo;zzz&rdquo;.
          </p>
        </div>
      </div>
    </Page>
  ),
};

/** Options arrive after a delay, the way a real fetch behaves. */
function AsyncSelect() {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOptions(MANY);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Select
      label="Nationality"
      options={options}
      loading={loading}
      searchable
      clearable
      helperText="Loads 1.5s after the story mounts"
    />
  );
}

export const AsyncLoading: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '20rem', minHeight: '24rem' }}>
        <AsyncSelect />
      </div>
    </Page>
  ),
};

/**
 * The reason the listbox is portalled. Both selects sit inside a card with
 * `overflow: hidden`; without the portal the dropdown would be cut at the
 * card's edge.
 */
export const EscapesOverflow: Story = {
  render: () => (
    <Page>
      <div
        style={{
          maxWidth: '26rem',
          height: '10rem',
          overflow: 'hidden',
          padding: 'var(--uh-spacing-16)',
          border: 'var(--uh-border-width-1) solid var(--uh-color-border-default)',
          borderRadius: 'var(--uh-radius-lg)',
          background: 'var(--uh-color-bg-surface)',
        }}
      >
        <Caption>A card with overflow: hidden and a fixed height</Caption>
        <div style={{ marginTop: 'var(--uh-spacing-12)' }}>
          <Select label="Nationality" options={MANY} clearable />
        </div>
      </div>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
          minHeight: '24rem',
        }}
      >
        <div>
          <Caption>Open in dark</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Select label="Nationality" options={MANY} defaultValue="ID" clearable />
          </div>
        </div>
        <div>
          <Caption>Error</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Select
              label="Nationality"
              options={COUNTRIES}
              errorMessage="Select your nationality"
            />
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Select.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<Select ... />` JSX instead of a render function body.
 */

export const Basic: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Nationality', options: COUNTRIES, required: true },
};

export const Searchable: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Nationality',
    options: MANY,
    searchable: true,
    clearable: true,
    helperText: 'Type to filter the list',
  },
};

export const WithError: Story = {
  parameters: { layout: 'centered' },
  args: { label: 'Nationality', options: COUNTRIES, errorMessage: 'Select your nationality' },
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  { code: 'en', label: 'English', field: 'Nationality', helper: 'As shown on your passport' },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    field: 'Kewarganegaraan',
    helper: 'Seperti dalam pasport anda',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    field: 'Kewarganegaraan',
    helper: 'Seperti tertera di paspor Anda',
  },
] as const;

/**
 * The option labels stay in English because that is how the country list is
 * stored; the field label and helper text are what translate. "Brunei
 * Darussalam" is the long one, and the trigger truncates rather than growing.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Field width fixed at 280px. Each column carries its own <code>lang</code>, which the
        portalled listbox inherits explicitly so option text picks up the same line-height
        correction.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--uh-spacing-24)',
          flexWrap: 'wrap',
          minHeight: '22rem',
        }}
      >
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
              <Select
                label={locale.field}
                options={COUNTRIES}
                required
                helperText={locale.helper}
                placeholder="—"
              />
              <Select
                label={locale.field}
                options={COUNTRIES}
                defaultValue="BN"
                clearable
                helperText={locale.helper}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
