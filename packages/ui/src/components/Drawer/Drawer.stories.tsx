import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Drawer, type DrawerProps, type DrawerSide, type DrawerSize } from './Drawer.js';
import { Button } from '../Button/Button.js';
import { PriceBreakdown } from '../PriceBreakdown/PriceBreakdown.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '480px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function Launcher({
  label,
  children,
  ...drawer
}: Omit<DrawerProps, 'open' | 'onClose'> & { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Drawer {...drawer} open={open} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </>
  );
}

const SUMMARY = (
  <PriceBreakdown
    variant="inline"
    currency="MYR"
    locale="en-MY"
    passengers={{ adults: 2, children: 1, infants: 0 }}
    items={[
      { label: 'Adults', amount: 19600, type: 'base', quantity: 2 },
      { label: 'Children', amount: 7300, type: 'base' },
      { label: 'Visa Processing', amount: 1350, type: 'fee' },
      { label: 'Travel Insurance', amount: 750, type: 'addon' },
      { label: 'Early bird discount', amount: 1500, type: 'discount' },
      { label: 'Total', amount: 27500, type: 'total' },
    ]}
  />
);

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The desktop rail: full-height, attached to one side, sliding in from it on the ' +
          'overlay pairing and out on the exit pairing. The whole modal contract - portal, ' +
          'focus trap, scroll lock, Escape, backdrop, focus return, refusal props, ' +
          'initialFocus - comes from the same three hooks Modal and BottomSheet use; the ' +
          'drawer adds only a side and a width.\n\n' +
          '`side` is physical, not logical, on purpose: a drawer anchors to something on ' +
          'screen - the cart icon top-right, the nav top-left - and that anchor does not ' +
          'move when the text direction does. An RTL layout wanting the mirrored side ' +
          'passes the other value.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = { open: false, onClose: () => {}, title: 'Booking summary' };

export const Playground: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Review booking"
        title="Booking summary"
        size="md"
        footer={
          <>
            <Button variant="outline">Keep browsing</Button>
            <Button variant="primary">Continue to payment</Button>
          </>
        }
      >
        {SUMMARY}
      </Launcher>
    </Page>
  ),
};

const SIDES: DrawerSide[] = ['left', 'right'];
const SIZES: DrawerSize[] = ['sm', 'md', 'lg'];

export const Matrix: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Both sides against every width. Drawers are portalled singletons, so the matrix ' +
          'is a launcher grid - one open at a time, which is also the only honest way to ' +
          'show the focus trap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
        {SIDES.map((side) =>
          SIZES.map((size) => (
            <Launcher
              key={`${side}-${size}`}
              label={`${side} / ${size}`}
              side={side}
              size={size}
              title="Booking summary"
              footer={<Button variant="primary">Continue to payment</Button>}
            >
              {SUMMARY}
            </Launcher>
          )),
        )}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: baseArgs,
  parameters: { backgrounds: { disable: true } },
  render: function Dark() {
    const [open, setOpen] = useState(true);
    return (
      <Page theme="dark">
        <Button variant="outline" onClick={() => setOpen(true)}>
          Reopen
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Booking summary"
          footer={<Button variant="primary">Continue to payment</Button>}
        >
          {SUMMARY}
        </Drawer>
      </Page>
    );
  },
};

/* --------------------------------------------------------- documentation
 * Three small, realistic examples for Drawer.mdx's "Contoh Penggunaan".
 * Each wraps the trigger in the same Launcher pattern the stories above
 * use - a drawer is a portalled singleton, so it needs something on screen
 * to open it from.
 */

export const PackageDetails: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher label="View itinerary" title="5D4N Makkah & Madinah" side="right" size="md">
        <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
          Day 1: Arrival in Jeddah, transfer to Madinah. Day 2-3: Ziarah and prayers at Masjid
          Nabawi. Day 4: Travel to Makkah for Umrah. Day 5: Departure.
        </p>
      </Launcher>
    </Page>
  ),
};

export const FilterDrawer: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Filter packages"
        title="Filter"
        side="left"
        size="sm"
        footer={
          <Button variant="primary" fullWidth>
            Apply filters
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
          <label style={{ display: 'flex', gap: 'var(--uh-spacing-8)', alignItems: 'center' }}>
            <input type="checkbox" /> Direct flight only
          </label>
          <label style={{ display: 'flex', gap: 'var(--uh-spacing-8)', alignItems: 'center' }}>
            <input type="checkbox" /> 5-star hotel
          </label>
          <label style={{ display: 'flex', gap: 'var(--uh-spacing-8)', alignItems: 'center' }}>
            <input type="checkbox" /> Departs from Kuala Lumpur
          </label>
        </div>
      </Launcher>
    </Page>
  ),
};

export const NonDismissiblePayment: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          '`closeOnOverlayClick={false}` and `closeOnEsc={false}` together: a payment step ' +
          'in progress should not vanish because of a stray click or an accidental Escape. ' +
          'The close button in the header still works - only the two implicit dismissals ' +
          'are refused, not every way out.',
      },
    },
  },
  render: () => (
    <Page>
      <Launcher
        label="Confirm payment"
        title="Confirm payment"
        closeOnOverlayClick={false}
        closeOnEsc={false}
        footer={
          <>
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Pay MYR 2,750</Button>
          </>
        }
      >
        <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
          This step cannot be dismissed by clicking outside or pressing Escape - a payment in
          progress should never close by accident.
        </p>
      </Launcher>
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    label: 'English',
    title: 'Booking summary',
    continueLabel: 'Continue to payment',
    back: 'Keep browsing',
    close: 'Close',
  },
  {
    lang: 'ms',
    label: 'Bahasa Melayu',
    title: 'Ringkasan tempahan',
    continueLabel: 'Teruskan ke pembayaran',
    back: 'Terus melayari',
    close: 'Tutup',
  },
  {
    lang: 'id',
    label: 'Bahasa Indonesia',
    title: 'Ringkasan pemesanan',
    continueLabel: 'Lanjutkan ke pembayaran',
    back: 'Lanjut menjelajah',
    close: 'Tutup',
  },
] as const;

export const TextExpansion: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          '"Lanjutkan ke pembayaran" half again the English; the footer wraps rather than ' +
          'shrinking its buttons, and the fixed drawer width absorbs nothing - which is the ' +
          'point of testing at md. One drawer at a time.',
      },
    },
  },
  render: function Expansion() {
    const [openLang, setOpenLang] = useState<string | null>('id');
    const copy = COPY.find((entry) => entry.lang === openLang);
    return (
      <Page>
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-8)' }}>
          {COPY.map((entry) => (
            <Button key={entry.lang} variant="outline" onClick={() => setOpenLang(entry.lang)}>
              {entry.label}
            </Button>
          ))}
        </div>
        {copy ? (
          <div lang={copy.lang}>
            <Drawer
              open
              onClose={() => setOpenLang(null)}
              title={copy.title}
              closeLabel={copy.close}
              footer={
                <>
                  <Button variant="outline" onClick={() => setOpenLang(null)}>
                    {copy.back}
                  </Button>
                  <Button variant="primary" onClick={() => setOpenLang(null)}>
                    {copy.continueLabel}
                  </Button>
                </>
              }
            >
              {SUMMARY}
            </Drawer>
          </div>
        ) : null}
      </Page>
    );
  },
};
