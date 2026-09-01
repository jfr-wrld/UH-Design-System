import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ScrollArea } from './ScrollArea.js';

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

const LINES = Array.from({ length: 20 }, (_, index) => `Line ${index + 1} of a long list.`);

function LongList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
      {LINES.map((line) => (
        <p key={line} style={{ margin: 0 }}>
          {line}
        </p>
      ))}
    </div>
  );
}

const meta = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A themed, custom scrollbar around native scroll behaviour - `@base-ui/react` ' +
          '(a peer dependency, never bundled into this package) does the actual ' +
          'pointer/drag/keyboard handling; this component owns the token-driven track ' +
          'and thumb styling. Reach for this only when the default OS scrollbar ' +
          'genuinely does not fit the surface it is in - most scrolling content is ' +
          "better left to the browser's own scrollbar.",
      },
    },
  },
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <Page>
      <div style={{ width: '320px' }}>
        <ScrollArea maxHeight="200px">
          <LongList />
        </ScrollArea>
      </div>
    </Page>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Page>
      <div style={{ width: '320px' }}>
        <ScrollArea orientation="horizontal" maxWidth="320px">
          <div style={{ display: 'flex', gap: 'var(--uh-spacing-8)', width: 'max-content' }}>
            {LINES.map((line) => (
              <div
                key={line}
                style={{
                  padding: 'var(--uh-spacing-12) var(--uh-spacing-16)',
                  background: 'var(--uh-color-bg-surface-sunken)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-default)',
                  borderRadius: 'var(--uh-radius-sm)',
                  whiteSpace: 'nowrap',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ width: '320px' }}>
        <ScrollArea maxHeight="200px">
          <LongList />
        </ScrollArea>
      </div>
    </Page>
  ),
};

/** Malay/Indonesian labels run 15-30% longer than English - a scrollable
    list has to hold that without the track or thumb breaking. */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ width: '320px' }}>
        <ScrollArea maxHeight="160px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
            <p style={{ margin: 0 }}>Booking confirmed. A confirmation email is on its way.</p>
            <p style={{ margin: 0 }}>Tempahan disahkan. E-mel pengesahan sedang dihantar.</p>
            <p style={{ margin: 0 }}>Pemesanan dikonfirmasi. Email konfirmasi sedang dikirim.</p>
            <p style={{ margin: 0 }}>Booking confirmed. A confirmation email is on its way.</p>
            <p style={{ margin: 0 }}>Tempahan disahkan. E-mel pengesahan sedang dihantar.</p>
          </div>
        </ScrollArea>
      </div>
    </Page>
  ),
};
