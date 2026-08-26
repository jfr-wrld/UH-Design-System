import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Tooltip, type TooltipPlacement } from './Tooltip.js';
import { Button } from '../Button/Button.js';

const PLACEMENTS: TooltipPlacement[] = [
  'top-start',
  'top',
  'top-end',
  'bottom-start',
  'bottom',
  'bottom-end',
  'left-start',
  'left',
  'left-end',
  'right-start',
  'right',
  'right-end',
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

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Opens on hover and on focus, closes on Escape, and describes the trigger through ' +
          'aria-describedby rather than renaming it. Read the usage rule below before ' +
          'reaching for it: a tooltip is supplementary, and there are people who will never ' +
          'see it.',
      },
    },
  },
  /* Required by the type; every story below supplies its own via `render`. */
  args: {
    content: 'Refundable in full up to 45 days before departure',
    children: <Button variant="outline">Refund policy</Button>,
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The rule that matters more than any prop on this component.
 */
export const WhenNotToUseIt: Story = {
  name: 'When not to use it',
  render: () => (
    <Page>
      <div
        style={{
          maxWidth: '38rem',
          padding: 'var(--uh-spacing-16)',
          border: 'var(--uh-border-width-1) solid var(--uh-color-feedback-warning-border-strong)',
          borderRadius: 'var(--uh-radius-md)',
          background: 'var(--uh-color-feedback-warning-bg)',
          color: 'var(--uh-color-feedback-warning-text)',
        }}
      >
        <div className="uh-type-web-overline">A tooltip is never the only copy of something</div>
        <p className="uh-type-web-body-s" style={{ marginTop: 'var(--uh-spacing-8)' }}>
          It opens on hover and on focus. Neither exists on a touch screen, and this platform is
          mobile-first for pilgrims aged 30 to 60. Anything a person needs in order to decide or to
          finish a booking has to be on the page.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gap: 'var(--uh-spacing-24)',
          marginTop: 'var(--uh-spacing-32)',
          maxWidth: '38rem',
        }}
      >
        <div>
          <Caption>Wrong: the amount only exists in the tooltip</Caption>
          <p className="uh-type-web-body-m" style={{ marginTop: 'var(--uh-spacing-8)' }}>
            Pay a{' '}
            <Tooltip content="20% of the package price, RM 2,500">
              <button
                type="button"
                className="uh-type-web-body-m"
                style={{
                  border: 0,
                  padding: 0,
                  background: 'none',
                  color: 'var(--uh-color-text-link)',
                  textDecoration: 'underline',
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                deposit
              </button>
            </Tooltip>{' '}
            to confirm your seat.
          </p>
        </div>

        <div>
          <Caption>Right: the amount is on the page, the tooltip only adds detail</Caption>
          <p className="uh-type-web-body-m" style={{ marginTop: 'var(--uh-spacing-8)' }}>
            Pay a deposit of <span className="uh-type-numeric-price-sm">RM 2,500</span> (20%) to
            confirm your seat.{' '}
            <Tooltip content="Refundable in full up to 45 days before departure">
              <button
                type="button"
                className="uh-type-web-body-m"
                style={{
                  border: 0,
                  padding: 0,
                  background: 'none',
                  color: 'var(--uh-color-text-link)',
                  textDecoration: 'underline',
                  font: 'inherit',
                  cursor: 'pointer',
                }}
              >
                Refund policy
              </button>
            </Tooltip>
          </p>
        </div>
      </div>
    </Page>
  ),
};

export const Placements: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-24)' }}
      >
        Twelve placements. Each flips to the opposite side if the preferred one does not fit, and is
        clamped so it never leaves the viewport. Tab through them to see focus open each one without
        a pointer.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 'var(--uh-spacing-32)',
          maxWidth: '40rem',
          margin: 'var(--uh-spacing-64) auto',
        }}
      >
        {PLACEMENTS.map((placement) => (
          <Tooltip key={placement} content={`Placed ${placement}`} placement={placement} delay={0}>
            <Button variant="outline" size="sm">
              {placement}
            </Button>
          </Tooltip>
        ))}
      </div>
    </Page>
  ),
};

export const DelayAndDisabled: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', flexWrap: 'wrap' }}>
        <Tooltip content="Opens straight away" delay={0}>
          <Button variant="outline">No delay</Button>
        </Tooltip>
        <Tooltip content="Waits 600ms on hover, but opens instantly on focus">
          <Button variant="outline" style={{ minWidth: '10rem' }}>
            Default delay
          </Button>
        </Tooltip>
        <Tooltip content="You should never see this" disabled>
          <Button variant="outline">Disabled</Button>
        </Tooltip>
      </div>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-16)' }}
      >
        The delay applies to hover only. Focus opens immediately, because a keyboard user has
        already committed to the control by the time they reach it.
      </p>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div
        style={{ display: 'flex', gap: 'var(--uh-spacing-16)', padding: 'var(--uh-spacing-32)' }}
      >
        <Tooltip content="Refundable in full up to 45 days before departure" delay={0}>
          <Button variant="outline">Refund policy</Button>
        </Tooltip>
        <Tooltip content="Seats confirmed once the deposit clears" placement="bottom" delay={0}>
          <Button>Deposit</Button>
        </Tooltip>
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- text expansion */

const LOCALES = [
  {
    code: 'en',
    label: 'English',
    trigger: 'Refund policy',
    content: 'Refundable in full up to 45 days before departure',
  },
  {
    code: 'ms',
    label: 'Bahasa Melayu',
    trigger: 'Dasar bayaran balik',
    content: 'Boleh dibayar balik sepenuhnya sehingga 45 hari sebelum berlepas',
  },
  {
    code: 'id',
    label: 'Bahasa Indonesia',
    trigger: 'Kebijakan pengembalian dana',
    content: 'Dapat dikembalikan sepenuhnya hingga 45 hari sebelum keberangkatan',
  },
] as const;

/**
 * The tooltip is capped at 280px, so longer copy wraps rather than stretching
 * across the viewport. Each column carries its own lang, so the wrapped lines
 * pick up the per-language line-height correction. Tab through to open them.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <p
        className="uh-type-web-body-s uh-measure"
        style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-32)' }}
      >
        Indonesian runs longest here, both in the trigger and in the tooltip. Neither may overflow:
        the trigger truncates, the tooltip wraps.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--uh-spacing-24)',
          flexWrap: 'wrap',
          paddingBottom: 'var(--uh-spacing-96)',
        }}
      >
        {LOCALES.map((locale) => (
          <div key={locale.code} lang={locale.code} style={{ width: '280px' }}>
            <Caption>
              {locale.label} · {locale.code}
            </Caption>
            <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
              <Tooltip content={locale.content} placement="bottom" delay={0}>
                <Button variant="outline" size="sm" fullWidth>
                  {locale.trigger}
                </Button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};
