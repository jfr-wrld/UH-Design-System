import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Home } from '@tailgrids/icons';

import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs.js';

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
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A trail of links back up a page hierarchy, most recent last - a labelled `nav` ' +
          'landmark holding an ordered list, the last item marked `aria-current="page"`. ' +
          'Three divider styles (`slash`, `chevron`, `dot`), all decorative to assistive ' +
          'tech.',
      },
    },
  },
  args: {
    label: 'Breadcrumb',
    items: [
      { href: '/', label: 'Beranda' },
      { href: '/umrah', label: 'Paket Umrah' },
      { href: '/umrah/reguler', label: 'Umrah Reguler 9 Hari' },
    ],
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

const ITEMS: BreadcrumbItem[] = meta.args.items;

export const Playground: Story = {
  render: (args) => (
    <Page>
      <Breadcrumbs {...args} />
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Every divider style, plus the first item carrying an icon - the same `Home` ' +
          'glyph a "back to start" breadcrumb link typically shows.',
      },
    },
  },
  render: () => {
    const withIcon: BreadcrumbItem[] = [
      { href: '/', label: 'Beranda', icon: <Home /> },
      ...ITEMS.slice(1),
    ];
    return (
      <Page>
        {/* Five instances on one page each need their own distinct
            landmark name - a real page only ever has one breadcrumb
            trail, so this repetition (and the distinct labels below) is
            purely a demo-page artifact, not something a real consumer
            would do. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
          <Breadcrumbs items={ITEMS} label="Breadcrumb - slash" dividerType="slash" />
          <Breadcrumbs items={ITEMS} label="Breadcrumb - chevron" dividerType="chevron" />
          <Breadcrumbs items={ITEMS} label="Breadcrumb - dot" dividerType="dot" />
          <Breadcrumbs items={withIcon} label="Breadcrumb - icon" dividerType="chevron" />
          <Breadcrumbs items={[ITEMS[0]!]} label="Breadcrumb - single item" />
        </div>
      </Page>
    );
  },
};

export const DarkMode: Story = {
  render: (args) => (
    <Page theme="dark">
      <Breadcrumbs {...args} />
    </Page>
  ),
};

const COPY = [
  {
    lang: 'en',
    items: [
      { href: '/', label: 'Home' },
      { href: '/umrah', label: 'Umrah Packages' },
      { href: '/umrah/reguler', label: 'Regular 9-Day Umrah' },
    ],
  },
  {
    lang: 'ms',
    items: [
      { href: '/', label: 'Laman Utama' },
      { href: '/umrah', label: 'Pakej Umrah' },
      { href: '/umrah/reguler', label: 'Umrah Biasa 9 Hari' },
    ],
  },
  { lang: 'id', items: ITEMS },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The Indonesian and Malay labels run a little longer than the English ones - the ' +
          'list wraps onto a second line via `flex-wrap` rather than overflowing or ' +
          'truncating a link label.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-24)',
          maxWidth: '320px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            {/* Distinct per-instance label for the same reason the Matrix
                story's five copies each get one - a real page only ever
                has one breadcrumb trail. */}
            <Breadcrumbs items={[...entry.items]} label={`Breadcrumb - ${entry.lang}`} />
          </div>
        ))}
      </div>
    </Page>
  ),
};
