import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '@umrahhaji/ui';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const meta = {
  title: 'Foundations/Sizing & Touch Targets',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Controls: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="The size of a thing, kept apart from spacing on purpose: these values name what a control is, and they do not sit on the 4pt grid when the hand says otherwise. The audience skews 30-60 on mobile, so 44px is the default control, not the generous option."
      >
        <Rows>
          {[...tokensByPrefix('uh-size-control-'), ...tokensByPrefix('uh-size-tap-target')].map(
            ({ name, value }) => (
              <div key={name} style={{ display: 'contents' }}>
                <TokenName>{name}</TokenName>
                <div>
                  <div
                    style={{
                      width: `var(--${name})`,
                      height: `var(--${name})`,
                      borderRadius: 'var(--uh-radius-sm)',
                      background: 'var(--uh-color-bg-highlight)',
                      border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-brand)',
                    }}
                  />
                </div>
                <ValueText>{value}</ValueText>
              </div>
            ),
          )}
        </Rows>
      </Section>

      <Section
        title="The invisible overlay"
        hint="A 36px control does not shrink its pointer target: every small control in the package carries an invisible ::after stretched to tap-target-min, centred on the control. The dashed outline below draws that overlay on a real small Button - the box a finger actually has to hit."
      >
        <div
          style={{ position: 'relative', display: 'inline-flex', padding: 'var(--uh-spacing-16)' }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              margin: 'auto',
              width: 'var(--uh-size-tap-target-min)',
              height: 'var(--uh-size-tap-target-min)',
              border: 'var(--uh-border-width-hairline) dashed var(--uh-color-border-brand)',
              borderRadius: 'var(--uh-radius-sm)',
              pointerEvents: 'none',
            }}
          />
          <Button size="sm" variant="secondary">
            36px control
          </Button>
        </div>
      </Section>

      <Section
        title="Exceptions, documented"
        hint="Three controls sit at 24px - the WCAG 2.5.8 floor, not the house rule: the Badge remove control, the field clear control, and inline info icons in table rows. Each would steal taps from its neighbours at 44px, and each says so in a comment where it happens. An exception without a written reason is a bug."
      >
        <DoDont>
          <Do title="give an icon-only control the full target.">
            <button
              type="button"
              aria-label="Save package"
              style={{
                width: 'var(--uh-size-tap-target-min)',
                height: 'var(--uh-size-tap-target-min)',
                border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                borderRadius: 'var(--uh-radius-full)',
                background: 'var(--uh-color-bg-surface)',
                cursor: 'pointer',
              }}
            >
              ♥
            </button>
          </Do>
          <Dont title="ship a bare 24px icon button outside the documented exceptions.">
            <button
              type="button"
              aria-label="Save package"
              style={{
                width: 'var(--uh-size-icon-lg)',
                height: 'var(--uh-size-icon-lg)',
                border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                borderRadius: 'var(--uh-radius-full)',
                background: 'var(--uh-color-bg-surface)',
                cursor: 'pointer',
              }}
            >
              ♥
            </button>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
/* The small control keeps a full-size pointer target. */
.uh-stepper__button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: var(--uh-size-tap-target-min);
  height: var(--uh-size-tap-target-min);
  transform: translate(-50%, -50%);
}
        `}</Code>
      </Section>

      <A11ySection
        items={[
          '44x44px minimum pointer target on every interactive element (house rule, above WCAG 2.5.8).',
          'Documented 24px exceptions only where a 44px area would overlap a neighbouring target.',
          'Below 336px viewports the calendar and OTP cells trade width for no-horizontal-scroll; the row stays one continuous target.',
        ]}
      />
    </Page>
  ),
};
