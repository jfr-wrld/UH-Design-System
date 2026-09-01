import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';
import { Calendar, CreditCard, Gear1, MapMarker5, User2 } from '@tailgrids/icons';

import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from './Command.js';
import { CommandDialog } from './CommandDialog.js';
import { Button } from '../Button/Button.js';

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
  title: 'Components/Command',
  component: Command,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A command menu: a search box filtering a grouped, keyboard-navigable list. No ' +
          'dependency behind it - filtering, the active descendant, and Up/Down/Enter are ' +
          'all plain state and a `role="combobox"` `aria-activedescendant` pairing, the same ' +
          'accessible pattern `SearchCombobox` already uses. `CommandDialog` wraps the same ' +
          'tree in `Overlay` with a global Cmd/Ctrl+K shortcut, for a command palette rather ' +
          'than an inline menu.',
      },
    },
  },
} satisfies Meta<typeof Command>;

export default meta;
type Story = StoryObj<typeof meta>;

function BookingCommand() {
  return (
    <Command label="Search actions">
      <CommandInput placeholder="Search a booking, a destination, an action..." />
      <CommandList>
        <CommandEmpty>No matching actions.</CommandEmpty>
        <CommandGroup heading="Bookings">
          <CommandItem value="Umrah Reguler 9 Hari" keywords={['UH-10245']}>
            <MapMarker5 />
            <span>Umrah Reguler 9 Hari - UH-10245</span>
          </CommandItem>
          <CommandItem value="Umrah Plus Turki" keywords={['UH-10246']}>
            <MapMarker5 />
            <span>Umrah Plus Turki - UH-10246</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="New booking">
            <Calendar />
            <span>New booking</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem value="Billing">
            <CreditCard />
            <span>Billing</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
          <CommandItem value="Account settings">
            <Gear1 />
            <span>Account settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem value="Profile" disabled>
            <User2 />
            <span>Profile (verification pending)</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <BookingCommand />
      </div>
    </Page>
  ),
};

function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open command palette (or press ⌘K / Ctrl+K)</Button>
      <CommandDialog open={open} onOpenChange={setOpen} label="Command palette">
        <BookingCommand />
      </CommandDialog>
    </>
  );
}

export const Dialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same tree as the Playground above, opened as a modal palette instead of an ' +
          'inline menu - `Overlay` supplies the backdrop, focus trap, and Escape handling; ' +
          'CommandDialog only adds the global Cmd/Ctrl+K toggle.',
      },
    },
  },
  render: () => (
    <Page>
      <DialogDemo />
    </Page>
  ),
};

export const EmptyResults: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Typing something nothing matches shows CommandEmpty in place of every group.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <Command label="Search actions" defaultValue="zzz nothing here">
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No matching actions.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem value="New booking">New booking</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '480px' }}>
        <BookingCommand />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', placeholder: 'Search a booking, a destination, an action...' },
  { lang: 'ms', placeholder: 'Cari tempahan, destinasi, atau tindakan...' },
  { lang: 'id', placeholder: 'Cari pemesanan, destinasi, atau tindakan...' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Cari pemesanan, destinasi, atau tindakan..." runs about the same length as the ' +
          "English placeholder, but the input's own width already comes from the palette, " +
          'not the placeholder text - a longer one would simply be clipped, same as any ' +
          'native input placeholder.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-24)',
          maxWidth: '480px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Command label="Search actions">
              <CommandInput placeholder={entry.placeholder} />
              <CommandList>
                <CommandGroup heading="Actions">
                  <CommandItem value="New booking">New booking</CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        ))}
      </div>
    </Page>
  ),
};
