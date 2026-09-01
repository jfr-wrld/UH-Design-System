import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { AspectRatio, type AspectRatioPreset } from './AspectRatio.js';
import COVER from '../PackageCard/fixtures/cover.svg';

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

const fillStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  background: 'var(--uh-color-bg-brand-subtle)',
  color: 'var(--uh-color-text-brand)',
};

function Placeholder({ children }: { children: ReactNode }) {
  return <div style={fillStyle}>{children}</div>;
}

const imgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const meta = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A box that holds its width:height ratio regardless of what is inside - a hotel ' +
          'photo, a video embed - so a card grid never jumps as images load in at their own ' +
          'natural sizes. Pure CSS `aspect-ratio`, nothing to compute in script.',
      },
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <AspectRatio ratio="video">
          <img src={COVER} alt="Package cover" style={imgStyle} />
        </AspectRatio>
      </div>
    </Page>
  ),
};

const PRESETS: AspectRatioPreset[] = [
  'square',
  'video',
  '4/3',
  '3/4',
  '21/9',
  '9/16',
  '3/2',
  '2/3',
];

export const Matrix: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '720px',
        }}
      >
        {PRESETS.map((ratio) => (
          <div key={ratio}>
            <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
              {ratio}
            </p>
            <AspectRatio ratio={ratio}>
              <Placeholder>{ratio}</Placeholder>
            </AspectRatio>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const CustomRatio: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`customRatio` takes a plain number (width divided by height) for a shape none of ' +
          'the named presets cover - `2.5` here, wider than `3/2` but narrower than `21/9`.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <AspectRatio customRatio={2.5}>
          <Placeholder>2.5 : 1</Placeholder>
        </AspectRatio>
      </div>
    </Page>
  ),
};

export const InACardGrid: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same fixed box in every card of a row - a real photo grid never jumps between ' +
          'images that load in at different natural sizes, because every one of them is ' +
          'cropped into an identical shape from the start.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '720px',
        }}
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-default)',
              borderRadius: 'var(--uh-radius-card)',
              overflow: 'clip',
            }}
          >
            <AspectRatio ratio="4/3">
              <img src={COVER} alt="Hotel exterior" style={imgStyle} />
            </AspectRatio>
            <div style={{ padding: 'var(--uh-spacing-12)' }} className="uh-type-web-body-s">
              Hotel {n}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '480px' }}>
        <AspectRatio ratio="video">
          <Placeholder>16 : 9</Placeholder>
        </AspectRatio>
      </div>
    </Page>
  ),
};
