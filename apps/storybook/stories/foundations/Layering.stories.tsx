import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

const REASONS: Record<string, string> = {
  base: 'Normal flow.',
  raised: 'Lifted within flow: a card hover, a control above an image.',
  sticky: 'Sticky headers - far below every floating layer, so a dropdown is never buried.',
  dropdown: 'Listboxes and menus.',
  overlay: 'Scrims and backdrops.',
  modal: 'Dialogs.',
  sheet: 'Same layer as modal: one job, two viewports; they never coexist.',
  popover: 'Above modals, because popovers attach to controls inside them.',
  tooltip: 'Above popovers, for the same reason.',
  toast: 'Above everything: a payment failure must surface over the modal that caused it.',
};

const meta = {
  title: 'Foundations/Layering',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const StackingOrder: Story = {
  render: () => (
    <Page>
      <Section
        title="Z-index"
        hint="Read bottom-up: each row sits on everything below it. Floating layers are also portalled to the body, so no overflow:hidden ancestor can clip them - the token decides paint order, the portal decides escape."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content max-content 1fr',
            alignItems: 'baseline',
            columnGap: 'var(--uh-spacing-16)',
            rowGap: 'var(--uh-spacing-8)',
            maxWidth: '760px',
          }}
        >
          {[...tokensByPrefix('uh-z-index-')]
            .sort((a, b) => Number(b.value) - Number(a.value))
            .map(({ name, value }) => (
              <div key={name} style={{ display: 'contents' }}>
                <TokenName>{name}</TokenName>
                <ValueText>{value}</ValueText>
                <span
                  className="uh-type-web-body-s"
                  style={{ color: 'var(--uh-color-text-secondary)' }}
                >
                  {REASONS[name.replace('uh-z-index-', '')] ?? ''}
                </span>
              </div>
            ))}
        </div>
      </Section>

      <Section title="Usage">
        <DoDont>
          <Do title="take the named layer for the thing you are building.">
            <div className="uh-type-web-body-s">
              A menu takes dropdown; its tooltip takes tooltip.
            </div>
          </Do>
          <Dont title="invent z-index: 9999 to win an argument.">
            <div className="uh-type-web-body-s">
              If two layers fight, one of them is on the wrong token - fix the token choice, not the
              number.
            </div>
          </Dont>
        </DoDont>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-search__panel {
  z-index: var(--uh-z-index-dropdown);
}
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Paint order must match reading order: a portalled layer manages focus (see useAnchoredPortal), so what is on top is also where the keyboard is.',
          'Toast on top exists for announcements that must not be lost behind a modal.',
        ]}
      />
    </Page>
  ),
};

export const ScrimsAndBackdrops: Story = {
  render: () => (
    <Page>
      <Section
        title="Opacity"
        hint="For fading a thing that keeps its own colour. Colours with baked-in alpha (bg.overlay) stay colours. Never stack disabled opacity on already-muted colours - that is how text quietly drops below the contrast floor."
      >
        <Rows>
          {tokensByPrefix('uh-opacity-').map(({ name, value }) => (
            <div key={name} style={{ display: 'contents' }}>
              <TokenName>{name}</TokenName>
              <div
                style={{
                  height: 'var(--uh-spacing-24)',
                  maxWidth: '200px',
                  borderRadius: 'var(--uh-radius-sm)',
                  background: 'var(--uh-color-text-primary)',
                  opacity: Number(value),
                }}
              />
              <ValueText>{value}</ValueText>
            </div>
          ))}
        </Rows>
      </Section>

      <Section
        title="Blur"
        hint="backdrop-filter radii for the sticky header, the modal backdrop and the sheet backdrop. Where backdrop-filter is unsupported, do not fake the blur: raise the backdrop's own opacity one step (overlay to scrim) so contrast holds without it."
      >
        <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)' }}>
          {tokensByPrefix('uh-blur-').map(({ name, value }) => (
            <div
              key={name}
              style={{
                position: 'relative',
                width: 'var(--uh-size-avatar-xl)',
                height: 'var(--uh-size-avatar-xl)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--uh-radius-md)',
                  background:
                    'repeating-linear-gradient(45deg, var(--uh-color-border-brand), var(--uh-color-border-brand) var(--uh-spacing-4), var(--uh-color-bg-surface) var(--uh-spacing-4), var(--uh-color-bg-surface) var(--uh-spacing-8))',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--uh-radius-md)',
                  backdropFilter: `blur(var(--${name}))`,
                  display: 'flex',
                  alignItems: 'end',
                  justifyContent: 'center',
                  paddingBlockEnd: 'var(--uh-spacing-4)',
                }}
              >
                <ValueText>{value}</ValueText>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-picker__backdrop {
  background-color: var(--uh-color-bg-overlay);
}

@supports (backdrop-filter: blur(0)) {
  .sheet-backdrop {
    backdrop-filter: blur(var(--uh-blur-lg));
  }
}
        `}</Code>
      </Section>

      <A11ySection
        items={[
          'Text over a scrim is checked at the worst point of whatever is behind it, not the best.',
          'disabled opacity applies to whole controls whose text is WCAG-exempt; it is never a way to style secondary text.',
        ]}
      />
    </Page>
  ),
};
