import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Alert, type AlertLayout, type AlertVariant } from './Alert.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  minHeight: '420px',
};

const padded: CSSProperties = { padding: 'var(--uh-spacing-24)' };

function Page({
  theme = 'light',
  padding = true,
  children,
}: {
  theme?: 'light' | 'dark';
  padding?: boolean;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} style={{ ...surface, ...(padding ? padded : {}) }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Inline status, not floating: no portal, no z-index - Alert is part of the ' +
          'page\'s own flow, unlike Modal or Toast. `layout="inline"` is a bordered, ' +
          'radiused box for a card or a form - a validation summary, a sold-out notice on ' +
          'a package page. `layout="banner"` is edge-to-edge with square corners, for the ' +
          'top of a page or section.\n\n' +
          'error and warning render role="alert" (assertive); success and info render ' +
          'role="status" (polite) - a role already present when the element is inserted, ' +
          'which is the reliable case that role was designed for. This differs from ' +
          'Toast on purpose: Toast is portalled into a churning stack and goes through a ' +
          'hidden announce() call instead, because role insertion is unreliable there in ' +
          'particular (see lib/announcer). A dismissible Alert still plays its own exit ' +
          'animation through usePresence before calling onDismiss - the parent only needs ' +
          'to stop rendering it once told to, same lifecycle Modal, Drawer and Toast share.',
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <Alert
        variant="warning"
        title="Prices may change"
        dismissible
        onDismiss={() => {}}
        actions={[{ label: 'Learn more', onClick: () => {} }]}
      >
        Prices are indicative and may change closer to departure, depending on the exchange rate and
        flight availability.
      </Alert>
    </Page>
  ),
};

const VARIANTS: AlertVariant[] = ['success', 'warning', 'error', 'info'];
const LAYOUTS: AlertLayout[] = ['inline', 'banner'];

const COPY: Record<AlertVariant, { title: string; description: string }> = {
  success: {
    title: 'Booking confirmed',
    description: 'Your seat is reserved. A confirmation email is on its way.',
  },
  warning: {
    title: 'Prices may change',
    description: 'Prices are indicative and may change closer to departure.',
  },
  error: {
    title: 'Payment failed',
    description: 'We could not charge your card. Try another one.',
  },
  info: {
    title: 'Check-in opens soon',
    description: 'Online check-in opens 48 hours before your flight.',
  },
};

function MatrixCell({ variant, layout }: { variant: AlertVariant; layout: AlertLayout }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const copy = COPY[variant];
  return (
    <Alert
      variant={variant}
      layout={layout}
      title={copy.title}
      dismissible
      onDismiss={() => setDismissed(true)}
      actions={variant === 'error' ? [{ label: 'Retry', onClick: () => {} }] : undefined}
    >
      {copy.description}
    </Alert>
  );
}

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant against both layouts, each dismissible and independently ' +
          'closeable - close one and the rest are unaffected, since presence is local to ' +
          'each instance.',
      },
    },
  },
  render: () => (
    <Page padding={false}>
      {LAYOUTS.map((layout) => (
        <div
          key={layout}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--uh-spacing-12)',
            padding: layout === 'inline' ? 'var(--uh-spacing-24)' : 0,
            marginBlockEnd: layout === 'inline' ? 0 : 'var(--uh-spacing-24)',
          }}
        >
          {VARIANTS.map((variant) => (
            <MatrixCell key={variant} variant={variant} layout={layout} />
          ))}
        </div>
      ))}
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
        <Alert variant="success" title="Booking confirmed">
          Your seat is reserved. A confirmation email is on its way.
        </Alert>
        <Alert
          variant="error"
          title="Payment failed"
          actions={[{ label: 'Retry', onClick: () => {} }]}
        >
          We could not charge your card. Try another one.
        </Alert>
        <Alert layout="banner" variant="info">
          Prices shown include tax.
        </Alert>
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Alert.mdx's
 * "Contoh Penggunaan" section - args-only so the Docs Source panel shows
 * clean `<Alert ... />` JSX rather than a render function body.
 */

export const SoldOutNotice: Story = {
  parameters: { layout: 'centered' },
  args: {
    variant: 'error',
    title: 'Sold out',
    children: 'This package has no seats left for the selected departure date.',
  },
};

export const OfflineBanner: Story = {
  parameters: { layout: 'fullscreen' },
  args: {
    layout: 'banner',
    variant: 'warning',
    children: "You're offline. Some prices may be out of date until you reconnect.",
  },
};

export const PaymentFailedWithActions: Story = {
  parameters: { layout: 'centered' },
  args: {
    variant: 'error',
    title: 'Payment failed',
    dismissible: true,
    onDismiss: () => {},
    actions: [
      { label: 'Retry', onClick: () => {} },
      { label: 'Contact support', onClick: () => {} },
    ],
    children: 'We could not charge your card. Try another one.',
  },
};

const EXPANSION = [
  {
    lang: 'en',
    label: 'English',
    title: 'Refund requested',
    description: 'Refunds follow the package policy and reach your account in 5-7 working days.',
    action: 'View refund policy',
  },
  {
    lang: 'ms',
    label: 'Bahasa Melayu',
    title: 'Bayaran balik diminta',
    description:
      'Bayaran balik mengikut polisi pakej dan akan sampai ke akaun anda dalam 5-7 hari bekerja.',
    action: 'Lihat polisi bayaran balik',
  },
  {
    lang: 'id',
    label: 'Bahasa Indonesia',
    title: 'Pengembalian dana diminta',
    description:
      'Pengembalian dana mengikuti kebijakan paket dan akan masuk ke akun Anda dalam 5-7 hari kerja.',
    action: 'Lihat kebijakan pengembalian dana',
  },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Indonesian and Malay copy runs noticeably longer; title, description and ' +
          'the action link all wrap in place rather than truncating or breaking the ' +
          '44px close target.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
        {EXPANSION.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Alert
              variant="info"
              title={entry.title}
              dismissible
              onDismiss={() => {}}
              actions={[{ label: entry.action, onClick: () => {} }]}
            >
              {entry.description}
            </Alert>
          </div>
        ))}
      </div>
    </Page>
  ),
};
