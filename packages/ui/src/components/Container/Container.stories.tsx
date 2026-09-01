import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Container } from './Container.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function Filled({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--uh-spacing-24)',
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
  title: 'Components/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The page-level content column every `Patterns/*` screen was hand-rolling its ' +
          'own top-level width for before this existed - centred, capped at one of four ' +
          'widths, with its own edge padding so it never needs a wrapping ' +
          '`<div style={{padding}}>` around it.',
      },
    },
  },
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <Page>
      <Container {...args}>
        <Filled label='size="lg" (1280px) - the default for most product screens' />
      </Container>
    </Page>
  ),
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Page>
      <Container {...args}>
        <Filled label='size="sm" (640px) - a single form or confirmation flow' />
      </Container>
    </Page>
  ),
};

export const NoPadding: Story = {
  args: { size: 'md', padding: false },
  render: (args) => (
    <Page>
      <Container {...args}>
        <Filled label="padding={false} - edge padding turned off, for when the parent already owns it" />
      </Container>
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Container key={size} size={size}>
            <Filled label={`size="${size}"`} />
          </Container>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Container size="lg">
        <Filled label="Dark theme" />
      </Container>
    </Page>
  ),
};

/**
 * Container's own width never shifts with content length - its job is
 * exactly to hold Malay/Indonesian's 15-30% longer text without the page
 * column itself moving, unlike a component sized by its content.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <Container size="sm">
        <Filled label="Booking confirmed. A confirmation email is on its way. / Tempahan disahkan. E-mel pengesahan sedang dihantar. / Pemesanan dikonfirmasi. Email konfirmasi sedang dikirim." />
      </Container>
    </Page>
  ),
};
