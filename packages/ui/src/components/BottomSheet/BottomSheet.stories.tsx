import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { BottomSheet, type BottomSheetProps } from './BottomSheet.js';
import { Button } from '../Button/Button.js';
import { Checkbox } from '../Checkbox/Checkbox.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '560px',
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
  ...sheet
}: Omit<BottomSheetProps, 'open' | 'onClose'> & { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <BottomSheet {...sheet} open={open} onClose={() => setOpen(false)}>
        {children}
      </BottomSheet>
    </>
  );
}

const FILTERS = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
    <Checkbox label="Direct flights only" />
    <Checkbox label="Hotel within 500 m of the Haram" defaultChecked />
    <Checkbox label="Breakfast included" />
    <Checkbox label="Visa handled by the agency" defaultChecked />
    <Checkbox label="Instalment plans available" />
  </div>
);

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "The phone's modal surface, and the future FilterPanel's host. Same contract " +
          'as Modal - portal, focus trap, scroll lock, Escape, backdrop, focus return, all ' +
          'through the shared hooks - plus what only a sheet has: snap points as viewport ' +
          'fractions, a drag gesture that follows the finger, flicks that step between ' +
          'snaps, and a drag past the lowest rest that closes.\n\n' +
          'The grabber is a real slider: Arrow keys resize, Home/End jump, ArrowDown at ' +
          'the lowest snap closes, and each snap is announced as "60% of the screen" ' +
          'rather than an index - dragging is never the only way. Scrollable content ' +
          'keeps its own gestures except at scroll-top, where a downward pull is ' +
          'unambiguous.\n\n' +
          'radius.sheet rounds the top corners only - the bottom edge is attached to the ' +
          'screen - and sheet-max-height caps every snap, so a strip of page always ' +
          'survives above the sheet.',
      },
    },
  },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = { open: false, onClose: () => {}, title: 'Filters' };

export const Playground: Story = {
  args: baseArgs,
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <Page>
      <Launcher
        label="Filter packages"
        title="Filter packages"
        snapPoints={[0.5, 0.9]}
        scrollable
        footer={
          <>
            <Button variant="outline">Reset</Button>
            <Button variant="primary">Apply filters</Button>
          </>
        }
      >
        {FILTERS}
      </Launcher>
    </Page>
  ),
};

export const Matrix: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'The configurations that differ in behaviour, not just content: single snap, ' +
          'multi-snap, no handle, and non-scrollable. Sheets are portalled singletons, so ' +
          'the matrix is a launcher row - one at a time is also the only honest way to ' +
          'show a focus trap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
        <Launcher label="single snap" title="Sort by" snapPoints={[0.4]}>
          {FILTERS}
        </Launcher>
        <Launcher
          label="three snaps"
          title="Filter packages"
          snapPoints={[0.3, 0.6, 0.9]}
          initialSnap={1}
          scrollable
        >
          {FILTERS}
        </Launcher>
        <Launcher label="no handle" title="Terms" dragHandle={false} snapPoints={[0.7]} scrollable>
          <p
            className="uh-type-web-body-s"
            style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
          >
            Without the grabber the sheet still closes by Escape, backdrop and the button; only the
            resize gesture is gone.
          </p>
        </Launcher>
        <Launcher
          label="with footer"
          title="Filter packages"
          snapPoints={[0.5, 0.9]}
          scrollable
          footer={<Button variant="primary">Apply filters</Button>}
        >
          {FILTERS}
        </Launcher>
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
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Filter packages"
          snapPoints={[0.5, 0.9]}
          scrollable
          footer={<Button variant="primary">Apply filters</Button>}
        >
          {FILTERS}
        </BottomSheet>
      </Page>
    );
  },
};

const COPY = [
  {
    lang: 'en',
    label: 'English',
    title: 'Filter packages',
    apply: 'Apply filters',
    reset: 'Reset',
    labels: undefined,
  },
  {
    lang: 'ms',
    label: 'Bahasa Melayu',
    title: 'Tapis pakej',
    apply: 'Guna tapisan',
    reset: 'Set semula',
    labels: {
      close: 'Tutup',
      resize: 'Ubah saiz helaian',
      snapValue: (p: string) => `${p}% daripada skrin`,
    },
  },
  {
    lang: 'id',
    label: 'Bahasa Indonesia',
    title: 'Saring paket',
    apply: 'Terapkan filter',
    reset: 'Atur ulang',
    labels: {
      close: 'Tutup',
      resize: 'Ubah ukuran lembar',
      snapValue: (p: string) => `${p}% dari layar`,
    },
  },
] as const;

/* --------------------------------------------------------- documentation
 * Three small, individually-Canvas-able examples for BottomSheet.mdx's
 * "Contoh penggunaan" section. Each wraps the sheet in the same Launcher
 * used above, since a portalled singleton has to be opened to be seen at
 * all - unlike Button, there is no honest args-only version of this.
 */

export const Basic: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'The simplest shape: one snap point, the default drag handle, no footer. ' +
          'Enough for a short note that does not need its own actions.',
      },
    },
  },
  render: () => (
    <Page>
      <Launcher label="View terms" title="Terms & conditions" snapPoints={[0.5]} scrollable>
        <p
          className="uh-type-web-body-s"
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
        >
          By continuing you agree to the agency&apos;s cancellation policy and to receiving booking
          updates by email and WhatsApp.
        </p>
      </Launcher>
    </Page>
  ),
};

export const WithFooterActions: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'The FilterPanel shape: two snap points, scrollable content and a sticky ' +
          'footer with a primary and a secondary action. The footer stays pinned while ' +
          'the checkboxes above it scroll.',
      },
    },
  },
  render: () => (
    <Page>
      <Launcher
        label="Filter packages"
        title="Filter packages"
        snapPoints={[0.5, 0.9]}
        scrollable
        footer={
          <>
            <Button variant="outline">Reset</Button>
            <Button variant="primary">Apply filters</Button>
          </>
        }
      >
        {FILTERS}
      </Launcher>
    </Page>
  ),
};

export const NoDragHandle: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'With `dragHandle={false}` the grabber - and the resize gesture that comes ' +
          'with it - disappears. Escape, the backdrop and the close button still work; ' +
          'this is the right shape for content that never needs to resize, like a ' +
          'single confirmation.',
      },
    },
  },
  render: () => (
    <Page>
      <Launcher
        label="Confirm cancellation"
        title="Cancel this booking?"
        dragHandle={false}
        snapPoints={[0.4]}
      >
        <p
          className="uh-type-web-body-s"
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
        >
          This cannot be undone. Refunds follow the package&apos;s cancellation policy.
        </p>
      </Launcher>
    </Page>
  ),
};

export const TextExpansion: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'The footer again carries the growth - "Terapkan filter" against "Apply filters" ' +
          '- and wraps rather than shrinking its 44px buttons. The resize announcement is ' +
          'translated through labels; one sheet at a time, open each language in turn.',
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
            <BottomSheet
              open
              onClose={() => setOpenLang(null)}
              title={copy.title}
              snapPoints={[0.5, 0.9]}
              scrollable
              {...(copy.labels ? { labels: copy.labels } : {})}
              footer={
                <>
                  <Button variant="outline" onClick={() => setOpenLang(null)}>
                    {copy.reset}
                  </Button>
                  <Button variant="primary" onClick={() => setOpenLang(null)}>
                    {copy.apply}
                  </Button>
                </>
              }
            >
              {FILTERS}
            </BottomSheet>
          </div>
        ) : null}
      </Page>
    );
  },
};
