import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronRight, CreditCard, FileText, Globe2, Shield1Check, User2 } from '@tailgrids/icons';

import { List, ListItem } from './List.js';

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

const meta = {
  title: 'Components/List',
  component: List,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A bordered card of rows, not an interactive menu: order summary lines, ' +
          "settings entries, a package's included/excluded facilities. Each row is " +
          'independently plain, a link, or a button - see `Dropdown` instead the moment ' +
          'the group needs `role="menu"` behavior, or `Accordion`/`Collapsible` the moment ' +
          'a row needs to expand.',
      },
    },
  },
} satisfies Meta<typeof List>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <List>
          <ListItem leadingIcon={<User2 />} trailing={<ChevronRight />} href="/profile">
            Profil saya
          </ListItem>
          <ListItem leadingIcon={<CreditCard />} trailing={<ChevronRight />} href="/payment">
            Metode pembayaran
          </ListItem>
          <ListItem leadingIcon={<FileText />} trailing="3" href="/documents">
            Dokumen perjalanan
          </ListItem>
          <ListItem leadingIcon={<Globe2 />} trailing={<ChevronRight />} href="/language">
            Bahasa
          </ListItem>
        </List>
      </div>
    </Page>
  ),
};

export const OrderSummary: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A static (no `href`/`onClick`) list works just as well for a read-only summary - ' +
          'each row here is a plain `<li>`, not a link or button.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <List>
          <ListItem trailing="Rp 32.500.000">Paket Umrah 12 Hari</ListItem>
          <ListItem trailing="Rp 1.800.000">Asuransi perjalanan</ListItem>
          <ListItem trailing="- Rp 500.000">Diskon early bird</ListItem>
        </List>
      </div>
    </Page>
  ),
};

export const ActiveState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`active` marks the current row in a set - a selected room type, the current step ' +
          'of a settings section - with a tinted background and brand text, never color alone ' +
          "since the row's own label still carries the meaning.",
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <List>
          <ListItem href="/room/double" active>
            Double room
          </ListItem>
          <ListItem href="/room/twin">Twin room</ListItem>
          <ListItem href="/room/quad">Quad room</ListItem>
        </List>
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Static, link, and button rows, plus a disabled link and a disabled button.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <List>
          <ListItem leadingIcon={<Shield1Check />}>Static row</ListItem>
          <ListItem leadingIcon={<Shield1Check />} href="/link">
            Link row
          </ListItem>
          <ListItem leadingIcon={<Shield1Check />} onClick={() => {}}>
            Button row
          </ListItem>
          <ListItem leadingIcon={<Shield1Check />} href="/blocked" disabled>
            Disabled link row
          </ListItem>
          <ListItem leadingIcon={<Shield1Check />} onClick={() => {}} disabled>
            Disabled button row
          </ListItem>
        </List>
      </div>
    </Page>
  ),
};

export const HorizontalDirection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`direction="horizontal"` lays rows side by side, each sized to its own content - a ' +
          'compact filter strip rather than a full-width settings screen.',
      },
    },
  },
  render: () => (
    <Page>
      <List direction="horizontal">
        <ListItem href="/filter/all" active>
          Semua
        </ListItem>
        <ListItem href="/filter/economy">Ekonomi</ListItem>
        <ListItem href="/filter/vip">VIP</ListItem>
      </List>
    </Page>
  ),
};

export const HiddenDividers: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <List hideDividers>
          <ListItem leadingIcon={<User2 />} href="/a">
            Baris pertama
          </ListItem>
          <ListItem leadingIcon={<CreditCard />} href="/b">
            Baris kedua
          </ListItem>
        </List>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '360px' }}>
        <List>
          <ListItem leadingIcon={<User2 />} trailing={<ChevronRight />} href="/profile" active>
            Profil saya
          </ListItem>
          <ListItem leadingIcon={<CreditCard />} trailing={<ChevronRight />} href="/payment">
            Metode pembayaran
          </ListItem>
        </List>
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Travel document verification status' },
  { lang: 'ms', label: 'Status pengesahan dokumen perjalanan' },
  { lang: 'id', label: 'Status verifikasi dokumen perjalanan' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A long label truncates with an ellipsis rather than pushing the trailing content ' +
          'off the row - resize the panel to see it recover.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '280px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <List>
              <ListItem trailing={<ChevronRight />} href={`/status/${entry.lang}`}>
                {entry.label}
              </ListItem>
            </List>
          </div>
        ))}
      </div>
    </Page>
  ),
};
