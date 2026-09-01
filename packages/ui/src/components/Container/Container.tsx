import type { ReactNode } from 'react';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  children?: ReactNode | undefined;
  /**
   * Max-width cap. `sm` (640px) - a single form; `md` (960px) - a content
   * page; `lg` (1280px, default) - most product screens; `xl` (1440px) -
   * wide dashboards and admin tables.
   * @default 'lg'
   */
  size?: ContainerSize | undefined;
  /** Inline padding, so the content never touches the viewport edge on a
      narrow screen. Off only when the parent already owns that padding.
      @default true */
  padding?: boolean | undefined;
  className?: string | undefined;
}

/**
 * The page-level content column every `Patterns/*` screen was hand-rolling
 * its own top-level width for before this existed - centred, capped at one
 * of four widths, with its own edge padding so it never needs a wrapping
 * `<div style={{padding}}>` around it.
 */
export function Container(props: ContainerProps) {
  const { children, size = 'lg', padding = true, className } = props;

  return (
    <div
      className={['uh-container', className].filter(Boolean).join(' ')}
      data-size={size}
      data-padding={padding ? 'true' : 'false'}
    >
      {children}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Container.displayName = 'Container';
}
