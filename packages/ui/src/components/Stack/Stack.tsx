import type { ReactNode } from 'react';

/** Every step on the spacing scale - `Stack`'s `gap` maps straight onto it,
    not a separate enum, so a spacing value never has two names. */
export type StackGap = '2' | '4' | '8' | '12' | '16' | '20' | '24' | '32' | '40' | '48' | '64';
export type StackDirection = 'row' | 'column';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps {
  children?: ReactNode | undefined;
  /** @default 'column' */
  direction?: StackDirection | undefined;
  /** @default '16' */
  gap?: StackGap | undefined;
  align?: StackAlign | undefined;
  justify?: StackJustify | undefined;
  /** Lets items wrap onto a new row/column instead of overflowing or
      shrinking past their own minimum size. */
  wrap?: boolean | undefined;
  className?: string | undefined;
}

/**
 * A one-axis flex layout - the primitive every `Patterns/*` screen kept
 * hand-rolling as its own `display: flex; gap: ...px` before this existed.
 * `Grid` is the two-axis sibling; reach for `Stack` first, `Grid` only once
 * a layout genuinely needs rows and columns to line up together.
 */
export function Stack(props: StackProps) {
  const { children, direction = 'column', gap = '16', align, justify, wrap, className } = props;

  return (
    <div
      className={['uh-stack', className].filter(Boolean).join(' ')}
      data-direction={direction}
      data-gap={gap}
      data-align={align}
      data-justify={justify}
      data-wrap={wrap ? 'true' : undefined}
    >
      {children}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Stack.displayName = 'Stack';
}
