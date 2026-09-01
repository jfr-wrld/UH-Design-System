import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { Rating, type RatingSize } from './Rating.js';

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

const meta = {
  title: 'Components/Rating',
  component: Rating,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Two modes from one component, chosen by which props are present - never an ' +
          'explicit "mode" switch. Pass only `value`: a decorative score, role="img", a ' +
          'true fractional fill (4.3 of 5 fills 86%, not a rounded four and a half star). ' +
          'Add `onChange`, `defaultValue`, or `readOnly`: a star picker, ' +
          'role="radiogroup" with one native radio per star - arrow-key navigation, focus, ' +
          'and roving tabindex all come from the browser for free, nothing hand-rolled.\n\n' +
          'Every existing caller (PackageCard, ReviewCard, AgencyCard) passes only `value` ' +
          'and reads exactly as before; input mode is additive, not a breaking change.\n\n' +
          "`readOnly` keeps the picker's shape and marks aria-readonly rather than " +
          'disabling it - a radio group has no native readonly of its own, so the block is ' +
          'implemented in the change handler while the control stays reachable and legible.',
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

function PlaygroundDemo() {
  const [value, setValue] = useState(3);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
      <div>
        <p className="uh-type-web-label" style={{ margin: '0 0 4px' }}>
          Display
        </p>
        <Rating value={4.3} reviewCount={128} />
      </div>
      <div>
        <p className="uh-type-web-label" style={{ margin: '0 0 4px' }}>
          Input
        </p>
        <Rating value={value} onChange={setValue} groupLabel="Rate this agency" />
      </div>
    </div>
  );
}

export const Playground: Story = {
  args: { value: 4.3 },
  render: () => (
    <Page>
      <PlaygroundDemo />
    </Page>
  ),
};

const SIZES: RatingSize[] = ['sm', 'md'];

export const Matrix: Story = {
  args: { value: 4.3 },
  parameters: {
    docs: {
      description: {
        story:
          'Both sizes, in both modes, plus the states unique to input mode: default, ' +
          'selected, read-only and disabled.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}>
        <div>
          <p className="uh-type-web-label" style={{ margin: '0 0 8px' }}>
            Display
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
            {SIZES.map((size) => (
              <Rating key={size} value={4.3} reviewCount={128} size={size} />
            ))}
            <Rating value={0} reviewCount={0} />
            <Rating value={7} max={10} reviewCount={42} />
          </div>
        </div>

        <div>
          <p className="uh-type-web-label" style={{ margin: '0 0 8px' }}>
            Input
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
            {SIZES.map((size) => (
              <Rating
                key={size}
                value={0}
                size={size}
                onChange={() => {}}
                groupLabel={`Unrated, ${size}`}
              />
            ))}
            <Rating value={4} onChange={() => {}} groupLabel="Selected at 4" />
            <Rating value={3} readOnly groupLabel="Read-only at 3" />
            <Rating value={2} onChange={() => {}} disabled groupLabel="Disabled at 2" />
          </div>
        </div>
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { value: 4.3 },
  render: () => (
    <Page theme="dark">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        <Rating value={4.3} reviewCount={128} />
        <Rating value={4} onChange={() => {}} groupLabel="Rate this agency" />
      </div>
    </Page>
  ),
};

const COPY = [
  { lang: 'en', label: () => `4.8 out of 5, 1,284 reviews`, group: 'Rate this agency' },
  { lang: 'ms', label: () => `4.8 daripada 5, 1,284 ulasan`, group: 'Nilaikan agensi ini' },
  { lang: 'id', label: () => `4.8 dari 5, 1.284 ulasan`, group: 'Nilai agen ini' },
] as const;

export const TextExpansion: Story = {
  args: { value: 4.8 },
  parameters: {
    docs: {
      description: {
        story:
          'The stars and the digits never change shape or width across locales - only the ' +
          'accessible sentence and, for Indonesian, the thousands separator on the review ' +
          "count (1.284 rather than 1,284) do. That is Rating's whole surface for " +
          'localisation: nothing here truncates or wraps, because nothing here is prose.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        {COPY.map((entry) => (
          <div key={entry.lang} lang={entry.lang}>
            <Rating
              value={4.8}
              reviewCount={1284}
              locale={
                entry.lang === 'en' ? 'en' : `${entry.lang}-${entry.lang === 'ms' ? 'MY' : 'ID'}`
              }
              label={() => entry.label()}
            />
          </div>
        ))}
        {COPY.map((entry) => (
          <div key={`${entry.lang}-input`} lang={entry.lang}>
            <Rating value={4} onChange={() => {}} groupLabel={entry.group} />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for Rating.mdx's
 * "Contoh Penggunaan" section - one per mode the component draws, chosen by
 * which props are present. Args-only so the Docs Source panel reconstructs
 * clean `<Rating ... />` JSX.
 */

export const ScoreDisplay: Story = {
  parameters: { layout: 'centered' },
  args: { value: 4.5, reviewCount: 812 },
};

export const ReviewInput: Story = {
  parameters: { layout: 'centered' },
  args: { defaultValue: 0, onChange: () => {}, groupLabel: 'Rate your stay' },
};

export const YourRatingReadOnly: Story = {
  parameters: { layout: 'centered' },
  args: { value: 4, readOnly: true, groupLabel: 'Your rating' },
};
