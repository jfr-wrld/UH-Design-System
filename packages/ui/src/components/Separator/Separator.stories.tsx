import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Separator } from './Separator.js';

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

const meta = {
  title: 'Components/Separator',
  component: Separator,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A thin line separating content - horizontal or vertical, `role="separator"` by ' +
          'default (real structure), or `decorative` when the line is purely visual.',
      },
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <p className="uh-type-web-body-m">Package details</p>
        <Separator style={{ margin: 'var(--uh-spacing-16) 0' }} />
        <p className="uh-type-web-body-m">Cancellation policy</p>
      </div>
    </Page>
  ),
};

export const Vertical: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A vertical separator needs a parent with a real height to stretch into - a flex ' +
          "row here, matching the separator's own `align-self: stretch`.",
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--uh-spacing-16)',
          height: '48px',
        }}
      >
        <span className="uh-type-web-body-m">9 hari</span>
        <Separator orientation="vertical" />
        <span className="uh-type-web-body-m">4 bintang</span>
        <Separator orientation="vertical" />
        <span className="uh-type-web-body-m">Makkah &amp; Madinah</span>
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Horizontal and vertical, real (`role="separator"`) and `decorative` side by side - ' +
          'visually identical, the difference is only in the accessibility tree.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        <div style={{ maxWidth: '320px' }}>
          <p className="uh-type-web-label">Real (default)</p>
          <Separator style={{ margin: 'var(--uh-spacing-8) 0' }} />
        </div>
        <div style={{ maxWidth: '320px' }}>
          <p className="uh-type-web-label">Decorative</p>
          <Separator decorative style={{ margin: 'var(--uh-spacing-8) 0' }} />
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--uh-spacing-16)',
            height: '32px',
          }}
        >
          <span className="uh-type-web-label">Vertical, real</span>
          <Separator orientation="vertical" />
          <span className="uh-type-web-label">Vertical, decorative</span>
          <Separator orientation="vertical" decorative />
          <span className="uh-type-web-label">end</span>
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '320px' }}>
        <p className="uh-type-web-body-m">Package details</p>
        <Separator style={{ margin: 'var(--uh-spacing-16) 0' }} />
        <p className="uh-type-web-body-m">Cancellation policy</p>
      </div>
    </Page>
  ),
};
