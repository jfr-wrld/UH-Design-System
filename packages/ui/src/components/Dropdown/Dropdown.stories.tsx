import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PenToSquare, Copy1, ShareNodes, Trash1 } from '@tailgrids/icons';

import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownGroup,
  DropdownSeparator,
} from './Dropdown.js';
import { Button } from '../Button/Button.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-64) var(--uh-spacing-24)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A trigger that opens a floating menu of actions - the "..." on a card, an account ' +
          'menu - not a value picker (`Select`) or a searchable list (`Command`). ' +
          '`role="menu"`/`role="menuitem"` with real, roving keyboard focus, the WAI-ARIA Menu ' +
          'Button Pattern.',
      },
    },
  },
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

function PackageActionsMenu() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="outline">Actions</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownItem>
          <PenToSquare />
          Edit package
        </DropdownItem>
        <DropdownItem>
          <Copy1 />
          Duplicate
        </DropdownItem>
        <DropdownItem>
          <ShareNodes />
          Share
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem destructive>
          <Trash1 />
          Delete package
        </DropdownItem>
      </DropdownContent>
    </Dropdown>
  );
}

export const Playground: Story = {
  render: () => (
    <Page>
      <PackageActionsMenu />
    </Page>
  ),
};

export const WithGroups: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Items split into labelled `DropdownGroup`s, a disabled item, and a destructive ' +
          'one at the end - a booking-row "..." menu.',
      },
    },
  },
  render: () => (
    <Page>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="outline">Booking #UH-10245</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownGroup heading="Booking">
            <DropdownItem>View details</DropdownItem>
            <DropdownItem>Download invoice</DropdownItem>
            <DropdownItem disabled>Reschedule (paid in full)</DropdownItem>
          </DropdownGroup>
          <DropdownSeparator />
          <DropdownGroup heading="Danger zone">
            <DropdownItem destructive>Cancel booking</DropdownItem>
          </DropdownGroup>
        </DropdownContent>
      </Dropdown>
    </Page>
  ),
};

export const Placement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every corner: the panel flips to whichever side of the trigger actually has room, ' +
          'the same `useAnchoredPortal` logic every other floating surface in this package ' +
          'shares.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--uh-spacing-64)',
          maxWidth: '480px',
        }}
      >
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline">Bottom-start (default)</Button>
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem>Delete</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline">Bottom-end</Button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem>Delete</DropdownItem>
          </DropdownContent>
        </Dropdown>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="outline">Top-start</Button>
          </DropdownTrigger>
          <DropdownContent placement="top">
            <DropdownItem>Edit</DropdownItem>
            <DropdownItem>Delete</DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <PackageActionsMenu />
    </Page>
  ),
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A longer Indonesian item label still fits the menu without truncating - the panel ' +
          "grows past its own min-width, it doesn't clip.",
      },
    },
  },
  render: () => (
    <Page>
      <Dropdown>
        <DropdownTrigger>
          <Button variant="outline">Paket Umrah Reguler</Button>
        </DropdownTrigger>
        <DropdownContent>
          <DropdownItem>Ubah tanggal keberangkatan</DropdownItem>
          <DropdownItem>Bagikan ke agen perjalanan lain</DropdownItem>
          <DropdownSeparator />
          <DropdownItem destructive>Batalkan pemesanan</DropdownItem>
        </DropdownContent>
      </Dropdown>
    </Page>
  ),
};
