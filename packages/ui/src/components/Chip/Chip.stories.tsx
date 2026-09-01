import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Chip } from './Chip.js';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
  minHeight: '360px',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A tappable pill, not a decorative label - Badge already owns that job. Chip is ' +
          'a filter that toggles on and off, a choice among several, or an applied filter ' +
          'shown back with its own dismiss.\n\n' +
          '`onClick` present turns the label into a real button carrying `aria-pressed`; ' +
          'absent, it is plain text - the shape a chip takes once it is only reporting an ' +
          'applied filter, not offering to change it. `removable` adds a second, ' +
          'independent 44px control: written as a sibling of the toggle inside one ' +
          'wrapper, never nested inside it, because a button cannot legally contain a ' +
          "button - the same reasoning behind PackageCard's whole-card action and its " +
          'wishlist heart being siblings rather than one wrapping the other.\n\n' +
          '`aria-disabled`, not the `disabled` attribute, on both controls - a disabled ' +
          'chip stays in the tab order and readable rather than vanishing from it.',
      },
    },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [selected, setSelected] = useState<string[]>(['direct']);
  const toggle = (key: string) =>
    setSelected((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key],
    );
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
      <Chip onClick={() => toggle('direct')} selected={selected.includes('direct')}>
        Direct flights only
      </Chip>
      <Chip onClick={() => toggle('halal')} selected={selected.includes('halal')}>
        Halal certified
      </Chip>
      <Chip
        onClick={() => toggle('ramadan')}
        selected={selected.includes('ramadan')}
        icon={<MoonIcon />}
      >
        Ramadan packages
      </Chip>
    </div>
  );
}

export const Playground: Story = {
  args: { children: 'Direct flights only' },
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

export const Matrix: Story = {
  args: { children: 'Direct flights only' },
  parameters: {
    docs: {
      description: {
        story:
          'Every combination that changes behaviour: toggle vs static-tag, ' +
          'selected vs not, with an icon, removable, and disabled.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
          <Chip onClick={() => {}}>Unselected toggle</Chip>
          <Chip onClick={() => {}} selected>
            Selected toggle
          </Chip>
          <Chip onClick={() => {}} icon={<MoonIcon />}>
            With icon
          </Chip>
          <Chip onClick={() => {}} disabled>
            Disabled toggle
          </Chip>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
          <Chip removable onRemove={() => {}}>
            Static tag
          </Chip>
          <Chip onClick={() => {}} removable onRemove={() => {}}>
            Toggle, removable
          </Chip>
          <Chip onClick={() => {}} selected removable onRemove={() => {}}>
            Selected, removable
          </Chip>
          <Chip onClick={() => {}} removable onRemove={() => {}} disabled>
            Disabled, removable
          </Chip>
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { children: 'Direct flights only' },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
        <Chip onClick={() => {}}>Direct flights only</Chip>
        <Chip onClick={() => {}} selected>
          Halal certified
        </Chip>
        <Chip removable onRemove={() => {}}>
          Jakarta
        </Chip>
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: 'Direct flights only' },
  { lang: 'ms', label: 'Penerbangan terus sahaja' },
  { lang: 'id', label: 'Hanya penerbangan langsung' },
] as const;

export const TextExpansion: Story = {
  args: { children: 'Direct flights only' },
  parameters: {
    docs: {
      description: {
        story:
          '"Penerbangan terus sahaja" and its Indonesian counterpart both run longer than ' +
          'the English label; the pill grows to fit rather than truncating, since a filter ' +
          'row usually has room to wrap rather than clip a word a pilgrim needs to read.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-8)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Chip onClick={() => {}} selected>
              {entry.label}
            </Chip>
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Chip.mdx's
 * "Contoh Penggunaan" section, one per shape the label slot can take -
 * args-only so the Docs Source panel reconstructs clean `<Chip ... />` JSX.
 */

export const AppliedFilterTag: Story = {
  parameters: { layout: 'centered' },
  args: { children: 'Jakarta', removable: true, onRemove: () => {} },
};

export const ToggleFilter: Story = {
  parameters: { layout: 'centered' },
  args: { children: 'Halal certified', selected: true, onClick: () => {} },
};

export const RemovableToggle: Story = {
  parameters: { layout: 'centered' },
  args: {
    children: 'Direct flights only',
    selected: true,
    onClick: () => {},
    removable: true,
    onRemove: () => {},
  },
};
