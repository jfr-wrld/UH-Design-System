import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table.js';
import { Badge } from '../Badge/Badge.js';

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
  title: 'Components/Table',
  component: Table,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A thin, composable wrapper around the native `<table>` family - `Table`, ' +
          '`TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell` map 1:1 ' +
          "onto `table`/`thead`/`tbody`/`tr`/`th`/`td`, each just adding this system's own " +
          'token-driven paint. Every native table attribute still works on every part - ' +
          "`colSpan` on a cell, `onClick` on a row - since each one extends its element's " +
          'real HTML attribute type. `Table` also supplies the horizontal-scroll wrapper, ' +
          'so a wide table scrolls in its own box instead of forcing the page itself to ' +
          "scroll sideways - and it's that wrapper, not the `<table>` inside it, that " +
          '`aria-label`/`aria-labelledby` on `Table` actually names, since the wrapper is ' +
          'the element that is really focusable and scrollable.',
      },
    },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

interface Booking {
  id: string;
  pilgrim: string;
  package: string;
  departure: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

const BOOKINGS: Booking[] = [
  {
    id: 'UH-10245',
    pilgrim: 'Ahmad Zulkifli',
    package: 'Umrah Reguler 9 Hari',
    departure: '12 Jan 2027',
    status: 'confirmed',
  },
  {
    id: 'UH-10246',
    pilgrim: 'Siti Nurhaliza',
    package: 'Umrah Plus Turki',
    departure: '18 Feb 2027',
    status: 'pending',
  },
  {
    id: 'UH-10247',
    pilgrim: 'Muhammad Faiz',
    package: 'Haji Furoda',
    departure: '20 Mei 2027',
    status: 'confirmed',
  },
  {
    id: 'UH-10248',
    pilgrim: 'Nur Aisyah',
    package: 'Umrah Reguler 12 Hari',
    departure: '3 Mar 2027',
    status: 'cancelled',
  },
];

const STATUS_LABEL: Record<Booking['status'], string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

const STATUS_VARIANT: Record<Booking['status'], 'success' | 'warning' | 'error'> = {
  confirmed: 'success',
  pending: 'warning',
  cancelled: 'error',
};

function BookingsTable({
  fullBleed = false,
  label = 'Recent bookings',
}: {
  fullBleed?: boolean;
  label?: string;
}) {
  return (
    <Table fullBleed={fullBleed} aria-label={label}>
      <TableHeader>
        <TableRow>
          <TableHead>Booking ID</TableHead>
          <TableHead>Pilgrim</TableHead>
          <TableHead>Package</TableHead>
          <TableHead>Departure</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {BOOKINGS.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell>{booking.id}</TableCell>
            <TableCell>{booking.pilgrim}</TableCell>
            <TableCell>{booking.package}</TableCell>
            <TableCell>{booking.departure}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const RecentBookings: Story = {
  render: () => (
    <Page>
      <BookingsTable />
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Bordered (default) above a full-bleed table below, for direct comparison. Each ' +
          "gets its own `aria-label` here - two regions on one page can't share a name, or a " +
          'screen reader has no way to tell them apart in the landmarks list.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <BookingsTable label="Recent bookings, bordered" />
        <BookingsTable fullBleed label="Recent bookings, full width" />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <BookingsTable />
    </Page>
  ),
};

const COPY: Array<{ lang: string; pilgrim: string; package: string }> = [
  { lang: 'en', pilgrim: 'Ahmad Zulkifli', package: 'Regular Umrah 9 Days' },
  { lang: 'ms', pilgrim: 'Ahmad Zulkifli', package: 'Umrah Biasa 9 Hari' },
  { lang: 'id', pilgrim: 'Ahmad Zulkifli', package: 'Umrah Reguler 9 Hari Perjalanan Lengkap' },
];

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Umrah Reguler 9 Hari Perjalanan Lengkap" runs longer than the other two - the ' +
          'cell wraps rather than pushing later columns off the visible width, and the ' +
          'table itself scrolls horizontally in its own box if a row still runs wider than ' +
          'its container.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang} style={{ maxWidth: '360px' }}>
            {/* Distinct per language - two regions on one page can't share
                an aria-label, see Matrix's own note above. */}
            <Table aria-label={`Booking (${entry.lang})`}>
              <TableHeader>
                <TableRow>
                  <TableHead>Pilgrim</TableHead>
                  <TableHead>Package</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{entry.pilgrim}</TableCell>
                  <TableCell>{entry.package}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </Page>
  ),
};
