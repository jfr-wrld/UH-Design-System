import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Modal, type ModalProps, type ModalSize, type ModalVariant } from './Modal.js';
import { Button } from '../Button/Button.js';

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

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

/** One trigger, one modal; the way every consumer will actually hold it. */
function Launcher({
  label,
  children,
  ...modal
}: Omit<ModalProps, 'open' | 'onClose'> & { label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal {...modal} open={open} onClose={() => setOpen(false)}>
        {children}
      </Modal>
    </>
  );
}

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The dialog three phase-5 components have been waiting for. Portalled to the ' +
          'body, focus-trapped through the shared `useFocusTrap` (extracted from ' +
          'PickerLayer, which now uses it too), body scroll locked through the re-entrant ' +
          '`useScrollLock`, and closed by Escape, the backdrop, or the labelled button - ' +
          'each refusable by prop. Focus returns to the trigger on close.\n\n' +
          '`confirmation` and `destructive` render as `alertdialog`: a question that must ' +
          'be answered, not a surface to browse. Destructive marks the title and carries a ' +
          'warning glyph; the PRD rule is that destructive actions confirm here, and prefer ' +
          'archive wording over delete.\n\n' +
          'Enter runs on the overlay pairing (slower + emphasized), exit on fast + ' +
          'accelerate, both as animations because the unmount waits for `animationend` - ' +
          'which still fires at zero duration under reduced motion, so the choreography ' +
          'survives it. Surface is `bg-elevation-4` + `elevation-4`: a shadow in light, a ' +
          'lighter surface in dark, with text contracts now checked on every ladder step.',
      },
    },
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  open: false,
  onClose: () => {},
  title: 'Cancel this booking?',
};

export const Playground: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Cancel a booking"
        title="Cancel this booking?"
        description="The seat is released immediately. Refunds follow the package policy and reach your account in 5 to 7 working days."
        variant="destructive"
        size="sm"
        closeOnOverlayClick={false}
        footer={
          <>
            <Button variant="outline">Keep booking</Button>
            <Button variant="destructive">Cancel booking</Button>
          </>
        }
      />
    </Page>
  ),
};

export const InitialFocus: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'For a destructive question, `initialFocus` puts the caret on the safe answer, ' +
          'so Enter pressed out of habit keeps the booking instead of cancelling it.',
      },
    },
  },
  render: function WithInitialFocus() {
    const [open, setOpen] = useState(false);
    /* Button is polymorphic (button-or-anchor), so its ref is the intersection. */
    const keep = useRef<HTMLButtonElement & HTMLAnchorElement>(null);
    return (
      <Page>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Cancel with safe default
        </Button>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Cancel this booking?"
          description="The seat is released immediately and cannot be held again at this price."
          variant="destructive"
          size="sm"
          initialFocus={keep}
          footer={
            <>
              <Button ref={keep} variant="outline" onClick={() => setOpen(false)}>
                Keep booking
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Cancel booking
              </Button>
            </>
          }
        />
      </Page>
    );
  },
};

/* ---------------------------------------------------------------- matrix */

const SIZES: ModalSize[] = ['sm', 'md', 'lg', 'fullscreen'];
const VARIANTS: ModalVariant[] = ['default', 'confirmation', 'destructive'];

export const Matrix: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Every size against every variant. Modals are portalled singletons, so the ' +
          'matrix is a launcher grid - one open at a time, which is also the only honest ' +
          'way to show a focus trap.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        {VARIANTS.map((variant) => (
          <div
            key={variant}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}
          >
            <Caption>{variant}</Caption>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
              {SIZES.map((size) => (
                <Launcher
                  key={size}
                  label={`${variant} / ${size}`}
                  title={variant === 'default' ? 'Booking documents' : 'Cancel this booking?'}
                  description={
                    variant === 'default'
                      ? 'Everything the agency has received so far.'
                      : 'The seat is released immediately. Refunds follow the package policy.'
                  }
                  variant={variant}
                  size={size}
                  footer={
                    variant === 'default' ? (
                      <Button variant="primary">Done</Button>
                    ) : (
                      <>
                        <Button variant="outline">Keep booking</Button>
                        <Button variant={variant === 'destructive' ? 'destructive' : 'primary'}>
                          Confirm
                        </Button>
                      </>
                    )
                  }
                >
                  {size === 'lg' || size === 'fullscreen' ? (
                    <p
                      className="uh-type-web-body-s"
                      style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
                    >
                      Larger sizes hold real content: an itinerary, a document preview, a
                      comparison. The panel scrolls internally past viewport height.
                    </p>
                  ) : null}
                </Launcher>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------------- dark mode */

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
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Cancel this booking?"
          description="In the dark the panel is bg-elevation-4 - a lighter surface with a thin edge - because a black shadow says nothing on a dark canvas."
          variant="destructive"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Keep booking
              </Button>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Cancel booking
              </Button>
            </>
          }
        />
      </Page>
    );
  },
};

/* --------------------------------------------------------- text expansion */

const COPY = [
  {
    lang: 'en',
    label: 'English',
    title: 'Cancel this booking?',
    description:
      'The seat is released immediately. Refunds follow the package policy and reach your account in 5 to 7 working days.',
    keep: 'Keep booking',
    cancel: 'Cancel booking',
    close: 'Close',
  },
  {
    lang: 'ms',
    label: 'Bahasa Melayu',
    title: 'Batalkan tempahan ini?',
    description:
      'Tempat anda dilepaskan serta-merta. Bayaran balik mengikut polisi pakej dan sampai ke akaun anda dalam 5 hingga 7 hari bekerja.',
    keep: 'Kekalkan tempahan',
    cancel: 'Batalkan tempahan',
    close: 'Tutup',
  },
  {
    lang: 'id',
    label: 'Bahasa Indonesia',
    title: 'Batalkan pemesanan ini?',
    description:
      'Kursi Anda langsung dilepaskan. Pengembalian dana mengikuti kebijakan paket dan sampai ke rekening Anda dalam 5 sampai 7 hari kerja.',
    keep: 'Pertahankan pemesanan',
    cancel: 'Batalkan pemesanan',
    close: 'Tutup',
  },
] as const;

/* --------------------------------------------------------- documentation
 * Three small, individually Canvas-able examples for Modal.mdx's "Contoh
 * Penggunaan" section. Modal is not visible by default, so each uses the
 * same Launcher (trigger button + open state) as the stories above, rather
 * than the args-only pattern Button.mdx uses for a component that renders
 * immediately.
 */

export const ConfirmationDialog: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Cancel a booking"
        title="Cancel this booking?"
        description="The seat is released immediately. Refunds follow the package policy and reach your account in 5 to 7 working days."
        variant="confirmation"
        size="sm"
        footer={
          <>
            <Button variant="outline">Keep booking</Button>
            <Button variant="primary">Cancel booking</Button>
          </>
        }
      />
    </Page>
  ),
};

export const DestructiveAction: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Delete a payment method"
        title="Delete this card?"
        description="Visa ending 4242 will be removed from your account. This cannot be undone."
        variant="destructive"
        size="sm"
        closeOnOverlayClick={false}
        footer={
          <>
            <Button variant="outline">Keep card</Button>
            <Button variant="destructive">Delete card</Button>
          </>
        }
      />
    </Page>
  ),
};

export const FormInModal: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Launcher
        label="Edit traveller details"
        title="Edit traveller details"
        description="Names must match the passport exactly for visa processing."
        size="md"
        footer={
          <>
            <Button variant="outline">Cancel</Button>
            <Button variant="primary">Save changes</Button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 'var(--uh-spacing-16)' }}>
          <label style={{ display: 'grid', gap: 'var(--uh-spacing-4)' }}>
            <span className="uh-type-web-caption">Full name (as per passport)</span>
            <input
              type="text"
              defaultValue="Siti Aminah binti Abdullah"
              style={{
                padding: 'var(--uh-spacing-8)',
                borderRadius: 'var(--uh-radius-md)',
                border: 'var(--uh-border-width-1) solid var(--uh-color-border-default)',
              }}
            />
          </label>
          <label style={{ display: 'grid', gap: 'var(--uh-spacing-4)' }}>
            <span className="uh-type-web-caption">Passport number</span>
            <input
              type="text"
              defaultValue="A1234567"
              style={{
                padding: 'var(--uh-spacing-8)',
                borderRadius: 'var(--uh-radius-md)',
                border: 'var(--uh-border-width-1) solid var(--uh-color-border-default)',
              }}
            />
          </label>
        </div>
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
          'The footer is the pressure point: "Pertahankan pemesanan" nearly doubles "Keep ' +
          'booking", and the action row wraps rather than shrinking its 44px buttons. One ' +
          'modal at a time - open each language in turn.',
      },
    },
  },
  render: function Expansion() {
    const [openLang, setOpenLang] = useState<string | null>('ms');
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
            <Modal
              open
              onClose={() => setOpenLang(null)}
              title={copy.title}
              description={copy.description}
              variant="destructive"
              size="sm"
              closeLabel={copy.close}
              footer={
                <>
                  <Button variant="outline" onClick={() => setOpenLang(null)}>
                    {copy.keep}
                  </Button>
                  <Button variant="destructive" onClick={() => setOpenLang(null)}>
                    {copy.cancel}
                  </Button>
                </>
              }
            />
          </div>
        ) : null}
      </Page>
    );
  },
};
