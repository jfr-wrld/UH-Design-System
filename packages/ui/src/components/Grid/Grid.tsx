import type { CSSProperties, ReactNode } from 'react';

/** Every step on the spacing scale - same reasoning as `Stack`'s `gap`. */
export type GridGap = '2' | '4' | '8' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64';

export interface GridProps {
  children?: ReactNode | undefined;
  /**
   * Equal-width columns. A plain number, not a responsive object: this
   * component does not decide breakpoints for the app that uses it (see
   * Troubleshooting → "Komponen tidak responsif") - pass a different number
   * from the consumer's own `useMediaQuery` check if the column count needs
   * to change per breakpoint.
   * @default 1
   */
  columns?: number | undefined;
  /** Row and column gap together. Overridden by `rowGap`/`columnGap` when
      either is set. @default '16' */
  gap?: GridGap | undefined;
  rowGap?: GridGap | undefined;
  columnGap?: GridGap | undefined;
  className?: string | undefined;
}

/**
 * A two-axis grid layout - `Stack`'s sibling for when rows and columns need
 * to line up together (a card grid, a form with paired fields), not just
 * flow along one axis.
 */
export function Grid(props: GridProps) {
  const { children, columns = 1, gap = '16', rowGap, columnGap, className } = props;

  const style: CSSProperties & Record<string, string | number> = {
    '--uh-grid-columns': columns,
  };

  return (
    <div
      className={['uh-grid', className].filter(Boolean).join(' ')}
      data-gap={gap}
      data-row-gap={rowGap}
      data-column-gap={columnGap}
      style={style}
    >
      {children}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Grid.displayName = 'Grid';
}
