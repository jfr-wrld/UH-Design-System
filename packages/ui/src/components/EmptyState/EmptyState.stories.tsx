import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { EmptyState, type EmptyStateSize } from './EmptyState.js';

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

function WishlistIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 40S8 30 8 18.5C8 12.7 12.7 8 18.5 8c3.2 0 6.1 1.5 8 3.8 1.9-2.3 4.8-3.8 8-3.8C40.3 8 45 12.7 45 18.5 45 30 24 40 24 40z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="21" cy="21" r="12" stroke="currentColor" strokeWidth="1.75" />
      <path d="M30 30l9 9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16 21h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The resting state of a list, a search, or a whole tab with nothing in it yet - ' +
          '"No packages match your filters", "Your wishlist is empty", "No bookings yet". ' +
          'A generic open-box icon renders if none is given, but `icon` takes anything - a ' +
          'suitcase for empty bookings, a heart for an empty wishlist - to make the state ' +
          'specific to what is actually missing.\n\n' +
          'No implicit live-region role: EmptyState is usually the settled result of an ' +
          'action the person just took (a search, a filter), not an interruption, and a ' +
          'surrounding list that already announces its own result count would otherwise be ' +
          'announced twice.\n\n' +
          '`size="sm"` sits inside a card or a bounded section; `size="md"` fills a whole ' +
          'page or tab.',
      },
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    title: 'No packages match your filters',
    description: 'Try widening your travel dates or removing a filter.',
  },
  render: (args) => (
    <Page>
      <EmptyState
        {...args}
        icon={<SearchIcon />}
        action={{ label: 'Clear filters', onClick: () => {} }}
        secondaryAction={{ label: 'Browse all packages', onClick: () => {} }}
      />
    </Page>
  ),
};

const SIZES: EmptyStateSize[] = ['md', 'sm'];

export const Matrix: Story = {
  args: { title: 'No packages match your filters' },
  parameters: {
    docs: {
      description: {
        story:
          'Every combination that changes behaviour: both sizes, with a default icon vs a ' +
          'custom one, and with zero/one/two actions.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {SIZES.map((size) => (
          <div key={size} style={{ display: 'flex', flexDirection: 'column' }}>
            <EmptyState title="No results found" size={size} />
            <EmptyState
              title="Your wishlist is empty"
              description="Save packages you like to find them here."
              icon={<WishlistIcon />}
              size={size}
              action={{ label: 'Browse packages', onClick: () => {} }}
            />
            <EmptyState
              title="No packages match your filters"
              description="Try widening your travel dates or removing a filter."
              icon={<SearchIcon />}
              size={size}
              action={{ label: 'Clear filters', onClick: () => {} }}
              secondaryAction={{ label: 'Browse all packages', onClick: () => {} }}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { title: 'Your wishlist is empty' },
  render: () => (
    <Page theme="dark">
      <EmptyState
        title="Your wishlist is empty"
        description="Save packages you like to find them here."
        icon={<WishlistIcon />}
        action={{ label: 'Browse packages', onClick: () => {} }}
      />
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    title: 'No packages match your filters',
    description: 'Try widening your travel dates or removing a filter.',
    action: 'Clear filters',
    secondary: 'Browse all packages',
  },
  {
    lang: 'ms',
    title: 'Tiada pakej sepadan dengan tapisan anda',
    description: 'Cuba luaskan tarikh perjalanan atau alih keluar satu tapisan.',
    action: 'Set semula tapisan',
    secondary: 'Semak imbas semua pakej',
  },
  {
    lang: 'id',
    title: 'Tidak ada paket yang cocok dengan filter Anda',
    description: 'Coba perluas tanggal perjalanan atau hapus salah satu filter.',
    action: 'Atur ulang filter',
    secondary: 'Lihat semua paket',
  },
] as const;

export const TextExpansion: Story = {
  args: { title: 'No packages match your filters' },
  parameters: {
    docs: {
      description: {
        story:
          '"Tiada pakej sepadan dengan tapisan anda" and its Indonesian counterpart both ' +
          'run longer than the English title; both title and description wrap at their ' +
          'max-width caps rather than overflowing, and the two action buttons wrap onto ' +
          'their own line before either label truncates.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang} style={{ flex: '1 1 260px' }}>
            <EmptyState
              title={entry.title}
              description={entry.description}
              icon={<SearchIcon />}
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
 * Three small, individually copy-pasteable examples for EmptyState.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<EmptyState ... />` JSX instead of a render function
 * body. Kept separate from Playground/Matrix above, which exist to prove the
 * whole surface works, not to be copied verbatim.
 */

export const NoSearchResults: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: 'No packages match your filters',
    description: 'Try widening your travel dates or removing a filter.',
    icon: <SearchIcon />,
    action: { label: 'Clear filters', onClick: () => {} },
  },
};

export const EmptyWishlist: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: 'Your wishlist is empty',
    description: 'Save packages you like to find them here.',
    icon: <WishlistIcon />,
    action: { label: 'Browse packages', onClick: () => {} },
  },
};

export const NoBookingsYet: Story = {
  parameters: { layout: 'centered' },
  args: {
    title: 'No bookings yet',
    size: 'sm',
  },
};
