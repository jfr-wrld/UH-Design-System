import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Pagination } from './Pagination.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '200px',
};

function Page({
  theme = 'light',
  width,
  children,
}: {
  theme?: 'light' | 'dark';
  width?: string;
  children: ReactNode;
}) {
  return (
    <div data-theme={theme} style={{ ...surface, maxWidth: width }}>
      {children}
    </div>
  );
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 6, onChange: () => {}, label: 'Search results' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Built for Fase 6 (see FASE6-REPORT.md) - SearchResults previously ended in a ' +
          '"Load more" button, functional but unable to say how many pages there were or ' +
          'jump to one directly. Always controlled: a page change means a refetch, so ' +
          'there is no self-contained uncontrolled version of this. Renders nothing for a ' +
          'single page.',
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [page, setPage] = useState(4);
  return <Pagination page={page} pageCount={12} onChange={setPage} label="Search results" />;
}

export const Playground: Story = {
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

const ROWS: { caption: string; page: number; pageCount: number }[] = [
  { caption: 'First page (Previous disabled)', page: 1, pageCount: 6 },
  { caption: 'Middle of a short run - fits with no ellipsis', page: 3, pageCount: 6 },
  { caption: 'Last page (Next disabled)', page: 6, pageCount: 6 },
  { caption: 'Near the start of a long run - one ellipsis', page: 2, pageCount: 20 },
  { caption: 'Middle of a long run - both sides collapse', page: 10, pageCount: 20 },
  { caption: 'Near the end of a long run - one ellipsis', page: 19, pageCount: 20 },
  { caption: 'A single page - renders nothing', page: 1, pageCount: 1 },
];

export const Matrix: Story = {
  render: () => (
    <Page>
      {/*
       * Each row's nav gets its own label - axe's landmark-unique rule
       * (correctly) flags multiple <nav> landmarks sharing one accessible
       * name on the same page. A single real screen only ever renders one
       * Pagination, so this collision is a Matrix-story artifact, not a
       * component bug - found by the real-browser a11y run in Fase 6
       * Session 2, jsdom's tests do not check landmarks.
       */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {ROWS.map((row) => (
          <div key={row.caption}>
            <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
              {row.caption}
            </p>
            <Pagination
              page={row.page}
              pageCount={row.pageCount}
              onChange={() => {}}
              label={`Search results - ${row.caption}`}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <Pagination page={10} pageCount={20} onChange={() => {}} label="Search results" />
    </Page>
  ),
};

const LOCALE_LABEL = {
  en: 'Search results',
  ms: 'Hasil carian',
  id: 'Hasil pencarian',
} as const;

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Pagination.mdx's
 * "Contoh Penggunaan" section - args-only so the Docs Source panel
 * reconstructs clean `<Pagination ... />` JSX. Kept separate from Matrix
 * above, which exists to prove the whole surface works, not to be copied
 * verbatim.
 */

export const ShortRun: Story = {
  parameters: { layout: 'centered' },
  args: { page: 3, pageCount: 6 },
};

export const LongRunWithEllipsis: Story = {
  parameters: { layout: 'centered' },
  args: { page: 10, pageCount: 20 },
};

export const SinglePage: Story = {
  parameters: { layout: 'centered' },
  args: { page: 1, pageCount: 1 },
};

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Page numbers are Intl-formatted rather than templated, on the same house rule ' +
          'as every other number in the system - identical in Latin-numeral locales like ' +
          'these, but the accessible name ("Pergi ke halaman 3") is real, translated text, ' +
          'checked here at a narrow width where the pill row is tightest.',
      },
    },
  },
  render: () => (
    <Page width="360px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        {(['en', 'ms', 'id'] as const).map((lang) => (
          <div key={lang} lang={lang}>
            <p className="uh-type-web-caption" style={{ margin: '0 0 8px' }}>
              {lang.toUpperCase()}
            </p>
            <Pagination
              page={4}
              pageCount={9}
              onChange={() => {}}
              label={LOCALE_LABEL[lang]}
              locale={lang}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
