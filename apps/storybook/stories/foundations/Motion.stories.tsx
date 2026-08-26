import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Page, Rows, Section, TokenName, ValueText } from './shared.js';
import { tokensByPrefix } from './tokens.js';

/** Draws a cubic-bezier curve from its own token value, so the plot cannot lie. */
function Curve({ value }: { value: string }) {
  const match = /cubic-bezier\(([^)]+)\)/.exec(value);
  const [x1, y1, x2, y2] = match
    ? match[1]!.split(',').map((part) => parseFloat(part))
    : [0, 0, 1, 1];
  /* SVG y runs down; easing y runs up. 40x40 box with 4px padding. */
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

const PAIRINGS = [
  { job: 'Element entering', pair: 'base + decelerate' },
  { job: 'Element leaving', pair: 'fast + accelerate (going away needs no flourish)' },
  { job: 'State change', pair: 'fast + standard' },
  { job: 'Modal or sheet', pair: 'slower + emphasized' },
];

function Demo() {
  const [side, setSide] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--uh-spacing-12)',
        maxWidth: '360px',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: 'var(--uh-size-control-md)',
          borderRadius: 'var(--uh-radius-md)',
          background: 'var(--uh-color-bg-muted)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            insetBlock: 'var(--uh-spacing-4)',
            insetInlineStart: side
              ? 'calc(100% - var(--uh-size-control-md))'
              : 'var(--uh-spacing-4)',
            width: 'var(--uh-size-icon-2xl)',
            borderRadius: 'var(--uh-radius-sm)',
            background: 'var(--uh-color-action-primary-default)',
            transition:
              'inset-inline-start var(--uh-motion-duration-slow) var(--uh-motion-easing-standard)',
          }}
        />
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
        onClick={() => setSide((current) => !current)}
      >
        Run (slow + standard)
      </button>
    </div>
  );
}

const meta = {
  title: 'Foundations/Motion',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const All: Story = {
  render: () => (
    <Page>
      <Section
        title="Durations"
        hint="instant is also what every duration becomes under prefers-reduced-motion - one global rule in the ui package zeroes all transitions, and components with animations carry their own designed replacements. spin is longer than everything else on purpose: a spinner is ambient, not a response to input."
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
                    background: 'var(--uh-color-bg-brand-subtle)',
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
        hint="Each curve is drawn from its own token value. enter and exit are the Phase 1 names kept as aliases of decelerate and accelerate; spring overshoots and is for small playful marks only - never on overlays, never in the booking flow."
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

      <Section
        title="The pairings"
        hint="Duration and easing go together; picking them separately is how a UI ends up feeling assembled. These four cover nearly everything, and they ship as the preset tokens (uh-motion-preset-*)."
      >
        <Rows>
          {PAIRINGS.map((row) => (
            <div key={row.job} style={{ display: 'contents' }}>
              <span className="uh-type-web-label">{row.job}</span>
              <span
                className="uh-type-web-body-s"
                style={{ color: 'var(--uh-color-text-secondary)' }}
              >
                {row.pair}
              </span>
              <span />
            </div>
          ))}
        </Rows>
        <Demo />
      </Section>
    </Page>
  ),
};
