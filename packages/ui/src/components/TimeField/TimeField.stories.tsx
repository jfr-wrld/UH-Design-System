import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { TimeField, type TimeValue } from './TimeField.js';

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
  title: 'Components/TimeField',
  component: TimeField,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A segment-based time input - Hour, Minute, an optional Second, and (in ' +
          '12-hour mode) an AM/PM segment, each independently focusable and editable with ' +
          'the keyboard. No dependency behind it: every segment is a hand-rolled ' +
          '`role="spinbutton"`, the same way `OTPInput` hand-rolls its own per-box keyboard ' +
          'handling instead of reaching for a library. `value`/`defaultValue`/`onChange` ' +
          'always carry a complete time or `null` - `onChange` only fires once every ' +
          'segment the current `granularity`/`hourCycle` requires has a real value.',
      },
    },
  },
  args: { label: 'Meeting time' },
} satisfies Meta<typeof TimeField>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDemo() {
  const [value, setValue] = useState<TimeValue | null>({ hour: 9, minute: 30 });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
      <TimeField label="Meeting time" value={value} onChange={setValue} />
      <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
        {value
          ? `${String(value.hour).padStart(2, '0')}:${String(value.minute).padStart(2, '0')}`
          : 'Not set'}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => (
    <Page>
      <ControlledDemo />
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <TimeField label="Empty" />
        <TimeField label="12-hour, filled" defaultValue={{ hour: 9, minute: 30 }} />
        <TimeField label="24-hour" hourCycle={24} defaultValue={{ hour: 21, minute: 30 }} />
        <TimeField
          label="With seconds"
          granularity="second"
          defaultValue={{ hour: 9, minute: 30, second: 15 }}
        />
        <TimeField
          label="Error"
          errorMessage="Business hours only."
          defaultValue={{ hour: 22, minute: 0 }}
        />
        <TimeField
          label="Success"
          successMessage="Time confirmed."
          defaultValue={{ hour: 9, minute: 0 }}
        />
        <TimeField label="Disabled" disabled defaultValue={{ hour: 9, minute: 30 }} />
        <TimeField label="Read only" readOnly defaultValue={{ hour: 9, minute: 30 }} />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <TimeField label="Meeting time" defaultValue={{ hour: 9, minute: 30 }} />
        <TimeField label="24-hour" hourCycle={24} defaultValue={{ hour: 21, minute: 30 }} />
        <TimeField
          label="Error"
          errorMessage="Business hours only."
          defaultValue={{ hour: 22, minute: 0 }}
        />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Meeting time', helperText: 'Choose a start time for the meeting.' },
  { lang: 'ms', label: 'Masa mesyuarat', helperText: 'Pilih masa mula untuk mesyuarat.' },
  { lang: 'id', label: 'Waktu pertemuan', helperText: 'Pilih waktu mulai untuk pertemuan.' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Pilih masa mula untuk mesyuarat" and "Pilih waktu mulai untuk pertemuan" both ' +
          "run longer than the English helper text, but the segments' own width is fixed " +
          'and independent of it - only the label and helper text wrap.',
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
          maxWidth: '280px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <TimeField
              label={entry.label}
              helperText={entry.helperText}
              defaultValue={{ hour: 9, minute: 30 }}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Small, individually copy-pasteable examples for TimeField.mdx's "Contoh
 * Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<TimeField ... />` JSX.
 */

export const Basic: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Meeting time',
    helperText: 'Choose a start time for the meeting.',
  },
};

export const TwentyFourHour: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Departure time',
    hourCycle: 24,
    defaultValue: { hour: 21, minute: 30 },
  },
};

export const WithSeconds: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Precise time',
    granularity: 'second',
    defaultValue: { hour: 9, minute: 30, second: 15 },
  },
};
