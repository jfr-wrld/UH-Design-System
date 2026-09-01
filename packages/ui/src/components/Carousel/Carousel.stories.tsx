import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Carousel, type CarouselSlide } from './Carousel.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '360px',
};

function Page({
  theme = 'light',
  width,
  children,
}: {
  theme?: 'light' | 'dark';
  width?: string;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} style={{ ...surface, maxWidth: width }}>
      {children}
    </div>
  );
}

function Frame({ tone, children }: { tone: { bg: string; on: string }; children: ReactNode }) {
  return (
    <div
      style={{
        aspectRatio: '16 / 9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tone.bg,
        color: tone.on,
        font: 'inherit',
      }}
    >
      {children}
    </div>
  );
}

/*
 * Each solid fill paired with its own "on-solid" token, not one blanket
 * text-inverse for all four - text.inverse is documented for bg.inverse
 * only, and feedback.warning-solid / feedback.success-solid are light
 * enough that white text on them fails contrast outright. Real-browser axe
 * caught this (jsdom's tests disable color-contrast) during the Fase 6
 * Session 2 guard run.
 */
const TONES = [
  { bg: 'var(--uh-color-action-primary-default)', on: 'var(--uh-color-action-primary-label)' },
  { bg: 'var(--uh-color-feedback-warning-solid)', on: 'var(--uh-color-feedback-warning-on-solid)' },
  { bg: 'var(--uh-color-feedback-success-solid)', on: 'var(--uh-color-feedback-success-on-solid)' },
  { bg: 'var(--uh-color-feedback-error-solid)', on: 'var(--uh-color-feedback-error-on-solid)' },
];

function makeSlides(labels: string[]): CarouselSlide[] {
  return labels.map((label, i) => ({
    id: String(i),
    label,
    content: (
      <Frame tone={TONES[i % TONES.length]!}>
        <span className="uh-type-web-label">{label}</span>
      </Frame>
    ),
  }));
}

const EN_SLIDES = makeSlides(['Exterior', 'Lobby', 'Room', 'Pool']);

const meta = {
  title: 'Components/Carousel',
  component: Carousel,
  args: { slides: EN_SLIDES, label: 'Hotel photos' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Built for Fase 6 (see FASE6-REPORT.md) - PackageDetail's photo gallery was " +
          'reported missing and stood in for with one static frame. Swipe comes from CSS ' +
          'scroll-snap on the track, not a touch library; Prev/Next and the dots drive the ' +
          'same track through scrollTo. Does not loop - Prev disables at the first slide, ' +
          'Next at the last.',
      },
    },
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default (first slide), started on the last slide (Next disabled), and a single ' +
          'slide (no controls at all - nothing to switch between).',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        {/*
         * Each row's landmark gets its own label - axe's landmark-unique
         * rule (correctly) flags multiple role="region" landmarks sharing
         * one accessible name on the same page. A single real screen only
         * ever renders one Carousel, so this collision is a Matrix-story
         * artifact, not a component bug - found by the real-browser a11y
         * run in Fase 6 Session 2, jsdom's tests do not check landmarks.
         */}
        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            Default
          </p>
          <Carousel slides={EN_SLIDES} label="Hotel photos - default" />
        </div>

        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            Started on the last slide
          </p>
          <Carousel slides={EN_SLIDES} label="Hotel photos - last slide" defaultIndex={3} />
        </div>

        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            A single slide - no Prev/Next, no dots
          </p>
          <Carousel slides={[EN_SLIDES[0]!]} label="Hotel photos - single slide" />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Carousel slides={EN_SLIDES} label="Hotel photos" defaultIndex={1} />
    </Page>
  ),
};

const LOCALE_SLIDES = {
  en: EN_SLIDES,
  ms: makeSlides(['Bahagian Luar', 'Ruang Legar', 'Bilik', 'Kolam Renang']),
  id: makeSlides(['Bagian Luar', 'Lobi', 'Kamar', 'Kolam Renang']),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Carousel.mdx's
 * "Contoh Penggunaan" section. Render-wrapped (not args-only) because the
 * track's slide width is 100% of its viewport - without the fixed-width
 * `Page` wrapper the docs canvas gives it nothing to be 100% of. Kept
 * separate from Matrix above, which exists to prove the whole surface
 * works, not to be copied verbatim.
 */

export const GalleryDefault: Story = {
  render: () => (
    <Page width="420px">
      <Carousel slides={EN_SLIDES} label="Hotel photos" />
    </Page>
  ),
};

export const SinglePhoto: Story = {
  render: () => (
    <Page width="420px">
      <Carousel slides={[EN_SLIDES[0]!]} label="Hotel photos" />
    </Page>
  ),
};

export const DeepLinkedPhoto: Story = {
  render: () => (
    <Page width="420px">
      <Carousel slides={EN_SLIDES} label="Hotel photos" defaultIndex={2} />
    </Page>
  ),
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Almost nothing here is visible text - the carousel is photos, and the only ' +
          'strings are the slide label read into the live region on change ("Ruang Legar, ' +
          'slide 2 of 4") and the Prev/Next accessible names. Checked in all three ' +
          'languages so a longer announcement never has to fit into anything that could ' +
          'clip it - it does not, because none of it is painted on screen.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        {(['en', 'ms', 'id'] as const).map((lang) => (
          <div key={lang} lang={lang}>
            <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
              {lang.toUpperCase()}
            </p>
            <Carousel
              slides={LOCALE_SLIDES[lang]}
              label={`Hotel photos - ${lang}`}
              defaultIndex={1}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
