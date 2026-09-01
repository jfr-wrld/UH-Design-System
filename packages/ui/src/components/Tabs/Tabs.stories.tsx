import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Tabs, type TabItem } from './Tabs.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '360px',
};

function Page({
  theme = 'light',
  narrow = false,
  children,
}: {
  theme?: 'light' | 'dark';
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} style={{ ...surface, maxWidth: narrow ? '360px' : undefined }}>
      {children}
    </div>
  );
}

const EN_ITEMS: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p>The full nine-day route, day by day.</p> },
  { id: 'itinerary', label: 'Itinerary', content: <p>Departs Kuala Lumpur, 15 Mar 2026.</p> },
  { id: 'hotel', label: 'Hotel', content: <p>Al Safwah Royale Orchid, 350 m from Haram.</p> },
  { id: 'reviews', label: 'Reviews', content: <p>4.8 out of 5, from 128 pilgrims.</p> },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { items: EN_ITEMS, label: 'Package sections' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Built for Fase 6 (see FASE6-REPORT.md) - PackageDetail switching between ' +
          'Overview / Itinerary / Hotel / Reviews. Automatic activation: the arrow keys ' +
          'move focus and select in one step, Home/End jump to the ends, and a disabled ' +
          'tab is skipped rather than landed on. Only the selected panel is rendered - ' +
          'every current use is static per-package content with nothing to preserve ' +
          'underneath.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [value, setValue] = useState('overview');
  return <Tabs items={EN_ITEMS} label="Package sections" value={value} onChange={setValue} />;
}

export const Playground: Story = {
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default selection, a later tab selected up front, a disabled tab skipped by ' +
          'keyboard navigation, and the list narrow enough to need its horizontal scroll.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            Default (first tab selected)
          </p>
          <Tabs items={EN_ITEMS} label="Package sections" />
        </div>

        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            Starting on a later tab
          </p>
          <Tabs items={EN_ITEMS} label="Package sections" defaultValue="hotel" />
        </div>

        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            One tab disabled (Reviews - no reviews yet)
          </p>
          <Tabs
            items={EN_ITEMS.map((item) =>
              item.id === 'reviews' ? { ...item, disabled: true } : item,
            )}
            label="Package sections"
          />
        </div>

        <div>
          <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
            Narrow container (360px) - the list scrolls rather than wraps
          </p>
          <Page narrow>
            <Tabs items={EN_ITEMS} label="Package sections" />
          </Page>
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Tabs items={EN_ITEMS} label="Package sections" defaultValue="itinerary" />
    </Page>
  ),
};

const LOCALE_ITEMS: Record<'en' | 'ms' | 'id', TabItem[]> = {
  en: EN_ITEMS,
  ms: [
    { id: 'overview', label: 'Gambaran Keseluruhan', content: <p>Itinerari sembilan hari.</p> },
    { id: 'itinerary', label: 'Itinerari', content: <p>Berlepas dari Kuala Lumpur.</p> },
    { id: 'hotel', label: 'Hotel', content: <p>350 m dari Haram.</p> },
    { id: 'reviews', label: 'Ulasan', content: <p>4.8 daripada 5, 128 jemaah.</p> },
  ],
  id: [
    { id: 'overview', label: 'Ikhtisar', content: <p>Rencana sembilan hari.</p> },
    { id: 'itinerary', label: 'Rencana Perjalanan', content: <p>Berangkat dari Kuala Lumpur.</p> },
    { id: 'hotel', label: 'Hotel', content: <p>350 m dari Haram.</p> },
    { id: 'reviews', label: 'Ulasan', content: <p>4.8 dari 5, 128 jemaah.</p> },
  ],
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Tabs.mdx's "Contoh
 * Penggunaan" section - args-only so the Docs Source panel reconstructs
 * clean `<Tabs ... />` JSX. Kept separate from Matrix above, which exists to
 * prove the whole surface works, not to be copied verbatim.
 */

export const Default: Story = {
  parameters: { layout: 'centered' },
};

export const StartsOnSpecificTab: Story = {
  parameters: { layout: 'centered' },
  args: { defaultValue: 'hotel' },
};

export const WithDisabledTab: Story = {
  parameters: { layout: 'centered' },
  args: {
    items: EN_ITEMS.map((item) => (item.id === 'reviews' ? { ...item, disabled: true } : item)),
  },
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Rencana Perjalanan" (Itinerary, id) and "Gambaran Keseluruhan" (Overview, ms) ' +
          'both run well past their English originals - this is why the list scrolls ' +
          'instead of wrapping or shrinking to fit.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        {(['en', 'ms', 'id'] as const).map((lang) => (
          <div key={lang} lang={lang}>
            <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
              {lang.toUpperCase()}
            </p>
            <Page narrow>
              <Tabs items={LOCALE_ITEMS[lang]} label="Package sections" />
            </Page>
          </div>
        ))}
      </div>
    </Page>
  ),
};
