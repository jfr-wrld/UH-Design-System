import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { SearchCombobox, type SearchOption } from './SearchCombobox.js';
import type { SearchComboboxLabels } from './labels.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '440px',
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

/**
 * Opens the popup the way a pilgrim does, by putting focus in the field, so
 * what is on screen is the component's own state rather than a class added for
 * the screenshot.
 *
 * The explicit `focusin` matters. A frame that does not hold the operating
 * system's focus moves `document.activeElement` when `focus()` is called but
 * fires no focus event, so a story that relied on `focus()` alone would sit
 * there closed in a background tab, in a docs page, and in the screenshot
 * runner. Dispatching the event is what makes this deterministic; when the
 * frame does hold focus the real event has already run and this is a no-op.
 */
function AutoOpen({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const input = ref.current?.querySelector<HTMLInputElement>('input[role="combobox"]');
    if (!input) return;
    input.focus();
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  }, []);
  return <div ref={ref}>{children}</div>;
}

const field: CSSProperties = { maxWidth: '420px' };

const AGENCIES: SearchOption[] = [
  { id: 'a1', label: 'Madinah Travel & Tours', description: 'Kuala Lumpur', group: 'Agencies' },
  { id: 'a2', label: 'Al Madinah Holidays', description: 'Johor Bahru', group: 'Agencies' },
  { id: 'a3', label: 'Safar Madinah Sdn Bhd', description: 'Shah Alam', group: 'Agencies' },
];

const DESTINATIONS: SearchOption[] = [
  { id: 'd1', label: 'Madinah', description: 'Saudi Arabia', group: 'Destinations' },
  { id: 'd2', label: 'Makkah', description: 'Saudi Arabia', group: 'Destinations' },
];

const ALL = [...AGENCIES, ...DESTINATIONS];
const RECENT = ['Makkah 12 days', 'Madinah', 'Umrah Ramadan'];

const meta = {
  title: 'Components/SearchCombobox',
  component: SearchCombobox,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A combobox whose popup is a listbox, portalled so no `overflow: hidden` ancestor ' +
          'can clip it. Focus never leaves the field: the active option is pointed at with ' +
          '`aria-activedescendant`, which is what lets the arrow keys walk a list while the ' +
          'caret stays where it is being typed.\n\n' +
          'Typing is debounced before `onSearch` fires, so a burst of keystrokes is one ' +
          'request rather than seven. Emptying the field cancels the pending request instead ' +
          'of searching for nothing.\n\n' +
          'On a phone the popup becomes a full-screen overlay carrying its own copy of the ' +
          'field, and the inline element becomes a button. Moving one input between two ' +
          'parents would remount it and drop focus mid-word, and a button that opens a ' +
          'search screen is what every phone already does.\n\n' +
          'The empty state names what was searched for and what to do next. "No results" ' +
          'tells a pilgrim nothing they did not already know.',
      },
    },
  },
} satisfies Meta<typeof SearchCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ----------------------------------------------------------- interactive */

export const Default: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'A simulated search with a 600ms round trip. Type "mad" and watch the states go ' +
          'past: typing, then loading, then results. Try "zzz" for the empty state. The ' +
          'field starts by offering what was searched for before.',
      },
    },
  },
  render: function Live(args) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [recent, setRecent] = useState<string[]>(RECENT);
    const [chosen, setChosen] = useState<SearchOption | null>(null);
    const request = useRef(0);

    function search(next: string) {
      const ticket = ++request.current;
      setLoading(true);
      setTimeout(() => {
        /* Ignore a reply that a newer request has already overtaken. */
        if (ticket !== request.current) return;
        const needle = next.trim().toLowerCase();
        setResults(ALL.filter((option) => option.label.toLowerCase().includes(needle)));
        setLoading(false);
      }, 600);
    }

    return (
      <Page>
        <div
          style={{
            ...field,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--uh-spacing-16)',
          }}
        >
          <SearchCombobox
            {...args}
            value={query}
            onChange={setQuery}
            onSearch={search}
            onSelect={setChosen}
            options={results}
            loading={loading}
            recentSearches={recent}
            onClearRecent={() => setRecent([])}
            helperText="Try a city, a country or an agency name."
          />
          <div>
            <Caption>What the consumer receives</Caption>
            <div className="uh-type-web-body-s">
              onSelect: {chosen ? chosen.label : '(nothing yet)'}
            </div>
          </div>
        </div>
      </Page>
    );
  },
};

/* ---------------------------------------------------------------- states */

export const RecentSearches: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'What an empty, focused field offers. Choosing one fills the field and runs the ' +
          'search at once rather than waiting out a debounce nobody caused.\n\n' +
          'The clear control is a real button in the popup. Because the popup is portalled ' +
          'to the end of the document, plain Tab order would reach it long after everything ' +
          'else on the page, so Tab from the field hands focus straight to it; Tab again ' +
          'closes the popup and comes back, and the Tab after that leaves normally. Nothing ' +
          'is trapped.',
      },
    },
  },
  render: (args) => (
    <Page>
      <AutoOpen>
        <div style={field}>
          <SearchCombobox {...args} recentSearches={RECENT} onClearRecent={() => {}} />
        </div>
      </AutoOpen>
    </Page>
  ),
};

export const Results: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'Agencies and destinations under their own headings, in one flat keyboard list: ' +
          'the arrow keys cross a heading without noticing it is there.\n\n' +
          'The matched run is marked with a teal tint and extra weight, not with the orange ' +
          'accent. Orange is reserved for the single most important moment on a surface, and ' +
          'a result list can hold thirty matched runs at once.',
      },
    },
  },
  render: (args) => (
    <Page>
      <AutoOpen>
        <div style={field}>
          <SearchCombobox {...args} defaultValue="Madinah" options={ALL} debounce={0} />
        </div>
      </AutoOpen>
    </Page>
  ),
};

export const Loading: Story = {
  args: { label: 'Search agencies and destinations' },
  render: (args) => (
    <Page>
      <AutoOpen>
        <div style={field}>
          <SearchCombobox {...args} defaultValue="Madinah" loading debounce={0} />
        </div>
      </AutoOpen>
    </Page>
  ),
};

export const Error: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'A failed search, which is the consumer’s to report. The message says what ' +
          'happened and what to do about it, and it replaces the results rather than ' +
          'sitting under a list of stale ones.',
      },
    },
  },
  render: (args) => (
    <Page>
      <AutoOpen>
        <div style={field}>
          <SearchCombobox
            {...args}
            defaultValue="Madinah"
            options={ALL}
            debounce={0}
            errorMessage="Search is unavailable right now. Try again in a moment."
          />
        </div>
      </AutoOpen>
    </Page>
  ),
};

export const Disabled: Story = {
  args: { label: 'Search agencies and destinations' },
  render: (args) => (
    <Page>
      <div style={field}>
        <SearchCombobox
          {...args}
          disabled
          defaultValue="Madinah"
          helperText="Search is closed while your booking is being confirmed."
        />
      </div>
    </Page>
  ),
};

/* ----------------------------------------------------------- empty state */

const EMPTY = [
  {
    lang: 'en',
    label: 'Search agencies and destinations',
    message: (q: string) => `No packages found for '${q}'. Try a different keyword.`,
  },
  {
    lang: 'ms',
    label: 'Cari agensi dan destinasi',
    message: (q: string) => `Tiada pakej dijumpai untuk '${q}'. Cuba kata kunci lain.`,
  },
  {
    lang: 'id',
    label: 'Cari agen dan destinasi',
    message: (q: string) => `Paket tidak ditemukan untuk '${q}'. Coba kata kunci lain.`,
  },
] as const;

export const EmptyState: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'The empty state names the query and suggests the next move. It is a function of ' +
          'the query rather than a fixed string, which is what lets a translation put the ' +
          'quoted term where its own grammar wants it.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        {EMPTY.map((locale) => (
          <div key={locale.lang} lang={locale.lang} style={{ width: '300px' }}>
            <Caption>{locale.lang}</Caption>
            <AutoOpen>
              <SearchCombobox
                label={locale.label}
                defaultValue="Kota Bharu"
                options={[]}
                debounce={0}
                emptyMessage={locale.message}
              />
            </AutoOpen>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ---------------------------------------------------------------- mobile */

export const Mobile: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        story:
          'Below 768px the inline element is a button, and tapping it opens a full-screen ' +
          'overlay holding the real combobox, a Cancel button and the list. Cancel and ' +
          'Escape both close it and put focus back on the trigger.',
      },
    },
  },
  render: function Sheet(args) {
    const [query, setQuery] = useState('');
    return (
      <Page>
        <div style={field}>
          <SearchCombobox
            {...args}
            value={query}
            onChange={setQuery}
            options={ALL}
            debounce={0}
            recentSearches={RECENT}
            onClearRecent={() => {}}
            helperText="Tap to search."
          />
        </div>
      </Page>
    );
  },
};

/* ---------------------------------------------------------------- matrix */

export const Matrix: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'Every state of the closed field, which is what a page full of other content ' +
          'actually shows. The popup states have their own stories above.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{ ...field, display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}
      >
        <div>
          <Caption>idle</Caption>
          <SearchCombobox label="Search agencies and destinations" debounce={0} />
        </div>
        <div>
          <Caption>with a query</Caption>
          <SearchCombobox
            label="Search agencies and destinations"
            defaultValue="Madinah"
            debounce={0}
          />
        </div>
        <div>
          <Caption>with helper text</Caption>
          <SearchCombobox
            label="Search agencies and destinations"
            debounce={0}
            helperText="Try a city, a country or an agency name."
          />
        </div>
        <div>
          <Caption>error</Caption>
          <SearchCombobox
            label="Search agencies and destinations"
            debounce={0}
            defaultValue="Madinah"
            errorMessage="Search is unavailable right now. Try again in a moment."
          />
        </div>
        <div>
          <Caption>disabled</Caption>
          <SearchCombobox
            label="Search agencies and destinations"
            debounce={0}
            disabled
            defaultValue="Madinah"
          />
        </div>
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------------- dark mode */

export const DarkMode: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: { backgrounds: { disable: true } },
  render: (args) => (
    <Page theme="dark">
      <div
        style={{ ...field, display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}
      >
        <div>
          <Caption>idle</Caption>
          <SearchCombobox
            {...args}
            debounce={0}
            helperText="Try a city, a country or an agency name."
          />
        </div>
        <div>
          <Caption>error</Caption>
          <SearchCombobox
            {...args}
            debounce={0}
            defaultValue="Madinah"
            errorMessage="Search is unavailable right now. Try again in a moment."
          />
        </div>
        <div>
          <Caption>results</Caption>
          <AutoOpen>
            <SearchCombobox {...args} defaultValue="Madinah" options={ALL} debounce={0} />
          </AutoOpen>
        </div>
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- text expansion */

const MS: Partial<SearchComboboxLabels> = {
  recentHeading: 'Carian terkini',
  clearRecent: 'Kosongkan carian terkini',
  clearQuery: 'Kosongkan carian',
  loading: 'Sedang mencari',
  cancel: 'Batal',
  resultCount: (count) => `${count} hasil`,
};

const ID: Partial<SearchComboboxLabels> = {
  recentHeading: 'Pencarian terakhir',
  clearRecent: 'Hapus pencarian terakhir',
  clearQuery: 'Hapus pencarian',
  loading: 'Sedang mencari',
  cancel: 'Batal',
  resultCount: (count) => `${count} hasil`,
};

export const TextExpansion: Story = {
  args: { label: 'Search agencies and destinations' },
  parameters: {
    docs: {
      description: {
        story:
          'The label, the placeholder and the helper text are what grow. Inside the popup ' +
          'the pressure is on the header row, where "Clear recent searches" runs half again ' +
          'as long in Malay and sits beside a heading; it wraps to its own line rather than ' +
          'squeezing the heading out.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        {[
          {
            lang: 'en',
            label: 'Search agencies and destinations',
            placeholder: 'Search agencies and destinations',
            helper: 'Try a city, a country or an agency name.',
            labels: undefined,
          },
          {
            lang: 'ms',
            label: 'Cari agensi dan destinasi',
            placeholder: 'Cari agensi dan destinasi',
            helper: 'Cuba nama bandar, negara atau agensi.',
            labels: MS,
          },
          {
            lang: 'id',
            label: 'Cari agen dan destinasi',
            placeholder: 'Cari agen dan destinasi',
            helper: 'Coba nama kota, negara atau agen.',
            labels: ID,
          },
        ].map((copy) => (
          <div key={copy.lang} lang={copy.lang} style={{ width: '300px' }}>
            <Caption>{copy.lang}</Caption>
            <AutoOpen>
              <SearchCombobox
                label={copy.label}
                placeholder={copy.placeholder}
                helperText={copy.helper}
                recentSearches={RECENT}
                onClearRecent={() => {}}
                debounce={0}
                {...(copy.labels ? { labels: copy.labels } : {})}
              />
            </AutoOpen>
          </div>
        ))}
      </div>
    </Page>
  ),
};
