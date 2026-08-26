import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Spinner } from './Spinner.js';
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

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One spinner, used everywhere. Button and Select previously carried their own copy ' +
          'of the same SVG; both now render this with `decorative` so the busy state is ' +
          'announced once, by whichever component knows what is loading.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sizes: Story = {
  render: () => (
    <Page>
      <Caption>sm, md, lg</Caption>
      <div
        style={{
          display: 'flex',
          gap: 'var(--uh-spacing-24)',
          alignItems: 'center',
          marginTop: 'var(--uh-spacing-8)',
        }}
      >
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
    </Page>
  ),
};

export const Colours: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-20)' }}>
        <div>
          <Caption>inherit — takes the surrounding text colour</Caption>
          <div
            style={{
              display: 'flex',
              gap: 'var(--uh-spacing-12)',
              alignItems: 'center',
              marginTop: 'var(--uh-spacing-8)',
              color: 'var(--uh-color-text-secondary)',
            }}
          >
            <Spinner size="md" />
            <span className="uh-type-web-body-s">Checking seat availability</span>
          </div>
        </div>

        <div>
          <Caption>primary</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Spinner size="md" color="primary" />
          </div>
        </div>

        <div>
          <Caption>white — for a saturated fill</Caption>
          <div
            style={{
              display: 'inline-flex',
              marginTop: 'var(--uh-spacing-8)',
              padding: 'var(--uh-spacing-12)',
              borderRadius: 'var(--uh-radius-md)',
              background: 'var(--uh-color-action-primary-default)',
            }}
          >
            <Spinner size="md" color="white" />
          </div>
        </div>
      </div>
    </Page>
  ),
};

export const InsideAControl: Story = {
  render: () => (
    <Page>
      <Caption>Button renders the same component, decorative</Caption>
      <div
        style={{ display: 'flex', gap: 'var(--uh-spacing-12)', marginTop: 'var(--uh-spacing-8)' }}
      >
        <Button loading loadingLabel="Processing payment">
          Continue to Payment
        </Button>
        <Button variant="outline" loading>
          View Package Details
        </Button>
      </div>
    </Page>
  ),
};

export const ReducedMotion: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', alignItems: 'center' }}>
        <Spinner size="lg" color="primary" />
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)' }}
        >
          Under <code>prefers-reduced-motion</code> the arc stops turning. A frozen ring is a poor
          visual on its own, which is why every use pairs it with words: the announced label here,
          the hidden label in Button, the status row in Select. Motion is never the only signal that
          something is happening.
        </p>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', alignItems: 'center' }}>
        <Spinner size="sm" />
        <Spinner size="md" color="primary" />
        <Spinner size="lg" />
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  { code: 'en', label: 'English', text: 'Loading packages' },
  { code: 'ms', label: 'Bahasa Melayu', text: 'Sedang memuatkan pakej' },
  { code: 'id', label: 'Bahasa Indonesia', text: 'Sedang memuat daftar paket' },
] as const;

/**
 * A spinner draws no text, so its translatable surface is the announced label.
 * It is normally read out and never seen; this story renders it visibly so it
 * can be reviewed and translated, and shows the same string used as visible
 * copy beside the spinner, which is the pattern the reduced-motion note asks
 * for anyway.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        The <code>label</code> prop is announced, not drawn. It is shown here so it can be reviewed
        like any other string.
      </p>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--uh-spacing-12)',
                marginTop: 'var(--uh-spacing-8)',
                padding: 'var(--uh-spacing-12)',
                border: 'var(--uh-border-width-1) dashed var(--uh-color-border-default)',
                borderRadius: 'var(--uh-radius-md)',
              }}
            >
              <Spinner size="md" label={locale.text} />
              <span
                className="uh-type-web-body-s"
                style={{ color: 'var(--uh-color-text-secondary)' }}
              >
                {locale.text}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
