import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont, ThemePair } from './docs.js';

const meta = {
  title: 'Foundations/Shape & Borders',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const RadiusAndBorders: Story = {
  render: () => {
    const scale = tokensByPrefix('uh-radius-').filter(({ value }) => /^\d/.test(value));
    const aliases = tokensByPrefix('uh-radius-').filter(({ value }) => !/^\d/.test(value));
    return (
      <Page>
        <Section
          title="Radius scale"
          hint="Rounded, not pill-shaped everywhere: the direction is modern-efficient, and a page where every element is a capsule reads as template, not craft."
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-16)' }}>
            {scale.map(({ name, value }) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 'var(--uh-spacing-4)',
                }}
              >
                <div
                  style={{
                    width: 'var(--uh-size-control-lg)',
                    height: 'var(--uh-size-control-lg)',
                    border: 'var(--uh-border-width-thick) solid var(--uh-color-border-brand)',
                    borderRadius: `var(--${name})`,
                    background: 'var(--uh-color-bg-surface)',
                  }}
                />
                <TokenName>{name}</TokenName>
                <ValueText>{value}</ValueText>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Component contracts"
          hint="The aliases are where a component's roundness is decided - once. A consumer or a redesign changes radius.card, and every card follows; no stylesheet hunt."
        >
          <Rows>
            {aliases.map(({ name, value }) => (
              <div key={name} style={{ display: 'contents' }}>
                <TokenName>{name}</TokenName>
                <div
                  style={{
                    height: 'var(--uh-spacing-24)',
                    border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                    borderRadius: `var(--${name})`,
                    maxWidth: '200px',
                  }}
                />
                <ValueText>{value}</ValueText>
              </div>
            ))}
          </Rows>
        </Section>

        <Section
          title="Border widths"
          hint="hairline for borders and dividers, thin for the focused input, thick for the focus ring and selected states. The numeric names remain for calc() arithmetic."
        >
          <Rows>
            {tokensByPrefix('uh-border-width-')
              .filter(({ name }) => /-(hairline|thin|thick)$/.test(name))
              .map(({ name, value }) => (
                <div key={name} style={{ display: 'contents' }}>
                  <TokenName>{name}</TokenName>
                  <div
                    style={{
                      borderBlockStart: `var(--${name}) solid var(--uh-color-border-strong)`,
                    }}
                  />
                  <ValueText>{value}</ValueText>
                </div>
              ))}
          </Rows>
        </Section>

        <Section
          title="The focus ring, in both themes"
          hint="One ring for the entire system, no exceptions: thick width, 2px offset, color.border.focus - teal-600 in light, teal-400 in dark, both clearing 3:1 against every surface they meet. Tab to the buttons."
        >
          <ThemePair
            render={() => (
              <button
                type="button"
                className="uh-type-web-label"
                style={{
                  padding: 'var(--uh-spacing-8) var(--uh-spacing-16)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                  borderRadius: 'var(--uh-radius-button)',
                  background: 'var(--uh-color-bg-surface)',
                  color: 'var(--uh-color-text-primary)',
                  outlineOffset: 'var(--uh-size-focus-ring-offset)',
                  cursor: 'pointer',
                }}
                onFocus={(event) => {
                  event.currentTarget.style.outline =
                    'var(--uh-size-focus-ring-width) solid var(--uh-color-border-focus)';
                }}
                onBlur={(event) => {
                  event.currentTarget.style.outline = '';
                }}
              >
                Focus me
              </button>
            )}
          />
        </Section>

        <Section title="Usage">
          <DoDont>
            <Do title="use the alias for the thing you are building.">
              <div
                style={{
                  padding: 'var(--uh-spacing-12)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
                  borderRadius: 'var(--uh-radius-card)',
                }}
                className="uh-type-web-body-s"
              >
                A card, on radius.card
              </div>
            </Do>
            <Dont title="mix scale steps on one surface; nested corners step down, never up.">
              <div
                style={{
                  padding: 'var(--uh-spacing-12)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
                  borderRadius: 'var(--uh-radius-sm)',
                }}
              >
                <div
                  style={{
                    padding: 'var(--uh-spacing-8)',
                    border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
                    borderRadius: 'var(--uh-radius-2xl)',
                  }}
                  className="uh-type-web-body-s"
                >
                  Inner rounder than outer
                </div>
              </div>
            </Dont>
          </DoDont>
        </Section>

        <Section title="Implementation">
          <Code>{`
.uh-package {
  border: var(--uh-border-width-hairline) solid var(--uh-color-border-subtle);
  border-radius: var(--uh-radius-card);
}

.uh-btn:focus-visible {
  outline: var(--uh-size-focus-ring-width) solid var(--uh-color-border-focus);
  outline-offset: var(--uh-size-focus-ring-offset);
}
          `}</Code>
        </Section>

        <A11ySection
          items={[
            'The focus ring is never removed without this exact replacement; outline: none alone fails review.',
            'Interactive component boundaries (border.strong, border.focus) hold 3:1 against adjacent colours in both themes - contract-checked.',
            'Shape is never the only signal: a selected state pairs its border change with a fill, an icon, or words.',
          ]}
        />
      </Page>
    );
  },
};
