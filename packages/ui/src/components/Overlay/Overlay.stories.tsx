import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Overlay } from './Overlay.js';
import { Button } from '../Button/Button.js';
import { Card } from '../Card/Card.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '320px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Overlay',
  component: Overlay,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The bare mechanics an overlay needs - a portalled backdrop, a focus trap, a ' +
          'scroll lock, Escape and backdrop-click dismissal, the enter/exit animation - with ' +
          'no visual chrome of its own. `Modal` is this same mechanism plus an owned ' +
          'title/body/footer; reach for `Overlay` when the content does not fit that shape - ' +
          'wrap it in `Card` for a bordered surface (the pattern below), or leave it bare for ' +
          'a lightbox-style image or a custom confirmation strip.',
      },
    },
  },
} satisfies Meta<typeof Overlay>;

export default meta;
type Story = StoryObj<typeof meta>;

/* Every story below manages its own open state and ignores these - present
   only because every real prop on Overlay is required, and CSF3 typing
   needs `args` to satisfy them regardless of whether `render` reads them. */
const baseArgs = {
  open: false,
  onClose: () => {},
  'aria-label': 'Overlay',
  children: null,
};

function CardOverlayDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open custom overlay</Button>
      <Overlay open={open} onClose={() => setOpen(false)} aria-label="Refer a friend">
        <div style={{ width: '360px' }}>
          <Card padding="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
              <h2 className="uh-type-web-h5">Refer a friend</h2>
              <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
                Content Overlay owns none of this chrome itself - the card, the heading, the spacing
                all come from what was put inside it.
              </p>
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </Card>
        </div>
      </Overlay>
    </>
  );
}

export const Playground: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <CardOverlayDemo />
    </Page>
  ),
};

function BareOverlayDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open bare overlay</Button>
      <Overlay open={open} onClose={() => setOpen(false)} aria-label="Preview image">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--uh-spacing-12)',
          }}
        >
          <div
            style={{
              width: '320px',
              height: '200px',
              borderRadius: 'var(--uh-radius-md)',
              background:
                'linear-gradient(135deg, var(--uh-color-teal-600), var(--uh-color-blue-600))',
            }}
          />
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Overlay>
    </>
  );
}

export const Bare: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'No Card, no border, no background - just the image and a close button, ' +
          'centered and animated the same way the Card example above is. The panel imposes ' +
          'nothing beyond centering and the enter/exit motion.',
      },
    },
  },
  render: () => (
    <Page>
      <BareOverlayDemo />
    </Page>
  ),
};

export const DarkMode: Story = {
  args: baseArgs,
  render: () => (
    <Page theme="dark">
      <CardOverlayDemo />
    </Page>
  ),
};

/*
 * Overlay's panel is always a full-viewport portal, so unlike most of this
 * package's other TextExpansion stories, several instances cannot be shown
 * open side by side - they would stack on top of each other. This shows
 * only the worst case (the longest of the three) with the overlay already
 * open.
 */
function TextExpansionDemo() {
  const [open, setOpen] = useState(true);
  if (!open) {
    return <Button onClick={() => setOpen(true)}>Reopen</Button>;
  }
  return (
    <Overlay open={open} onClose={() => setOpen(false)} aria-label="Ajak teman">
      <div style={{ width: '320px' }}>
        <Card padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-12)' }}>
            <h2 className="uh-type-web-h5">Ajak teman</h2>
            <p className="uh-type-web-body-s" style={{ color: 'var(--uh-color-text-secondary)' }}>
              Bagikan kode Anda dan kalian berdua dapat diskon RM50.
            </p>
            <Button onClick={() => setOpen(false)}>Tutup</Button>
          </div>
        </Card>
      </div>
    </Overlay>
  );
}

export const TextExpansion: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          '"Bagikan kode Anda dan kalian berdua dapat diskon RM50" runs longer than the ' +
          "English copy would, but the panel's width is set by the Card inside it, not by " +
          'Overlay - the text wraps within that width instead of forcing the panel wider.',
      },
    },
  },
  render: () => (
    <Page>
      <div lang="id">
        <TextExpansionDemo />
      </div>
    </Page>
  ),
};
