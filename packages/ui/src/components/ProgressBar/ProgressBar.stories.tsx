import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ProgressBar, type ProgressBarVariant } from './ProgressBar.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '360px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={{ ...surface, maxWidth: '420px' }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A determinate track (value known - a file upload, a multi-step form) or an ' +
          'indeterminate one (duration unknown - "Processing your payment") sharing the ' +
          'same size.progress-track thickness. The accessible name comes from `label` ' +
          'always; `showLabel` decides whether it also paints, `showValue` adds a ' +
          'percentage formatted through Intl for the given `locale` - never a hand-built ' +
          "string, and never reused as the fill's CSS width, since a locale's percent " +
          'format is not a length.\n\n' +
          'Determinate reports aria-valuenow and a formatted aria-valuetext; indeterminate ' +
          'omits both entirely per the WAI-ARIA progressbar pattern - a number that is not ' +
          'real is worse than no number. Under prefers-reduced-motion the stripe stops ' +
          'moving and the track fills evenly instead of freezing mid-sweep.',
      },
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [value, setValue] = useState(35);
  useEffect(() => {
    const id = window.setInterval(() => {
      setValue((current) => (current >= 100 ? 0 : current + 5));
    }, 400);
    return () => window.clearInterval(id);
  }, []);
  return (
    <ProgressBar label="Uploading passport.pdf" value={value} showLabel showValue locale="en" />
  );
}

export const Playground: Story = {
  args: { label: 'Uploading passport.pdf', value: 35 },
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

const VARIANTS: ProgressBarVariant[] = ['default', 'success', 'error'];

export const Matrix: Story = {
  args: { label: 'Step' },
  parameters: {
    docs: {
      description: {
        story:
          'Every variant, each at a different determinate value, plus the indeterminate ' +
          'case at the bottom for comparison - notice its stripe carries no percentage, ' +
          'because there is none to show.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {VARIANTS.map((variant, index) => (
          <ProgressBar
            key={variant}
            label={`${variant} step`}
            value={30 + index * 30}
            variant={variant}
            showLabel
            showValue
          />
        ))}
        <ProgressBar label="Processing payment" indeterminate showLabel />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { label: 'Uploading passport.pdf' },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        <ProgressBar label="Uploading passport.pdf" value={62} showLabel showValue />
        <ProgressBar label="Payment failed" value={40} variant="error" showLabel showValue />
        <ProgressBar label="Processing payment" indeterminate showLabel />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Uploading passport.pdf' },
  { lang: 'ms', label: 'Sedang memuat naik passport.pdf' },
  { lang: 'id', label: 'Mengunggah passport.pdf' },
] as const;

export const TextExpansion: Story = {
  args: { label: 'Uploading passport.pdf' },
  parameters: {
    docs: {
      description: {
        story:
          '"Sedang memuat naik passport.pdf" runs longer than the English label but the ' +
          'track width is independent of it - only the header row needs to make room, and ' +
          'it wraps rather than pushing the percentage off the edge. Each locale also ' +
          'drives its own percent formatting for the value beside it.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <ProgressBar label={entry.label} value={62} locale={entry.lang} showLabel showValue />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for ProgressBar.mdx's
 * "Contoh Penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<ProgressBar ... />` JSX instead of a render function
 * body. Kept separate from Playground/Matrix above, which exist to prove the
 * whole surface works, not to be copied verbatim.
 */

export const FileUploadProgress: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Uploading passport.pdf',
    value: 62,
    showLabel: true,
    showValue: true,
  },
};

export const ProcessingPayment: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Processing payment',
    indeterminate: true,
    showLabel: true,
  },
};

export const PaymentFailedProgress: Story = {
  parameters: { layout: 'centered' },
  args: {
    label: 'Payment failed',
    value: 40,
    variant: 'error',
    showLabel: true,
    showValue: true,
  },
};
