import type { CSSProperties, ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible.js';

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
  title: 'Components/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "`Accordion`'s own sibling, simplified down to exactly one expand/collapse " +
          'section instead of a group - "Show more", a truncated description, one FAQ entry ' +
          'read on its own. Reach for `Accordion` instead the moment there is more than one ' +
          'of these sitting together.',
      },
    },
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <Collapsible>
          <CollapsibleTrigger>Kebijakan pembatalan</CollapsibleTrigger>
          <CollapsibleContent>
            Pembatalan lebih dari 30 hari sebelum keberangkatan mendapat pengembalian dana penuh.
            Antara 15-30 hari, 50% dari harga paket dikembalikan. Kurang dari 15 hari, tidak ada
            pengembalian dana.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Page>
  ),
};

export const Matrix: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default (open by default), and disabled.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '480px',
        }}
      >
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Open by default</CollapsibleTrigger>
          <CollapsibleContent>This content starts visible.</CollapsibleContent>
        </Collapsible>
        <Collapsible disabled defaultOpen>
          <CollapsibleTrigger>Disabled</CollapsibleTrigger>
          <CollapsibleContent>Never reachable while disabled.</CollapsibleContent>
        </Collapsible>
      </div>
    </Page>
  ),
};

export const AsAPageSection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`headingLevel` wraps the trigger in a real heading, for the rarer case where a ' +
          'single collapsible genuinely is its own page section worth heading navigation - ' +
          'left unset (plain button, no heading) by default everywhere else.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <Collapsible headingLevel={2}>
          <CollapsibleTrigger>Pertanyaan yang sering diajukan</CollapsibleTrigger>
          <CollapsibleContent>
            Jawaban lengkap muncul di sini setelah section-nya dibuka.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  render: () => (
    <Page theme="dark">
      <div style={{ maxWidth: '480px' }}>
        <Collapsible defaultOpen>
          <CollapsibleTrigger>Kebijakan pembatalan</CollapsibleTrigger>
          <CollapsibleContent>
            Pembatalan lebih dari 30 hari sebelum keberangkatan mendapat pengembalian dana penuh.
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Cancellation policy' },
  { lang: 'ms', label: 'Polisi pembatalan' },
  { lang: 'id', label: 'Kebijakan pembatalan' },
] as const;

export const TextExpansion: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '"Polisi pembatalan" and "Kebijakan pembatalan" run about the same length as the ' +
          'English label - the trigger wraps onto a second line rather than truncating if a ' +
          'longer label ever needs to.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '360px',
        }}
      >
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Collapsible>
              <CollapsibleTrigger>{entry.label}</CollapsibleTrigger>
              <CollapsibleContent>Detail text.</CollapsibleContent>
            </Collapsible>
          </div>
        ))}
      </div>
    </Page>
  ),
};
