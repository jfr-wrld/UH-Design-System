import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ToastProvider, useToast } from './index.js';
import { Button } from '../Button/Button.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '420px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      <ToastProvider position="bottom-center">{children}</ToastProvider>
    </div>
  );
}

function PlaygroundDemo() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
      <Button
        variant="primary"
        onClick={() => toast.success('Your booking is confirmed.', { title: 'Booked' })}
      >
        Show success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('We could not charge your card. Try another one.', {
            title: 'Payment failed',
          })
        }
      >
        Show error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.show({
            description: 'Seat released. You can rebook within 24 hours.',
            action: { label: 'Undo', onClick: () => toast.info('Seat held again.') },
          })
        }
      >
        Show with action
      </Button>
      <Button variant="ghost" onClick={() => toast.dismissAll()}>
        Dismiss all
      </Button>
    </div>
  );
}

const meta = {
  title: 'Components/Toast',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Not opened, announced. ToastProvider portals a stack to document.body only ' +
          'while at least one toast is active - `useToast()` returns show/success/' +
          'warning/error/info, each stamping a variant onto a shared record. Every item ' +
          'runs the same open/closing/closed lifecycle as Modal and Drawer through ' +
          'usePresence; what a toast adds on top is its own auto-dismiss clock ' +
          '(useAutoDismiss) and a call into the shared announce() utility, rather than ' +
          'relying on the visible stack itself to be a live region - role="status" ' +
          'insertion is announced inconsistently across screen readers, particularly ' +
          'Safari + VoiceOver.\n\n' +
          'default/success/info read and go in 4-5s; warning gets 8s, since it is ' +
          'usually asking for a decision; error never times out - "Payment failed" ' +
          'disappearing on its own is how a person loses track of what they were paying. ' +
          'Every timer pauses on hover or focus and resumes once every hold - both ' +
          'hover and a focused action button - has released (WCAG 2.2.1 Timing ' +
          'Adjustable). Exceeding `limit` dismisses the oldest active toast rather than ' +
          'clipping the newest one out of view.',
      },
    },
  },
} satisfies Meta<typeof ToastProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

function MatrixDemo() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.show({ description: 'Draft saved.' })}
      >
        default
      </Button>
      <Button variant="outline" size="sm" onClick={() => toast.success('Package added to cart.')}>
        success
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.warning('Prices may change closer to departure.')}
      >
        warning
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.error('Could not save your changes.')}
      >
        error
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast.info('Check-in opens 48 hours before.')}
      >
        info
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.show({
            title: 'Refund requested',
            description: 'Refunds follow the package policy and reach your account in 5-7 days.',
          })
        }
      >
        title + description
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.show({
            description: 'Seat released.',
            action: { label: 'Undo', onClick: () => {} },
          })
        }
      >
        with action
      </Button>
    </div>
  );
}

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every variant, plus the title+description and action-button shapes, each its ' +
          'own trigger so the stack is easy to build up and compare at once.',
      },
    },
  },
  render: () => (
    <Page>
      <MatrixDemo />
    </Page>
  ),
};

function DarkDemo() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
      <Button variant="primary" onClick={() => toast.success('Your booking is confirmed.')}>
        Show success
      </Button>
      <Button variant="outline" onClick={() => toast.error('Payment failed.')}>
        Show error
      </Button>
    </div>
  );
}

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <DarkDemo />
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually-Canvas-able examples for Toast.mdx's "Contoh
 * penggunaan" section - each its own trigger, since a toast only exists
 * once fired and there is no honest args-only version of a hook.
 */

function BookingConfirmedDemo() {
  const toast = useToast();
  return (
    <Button
      variant="primary"
      onClick={() => toast.success('Your booking is confirmed.', { title: 'Booked' })}
    >
      Confirm booking
    </Button>
  );
}

export const BookingConfirmed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The `success` shorthand: `toast.success(description, { title })`. Reads and ' +
          'goes after 4s - long enough for a sentence, short enough not to sit in the way.',
      },
    },
  },
  render: () => (
    <Page>
      <BookingConfirmedDemo />
    </Page>
  ),
};

function PaymentFailedDemo() {
  const toast = useToast();
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.error('We could not charge your card. Try another one.', {
          title: 'Payment failed',
        })
      }
    >
      Charge card
    </Button>
  );
}

export const PaymentFailed: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`error` never times out - `duration` resolves to `null` for this variant ' +
          'unless a caller overrides it. "Payment failed" disappearing on its own is how ' +
          'someone loses track of what they were paying; it waits for the close button ' +
          'instead of a clock.',
      },
    },
  },
  render: () => (
    <Page>
      <PaymentFailedDemo />
    </Page>
  ),
};

function UndoActionDemo() {
  const toast = useToast();
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast.show({
          description: 'Seat released. You can rebook within 24 hours.',
          action: { label: 'Undo', onClick: () => toast.info('Seat held again.') },
        })
      }
    >
      Release seat
    </Button>
  );
}

export const UndoAction: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'An `action` renders as a second button inside the toast, separate from the ' +
          'close control - clicking it fires its own `onClick` without dismissing the ' +
          'toast, so a slow reader still has the close button to dismiss on their own terms.',
      },
    },
  },
  render: () => (
    <Page>
      <UndoActionDemo />
    </Page>
  ),
};

const COPY = {
  en: {
    label: 'English',
    trigger: 'Show refund toast',
    title: 'Refund requested',
    description: 'Refunds follow the package policy and reach your account in 5-7 working days.',
  },
  ms: {
    label: 'Bahasa Melayu',
    trigger: 'Tunjuk pemberitahuan bayaran balik',
    title: 'Bayaran balik diminta',
    description:
      'Bayaran balik mengikut polisi pakej dan akan sampai ke akaun anda dalam 5-7 hari bekerja.',
  },
  id: {
    label: 'Bahasa Indonesia',
    trigger: 'Tampilkan notifikasi pengembalian dana',
    title: 'Pengembalian dana diminta',
    description:
      'Pengembalian dana mengikuti kebijakan paket dan akan masuk ke akun Anda dalam 5-7 hari kerja.',
  },
} as const;

function ExpansionDemo() {
  const toast = useToast();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
      {(Object.keys(COPY) as Array<keyof typeof COPY>).map((lang) => {
        const copy = COPY[lang];
        return (
          <div key={lang} lang={lang}>
            <Button
              variant="outline"
              onClick={() =>
                toast.show({ title: copy.title, description: copy.description, duration: null })
              }
            >
              {copy.label}: {copy.trigger}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Indonesian and Malay descriptions run noticeably longer than the English ' +
          'one; the card wraps rather than truncating, and its width still caps at ' +
          'size.toast.width. Durations are off here so all three can sit on screen at ' +
          'once for comparison - in real use the same content still expires (or not) by ' +
          'the same rules as every other language.',
      },
    },
  },
  render: () => (
    <Page>
      <ExpansionDemo />
    </Page>
  ),
};
