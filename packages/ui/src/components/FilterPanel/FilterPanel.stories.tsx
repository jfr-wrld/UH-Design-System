import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { FilterPanel, type FilterOption } from './FilterPanel.js';
import { Card } from '../Card/Card.js';

const OPTIONS: FilterOption[] = [
  { id: 'direct', label: 'Direct flights only' },
  { id: 'halal', label: 'Halal certified' },
  { id: 'breakfast', label: 'Breakfast included' },
  { id: 'five-star', label: '5-star hotel' },
  { id: 'near-haram', label: 'Within 500m of the Haram' },
];

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
  title: 'Components/FilterPanel',
  component: FilterPanel,
  args: { options: OPTIONS },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A checkbox filter group with apply/clear actions - the shape every ' +
          '`Patterns/*` list screen was reassembling from `Checkbox` and `Button` by hand ' +
          'before this existed. FilterPanel decides none of its own placement: put it ' +
          'inside a `Card` for a desktop rail (see the `rail` size token this was ' +
          'measured against), inside a `BottomSheet` for mobile, or wherever else a ' +
          "screen's own layout calls for.",
      },
    },
  },
} satisfies Meta<typeof FilterPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The desktop rail placement - `FilterPanel` inside a `Card`, the same
    composition `Patterns/SearchResults` uses. */
export const InRailCard: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState<string[]>(['direct', 'breakfast']);
      return (
        <Page>
          <div style={{ width: 'var(--uh-size-rail-sm)' }}>
            <Card padding="lg">
              <FilterPanel
                options={OPTIONS}
                value={value}
                onChange={setValue}
                onApply={() => {}}
                onClear={() => setValue([])}
              />
            </Card>
          </div>
        </Page>
      );
    }
    return <Demo />;
  },
};

/** Apply-only: no Clear all action, for a panel with nothing selected to
    clear yet. */
export const ApplyOnly: Story = {
  args: { options: OPTIONS, onApply: () => {} },
  render: (args) => (
    <Page>
      <div style={{ width: 'var(--uh-size-rail-sm)' }}>
        <FilterPanel {...args} />
      </div>
    </Page>
  ),
};

/** `showTitle={false}` - for placement inside a `BottomSheet` whose own
    `title` already reads "Filters", so the panel does not repeat it. */
export const WithoutOwnTitle: Story = {
  args: { options: OPTIONS, showTitle: false, onApply: () => {}, onClear: () => {} },
  render: (args) => (
    <Page>
      <div style={{ width: 'var(--uh-size-rail-sm)' }}>
        <FilterPanel {...args} />
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-32)', flexWrap: 'wrap' }}>
        <div style={{ width: 'var(--uh-size-rail-sm)' }}>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            Nothing selected
          </span>
          <FilterPanel options={OPTIONS} onApply={() => {}} onClear={() => {}} />
        </div>
        <div style={{ width: 'var(--uh-size-rail-sm)' }}>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            Some selected
          </span>
          <FilterPanel
            options={OPTIONS}
            defaultValue={['direct', 'halal']}
            onApply={() => {}}
            onClear={() => {}}
          />
        </div>
        <div style={{ width: 'var(--uh-size-rail-sm)' }}>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            Disabled
          </span>
          <FilterPanel
            options={OPTIONS}
            defaultValue={['direct']}
            onApply={() => {}}
            onClear={() => {}}
            disabled
          />
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ width: 'var(--uh-size-rail-sm)' }}>
        <FilterPanel
          options={OPTIONS}
          defaultValue={['direct']}
          onApply={() => {}}
          onClear={() => {}}
        />
      </div>
    </Page>
  ),
};

export const TextExpansion: Story = {
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-32)', flexWrap: 'wrap' }}>
        {(
          [
            {
              lang: 'English',
              options: OPTIONS,
              labels: { title: 'Filters', applyFilters: 'Apply filters', clearAll: 'Clear all' },
            },
            {
              lang: 'Malay',
              options: [
                { id: 'direct', label: 'Penerbangan terus sahaja' },
                { id: 'halal', label: 'Disahkan halal' },
                { id: 'breakfast', label: 'Termasuk sarapan pagi' },
                { id: 'five-star', label: 'Hotel 5 bintang' },
                { id: 'near-haram', label: 'Dalam lingkungan 500m dari Haram' },
              ],
              labels: {
                title: 'Tapisan',
                applyFilters: 'Guna tapisan',
                clearAll: 'Kosongkan semua',
              },
            },
            {
              lang: 'Indonesian',
              options: [
                { id: 'direct', label: 'Hanya penerbangan langsung' },
                { id: 'halal', label: 'Bersertifikat halal' },
                { id: 'breakfast', label: 'Termasuk sarapan' },
                { id: 'five-star', label: 'Hotel bintang 5' },
                { id: 'near-haram', label: 'Dalam radius 500m dari Masjidil Haram' },
              ],
              labels: { title: 'Filter', applyFilters: 'Terapkan filter', clearAll: 'Hapus semua' },
            },
          ] as const
        ).map(({ lang, options, labels }) => (
          <div key={lang} style={{ width: 'var(--uh-size-rail-sm)' }}>
            <span
              className="uh-type-web-caption"
              style={{ color: 'var(--uh-color-text-secondary)' }}
            >
              {lang}
            </span>
            <FilterPanel
              options={[...options]}
              defaultValue={['direct']}
              onApply={() => {}}
              onClear={() => {}}
              labels={labels}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
