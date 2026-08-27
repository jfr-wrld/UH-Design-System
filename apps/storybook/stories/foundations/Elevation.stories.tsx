import type { Meta, StoryObj } from '@storybook/react';

import { Page, Section, TokenName, ValueText } from './shared.js';
import { FLAT } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const LEVELS = [0, 1, 2, 3, 4, 5] as const;

const USE: Record<number, string> = {
  0: 'Flat',
  1: 'Resting card, focused input',
  2: 'Card hover, dropdown, tooltip',
  3: 'Popover, sticky header',
  4: 'Modal, bottom sheet',
  5: 'Full-screen overlay',
};

/**
 * One column of the ladder. Both the shadow and the surface come from the
 * theme cascade, which is the whole point being documented: a component says
 * `elevation-3` once, and light answers with a shadow while dark answers with
 * a lighter surface plus a thin edge.
 */
function Ladder({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--uh-color-bg-canvas)',
        padding: 'var(--uh-spacing-24)',
        borderRadius: 'var(--uh-radius-lg)',
      }}
    >
      <div
        className="uh-type-web-overline"
        style={{ color: 'var(--uh-color-text-tertiary)', marginBlockEnd: 'var(--uh-spacing-16)' }}
      >
        {theme}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
        {LEVELS.map((level) => (
          <div
            key={level}
            style={{
              padding: 'var(--uh-spacing-16)',
              borderRadius: 'var(--uh-radius-card)',
              background: `var(--uh-color-bg-elevation-${level})`,
              boxShadow: `var(--uh-elevation-${level})`,
              color: 'var(--uh-color-text-primary)',
            }}
          >
            <span className="uh-type-web-label">elevation-{level}</span>{' '}
            <span
              className="uh-type-web-body-s"
              style={{ color: 'var(--uh-color-text-secondary)' }}
            >
              {USE[level]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Foundations/Elevation',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Ladders: Story = {
  render: () => (
    <Page>
      <Section
        title="One name, two answers"
        hint="Height is stated once, per level, through var(--uh-elevation-N) and var(--uh-color-bg-elevation-N). In light mode the level is a shadow on a plain surface. In the dark a black shadow is invisible, so the level becomes a lighter surface - each step up is a step lighter - with only a thin edge shadow left to separate two surfaces at the same height. Components do not know any of this; the theme cascade answers for them."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--uh-spacing-24)',
            maxWidth: '900px',
          }}
        >
          <Ladder theme="light" />
          <Ladder theme="dark" />
        </div>
      </Section>

      <Section
        title="The rule"
        hint="Never raise elevation to attract attention. Elevation says how far a surface is from the page, not how important it is - importance is said with colour and spacing. A card that wants to be noticed at elevation-4 is a modal pretending not to be one."
      >
        <div />
      </Section>

      <Section
        title="Native apps"
        hint="The same ladder for iOS and Android, read from the JSON build. iOS takes shadowColor with these offset, opacity and radius triplets; Android takes its elevation integer and derives the rest."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content repeat(4, max-content)',
            columnGap: 'var(--uh-spacing-24)',
            rowGap: 'var(--uh-spacing-8)',
            alignItems: 'baseline',
          }}
        >
          <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
            level
          </span>
          <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
            iOS offset-y
          </span>
          <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
            iOS opacity
          </span>
          <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
            iOS radius
          </span>
          <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
            Android
          </span>
          {LEVELS.map((level) => (
            <div key={level} style={{ display: 'contents' }}>
              <TokenName>{`uh-elevation-${level}`}</TokenName>
              <ValueText>
                {level === 0 ? '-' : String(FLAT[`uh-elevation-native-ios-${level}-offset-y`])}
              </ValueText>
              <ValueText>
                {level === 0 ? '-' : String(FLAT[`uh-elevation-native-ios-${level}-opacity`])}
              </ValueText>
              <ValueText>
                {level === 0 ? '-' : String(FLAT[`uh-elevation-native-ios-${level}-radius`])}
              </ValueText>
              <ValueText>{String(FLAT[`uh-elevation-native-android-${level}`])}</ValueText>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Usage">
        <DoDont>
          <Do title="state the level once; pair shadow with its surface.">
            <div
              style={{
                padding: 'var(--uh-spacing-12)',
                borderRadius: 'var(--uh-radius-card)',
                background: 'var(--uh-color-bg-elevation-2)',
                boxShadow: 'var(--uh-elevation-2)',
              }}
              className="uh-type-web-body-s"
            >
              elevation-2, both tokens
            </div>
          </Do>
          <Dont title="raise elevation to attract attention - that is colour and spacing's job.">
            <div
              style={{
                padding: 'var(--uh-spacing-12)',
                borderRadius: 'var(--uh-radius-card)',
                background: 'var(--uh-color-bg-elevation-1)',
                boxShadow: 'var(--uh-elevation-5)',
              }}
              className="uh-type-web-body-s"
            >
              a resting card shouting at elevation-5
            </div>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-picker__panel {
  background: var(--uh-color-bg-elevation-3);
  box-shadow: var(--uh-elevation-3);
}
/* Light resolves to a shadow ladder; dark to a lighter surface
   plus a thin edge. The component never knows which. */
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Depth is redundant information: every elevated layer is also announced by role (dialog, listbox, tooltip) - nobody needs to see the shadow to know a modal opened.',
          'The dark surface ladder keeps text contracts on every step (checked against bg-elevation surfaces via the neutral-on-tint contracts).',
        ]}
      />
    </Page>
  ),
};
