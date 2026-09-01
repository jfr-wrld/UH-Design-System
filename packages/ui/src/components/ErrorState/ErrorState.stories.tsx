import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ErrorState, type ErrorStateSize } from './ErrorState.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  minHeight: '420px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function OfflineIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M8 20a22 22 0 0 1 32 0M14 27a14 14 0 0 1 20 0M20 34a6 6 0 0 1 8 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M6 6l36 36" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Something failed and the person should be told now - a request that errored, ' +
          'a page that could not load. Shares its entire anatomy with EmptyState through ' +
          'lib/StateMessage.tsx (icon, title, description, up to two actions); only the ' +
          'icon tone and the role differ.\n\n' +
          '**role="alert" fires the moment it mounts** - the key difference from ' +
          'EmptyState, which stays silent. An error is an interruption; an empty list ' +
          "after a search is not. This follows the same reasoning as Alert's error " +
          "variant and Toast's error announcement elsewhere in this package.\n\n" +
          'A generic broken-connection icon renders if none is given; pass your own for ' +
          'a specific failure (a card-declined glyph for a payment error, a server icon ' +
          'for a 500).',
      },
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'Could not load packages',
    description: 'Check your connection and try again.',
  },
  render: (args) => (
    <Page>
      <ErrorState {...args} action={{ label: 'Try again', onClick: () => {} }} />
    </Page>
  ),
};

const SIZES: ErrorStateSize[] = ['md', 'sm'];

export const Matrix: Story = {
  args: { title: 'Could not load packages' },
  parameters: {
    docs: {
      description: {
        story:
          'Both sizes, with a default icon vs a custom one, and with zero/one/two ' +
          "actions - the same combinations EmptyState's matrix covers, since both share " +
          'the shell.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {SIZES.map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column' }}>
            <ErrorState title="Something went wrong" size={size} />
            <ErrorState
              title="You're offline"
              description="Check your connection and try again."
              icon={<OfflineIcon />}
              size={size}
              action={{ label: 'Retry', onClick: () => {} }}
            />
            <ErrorState
              title="Payment failed"
              description="We could not charge your card. Try another one."
              size={size}
              action={{ label: 'Try again', onClick: () => {} }}
              secondaryAction={{ label: 'Contact support', onClick: () => {} }}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { title: "You're offline" },
  render: () => (
    <Page theme="dark">
      <ErrorState
        title="You're offline"
        description="Check your connection and try again."
        icon={<OfflineIcon />}
        action={{ label: 'Retry', onClick: () => {} }}
      />
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    title: 'Could not load packages',
    description: 'Check your connection and try again.',
    action: 'Try again',
    secondary: 'Contact support',
  },
  {
    lang: 'ms',
    title: 'Tidak dapat memuatkan pakej',
    description: 'Semak sambungan anda dan cuba lagi.',
    action: 'Cuba lagi',
    secondary: 'Hubungi sokongan',
  },
  {
    lang: 'id',
    title: 'Tidak dapat memuat paket',
    description: 'Periksa koneksi Anda dan coba lagi.',
    action: 'Coba lagi',
    secondary: 'Hubungi dukungan',
  },
] as const;

export const TextExpansion: Story = {
  args: { title: 'Could not load packages' },
  parameters: {
    docs: {
      description: {
        story:
          '"Tidak dapat memuatkan pakej" and the Indonesian equivalent both wrap at the ' +
          'same max-width cap as English rather than overflowing; the two action buttons ' +
          'wrap onto their own line before either label truncates.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang} style={{ flex: '1 1 260px' }}>
            <ErrorState
              title={entry.title}
              description={entry.description}
              action={{ label: entry.action, onClick: () => {} }}
              secondaryAction={{ label: entry.secondary, onClick: () => {} }}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for ErrorState.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<ErrorState ... />` JSX instead of a render function
 * body. Kept separate from Playground/Matrix above, which exist to prove the
 * whole surface works, not to be copied verbatim.
 */

export const LoadFailed: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: 'Could not load packages',
    description: 'Check your connection and try again.',
    action: { label: 'Try again', onClick: () => {} },
  },
};

export const OfflineError: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: "You're offline",
    description: 'Check your connection and try again.',
    icon: <OfflineIcon />,
    action: { label: 'Retry', onClick: () => {} },
  },
};

export const PaymentFailedError: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: 'Payment failed',
    description: 'We could not charge your card. Try another one.',
    action: { label: 'Try again', onClick: () => {} },
    secondaryAction: { label: 'Contact support', onClick: () => {} },
  },
};
