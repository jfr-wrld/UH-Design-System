import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Button, type ButtonSize, type ButtonVariant } from './Button.js';

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'outline',
  'ghost',
  'link',
  'destructive',
];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

/** Interaction states the matrix walks through. */
const STATES = [
  { key: 'default', label: 'Default', pseudo: {} },
  { key: 'hover', label: 'Hover', pseudo: { hover: true } },
  { key: 'focus', label: 'Focus', pseudo: { focusVisible: true } },
  { key: 'active', label: 'Active', pseudo: { active: true } },
  { key: 'disabled', label: 'Disabled', pseudo: {}, props: { disabled: true } },
  { key: 'loading', label: 'Loading', pseudo: {}, props: { loading: true } },
] as const;

/* ------------------------------------------------------------- scaffolding */

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

/**
 * Stories pin their theme rather than inheriting the viewer's OS preference.
 * Without this, the light matrix and the dark matrix render identically on a
 * machine set to dark, which defeats the point of having both.
 */
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

function PlaneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2 13l8 2 3 6 2-7 7-2-7-2-2-7-3 6-8 2z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Six variants, three sizes. Every value resolves to a token — `pnpm --filter ' +
          '@umrahhaji/ui verify:tokens` fails the build on a literal colour or length.',
      },
    },
  },
  args: { children: 'Book Now' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ matrix */

/**
 * Every variant against every interaction state, at one size per block.
 * The hover / focus / active columns are forced by the pseudo-states addon, so
 * these are the real CSS states rather than a look-alike.
 */
function Matrix({ size }: { size: ButtonSize }) {
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
            <Caption>variant</Caption>
          </th>
          {STATES.map((state) => (
            <th key={state.key} style={{ textAlign: 'left', padding: 'var(--uh-spacing-8)' }}>
              <Caption>{state.label}</Caption>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {VARIANTS.map((variant) => (
          <tr key={variant}>
            <td style={{ padding: 'var(--uh-spacing-8)' }}>
              <code className="uh-type-web-caption">{variant}</code>
            </td>
            {STATES.map((state) => (
              <td key={state.key} style={{ padding: 'var(--uh-spacing-8)' }}>
                <Button
                  variant={variant}
                  size={size}
                  className={pseudoClass(state.pseudo)}
                  {...('props' in state ? state.props : {})}
                >
                  Book Now
                </Button>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * storybook-addon-pseudo-states rewrites each `:hover` / `:active` /
 * `:focus-visible` rule so it also matches a `pseudo-*` class. The class has to
 * sit on the element itself — a wrapper only works with the `-all` suffix — so
 * this is passed straight through to the Button's className.
 */
function pseudoClass(pseudo: Record<string, boolean>): string | undefined {
  const map: Record<string, string> = {
    hover: 'pseudo-hover',
    focusVisible: 'pseudo-focus-visible',
    active: 'pseudo-active',
  };
  const classes = Object.keys(pseudo)
    .map((key) => map[key])
    .filter((value): value is string => Boolean(value));
  return classes.length ? classes.join(' ') : undefined;
}

export const StateMatrix: Story = {
  render: () => (
    <Page>
      {SIZES.map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-32)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <Matrix size={size} />
        </section>
      ))}
    </Page>
  ),
};

export const SizesAndIcons: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-24)' }}>
        <div>
          <Caption>Sizes — sm 36px, md 44px, lg 52px</Caption>
          <div
            style={{
              display: 'flex',
              gap: 'var(--uh-spacing-12)',
              alignItems: 'center',
              marginTop: 'var(--uh-spacing-8)',
            }}
          >
            {SIZES.map((size) => (
              <Button key={size} size={size}>
                Book Now
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Caption>Icons</Caption>
          <div
            style={{
              display: 'flex',
              gap: 'var(--uh-spacing-12)',
              alignItems: 'center',
              marginTop: 'var(--uh-spacing-8)',
            }}
          >
            <Button leftIcon={<PlaneIcon />}>Book Now</Button>
            <Button variant="outline" rightIcon={<ChevronIcon />}>
              View Package Details
            </Button>
            <Button iconOnly aria-label="Save this package" variant="outline">
              <PlaneIcon />
            </Button>
            <Button iconOnly size="sm" aria-label="Save this package" variant="ghost">
              <PlaneIcon />
            </Button>
          </div>
          <p
            className="uh-type-web-body-s uh-measure"
            style={{ color: 'var(--uh-color-text-secondary)', marginTop: 'var(--uh-spacing-8)' }}
          >
            The two icon-only buttons are 44×44 even at <code>size=&quot;sm&quot;</code>. A text
            button at <code>sm</code> stays 36px tall but carries an invisible 44px pointer target,
            so the touch floor holds without inflating the layout.
          </p>
        </div>

        <div>
          <Caption>Full width</Caption>
          <div style={{ maxWidth: '22rem', marginTop: 'var(--uh-spacing-8)' }}>
            <Button fullWidth size="lg">
              Continue to Payment
            </Button>
          </div>
        </div>

        <div>
          <Caption>As a link element</Caption>
          <div style={{ marginTop: 'var(--uh-spacing-8)' }}>
            <Button as="a" href="#packages" variant="link">
              View Package Details
            </Button>
          </div>
        </div>
      </div>
    </Page>
  ),
};

/**
 * Loading must not change the button's width, or every form reflows the moment
 * it is submitted. The pairs below render the same button in both states.
 */
export const LoadingHoldsWidth: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-24)' }}>
        <Caption>Same label, idle vs loading — the box must not move</Caption>
        {['Book Now', 'Continue to Payment', 'View Package Details'].map((label) => (
          <div
            key={label}
            style={{ display: 'flex', gap: 'var(--uh-spacing-16)', alignItems: 'center' }}
          >
            <Button>{label}</Button>
            <Button loading loadingLabel="Processing">
              {label}
            </Button>
            <span
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-tertiary)' }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      {SIZES.slice(1).map((size) => (
        <section key={size} style={{ marginBottom: 'var(--uh-spacing-32)' }}>
          <h3 className="uh-type-web-h5" style={{ marginBottom: 'var(--uh-spacing-12)' }}>
            size = {size}
          </h3>
          <Matrix size={size} />
        </section>
      ))}
    </Page>
  ),
};

/* --------------------------------------------------------- text expansion */

const EXPANSION = [
  { en: 'Book Now', ms: 'Tempah Sekarang', id: 'Pesan Sekarang' },
  { en: 'View Package Details', ms: 'Lihat Butiran Pakej', id: 'Lihat Detail Paket' },
  { en: 'Continue to Payment', ms: 'Teruskan ke Bayaran', id: 'Lanjut ke Pembayaran' },
] as const;

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'ms', label: 'Bahasa Melayu' },
  { code: 'id', label: 'Bahasa Indonesia' },
] as const;

/**
 * Malay and Indonesian run 15–30% longer than English for the same string. The
 * container width is fixed on purpose: if a label is going to overflow, break
 * the layout or get clipped, it has to happen here rather than in production.
 */
export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'grid', gap: 'var(--uh-spacing-32)' }}>
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)' }}
        >
          Fixed 240px container, <code>size=&quot;md&quot;</code>,{' '}
          <code>variant=&quot;primary&quot;</code>. Each column carries its own <code>lang</code>,
          so the per-language line-height correction applies to any label that wraps.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 15rem)',
            gap: 'var(--uh-spacing-24)',
          }}
        >
          {LOCALES.map((locale) => (
            <div key={locale.code} lang={locale.code}>
              <Caption>
                {locale.label} · {locale.code}
              </Caption>
              <div
                style={{
                  display: 'grid',
                  gap: 'var(--uh-spacing-12)',
                  marginTop: 'var(--uh-spacing-8)',
                  padding: 'var(--uh-spacing-12)',
                  border: 'var(--uh-border-width-1) dashed var(--uh-color-border-default)',
                  borderRadius: 'var(--uh-radius-md)',
                }}
              >
                {EXPANSION.map((row) => (
                  <Button key={row.en} size="md" variant="primary">
                    {row[locale.code]}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <Caption>Same three strings, full width — the common real layout</Caption>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 15rem)',
              gap: 'var(--uh-spacing-24)',
              marginTop: 'var(--uh-spacing-8)',
            }}
          >
            {LOCALES.map((locale) => (
              <div
                key={locale.code}
                lang={locale.code}
                style={{ display: 'grid', gap: 'var(--uh-spacing-12)' }}
              >
                {EXPANSION.map((row) => (
                  <Button key={row.en} size="md" variant="primary" fullWidth>
                    {row[locale.code]}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  ),
};
