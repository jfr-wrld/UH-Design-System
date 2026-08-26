import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Badge, type BadgeStatus, type BadgeVariant } from './Badge.js';

const VARIANTS: BadgeVariant[] = [
  'neutral',
  'primary',
  'secondary',
  'success',
  'warning',
  'error',
  'info',
];

/** Label per booking state, in the order a booking actually moves through. */
const STATUSES: Array<{ value: BadgeStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

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

function Row({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--uh-spacing-8)',
        marginTop: 'var(--uh-spacing-8)',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

function SeatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M7 4v9h10M7 13l-1 7M17 13l1 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Tinted, never solid: a package grid carries six or seven of these at once, and ' +
          'solid fills at that density compete with the price. The dot uses the role’s ' +
          '`-text` token rather than `-solid` — measured, success-500 on success-50 is ' +
          '2.18:1, under the 3:1 a graphical object needs.',
      },
    },
  },
  args: { children: 'Almost Full' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <Page>
      {(['md', 'sm'] as const).map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-32)' }}>
          <h3 className="uh-type-web-h5">size = {size}</h3>
          <Caption>Plain</Caption>
          <Row>
            {VARIANTS.map((v) => (
              <Badge key={v} variant={v} size={size}>
                {v}
              </Badge>
            ))}
          </Row>
          <Caption>With dot</Caption>
          <Row>
            {VARIANTS.map((v) => (
              <Badge key={v} variant={v} size={size} dot>
                {v}
              </Badge>
            ))}
          </Row>
        </section>
      ))}
    </Page>
  ),
};

export const BookingStatus: Story = {
  render: () => (
    <Page>
      <Caption>The booking lifecycle, in order</Caption>
      <Row>
        {STATUSES.map((s) => (
          <Badge key={s.value} variant={s.value} dot>
            {s.label}
          </Badge>
        ))}
      </Row>
      <Caption>Small, for table cells</Caption>
      <Row>
        {STATUSES.map((s) => (
          <Badge key={s.value} variant={s.value} size="sm">
            {s.label}
          </Badge>
        ))}
      </Row>
    </Page>
  ),
};

export const IconAndRemovable: Story = {
  render: () => (
    <Page>
      <Caption>With icon</Caption>
      <Row>
        <Badge variant="warning" icon={<SeatIcon />}>
          Almost Full
        </Badge>
        <Badge variant="primary" icon={<SeatIcon />} size="sm">
          Best Seller
        </Badge>
      </Row>

      <Caption>Removable filter chips</Caption>
      <Row>
        <Badge variant="neutral" removable removeLabel="Remove filter: Ramadan">
          Ramadan
        </Badge>
        <Badge variant="neutral" removable removeLabel="Remove filter: 14 days">
          14 days
        </Badge>
        <Badge variant="neutral" removable removeLabel="Remove filter: Five star">
          Five star
        </Badge>
      </Row>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-12)' }}
      >
        The remove control is 24px, not the house 44px. A 44px hit area inside a 24px badge would
        spill over the badge beside it in a wrapped row and steal its taps. 24px is the WCAG 2.2 AA
        minimum and is what a badge can honestly offer.
      </p>
    </Page>
  ),
};

/** What a package card actually looks like with badges on it. */
export const InAPackageCard: Story = {
  render: () => (
    <Page>
      <article
        style={{
          maxWidth: '20rem',
          padding: 'var(--uh-spacing-16)',
          border: 'var(--uh-border-width-1) solid var(--uh-color-border-default)',
          borderRadius: 'var(--uh-radius-lg)',
          background: 'var(--uh-color-bg-surface)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-8)', flexWrap: 'wrap' }}>
          <Badge variant="secondary" size="sm">
            Best Seller
          </Badge>
          <Badge variant="warning" size="sm" dot>
            Almost Full
          </Badge>
        </div>
        <h3 className="uh-type-web-h6 uh-clamp-2" style={{ margin: 'var(--uh-spacing-12) 0' }}>
          Pakej Umrah Ramadan 14 Hari Bersama Ustaz Terpilih
        </h3>
        <div className="uh-type-numeric-price-md">RM 12,500</div>
      </article>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Caption>Variants</Caption>
      <Row>
        {VARIANTS.map((v) => (
          <Badge key={v} variant={v} dot>
            {v}
          </Badge>
        ))}
      </Row>
      <Caption>Booking status</Caption>
      <Row>
        {STATUSES.map((s) => (
          <Badge key={s.value} variant={s.value} dot>
            {s.label}
          </Badge>
        ))}
      </Row>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  { code: 'en', label: 'English', almostFull: 'Almost Full', bestSeller: 'Best Seller' },
  { code: 'ms', label: 'Bahasa Melayu', almostFull: 'Hampir Penuh', bestSeller: 'Paling Laris' },
  { code: 'id', label: 'Bahasa Indonesia', almostFull: 'Hampir Penuh', bestSeller: 'Paling Laris' },
] as const;

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-16)' }}
      >
        Badges size to their content, so expansion pushes the row rather than clipping the label. In
        a card the pair has to stay on one line at 280px.
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
                gap: 'var(--uh-spacing-8)',
                flexWrap: 'wrap',
                marginTop: 'var(--uh-spacing-8)',
                padding: 'var(--uh-spacing-12)',
                border: 'var(--uh-border-width-1) dashed var(--uh-color-border-default)',
                borderRadius: 'var(--uh-radius-md)',
              }}
            >
              <Badge variant="secondary" size="sm">
                {locale.bestSeller}
              </Badge>
              <Badge variant="warning" size="sm" dot>
                {locale.almostFull}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
