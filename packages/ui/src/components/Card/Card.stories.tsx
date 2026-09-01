import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Card, type CardPadding, type CardVariant } from './Card.js';
import { Badge } from '../Badge/Badge.js';
import { PriceDisplay } from '../PriceDisplay/PriceDisplay.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '420px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
      style={{ width: 'var(--uh-size-icon-md)', height: 'var(--uh-size-icon-md)' }}
    >
      <path
        d="M12 20S3 14 3 8.5C3 5.5 5.5 3 8.5 3c1.6 0 3 .7 3.5 1.9C12.5 3.7 13.9 3 15.5 3 18.5 3 21 5.5 21 8.5 21 14 12 20 12 20z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SampleContent() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--uh-spacing-8)',
      }}
    >
      <Badge variant="success">Verified</Badge>
      <p className="uh-type-web-h6" style={{ margin: 0 }}>
        9-Day Umrah Package - Istanbul Transit
      </p>
      <p
        className="uh-type-web-body-s"
        style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
      >
        Departs from Kuala Lumpur - Makkah - Madinah
      </p>
      <PriceDisplay currency="MYR" locale="en-MY" amount={12500} size="md" />
    </div>
  );
}

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The shell PackageCard, AgencyCard, HotelCard and ReviewCard are meant to sit ' +
          'on: a surface, one of three treatments (outlined/elevated/flat), and a padding ' +
          'scale. `href` or `onClick` turns the whole card into a single named hit area - ' +
          'an invisible link or button absolutely positioned to fill it - while ' +
          '`.uh-card__action` lets any nested control (a wishlist heart, a share icon) ' +
          'stay independently clickable on top of it. That works because a positioned box ' +
          'always paints above a non-positioned one regardless of DOM order: the hit-area ' +
          'is written first, so anything after it that opts into its own position wins the ' +
          'paint order and the clicks.\n\n' +
          '`label` is required whenever the card is interactive - a package photo and a ' +
          'price read as nothing on their own to a screen reader; the label is what a ' +
          'person actually needs to hear.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <Card href="/packages/123" label="9-Day Umrah Package - Istanbul Transit, from RM 12,500">
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="uh-card__action"
              aria-label="Save to wishlist"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 'var(--uh-size-tap-target-min)',
                height: 'var(--uh-size-tap-target-min)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 0,
                background: 'transparent',
                color: 'var(--uh-color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <HeartIcon filled={false} />
            </button>
            <SampleContent />
          </div>
        </Card>
      </div>
    </Page>
  ),
};

const VARIANTS: CardVariant[] = ['outlined', 'elevated', 'flat'];
const PADDINGS: CardPadding[] = ['none', 'sm', 'md', 'lg'];

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant against every padding, static (top row) and interactive as a ' +
          'link (bottom row) - hover or focus either to see the shared elevation treatment.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
          {VARIANTS.map((variant) =>
            PADDINGS.map((padding) => (
              <Card key={`${variant}-${padding}`} variant={variant} padding={padding}>
                <p className="uh-type-web-label" style={{ margin: 0 }}>
                  {variant} / {padding}
                </p>
              </Card>
            )),
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
          {VARIANTS.map((variant) => (
            <Card key={variant} variant={variant} href="#" label={`${variant} card, clickable`}>
              <p className="uh-type-web-label" style={{ margin: 0 }}>
                {variant}, interactive
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '320px' }}>
        <Card href="/packages/123" label="9-Day Umrah Package - Istanbul Transit, from RM 12,500">
          <SampleContent />
        </Card>
      </div>
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    label: '9-Day Umrah Package - Istanbul Transit',
    body: 'Departs from Kuala Lumpur',
  },
  {
    lang: 'ms',
    label: 'Pakej Umrah 9 Hari - Transit Istanbul',
    body: 'Berlepas dari Kuala Lumpur',
  },
  {
    lang: 'id',
    label: 'Paket Umrah 9 Hari - Transit Istanbul',
    body: 'Berangkat dari Kuala Lumpur',
  },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Malay and Indonesian titles both run a little longer; since Card imposes no ' +
          'text truncation of its own, wrapping is entirely up to the content a consumer ' +
          'puts inside it - which is the point of Card being a shell, not a title API.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang} style={{ width: '240px' }}>
            <Card href="#" label={entry.label}>
              <p className="uh-type-web-h6" style={{ margin: 0 }}>
                {entry.label}
              </p>
              <p
                className="uh-type-web-body-s"
                style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
              >
                {entry.body}
              </p>
            </Card>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually Canvas-able examples for Card.mdx's "Contoh
 * Penggunaan" section - one per discriminated shape (static / link /
 * button), since that shape is Card's core distinction. Each uses a small
 * render function rather than args-only, so the href/onClick + children
 * combination stays readable in the Docs Source panel. Kept separate from
 * Playground/Matrix above, which exist to prove the whole surface works,
 * not to be copied verbatim.
 */

export const StaticCard: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ width: '280px' }}>
      <Card variant="outlined" padding="md">
        <p className="uh-type-web-h6" style={{ margin: 0 }}>
          Departure Details
        </p>
        <p
          className="uh-type-web-body-s"
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
        >
          This group departs 12 March 2027 from Jakarta. No part of this card is clickable.
        </p>
      </Card>
    </div>
  ),
};

export const LinkCard: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ width: '280px' }}>
      <Card
        variant="elevated"
        href="/packages/456"
        label="12-Day Umrah Package - Madinah First, from RM 9,800"
      >
        <p className="uh-type-web-h6" style={{ margin: 0 }}>
          12-Day Umrah Package - Madinah First
        </p>
        <PriceDisplay currency="MYR" locale="en-MY" amount={9800} size="md" />
      </Card>
    </div>
  ),
};

export const ButtonCard: Story = {
  parameters: { layout: 'centered' },
  render: () => (
    <div style={{ width: '280px' }}>
      <Card onClick={() => {}} label="Select Trusted Umrah Travel as your agency">
        <p className="uh-type-web-h6" style={{ margin: 0 }}>
          Trusted Umrah Travel
        </p>
        <p
          className="uh-type-web-body-s"
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
        >
          4.8 rating · 230 reviews
        </p>
      </Card>
    </div>
  ),
};
