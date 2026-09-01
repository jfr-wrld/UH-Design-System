import type { HTMLAttributes, ReactElement } from 'react';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export interface SeparatorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** @default 'horizontal' */
  orientation?: SeparatorOrientation | undefined;
  /**
   * Whether this line is purely visual rather than a real content break -
   * the same distinction Radix's own Separator draws. A divider between two
   * genuinely separate sections of a page is real structure worth
   * announcing (`role="separator"`); one dropped inside content a screen
   * reader already understands as separated (two cards already in their
   * own landmarks, say) is decoration a sighted reader gets from the line
   * itself, and a second announcement of "separator" would only be noise -
   * same reasoning `CommandSeparator` already documents for its own
   * `role="presentation"` inside a listbox.
   * @default false
   */
  decorative?: boolean | undefined;
  className?: string | undefined;
}

export function Separator(props: SeparatorProps): ReactElement {
  const { orientation = 'horizontal', decorative = false, className, ...rest } = props;

  return (
    <div
      {...rest}
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={['uh-separator', className].filter(Boolean).join(' ')}
    />
  );
}

if (process.env.NODE_ENV !== 'production') {
  Separator.displayName = 'Separator';
}
