import type { ReactNode } from 'react';

import { Section } from './shared.js';

/**
 * The recurring blocks every Foundations page must carry: do/don't pairs,
 * an implementation snippet, and a light/dark comparison. Componentised so a
 * page that forgets one is visibly missing a block, not quietly thinner.
 */

export function DoDont({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--uh-spacing-16)',
        maxWidth: '760px',
      }}
    >
      {children}
    </div>
  );
}

function Verdict({
  kind,
  title,
  children,
}: {
  kind: 'do' | 'dont';
  title: string;
  children: ReactNode;
}) {
  /*
   * Two tokens per verdict, not one: the accent bar is a UI edge (border
   * tokens, 3:1 contract) while the word is text (text tokens, 4.5:1). Using
   * the solid fill for the word is exactly the tinted-role mistake the Colors
   * page warns about - and axe caught this file doing it.
   */
  const bar =
    kind === 'do'
      ? 'var(--uh-color-feedback-success-border-strong)'
      : 'var(--uh-color-feedback-error-border-strong)';
  const word =
    kind === 'do' ? 'var(--uh-color-feedback-success-text)' : 'var(--uh-color-feedback-error-text)';
  return (
    <figure
      style={{
        margin: 0,
        borderRadius: 'var(--uh-radius-card)',
        border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
        borderBlockStartWidth: 'var(--uh-border-width-thick)',
        borderBlockStartColor: bar,
        background: 'var(--uh-color-bg-surface)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 'var(--uh-spacing-16)' }}>{children}</div>
      <figcaption
        className="uh-type-web-body-s"
        style={{
          padding: 'var(--uh-spacing-8) var(--uh-spacing-16)',
          borderBlockStart: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
          color: 'var(--uh-color-text-secondary)',
        }}
      >
        <strong style={{ color: word }}>{kind === 'do' ? 'Do' : "Don't"}</strong> {title}
      </figcaption>
    </figure>
  );
}

export function Do({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Verdict kind="do" title={title}>
      {children}
    </Verdict>
  );
}

export function Dont({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Verdict kind="dont" title={title}>
      {children}
    </Verdict>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <pre
      /* A code block can scroll sideways, and a scrollable region must be
         reachable by keyboard - axe flagged the one page whose line overflowed. */
      tabIndex={0}
      role="region"
      aria-label="Code example"
      className="uh-type-numeric-table"
      style={{
        margin: 0,
        maxWidth: '760px',
        overflowX: 'auto',
        padding: 'var(--uh-spacing-16)',
        borderRadius: 'var(--uh-radius-md)',
        background: 'var(--uh-color-bg-surface-sunken)',
        color: 'var(--uh-color-text-primary)',
      }}
    >
      <code>{children.trim()}</code>
    </pre>
  );
}

/** The same content rendered on both themes, side by side. */
export function ThemePair({ render }: { render: (theme: 'light' | 'dark') => ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--uh-spacing-16)',
        maxWidth: '760px',
      }}
    >
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          style={{
            padding: 'var(--uh-spacing-16)',
            borderRadius: 'var(--uh-radius-card)',
            background: 'var(--uh-color-bg-canvas)',
            color: 'var(--uh-color-text-primary)',
          }}
        >
          <div
            className="uh-type-web-overline"
            style={{
              color: 'var(--uh-color-text-tertiary)',
              marginBlockEnd: 'var(--uh-spacing-8)',
            }}
          >
            {theme}
          </div>
          {render(theme)}
        </div>
      ))}
    </div>
  );
}

/** The closing block every page ends on. */
export function A11ySection({ items }: { items: string[] }) {
  return (
    <Section title="Accessibility requirements">
      <ul
        className="uh-type-web-body-s"
        style={{
          margin: 0,
          paddingInlineStart: 'var(--uh-spacing-20)',
          color: 'var(--uh-color-text-secondary)',
          maxWidth: '640px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-4)',
        }}
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Section>
  );
}
