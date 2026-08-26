import type { ReactNode } from 'react';

export function Page({
  theme = 'light',
  children,
}: {
  theme?: 'light' | 'dark';
  children: ReactNode;
}) {
  return (
    <div
      data-theme={theme}
      style={{
        background: 'var(--uh-color-bg-canvas)',
        color: 'var(--uh-color-text-primary)',
        padding: 'var(--uh-spacing-32)',
        minHeight: '400px',
      }}
    >
      {children}
    </div>
  );
}

export function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--uh-spacing-12)',
        marginBlockEnd: 'var(--uh-spacing-48)',
      }}
    >
      <h2 className="uh-type-web-h5" style={{ margin: 0 }}>
        {title}
      </h2>
      {hint ? (
        <p
          className="uh-type-web-body-s"
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)', maxWidth: '640px' }}
        >
          {hint}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** A `--uh-*` name rendered the way a consumer would type it. */
export function TokenName({ children }: { children: string }) {
  return (
    <code
      className="uh-type-numeric-table"
      style={{ color: 'var(--uh-color-text-secondary)', whiteSpace: 'nowrap' }}
    >
      --{children}
    </code>
  );
}

export function ValueText({ children }: { children: ReactNode }) {
  return (
    <span className="uh-type-numeric-table" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </span>
  );
}

/** Label / swatch / value rows with the columns lined up. */
export function Rows({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr max-content',
        alignItems: 'center',
        columnGap: 'var(--uh-spacing-16)',
        rowGap: 'var(--uh-spacing-8)',
        maxWidth: '760px',
      }}
    >
      {children}
    </div>
  );
}
