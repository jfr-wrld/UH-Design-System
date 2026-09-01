import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Grid } from './Grid.js';

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

function Cell({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: 'var(--uh-spacing-16)',
        borderRadius: 'var(--uh-radius-sm)',
        background: 'var(--uh-color-bg-surface-secondary)',
        border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-default)',
        fontSize: 'var(--uh-typography-web-body-s-font-size)',
        textAlign: 'center',
      }}
    >
      {label}
    </div>
  );
}

const meta = {
  title: 'Components/Grid',
  component: Grid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "`Stack`'s two-axis sibling: equal-width `columns`, a spacing-scale `gap`. " +
          'Column count is a plain number, not a responsive object - this component does ' +
          'not decide breakpoints for the app that uses it (see Troubleshooting -> ' +
          '"Komponen tidak responsif"); pass a different number from the ' +
          "consumer's own `useMediaQuery` check if the count needs to change per breakpoint.",
      },
    },
  },
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ThreeColumns: Story = {
  args: { columns: 3, gap: '16' },
  render: (args) => (
    <Page>
      <Grid {...args}>
        <Cell label="One" />
        <Cell label="Two" />
        <Cell label="Three" />
        <Cell label="Four" />
        <Cell label="Five" />
        <Cell label="Six" />
      </Grid>
    </Page>
  ),
};

export const SplitRowColumnGap: Story = {
  args: { columns: 2, rowGap: '32', columnGap: '8' },
  render: (args) => (
    <Page>
      <Grid {...args}>
        <Cell label="A" />
        <Cell label="B" />
        <Cell label="C" />
        <Cell label="D" />
      </Grid>
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        {[2, 3, 4].map((columns) => (
          <div
            key={columns}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
          >
            <span
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-secondary)' }}
            >
              columns={columns}
            </span>
            <Grid columns={columns} gap="12">
              {Array.from({ length: columns * 2 }, (_, index) => (
                <Cell key={index} label={`${index + 1}`} />
              ))}
            </Grid>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Grid columns={3} gap="16">
        <Cell label="One" />
        <Cell label="Two" />
        <Cell label="Three" />
      </Grid>
    </Page>
  ),
};

/**
 * Cell content in Malay and Indonesian runs 15-30% longer than English -
 * each cell must hold that without breaking the column grid, since `Grid`
 * fixes column count, not column width.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <Grid columns={3} gap="8">
          <Cell label="Confirmed" />
          <Cell label="Disahkan" />
          <Cell label="Dikonfirmasi" />
        </Grid>
      </div>
    </Page>
  ),
};
