import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { TimePicker } from './TimePicker.js';
import type { TimeValue } from '../TimeField/time.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  /* Room for the popover to open into inside the story frame. */
  minHeight: '400px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

const stack: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--uh-spacing-24)',
  maxWidth: '280px',
};

const meta = {
  title: 'Components/TimePicker',
  component: TimePicker,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A trigger button that opens onto three scrollable columns - Hour, Minute, and ' +
          '(in 12-hour mode) AM/PM - for picking a time by scanning and clicking rather than ' +
          'typing. For keyboard-first entry, see `TimeField` instead; the two share the same ' +
          '`TimeValue` shape, so a form can use either without translating between them. ' +
          'Reuses `Popover`/`PickerLayer` under the hood - a popover on desktop, a bottom ' +
          'sheet on a phone - the exact surface `DatePicker` already opens onto.',
      },
    },
  },
  args: { label: 'Select time' },
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledDemo() {
  const [value, setValue] = useState<TimeValue | null>({ hour: 9, minute: 30 });
  return (
    <div style={stack}>
      <TimePicker label="Meeting time" value={value} onChange={setValue} />
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
      <div style={stack}>
        <TimePicker label="Empty" />
        <TimePicker label="12-hour, filled" defaultValue={{ hour: 9, minute: 30 }} />
        <TimePicker label="24-hour" hourCycle={24} defaultValue={{ hour: 21, minute: 30 }} />
        <TimePicker label="Every minute" minuteStep={1} defaultValue={{ hour: 9, minute: 7 }} />
        <TimePicker
          label="Error"
          errorMessage="Business hours only."
          defaultValue={{ hour: 22, minute: 0 }}
        />
        <TimePicker label="Disabled" disabled defaultValue={{ hour: 9, minute: 30 }} />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={stack}>
        <TimePicker label="Meeting time" defaultValue={{ hour: 9, minute: 30 }} />
        <TimePicker label="24-hour" hourCycle={24} defaultValue={{ hour: 21, minute: 30 }} />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Meeting time', helperText: 'Choose a time slot for the call.' },
  { lang: 'ms', label: 'Masa mesyuarat', helperText: 'Pilih slot masa untuk panggilan.' },
  { lang: 'id', label: 'Waktu pertemuan', helperText: 'Pilih slot waktu untuk panggilan.' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Pilih slot masa untuk panggilan" and "Pilih slot waktu untuk panggilan" both run ' +
          'longer than the English helper text, but the trigger and popover keep their own ' +
          'fixed width - only the label and helper text wrap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={stack}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <TimePicker
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
 * Small, individually copy-pasteable examples for TimePicker.mdx's "Contoh
 * Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<TimePicker ... />` JSX.
 */

export const Basic: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Meeting time',
    helperText: 'Choose a time slot for the call.',
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
