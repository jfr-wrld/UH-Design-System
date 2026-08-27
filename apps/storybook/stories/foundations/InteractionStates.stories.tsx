import type { Meta, StoryObj } from '@storybook/react';

import { Badge, Button, Checkbox, Input } from '@umrahhaji/ui';

import { Page, Section } from './shared.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const meta = {
  title: 'Foundations/Interaction States',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-8)' }}>
      <span className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
        {label}
      </span>
      {children}
    </div>
  );
}

export const UniversalContract: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="Every interactive element answers the same seven questions the same way: rest, hover, focus, active, disabled, error, and - where it applies - selected. The contract is universal so a pilgrim who has learned one control has learned them all. Hover and focus rows here are real components with the state forced by the pseudo-states addon, not restyled copies."
      >
        <div />
      </Section>

      <Section title="Rest / disabled / error, on real components">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--uh-spacing-24)',
            maxWidth: '820px',
          }}
        >
          <Cell label="rest">
            <Button variant="primary">Continue to payment</Button>
          </Cell>
          <Cell label="disabled - aria-disabled, still readable, still focusable">
            <Button variant="primary" disabled>
              Continue to payment
            </Button>
          </Cell>
          <Cell label="loading - width held, action announced">
            <Button variant="primary" loading>
              Continue to payment
            </Button>
          </Cell>
          <Cell label="error - words first, colour second">
            <Input label="Full name" errorMessage="Enter the name exactly as in the passport." />
          </Cell>
          <Cell label="selected - mark plus state, never colour alone">
            <Checkbox label="Travel insurance" defaultChecked />
          </Cell>
          <Cell label="status - text in the chip, not a coloured dot">
            <Badge variant="confirmed">Confirmed</Badge>
          </Cell>
        </div>
      </Section>

      <Section
        title="The state layers"
        hint="Hover and pressed tints on filled surfaces come from opacity.hover-subtle (0.08) and opacity.pressed (0.12) over the fill - not from a second colour ramp. Focus is never a tint: it is the one ring, documented under Shape & Borders."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)' }}>
          {[
            ['rest', '0'],
            ['hover', 'var(--uh-opacity-hover-subtle)'],
            ['pressed', 'var(--uh-opacity-pressed)'],
          ].map(([label, layer]) => (
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
                  position: 'relative',
                  width: 'var(--uh-size-control-lg)',
                  height: 'var(--uh-size-control-lg)',
                  borderRadius: 'var(--uh-radius-button)',
                  background: 'var(--uh-color-action-primary-default)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--uh-color-text-inverse)',
                    opacity: layer,
                  }}
                />
              </div>
              <span
                className="uh-type-web-caption"
                style={{ color: 'var(--uh-color-text-secondary)' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Usage">
        <DoDont>
          <Do title="keep disabled controls in the tab order with aria-disabled, so their reason can be read.">
            <div className="uh-type-web-body-s">
              A sold-out card can still tell you what it was.
            </div>
          </Do>
          <Dont title="say a state with colour alone.">
            <div className="uh-type-web-body-s">
              Every error pairs its red with a message; every selection pairs its fill with a mark.
            </div>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-btn[data-variant='primary']:hover { background: var(--uh-color-action-primary-hover); }
.uh-btn:focus-visible {
  outline: var(--uh-size-focus-ring-width) solid var(--uh-color-border-focus);
  outline-offset: var(--uh-size-focus-ring-offset);
}
/* Disabled is aria-disabled + action.primary.disabled - never opacity on text. */
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Focus visible on every interactive element, both themes, contract-checked at 3:1.',
          'Hover-only affordances are forbidden; everything reachable by pointer is reachable and visible by keyboard.',
          'Disabled text is WCAG-exempt but never stacked with extra opacity.',
          'Error states interrupt via role=alert; helper text waits its turn via aria-describedby.',
        ]}
      />
    </Page>
  ),
};

export const HoverAndFocusForced: Story = {
  parameters: { pseudo: { hover: true, focusVisible: true } },
  render: () => (
    <Page>
      <Section
        title="Hover and focus-visible, held still"
        hint="The pseudo-states addon forces :hover and :focus-visible on, so the two states can be inspected and screenshotted at rest on the genuine components."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-24)', flexWrap: 'wrap' }}>
          <Button variant="primary">Hovered and focused</Button>
          <Button variant="secondary">Hovered and focused</Button>
          <Button variant="ghost">Hovered and focused</Button>
        </div>
      </Section>
    </Page>
  ),
};
