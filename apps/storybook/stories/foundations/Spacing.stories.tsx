import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';

const numeric = (name: string) => Number(name.split('-').pop());

function Bars({ prefix, max }: { prefix: string; max: number }) {
  const steps = tokensByPrefix(prefix)
    .filter(({ name }) => /-\d+$/.test(name))
    .sort((a, b) => numeric(a.name) - numeric(b.name));
  return (
    <Rows>
      {steps.map(({ name, value }) => (
        <div key={name} style={{ display: 'contents' }}>
          <TokenName>{name}</TokenName>
          <div>
            <div
              style={{
                width: `${(parseFloat(value) / max) * 100}%`,
                minWidth: 'var(--uh-border-width-thick)',
                height: 'var(--uh-spacing-12)',
                borderRadius: 'var(--uh-radius-sm)',
                background: 'var(--uh-color-bg-brand-subtle)',
                borderInlineEnd: 'var(--uh-border-width-thick) solid var(--uh-color-border-brand)',
              }}
            />
          </div>
          <ValueText>{value}</ValueText>
        </div>
      ))}
    </Rows>
  );
}

function RadiusRow() {
  const scale = tokensByPrefix('uh-radius-').filter(({ value }) => /^\d/.test(value));
  const aliases = tokensByPrefix('uh-radius-').filter(({ value }) => !/^\d/.test(value));
  return (
    <>
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
    </>
  );
}

const meta = {
  title: 'Foundations/Spacing and Shape',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => (
    <Page>
      <Section
        title="Spacing"
        hint="A 4pt grid. The 2px step is a half-step for optical nudges only; nothing else lives off the grid. These are gaps between things - the size of a thing is the sizing scale below."
      >
        <Bars prefix="uh-spacing-" max={96} />
      </Section>

      <Section
        title="Sizing"
        hint="Controls come in 36, 44 and 52; the pointer target never drops below tap-target-min even when the visible control does - the small button carries an invisible 44px overlay."
      >
        <Rows>
          {[
            ...tokensByPrefix('uh-size-control-'),
            ...tokensByPrefix('uh-size-tap-target'),
            ...tokensByPrefix('uh-size-icon-'),
          ].map(({ name, value }) => (
            <div key={name} style={{ display: 'contents' }}>
              <TokenName>{name}</TokenName>
              <div>
                <div
                  style={{
                    width: `var(--${name})`,
                    height: `var(--${name})`,
                    borderRadius: 'var(--uh-radius-sm)',
                    background: 'var(--uh-color-bg-brand-subtle)',
                    border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-brand)',
                  }}
                />
              </div>
              <ValueText>{value}</ValueText>
            </div>
          ))}
        </Rows>
      </Section>

      <Section
        title="Radius"
        hint="The scale, then the component contracts: change what a card's corner is once, in the alias, rather than in its stylesheet. The sheet alias rounds top corners only - its bottom edge is attached to the screen."
      >
        <RadiusRow />
      </Section>

      <Section
        title="Border widths"
        hint="The named aliases say what a weight is for. hairline for borders and dividers, thin for the focused input, thick for the focus ring and selected states."
      >
        <Rows>
          {tokensByPrefix('uh-border-width-')
            .filter(({ name }) => /-(hairline|thin|thick)$/.test(name))
            .map(({ name, value }) => (
              <div key={name} style={{ display: 'contents' }}>
                <TokenName>{name}</TokenName>
                <div
                  style={{ borderBlockStart: `var(--${name}) solid var(--uh-color-border-strong)` }}
                />
                <ValueText>{value}</ValueText>
              </div>
            ))}
        </Rows>
      </Section>

      <Section
        title="Focus ring"
        hint="One ring for the entire system, no exceptions: 2px, offset 2px, color.border.focus. Tab to the box below to see it."
      >
        <button
          type="button"
          className="uh-type-web-label"
          style={{
            padding: 'var(--uh-spacing-12) var(--uh-spacing-20)',
            border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
            borderRadius: 'var(--uh-radius-button)',
            background: 'var(--uh-color-bg-surface)',
            color: 'var(--uh-color-text-primary)',
            outlineOffset: 'var(--uh-size-focus-ring-offset)',
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
      </Section>
    </Page>
  ),
};
