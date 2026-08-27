import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

/**
 * Doc-only sample glyphs. They restate the drawing contract every component
 * icon in the package follows (24 viewBox, 1.75 stroke, round caps,
 * currentColor); the real glyphs live beside their components.
 */
const stroke = { stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' } as const;

function SampleSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="11" cy="11" r="6.25" {...stroke} />
      <path d="M15.5 15.5L20 20" {...stroke} />
    </svg>
  );
}

function SampleCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect
        x="3.75"
        y="5.75"
        width="16.5"
        height="14.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3.75 10h16.5M8 3.75v4M16 3.75v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const meta = {
  title: 'Foundations/Iconography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Icons: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose and the drawing contract"
        hint="There is no icon font and no icon package: icons are inline SVGs drawn beside the component that needs them. Every one follows the same contract - 24x24 viewBox, 1.75 stroke (1.5 for fine double-strokes), round caps and joins, currentColor for fill and stroke, aria-hidden with focusable=false. That contract is why forty-plus icons by different hands read as one set."
      >
        <div
          style={{
            display: 'flex',
            gap: 'var(--uh-spacing-16)',
            color: 'var(--uh-color-text-primary)',
          }}
        >
          {[SampleSearch, SampleCalendar].map((Glyph, index) => (
            <div
              key={index}
              style={{ width: 'var(--uh-size-icon-2xl)', height: 'var(--uh-size-icon-2xl)' }}
            >
              <Glyph />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes"
        hint="Icons take a size token, never a bare number; the SVG scales because only the viewBox is fixed."
      >
        <Rows>
          {tokensByPrefix('uh-size-icon-').map(({ name, value }) => (
            <div key={name} style={{ display: 'contents' }}>
              <TokenName>{name}</TokenName>
              <div
                style={{
                  width: `var(--${name})`,
                  height: `var(--${name})`,
                  color: 'var(--uh-color-text-primary)',
                }}
              >
                <SampleSearch />
              </div>
              <ValueText>{value}</ValueText>
            </div>
          ))}
        </Rows>
      </Section>

      <Section
        title="Colour"
        hint="currentColor always: an icon inherits the text colour of its context and never carries its own. That is what makes disabled, error and dark states free."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)' }}>
          {[
            ['text-primary', 'var(--uh-color-text-primary)'],
            ['text-secondary', 'var(--uh-color-text-secondary)'],
            ['feedback-error-text', 'var(--uh-color-feedback-error-text)'],
            ['text-brand', 'var(--uh-color-text-brand)'],
          ].map(([label, colour]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--uh-spacing-4)',
              }}
            >
              <div
                style={{
                  width: 'var(--uh-size-icon-lg)',
                  height: 'var(--uh-size-icon-lg)',
                  color: colour,
                }}
              >
                <SampleCalendar />
              </div>
              <ValueText>{label}</ValueText>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Usage">
        <DoDont>
          <Do title="pair every meaningful icon with words; aria-hidden the drawing.">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--uh-spacing-4)',
                color: 'var(--uh-color-text-brand)',
              }}
            >
              <span
                style={{
                  width: 'var(--uh-size-icon-sm)',
                  height: 'var(--uh-size-icon-sm)',
                  display: 'inline-flex',
                }}
              >
                <SampleCalendar />
              </span>
              <span className="uh-type-web-body-s">15 Mar 2026</span>
            </span>
          </Do>
          <Dont title="ship sparkles, stars or generic AI decoration; every glyph earns its place.">
            <span
              className="uh-type-web-body-s"
              style={{ color: 'var(--uh-color-text-secondary)' }}
            >
              An icon that only decorates is noise in a booking flow.
            </span>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="…" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

.uh-picker__icon > svg {
  width: var(--uh-size-icon-md);
  height: var(--uh-size-icon-md);
}
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Icon-only controls carry aria-label; the SVG itself is aria-hidden and focusable=false.',
          'An icon never carries information alone - a label, tooltip-plus-name, or sr-only text says the same thing in words.',
          'Unknown-kind fallbacks (amenities, itinerary) degrade to a neutral mark with the label intact.',
        ]}
      />
    </Page>
  ),
};
