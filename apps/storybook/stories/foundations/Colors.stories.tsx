import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';
import { tokensByPrefix } from './tokens.js';

/** The ramp families, in the order the palette file defines them. */
const RAMPS = ['teal', 'orange', 'neutral', 'green', 'red', 'yellow', 'blue'];

/** Semantic roles worth a swatch row; each renders through its own var(). */
const SEMANTIC_GROUPS: Array<{ title: string; hint: string; prefix: string }> = [
  {
    title: 'Text',
    hint: 'Every role here is contract-checked against the page it sits on.',
    prefix: 'uh-color-text-',
  },
  {
    title: 'Backgrounds',
    hint: 'Canvas is the page, surface is a card; the elevation ladder has its own page.',
    prefix: 'uh-color-bg-',
  },
  {
    title: 'Borders',
    hint: 'strong clears the 3:1 UI-component minimum; default is decorative only.',
    prefix: 'uh-color-border-',
  },
];

function RampRow({ family }: { family: string }) {
  const steps = tokensByPrefix(`uh-color-${family}-`).filter(({ name }) => /-\d+$/.test(name));
  if (steps.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-4)' }}>
      <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
        {family}
      </div>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-4)' }}>
        {steps.map(({ name, value }) => (
          <div
            key={name}
            title={`--${name}: ${value}`}
            style={{
              width: 'var(--uh-size-control-md)',
              height: 'var(--uh-size-control-md)',
              borderRadius: 'var(--uh-radius-sm)',
              border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
              background: `var(--${name})`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SemanticRows({ prefix }: { prefix: string }) {
  const roles = tokensByPrefix(prefix).filter(
    /* The elevation ladder repeats six near-identical rows; its own page shows
       it properly, in both modes at once. */
    ({ name }) => !name.includes('-elevation-'),
  );
  return (
    <Rows>
      {roles.map(({ name, value }) => (
        <div key={name} style={{ display: 'contents' }}>
          <TokenName>{name}</TokenName>
          <div
            style={{
              height: 'var(--uh-spacing-24)',
              borderRadius: 'var(--uh-radius-sm)',
              border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
              background: `var(--${name})`,
            }}
          />
          <ValueText>{value}</ValueText>
        </div>
      ))}
    </Rows>
  );
}

function ColorsPage({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <Page theme={theme}>
      <Section
        title="Ramps"
        hint="The primitive scales. Components never touch these directly; they consume the semantic roles below, which is what lets dark mode be a cascade instead of a rewrite. The printed hex values are the light build; in the dark story the swatches show what the same names resolve to there."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
          {RAMPS.map((family) => (
            <RampRow key={family} family={family} />
          ))}
        </div>
      </Section>

      {SEMANTIC_GROUPS.map((group) => (
        <Section key={group.prefix} title={group.title} hint={group.hint}>
          <SemanticRows prefix={group.prefix} />
        </Section>
      ))}

      <Section
        title="The two rules the palette exists to protect"
        hint="Teal is structural: brand, links, primary actions. Orange is the accent, spent once per surface on the thing that must be noticed. And never white text on orange-500: 2.82 to 1, checked by a build-time contract that fails if it ever stops being true."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)' }}>
          <div
            className="uh-type-web-label"
            style={{
              padding: 'var(--uh-spacing-12) var(--uh-spacing-20)',
              borderRadius: 'var(--uh-radius-button)',
              background: 'var(--uh-color-action-primary-default)',
              color: 'var(--uh-color-action-primary-label)',
            }}
          >
            Primary action
          </div>
          <div
            className="uh-type-web-label"
            style={{
              padding: 'var(--uh-spacing-12) var(--uh-spacing-20)',
              borderRadius: 'var(--uh-radius-button)',
              background: 'var(--uh-color-action-secondary-default)',
              color: 'var(--uh-color-action-secondary-label)',
            }}
          >
            Accent action
          </div>
        </div>
      </Section>

      <Section title="Usage">
        <DoDont>
          <Do title="consume semantic roles; the theme does the rest.">
            <p
              className="uh-type-web-body-s"
              style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
            >
              color: var(--uh-color-text-secondary)
            </p>
          </Do>
          <Dont title="reach past the role into the ramp, or reuse a page-checked colour on a tint.">
            <p className="uh-type-web-body-s" style={{ margin: 0 }}>
              text.tertiary passes on the surface but fails on feedback.info.bg - the tinted-surface
              trap the contracts exist to catch.
            </p>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-review__date { color: var(--uh-color-text-tertiary); }
.uh-badge[data-variant='primary'] {
  background: var(--uh-color-bg-brand-subtle);
  color: var(--uh-color-text-brand);
}
        `}</Code>
      </Section>

      <A11ySection
        items={[
          '154 build-time contracts: every text role against its page, action labels on all three states, feedback text on its own tint, borders at 3:1.',
          'Colour is never the only signal - each coloured state pairs with a word, icon or mark.',
          'Disabled text is exempt from contrast but never additionally faded.',
        ]}
      />
    </Page>
  );
}

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Light: Story = { render: () => <ColorsPage theme="light" /> };

export const Dark: Story = {
  parameters: { backgrounds: { disable: true } },
  render: () => <ColorsPage theme="dark" />,
};
