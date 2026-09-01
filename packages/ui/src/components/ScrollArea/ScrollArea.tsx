import type { CSSProperties, ReactNode } from 'react';
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps {
  children?: ReactNode | undefined;
  /** @default 'vertical' */
  orientation?: ScrollAreaOrientation | undefined;
  /** A CSS length (`'320px'`, `'50vh'`) capping the scrollable axis.
      Content-driven height varies too much by use case for a fixed
      token to fit every caller, so this stays a plain string. */
  maxHeight?: string | undefined;
  maxWidth?: string | undefined;
  className?: string | undefined;
}

/**
 * A themed, custom scrollbar around native scroll behaviour - `@base-ui/react`
 * (a peer dependency, never bundled into this package - see the `external`
 * comment in vite.config.ts) does the actual pointer/drag/keyboard handling;
 * this component owns the token-driven track and thumb styling. Reach for
 * this only when the default OS scrollbar genuinely does not fit the
 * surface it is in (a fixed-height panel inside a Card, a long list inside
 * a Popover) - most scrolling content (the page itself, a `Tabs` list) is
 * better left to the browser's own scrollbar, which this design system
 * hides entirely in a few places for a different, narrower reason (see
 * `Tabs.css`'s own comment) and should not be reached for by default here.
 */
export function ScrollArea(props: ScrollAreaProps) {
  const { children, orientation = 'vertical', maxHeight, maxWidth, className } = props;

  const style: CSSProperties = {};
  if (maxHeight !== undefined) style.maxHeight = maxHeight;
  if (maxWidth !== undefined) style.maxWidth = maxWidth;

  return (
    <BaseScrollArea.Root
      className={['uh-scroll-area', className].filter(Boolean).join(' ')}
      style={style}
    >
      <BaseScrollArea.Viewport className="uh-scroll-area__viewport">
        {children}
      </BaseScrollArea.Viewport>
      {orientation === 'vertical' || orientation === 'both' ? (
        <BaseScrollArea.Scrollbar orientation="vertical" className="uh-scroll-area__bar">
          <BaseScrollArea.Thumb className="uh-scroll-area__thumb" />
        </BaseScrollArea.Scrollbar>
      ) : null}
      {orientation === 'horizontal' || orientation === 'both' ? (
        <BaseScrollArea.Scrollbar orientation="horizontal" className="uh-scroll-area__bar">
          <BaseScrollArea.Thumb className="uh-scroll-area__thumb" />
        </BaseScrollArea.Scrollbar>
      ) : null}
      <BaseScrollArea.Corner className="uh-scroll-area__corner" />
    </BaseScrollArea.Root>
  );
}

if (process.env.NODE_ENV !== 'production') {
  ScrollArea.displayName = 'ScrollArea';
}
