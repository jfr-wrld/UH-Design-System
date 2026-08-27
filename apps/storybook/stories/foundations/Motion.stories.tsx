import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';
import { A11ySection, Code, Do, DoDont, Dont } from './docs.js';

/** Draws a cubic-bezier curve from its own token value, so the plot cannot lie. */
function Curve({ value }: { value: string }) {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  const [x1, y1, x2, y2] = match
    ? match[1]!.split(',').map((part) => parseFloat(part))
    : [0, 0, 1, 1];
  const px = (x: number) => 4 + x * 32;
  const py = (y: number) => 36 - y * 32;
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
      <path
        d={`M ${px(0)} ${py(0)} C ${px(x1!)} ${py(y1!)}, ${px(x2!)} ${py(y2!)}, ${px(1)} ${py(1)}`}
        fill="none"
        stroke="var(--uh-color-border-brand)"
        strokeWidth="2"
      />
    </svg>
  );
}

const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const DurationsAndEasing: Story = {
  render: () => (
    <Page>
      <Section
        title="Purpose"
        hint="MOTION 2, scoped: transitions on interaction - focus, open, state change - and nothing in the booking flow that anyone has to wait for. No one spending RM 12,500 waits on an animation."
      >
        <div />
      </Section>

      <Section
        title="Durations"
        hint="instant is also what everything becomes under prefers-reduced-motion. spin outruns the rest on purpose: a spinner is ambient, not a response to input."
      >
        <Rows>
          {tokensByPrefix('uh-motion-duration-').map(({ name, value }) => (
            <div key={name} style={{ display: 'contents' }}>
              <TokenName>{name}</TokenName>
              <div>
                <div
                  style={{
                    width: `${Math.max(parseFloat(value) / 7, 1)}px`,
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
        title="Easing"
        hint="Each curve is drawn from its own token value. enter and exit are Phase 1 names kept as aliases of decelerate and accelerate. spring overshoots and is for small playful marks only - never on overlays, never in the booking flow."
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'max-content max-content 1fr',
            alignItems: 'center',
            columnGap: 'var(--uh-spacing-16)',
            rowGap: 'var(--uh-spacing-8)',
            maxWidth: '760px',
          }}
        >
          {tokensByPrefix('uh-motion-easing-').map(({ name, value }) => (
            <div key={name} style={{ display: 'contents' }}>
              <TokenName>{name}</TokenName>
              <Curve value={value} />
              <ValueText>{value}</ValueText>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Implementation">
        <Code>{`
.uh-search__control {
  transition: border-color var(--uh-motion-duration-fast)
    var(--uh-motion-easing-standard);
}
        `}</Code>
      </Section>
    </Page>
  ),
};

export const PairingsAndPresets: Story = {
  render: function Presets() {
    const [open, setOpen] = useState(true);
    /*
     * Zero means resting: the preset classes are only applied on Replay.
     * Entrances belong to things that enter - animating content that is
     * simply there on load is flicker, and it is also how the a11y runner
     * catches text mid-fade and calls the contrast wrong. It was right.
     */
    const [runId, setRunId] = useState(0);
    return (
      <Page>
        <Section
          title="The pairings"
          hint="Duration and easing go together; picking them separately is how a UI ends up feeling assembled. Entering: base + decelerate. Leaving: fast + accelerate - going away needs no flourish. State change: fast + standard. Modal or sheet: slower + emphasized. They ship as the uh-motion-preset-* timing tokens and the classes below."
        >
          <div />
        </Section>

        <Section
          title="Presets, live"
          hint="uh-anim-fade, uh-anim-slide-up, uh-anim-slide-down, uh-anim-scale - one class each, timing from the preset tokens, `both` fill so under reduced motion the end state simply applies at once."
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--uh-spacing-12)',
              maxWidth: '480px',
            }}
          >
            <div
              style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-12)' }}
              key={runId}
            >
              {(['fade', 'slide-up', 'slide-down', 'scale'] as const).map((preset) => (
                <div
                  key={preset}
                  className={
                    runId > 0 ? `uh-anim-${preset} uh-type-web-label` : 'uh-type-web-label'
                  }
                  style={{
                    padding: 'var(--uh-spacing-12) var(--uh-spacing-16)',
                    borderRadius: 'var(--uh-radius-card)',
                    border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
                    background: 'var(--uh-color-bg-surface)',
                  }}
                >
                  {preset}
                </div>
              ))}
            </div>
            <button
              type="button"
              className="uh-type-web-label"
              style={{
                alignSelf: 'flex-start',
                padding: 'var(--uh-spacing-8) var(--uh-spacing-16)',
                border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                borderRadius: 'var(--uh-radius-button)',
                background: 'var(--uh-color-bg-surface)',
                color: 'var(--uh-color-text-primary)',
                cursor: 'pointer',
              }}
              onClick={() => setRunId((current) => current + 1)}
            >
              Replay
            </button>
          </div>
        </Section>

        <Section
          title="Collapse"
          hint="A transition, not a keyframe: the 0fr/1fr grid row is what lets CSS animate to an unknown content height. The inner element needs only min-height: 0."
        >
          <div
            style={{
              maxWidth: '480px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--uh-spacing-8)',
            }}
          >
            <button
              type="button"
              className="uh-type-web-label"
              aria-expanded={open}
              style={{
                alignSelf: 'flex-start',
                padding: 'var(--uh-spacing-8) var(--uh-spacing-16)',
                border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-strong)',
                borderRadius: 'var(--uh-radius-button)',
                background: 'var(--uh-color-bg-surface)',
                color: 'var(--uh-color-text-primary)',
                cursor: 'pointer',
              }}
              onClick={() => setOpen((current) => !current)}
            >
              {open ? 'Collapse' : 'Expand'}
            </button>
            <div className="uh-collapse" data-open={open ? 'true' : undefined}>
              <div>
                <p
                  className="uh-type-web-body-s"
                  style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
                >
                  Day 2: Raudhah visit in the morning, rest after Zohor, and the evening free for
                  ibadah at Masjid Nabawi. The bus for Quba leaves at nine.
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section title="Usage">
          <DoDont>
            <Do title="animate entrances; let exits leave.">
              <div className="uh-type-web-body-s">base + decelerate in, fast + accelerate out.</div>
            </Do>
            <Dont title="use spring on overlays or anywhere in the booking flow.">
              <div className="uh-type-web-body-s">
                Overshoot on a payment modal reads as instability.
              </div>
            </Dont>
          </DoDont>
        </Section>

        <Section title="Implementation">
          <Code>{`
<div className="uh-anim-slide-up">…</div>

<div className="uh-collapse" data-open={open || undefined}>
  <div>…content…</div>
</div>

/* Reduced motion is handled once, globally:
   every transition and preset collapses to duration-instant. */
          `}</Code>
        </Section>

        <A11ySection
          items={[
            'prefers-reduced-motion zeroes every transition and preset globally; components whose animation carries meaning ship a designed static replacement instead.',
            'Motion is never the only signal: everything animated is also stated in text or structure.',
            'Scroll-triggered reveals are allowed on marketing surfaces only - never booking, admin, or agency portals.',
          ]}
        />
      </Page>
    );
  },
};
