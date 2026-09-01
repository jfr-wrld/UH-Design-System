import type { HTMLAttributes, ReactElement } from 'react';

export type AspectRatioPreset =
  'square' | 'video' | '4/3' | '3/4' | '21/9' | '9/16' | '3/2' | '2/3';

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** @default 'video' */
  ratio?: AspectRatioPreset | undefined;
  /** An arbitrary width/height ratio (`1.5` for 3:2, say) - wins over
      `ratio` when given, for a shape none of the named presets cover. The
      one place in this component a literal number is correct rather than
      a token: a ratio is math, not a design decision the token layer
      owns, the same way a `Grid`'s own `columns` count isn't a token
      either. */
  customRatio?: number | undefined;
  className?: string | undefined;
}

/**
 * A box that holds its width:height ratio regardless of what's inside -
 * a hotel photo, a video embed, a skeleton placeholder - so a grid of
 * them never jumps as images load in at their own natural sizes. Pure
 * CSS: the `aspect-ratio` property does the actual work, so there's
 * nothing to compute in script and no padding-percentage hack to fall
 * back on for a browser old enough to lack it.
 *
 * Deliberately does not reach into `children` to size or crop them - an
 * `<img>` or `<video>` placed inside still needs its own `width: 100%;
 * height: 100%; object-fit: cover` (or `contain`, if cropping is wrong
 * for what it holds) to actually fill the box, the same way the
 * TailGrids reference this was translated from leaves that to the
 * caller too.
 */
export function AspectRatio(props: AspectRatioProps): ReactElement {
  const { ratio = 'video', customRatio, children, className, style, ...rest } = props;

  return (
    <div
      {...rest}
      data-ratio={customRatio === undefined ? ratio : undefined}
      style={customRatio === undefined ? style : { ...style, aspectRatio: `${customRatio}` }}
      className={['uh-aspect-ratio', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  AspectRatio.displayName = 'AspectRatio';
}
