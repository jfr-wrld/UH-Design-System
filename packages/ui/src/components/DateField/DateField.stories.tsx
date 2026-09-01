import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { DateField } from './DateField.js';

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
  title: 'Components/DateField',
  component: DateField,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "`TimeField`'s own sibling: a segment-based Day/Month/Year date input, typed " +
          'directly rather than browsed through a popup calendar. For a birthdate or a ' +
          "passport's expiry date - decades of clicking `DatePicker` back a month at a time " +
          'is real friction typing three short numbers does not have.',
      },
    },
  },
  args: { label: 'Date of birth' },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <DateField label="Date of birth" />
      </div>
    </Page>
  ),
};

export const StateMatrix: Story = {
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--uh-spacing-24)',
          maxWidth: '640px',
        }}
      >
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Empty
          </p>
          <DateField label="Date of birth" />
        </div>
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Filled
          </p>
          <DateField label="Date of birth" defaultValue={{ day: 5, month: 3, year: 1998 }} />
        </div>
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Error
          </p>
          <DateField label="Passport expiry" errorMessage="This date has already passed." />
        </div>
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Disabled
          </p>
          <DateField
            label="Date of birth"
            disabled
            defaultValue={{ day: 5, month: 3, year: 1998 }}
          />
        </div>
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Read only
          </p>
          <DateField
            label="Date of birth"
            readOnly
            defaultValue={{ day: 5, month: 3, year: 1998 }}
          />
        </div>
        <div>
          <p className="uh-type-web-label" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
            Helper text
          </p>
          <DateField label="Date of birth" helperText="As shown on your passport." />
        </div>
      </div>
    </Page>
  ),
};

export const PassportExpiry: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`minYear`/`maxYear` narrow the valid range to what the field is actually for - a ' +
          "passport's expiry date has no business accepting 1850, the way a date of birth " +
          'field has no business accepting a year past today.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <DateField
          label="Passport expiry"
          minYear={new Date().getFullYear()}
          maxYear={new Date().getFullYear() + 15}
          helperText="Must be valid for at least 6 months after travel."
        />
      </div>
    </Page>
  ),
};

export const LeapYearClamping: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '29 February, entered while the year still reads 2024 (a leap year) - stepping the ' +
          'year down to 2023 with the arrow keys settles the day at 28 automatically, the ' +
          'same way a native date input resolves the conflict instead of leaving an ' +
          'impossible date sitting in the field.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '320px' }}>
        <DateField label="Date of birth" defaultValue={{ day: 29, month: 2, year: 2024 }} />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '320px' }}>
        <DateField label="Date of birth" defaultValue={{ day: 5, month: 3, year: 1998 }} />
      </div>
    </Page>
  ),
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The segments themselves never translate (digits are digits in every locale this ' +
          'product ships), so only the label and helper text vary here - both wrap normally ' +
          'like any other field label.',
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
          maxWidth: '320px',
        }}
      >
        <div lang="en">
          <DateField label="Date of birth" helperText="As shown on your passport." />
        </div>
        <div lang="ms">
          <DateField label="Tarikh lahir" helperText="Seperti tertera dalam pasport." />
        </div>
        <div lang="id">
          <DateField label="Tanggal lahir" helperText="Sesuai yang tertera di paspor." />
        </div>
      </div>
    </Page>
  ),
};
