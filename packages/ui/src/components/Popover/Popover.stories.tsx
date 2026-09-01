import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Popover } from './Popover.js';
import { Button } from '../Button/Button.js';
import type { AnchorAlign, AnchorPlacement } from '../../hooks/useAnchoredPortal.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-96)',
  minHeight: '480px',
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--uh-spacing-24)',
  alignItems: 'flex-start',
  justifyContent: 'center',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

const SHARE = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
    <Button variant="ghost" size="sm">
      Copy link
    </Button>
    <Button variant="ghost" size="sm">
      WhatsApp
    </Button>
    <Button variant="ghost" size="sm">
      Telegram
    </Button>
  </div>
);

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The interactive cousin of Tooltip: same anchoring brain ' +
          '(`useAnchoredPortal`, now grown four-sided placement, alignment, offset and an ' +
          'arrow coordinate), opposite contract. A tooltip repeats what its owner says and ' +
          'vanishes on movement; a popover contains things - buttons, links, a small form ' +
          '- so it opens on click, holds focus without trapping it, and closes on Escape ' +
          '(focus back to the trigger), an outside pointer, or focus moving on. Non-modal: ' +
          'the page keeps scrolling, and the panel repositions with it.\n\n' +
          'The trigger element is cloned, not wrapped: it keeps its own semantics and ' +
          'gains the toggle plus aria-haspopup/expanded/controls wiring - aria-controls ' +
          'only while the popup exists. The arrow keeps pointing at the anchor centre ' +
          'even after the panel is clamped into the viewport, because the hook hands the ' +
          'corrected coordinate over rather than letting the arrow drift with the panel.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  trigger: <Button variant="outline">Share package</Button>,
  'aria-label': 'Share options',
  content: SHARE,
};

export const Playground: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Popover
        trigger={<Button variant="outline">Share package</Button>}
        aria-label="Share options"
        content={SHARE}
      />
    </Page>
  ),
};

const PLACEMENTS: AnchorPlacement[] = ['top', 'bottom', 'left', 'right'];
const ALIGNS: AnchorAlign[] = ['start', 'center', 'end'];

export const Matrix: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Every placement against every alignment, each popover live. Near a viewport ' +
          'edge the requested side flips when the other side has more room, and the panel ' +
          'clamps inside the viewport while the arrow stays on the anchor.',
      },
    },
  },
  render: () => (
    <Page>
      {PLACEMENTS.map((placement) =>
        ALIGNS.map((align) => (
          <Popover
            key={`${placement}-${align}`}
            trigger={
              <Button variant="outline" size="sm">
                {placement}/{align}
              </Button>
            }
            aria-label={`Share options ${placement} ${align}`}
            placement={placement}
            align={align}
            content={
              <span
                className="uh-type-web-body-s"
                style={{ color: 'var(--uh-color-text-secondary)' }}
              >
                {placement} + {align}
              </span>
            }
          />
        )),
      )}
    </Page>
  ),
};

export const DarkMode: Story = {
  args: baseArgs,
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <Popover
        defaultOpen
        trigger={<Button variant="outline">Share package</Button>}
        aria-label="Share options"
        content={SHARE}
      />
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, realistic examples for Popover.mdx's "Contoh Penggunaan".
 */

export const SharePackage: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Popover
        trigger={<Button variant="outline">Share package</Button>}
        aria-label="Share options"
        content={SHARE}
      />
    </Page>
  ),
};

export const SortOptions: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive content is the whole point over Tooltip: the radio buttons inside ' +
          'stay usable, and the popover only closes on Escape, an outside click, or focus ' +
          'moving on - never on a click inside its own content.',
      },
    },
  },
  render: function Sort() {
    const [sort, setSort] = useState('price-asc');
    const options = [
      { value: 'price-asc', label: 'Price: low to high' },
      { value: 'price-desc', label: 'Price: high to low' },
      { value: 'departure', label: 'Departure date' },
    ];
    return (
      <Page>
        <Popover
          trigger={<Button variant="outline">Sort by</Button>}
          aria-label="Sort packages"
          content={
            <fieldset
              style={{
                border: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--uh-spacing-8)',
              }}
            >
              <legend
                className="uh-type-web-caption"
                style={{
                  color: 'var(--uh-color-text-tertiary)',
                  marginBottom: 'var(--uh-spacing-4)',
                }}
              >
                Sort by
              </legend>
              {options.map((option) => (
                <label
                  key={option.value}
                  style={{ display: 'flex', gap: 'var(--uh-spacing-8)', alignItems: 'center' }}
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === option.value}
                    onChange={() => setSort(option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          }
        />
      </Page>
    );
  },
};

export const PriceInfoPopover: Story = {
  args: baseArgs,
  render: () => (
    <Page>
      <Popover
        trigger={
          <Button variant="ghost" size="sm">
            Price info
          </Button>
        }
        aria-label="Price details"
        placement="top"
        content={
          <p
            className="uh-type-web-body-s"
            style={{ color: 'var(--uh-color-text-secondary)', maxWidth: '220px' }}
          >
            Prices shown include tax and airport fees. Visa processing is billed separately at
            checkout.
          </p>
        }
      />
    </Page>
  ),
};

const COPY = [
  { lang: 'en', triggerLabel: 'Share package', items: ['Copy link', 'Send by WhatsApp'] },
  { lang: 'ms', triggerLabel: 'Kongsi pakej', items: ['Salin pautan', 'Hantar melalui WhatsApp'] },
  { lang: 'id', triggerLabel: 'Bagikan paket', items: ['Salin tautan', 'Kirim lewat WhatsApp'] },
] as const;

export const TextExpansion: Story = {
  args: baseArgs,
  parameters: {
    docs: {
      description: {
        story:
          '"Hantar melalui WhatsApp" doubles the English item; the panel grows to its ' +
          'max-width and wraps, and the arrow stays on the trigger regardless. All three ' +
          'open at once - popovers are not modal, so they can coexist.',
      },
    },
  },
  render: () => (
    <Page>
      {COPY.map((copy) => (
        <div key={copy.lang} lang={copy.lang}>
          <Popover
            defaultOpen
            trigger={<Button variant="outline">{copy.triggerLabel}</Button>}
            aria-label={copy.triggerLabel}
            placement="bottom"
            content={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
                {copy.items.map((item) => (
                  <Button key={item} variant="ghost" size="sm">
                    {item}
                  </Button>
                ))}
              </div>
            }
          />
        </div>
      ))}
    </Page>
  ),
};
