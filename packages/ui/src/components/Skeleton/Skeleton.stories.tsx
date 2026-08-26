import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import {
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  type SkeletonAnimation,
} from './Skeleton.js';

const ANIMATIONS: SkeletonAnimation[] = ['pulse', 'wave', 'none'];

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
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A placeholder for content that is arriving, never a stand-in for content that is ' +
          'missing. An empty result gets an empty state with words in it. The bars are hidden ' +
          'from assistive tech; the preset wrappers carry the announcement, because they are ' +
          'the ones that know what is loading.',
      },
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-24)', maxWidth: '26rem' }}>
        <div>
          <Caption>text, one line</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Skeleton variant="text" />
          </div>
        </div>
        <div>
          <Caption>text, four lines — the last is short, so it reads as prose</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Skeleton variant="text" lines={4} />
          </div>
        </div>
        <div>
          <Caption>circle</Caption>
          <div
            style={{
              display: 'flex',
              gap: 'var(--uh-spacing-12)',
              marginTop: 'var(--uh-spacing-8)',
            }}
          >
            <Skeleton variant="circle" width={24} height={24} />
            <Skeleton variant="circle" width={40} height={40} />
            <Skeleton variant="circle" width={64} height={64} />
          </div>
        </div>
        <div>
          <Caption>rect</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Skeleton variant="rect" height={120} />
          </div>
        </div>
      </div>
    </Page>
  ),
};

export const Animations: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-24)', maxWidth: '26rem' }}>
        {ANIMATIONS.map((animation) => (
          <div key={animation}>
            <Caption>{animation}</Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <Skeleton variant="rect" height={64} animation={animation} />
            </div>
          </div>
        ))}
      </div>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-24)' }}
      >
        Under <code>prefers-reduced-motion</code> both pulse and wave stop and the shape stays flat.
        The wave&rsquo;s sweeping overlay is removed rather than frozen, because a stationary
        gradient would sit on the bar as a permanent bright stripe.
      </p>
    </Page>
  ),
};

export const Presets: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-32)' }}>
        <div>
          <Caption>SkeletonCard — a package tile</Caption>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
              gap: 'var(--uh-spacing-16)',
              marginTop: 'var(--uh-spacing-8)',
              maxWidth: '50rem',
            }}
          >
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>

        <div style={{ maxWidth: '30rem' }}>
          <Caption>SkeletonList — a pilgrim roster</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <SkeletonList rows={4} />
          </div>
        </div>

        <div style={{ maxWidth: '40rem' }}>
          <Caption>SkeletonTable — a payment breakdown</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <SkeletonTable rows={5} columns={4} />
          </div>
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
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '34rem',
        }}
      >
        <SkeletonCard animation="wave" />
        <SkeletonCard animation="pulse" />
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  { code: 'en', label: 'English', card: 'Loading package', list: 'Loading pilgrim list' },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    card: 'Sedang memuatkan pakej',
    list: 'Sedang memuatkan senarai jemaah',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    card: 'Sedang memuat paket',
    list: 'Sedang memuat daftar jemaah',
  },
] as const;

/**
 * A skeleton draws no text either: its translatable surface is the preset's
 * announced label, which is what a screen reader hears instead of the bars.
 * Rendered visibly here so the strings can be reviewed and translated.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        The bars carry no text. What a screen reader hears is the preset&rsquo;s
        <code> label</code>, shown here so it can be reviewed like any other string.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <SkeletonCard label={locale.card} />
            </div>
            <div
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-tertiary)', marginTop: 'var(--uh-spacing-8)' }}
            >
              announced: &ldquo;{locale.card}&rdquo;
            </div>
            <div style={{ marginTop: 'var(--uh-spacing-16)' }}>
              <SkeletonList rows={2} label={locale.list} />
            </div>
            <div
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-tertiary)', marginTop: 'var(--uh-spacing-8)' }}
            >
              announced: &ldquo;{locale.list}&rdquo;
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
