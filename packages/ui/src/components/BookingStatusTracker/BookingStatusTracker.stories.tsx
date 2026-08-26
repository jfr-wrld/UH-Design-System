import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { BookingStatusTracker } from './BookingStatusTracker.js';
import type { BookingStatusTrackerLabels } from './labels.js';

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
  title: 'Components/BookingStatusTracker',
  component: BookingStatusTracker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Where a booking stands, as one ordered list in two directions. The states fall ' +
          'out of `currentStep`: everything before it is completed, everything after is ' +
          "upcoming, and a step's own `error` flag overrides its position - a failed " +
          'payment is the current step gone wrong, rejected documents a completed one ' +
          'reopened.\n\n' +
          'Every state is a shape as well as a colour - check, ring, number, warning ' +
          'triangle - and the same fact reaches a screen reader as a word appended to the ' +
          'label, with `aria-current="step"` on the active one. Timestamps go through ' +
          '`Intl.DateTimeFormat`.\n\n' +
          'The variant is a prop, not a media query, because the tracker cannot know ' +
          'whether it sits in a sidebar or a full page; the consumer pairs it with ' +
          '`useMediaQuery(MOBILE_QUERY)` where the viewport should decide.',
      },
    },
  },
} satisfies Meta<typeof BookingStatusTracker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { currentStep: 1 },
  render: (args) => (
    <Page>
      <div style={{ maxWidth: '720px' }}>
        <BookingStatusTracker {...args} />
      </div>
    </Page>
  ),
};

export const Vertical: Story = {
  args: { currentStep: 1, variant: 'vertical' },
  parameters: {
    docs: {
      description: {
        story: 'The phone form, with details that would crowd the horizontal one.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <BookingStatusTracker
          variant="vertical"
          currentStep={2}
          locale="en-MY"
          steps={[
            {
              label: 'Booking',
              description: 'Confirmed by Madinah Travel & Tours.',
              timestamp: new Date(2026, 1, 3, 10, 12),
            },
            {
              label: 'Payment',
              description: 'Paid in full by FPX transfer.',
              timestamp: new Date(2026, 1, 5, 14, 32),
            },
            { label: 'Documents', description: 'Passports due 30 days before departure.' },
            { label: 'Ready to Depart' },
          ]}
        />
      </div>
    </Page>
  ),
};

export const AllStates: Story = {
  args: { currentStep: 1 },
  parameters: {
    docs: {
      description: {
        story:
          'Every step state at once, error included. The error sits mid-journey to show it ' +
          'overriding a completed position.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-32)',
          maxWidth: '720px',
        }}
      >
        <div>
          <Caption>just started</Caption>
          <BookingStatusTracker currentStep={0} />
        </div>
        <div>
          <Caption>documents rejected after payment</Caption>
          <BookingStatusTracker
            currentStep={3}
            steps={[
              { label: 'Booking' },
              { label: 'Payment' },
              {
                label: 'Documents',
                error: true,
                description: 'Passport photo rejected. Upload a new scan.',
              },
              { label: 'Ready to Depart' },
            ]}
          />
        </div>
        <div>
          <Caption>everything done</Caption>
          <BookingStatusTracker currentStep={4} />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { currentStep: 2 },
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '720px' }}>
        <BookingStatusTracker currentStep={2} />
      </div>
    </Page>
  ),
};

const MS_STEPS = [
  { label: 'Tempahan' },
  { label: 'Pembayaran' },
  { label: 'Dokumen' },
  { label: 'Sedia Berlepas' },
];

const ID_STEPS = [
  { label: 'Pemesanan' },
  { label: 'Pembayaran' },
  { label: 'Dokumen' },
  { label: 'Siap Berangkat' },
];

const MS_LABELS: Partial<BookingStatusTrackerLabels> = {
  tracker: 'Status tempahan',
  completed: 'Selesai',
  current: 'Langkah semasa',
  upcoming: 'Belum bermula',
  error: 'Perlu perhatian',
};

const ID_LABELS: Partial<BookingStatusTrackerLabels> = {
  tracker: 'Status pemesanan',
  completed: 'Selesai',
  current: 'Langkah saat ini',
  upcoming: 'Belum dimulai',
  error: 'Perlu perhatian',
};

export const TextExpansion: Story = {
  args: { currentStep: 1 },
  parameters: {
    docs: {
      description: {
        story:
          '"Sedia Berlepas" and "Siap Berangkat" both outrun "Ready to Depart" while the ' +
          'horizontal tracker gives every step an equal quarter, so the labels wrap to a ' +
          'second line and the markers hold their line - the connector hangs off the marker, ' +
          'not the text. Steps come translated from the consumer; the tracker owns only the ' +
          'state words.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-32)',
          maxWidth: '640px',
        }}
      >
        <div lang="en">
          <Caption>en</Caption>
          <BookingStatusTracker currentStep={1} />
        </div>
        <div lang="ms">
          <Caption>ms</Caption>
          <BookingStatusTracker
            currentStep={1}
            steps={MS_STEPS}
            labels={MS_LABELS}
            locale="ms-MY"
          />
        </div>
        <div lang="id">
          <Caption>id</Caption>
          <BookingStatusTracker
            currentStep={1}
            steps={ID_STEPS}
            labels={ID_LABELS}
            locale="id-ID"
          />
        </div>
      </div>
    </Page>
  ),
};
