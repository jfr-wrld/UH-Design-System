import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { ButtonGroup } from './ButtonGroup.js';
import { Button } from '../Button/Button.js';

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
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Merges adjacent `Button`s into one connected, segmented strip - a pure layout ' +
          "wrapper around this system's own `Button`, not a second implementation of it. " +
          'Only the first and last child keep an outer corner radius; every seam in between ' +
          'draws one shared divider regardless of variant.',
      },
    },
  },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <ButtonGroup label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant, both orientations, a disabled segment, and a two-button group ' +
          '(smallest real case, where first and last are the same element).',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        <ButtonGroup label="Primary group">
          <Button>Day</Button>
          <Button>Week</Button>
          <Button>Month</Button>
        </ButtonGroup>

        <ButtonGroup label="Outline group">
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline" disabled>
            Month
          </Button>
        </ButtonGroup>

        <ButtonGroup label="Two-button group">
          <Button variant="outline">Prev</Button>
          <Button variant="outline">Next</Button>
        </ButtonGroup>

        <ButtonGroup label="Vertical group" orientation="vertical">
          <Button variant="outline" fullWidth>
            Newest
          </Button>
          <Button variant="outline" fullWidth>
            Oldest
          </Button>
          <Button variant="outline" fullWidth>
            Most viewed
          </Button>
        </ButtonGroup>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <ButtonGroup label="Text formatting">
        <Button variant="outline">Bold</Button>
        <Button variant="outline">Italic</Button>
        <Button variant="outline">Underline</Button>
      </ButtonGroup>
    </Page>
  ),
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A longer Indonesian label next to short English ones still fits the group's own " +
          "flex row without breaking the shared strip - each button keeps its own text's " +
          'natural width, same as outside a group.',
      },
    },
  },
  render: () => (
    <Page>
      <ButtonGroup label="Period">
        <Button variant="outline">Hari</Button>
        <Button variant="outline">Minggu ini</Button>
        <Button variant="outline">Bulan ini</Button>
      </ButtonGroup>
    </Page>
  ),
};
