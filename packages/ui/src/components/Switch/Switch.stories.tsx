import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Switch, type SwitchSize } from './Switch.js';

const SIZES: SwitchSize[] = ['sm', 'md'];

const STATES = [
  { key: 'off', label: 'Off', props: {} },
  { key: 'on', label: 'On', props: { defaultChecked: true } },
  { key: 'focus', label: 'Focus', props: {}, pseudo: 'pseudo-focus-visible-all' },
  { key: 'disabled-off', label: 'Disabled, off', props: { disabled: true } },
  { key: 'disabled-on', label: 'Disabled, on', props: { disabled: true, defaultChecked: true } },
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
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A switch applies immediately; a checkbox is submitted with a form. The off track ' +
          'is a mid grey rather than a pale one so the white thumb keeps 4.76:1 against it. ' +
          'The thumb travels over 200ms, from the motion token.',
      },
    },
  },
  args: { label: 'Email me trip updates' },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

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
              gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
              gap: 'var(--uh-spacing-20)',
            }}
          >
            {STATES.map((state) => (
              <div key={`${size}-${state.key}`}>
                <Caption>{state.label}</Caption>
                <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
                  <Switch
                    size={size}
                    label="Email me trip updates"
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

export const WithDescription: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-16)', maxWidth: '24rem' }}>
        <Switch
          label="Email me trip updates"
          description="Departure reminders, itinerary changes and payment receipts"
          defaultChecked
        />
        <Switch label="SMS reminders" description="Charged at your operator's standard rate" />
        <Switch
          label="WhatsApp updates"
          description="Not available for numbers outside Malaysia yet"
          disabled
        />
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
          gap: 'var(--uh-spacing-20)',
        }}
      >
        {STATES.map((state) => (
          <div key={state.key}>
            <Caption>{state.label}</Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <Switch
                label="Email me trip updates"
                className={'pseudo' in state ? state.pseudo : undefined}
                {...state.props}
              />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    text: 'Email me trip updates',
    desc: 'Departure reminders and itinerary changes',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    text: 'E-mel kemas kini perjalanan',
    desc: 'Peringatan berlepas dan perubahan jadual',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    text: 'Kirim pembaruan perjalanan lewat email',
    desc: 'Pengingat keberangkatan dan perubahan jadwal',
  },
] as const;

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <Switch label={locale.text} description={locale.desc} defaultChecked />
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
