import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Stack } from './Stack.js';

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

function Box({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--uh-spacing-12) var(--uh-spacing-16)',
        borderRadius: 'var(--uh-radius-sm)',
        background: 'var(--uh-color-bg-surface-secondary)',
        border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-default)',
        fontSize: 'var(--uh-typography-web-body-s-font-size)',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Components/Stack',
  component: Stack,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A one-axis flex layout - the primitive every `Patterns/*` screen kept ' +
          'hand-rolling as its own `display: flex; gap: ...px` before this existed. ' +
          '`direction` picks the axis, `gap` maps straight onto the spacing scale (no ' +
          "second enum for the same numbers), and `align`/`justify` are flexbox's own " +
          'terms, not renamed.',
      },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Row: Story = {
  args: { direction: 'row', gap: '12' },
  render: (args) => (
    <Page>
      <Stack {...args}>
        <Box label="One" />
        <Box label="Two" />
        <Box label="Three" />
      </Stack>
    </Page>
  ),
};

export const Column: Story = {
  args: { direction: 'column', gap: '8' },
  render: (args) => (
    <Page>
      <Stack {...args}>
        <Box label="One" />
        <Box label="Two" />
        <Box label="Three" />
      </Stack>
    </Page>
  ),
};

export const SpaceBetween: Story = {
  args: { direction: 'row', justify: 'between', align: 'center' },
  render: (args) => (
    <Page>
      <Stack {...args}>
        <Box label="Left" />
        <Box label="Right" />
      </Stack>
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <Stack direction="column" gap="32">
        {(['row', 'column'] as const).map((direction) => (
          <Stack key={direction} direction="column" gap="8">
            <span
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-secondary)' }}
            >
              direction=&quot;{direction}&quot;
            </span>
            <Stack direction={direction} gap="12" wrap>
              <Box label="One" />
              <Box label="Two" />
              <Box label="Three" />
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Stack direction="row" gap="12">
        <Box label="One" />
        <Box label="Two" />
        <Box label="Three" />
      </Stack>
    </Page>
  ),
};

/**
 * A row-direction Stack must wrap rather than overflow once its children's
 * combined width exceeds the available space - the same test every
 * text-expansion story runs, applied to a layout primitive instead of a
 * label: Malay and Indonesian content is 15-30% longer than English for the
 * same meaning, so the same three-language row is the realistic stress case.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <Stack direction="row" gap="8" wrap>
          <Box label="Confirmed" />
          <Box label="Disahkan" />
          <Box label="Dikonfirmasi" />
        </Stack>
      </div>
    </Page>
  ),
};
