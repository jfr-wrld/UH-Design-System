import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const numeric = (name: string) => Number(name.split('-').pop());

const meta = {
  title: 'Foundations/Spacing',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Scale: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="Spacing is the gap between things - never the size of a thing, which is the sizing scale's job. One 4pt grid across every surface is most of what makes thirty different screens read as one product; the direction calls whitespace structure, not leftover."
      >
        <Rows>
          {tokensByPrefix('uh-spacing-')
            .filter(({ name }) => /-\d+$/.test(name))
            .sort((a, b) => numeric(a.name) - numeric(b.name))
            .map(({ name, value }) => (
              <div key={name} style={{ display: 'contents' }}>
                <TokenName>{name}</TokenName>
                <div>
                  <div
                    style={{
                      width: `${(parseFloat(value) / 96) * 100}%`,
                      minWidth: 'var(--uh-border-width-thick)',
                      height: 'var(--uh-spacing-12)',
                      borderRadius: 'var(--uh-radius-sm)',
                      background: 'var(--uh-color-bg-highlight)',
                      borderInlineEnd:
                        'var(--uh-border-width-thick) solid var(--uh-color-border-brand)',
                    }}
                  />
                </div>
                <ValueText>{value}</ValueText>
              </div>
            ))}
        </Rows>
      </Section>

      <Section
        title="Usage"
        hint="4-8 separate things inside one element; 12-16 separate elements inside a card; 24-32 separate cards and form fields; 48-96 separate page sections. The 2px step exists for optical nudges only - centring an icon against a cap-height, not laying anything out. Spacing does not change across breakpoints: a phone gets fewer columns, not tighter gaps."
      >
        <DoDont>
          <Do title="pick from the scale, and say gaps with gap.">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
              <div className="uh-type-web-label">Departure date</div>
              <div
                style={{
                  height: 'var(--uh-size-control-md)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                  borderRadius: 'var(--uh-radius-input)',
                }}
              />
            </div>
          </Do>
          <Dont title="reach for a between value; 10px is how the grid dies.">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'calc(var(--uh-spacing-8) + var(--uh-spacing-2))',
              }}
            >
              <div className="uh-type-web-label">Departure date</div>
              <div
                style={{
                  height: 'var(--uh-size-control-md)',
                  border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                  borderRadius: 'var(--uh-radius-input)',
                }}
              />
            </div>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-package__body {
  display: flex;
  flex-direction: column;
  gap: var(--uh-spacing-8);
  padding: var(--uh-spacing-12);
}

/* Tailwind: the scale is mapped 1:1, named in pixels. */
<div className="flex flex-col gap-8 p-12" />
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Spacing is layout, not meaning: never rely on proximity alone to say two things belong together - group them structurally (fieldset, list, heading).',
          'Generous spacing between interactive elements is part of hitting the 44px target rule; see Sizing & Touch Targets.',
        ]}
      />
    </Page>
  ),
};
