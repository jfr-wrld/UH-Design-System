import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Slider, type SliderValueDisplay } from './Slider.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '320px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={{ ...surface, maxWidth: '360px' }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '`@base-ui/react` (a peer dependency, never bundled into this package) owns ' +
          'dragging, keyboard stepping, and value clamping; this component only supplies ' +
          'the token-driven track, indicator, and thumb it renders. `value`/`defaultValue` ' +
          'takes a single number for one thumb or a `[min, max]` array for a two-thumb ' +
          'range - whichever shape is passed first fixes the thumb count for the ' +
          "component's lifetime. `label` is always the accessible name; `showLabel` " +
          'decides whether it also paints. `valueDisplay` controls whether the current ' +
          "value(s) print at all: `'text'` under the track, always visible; " +
          "`'tooltip'` in a small pill above the thumb, only while hovering, " +
          'dragging, or focused.',
      },
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [value, setValue] = useState(50);
  return (
    <Slider
      label="Volume"
      value={value}
      onChange={setValue}
      showLabel
      valueDisplay="text"
      min={0}
      max={100}
    />
  );
}

export const Playground: Story = {
  args: { label: 'Volume', defaultValue: 50 },
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

const VALUE_DISPLAYS: SliderValueDisplay[] = ['none', 'text', 'tooltip'];

export const Matrix: Story = {
  args: { label: 'Value' },
  parameters: {
    docs: {
      description: {
        story:
          'Every valueDisplay mode, plus a two-thumb range slider at the bottom to ' +
          'compare against the single-thumb cases above it.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-40)' }}>
        {VALUE_DISPLAYS.map((valueDisplay) => (
          <Slider
            key={valueDisplay}
            label={`Value display: ${valueDisplay}`}
            defaultValue={40}
            showLabel
            valueDisplay={valueDisplay}
          />
        ))}
        <Slider
          label="Price range"
          defaultValue={[20, 60]}
          min={0}
          max={100}
          showLabel
          valueDisplay="text"
        />
        <Slider label="Disabled" defaultValue={30} showLabel disabled />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { label: 'Volume' },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-40)' }}>
        <Slider label="Volume" defaultValue={65} showLabel valueDisplay="text" />
        <Slider label="Price range" defaultValue={[20, 60]} min={0} max={100} showLabel />
        <Slider label="Disabled" defaultValue={30} showLabel disabled />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Price range' },
  { lang: 'ms', label: 'Julat harga' },
  { lang: 'id', label: 'Rentang harga' },
] as const;

export const TextExpansion: Story = {
  args: { label: 'Price range' },
  parameters: {
    docs: {
      description: {
        story:
          '"Julat harga" and "Rentang harga" both run shorter than the English label here, ' +
          'but the track width is independent of the label either way - only the label ' +
          'line itself needs room to wrap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-40)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Slider
              label={entry.label}
              defaultValue={[20, 60]}
              min={0}
              max={100}
              locale={entry.lang}
              showLabel
              valueDisplay="text"
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Small, individually copy-pasteable examples for Slider.mdx's "Contoh
 * Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<Slider ... />` JSX.
 */

export const VolumeControl: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Volume',
    defaultValue: 50,
    showLabel: true,
    valueDisplay: 'tooltip',
  },
};

export const PriceRange: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Price range',
    defaultValue: [20, 60],
    min: 0,
    max: 100,
    showLabel: true,
    valueDisplay: 'text',
  },
};

export const SteppedRating: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Minimum rating',
    defaultValue: 3,
    min: 1,
    max: 5,
    step: 1,
    showLabel: true,
    valueDisplay: 'text',
  },
};
