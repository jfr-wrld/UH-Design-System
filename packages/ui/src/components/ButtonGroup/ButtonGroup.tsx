import type { ReactElement, ReactNode } from 'react';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupProps {
  /** `Button` elements - any of `Button`'s own variants/sizes work as a
      child; this only merges their outer edges into one segmented strip,
      it never renders a button itself. Give every child the same
      `variant`/`size` for the strip to read as one control - mixed
      variants still work, they just read as a row of separate buttons
      that happen to touch. */
  children?: ReactNode | undefined;
  /** @default 'horizontal' */
  orientation?: ButtonGroupOrientation | undefined;
  /** Names the group for assistive tech (`role="group"`) - give it one
      when the buttons are genuinely a single toolbar of related actions
      ("Bold/Italic/Underline"), skip it when they merely happen to sit
      side by side (a segmented Prev/Next pair already named by its own
      buttons' own labels does not need a second, redundant name). */
  label?: string | undefined;
  className?: string | undefined;
}

/**
 * Merges adjacent `Button`s into one connected, segmented strip - only the
 * first and last child keep an outer corner radius, and every seam in
 * between overlaps onto the next button's own border by 1px, recoloured to
 * a neutral divider token, rather than leaving each pair of touching
 * borders to draw whatever colour their own variant happens to set.
 *
 * A pure layout wrapper, not a second implementation of `Button`: the
 * TailGrids reference this was translated from owns the actual button
 * painting itself (a `cva` targeting any `<button>` child generically),
 * which would mean reimplementing every one of `Button`'s own variants,
 * sizes, icons, and loading/disabled states a second time here to keep
 * pace. Real `Button` elements as children keep all of that working
 * unchanged - `ButtonGroup` only ever touches their outer edges.
 */
export function ButtonGroup(props: ButtonGroupProps): ReactElement {
  const { children, orientation = 'horizontal', label, className } = props;

  return (
    <div
      className={['uh-button-group', className].filter(Boolean).join(' ')}
      data-orientation={orientation}
      role={label ? 'group' : undefined}
      aria-label={label}
    >
      {children}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  ButtonGroup.displayName = 'ButtonGroup';
}
