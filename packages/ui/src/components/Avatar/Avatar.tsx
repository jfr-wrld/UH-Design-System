import { useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { User2 } from '@tailgrids/icons';

import { initialsFrom } from './initials.js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarShape = 'circle' | 'square';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src?: string;
  /** Required when `src` is set; the image is content, not decoration. */
  alt?: string;
  /** Drives the initials fallback and the accessible name when there is no image. */
  name?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string | undefined;
}

function PersonIcon() {
  return <User2 aria-hidden="true" focusable="false" />;
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className,
  ...rest
}: AvatarProps) {
  /*
   * Which src failed, rather than a boolean "failed". A new src is therefore a
   * fresh attempt automatically, with no effect resetting state behind React's
   * back - one broken URL must not poison the slot for the next one.
   */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const initials = name ? initialsFrom(name) : '';
  const showImage = Boolean(src) && failedSrc !== src;
  const showInitials = !showImage && initials.length > 0;

  /* With an image the <img> carries the name. Without one, the wrapper has to. */
  const label = name ?? alt;
  const semantics = showImage
    ? {}
    : label
      ? { role: 'img' as const, 'aria-label': label }
      : { 'aria-hidden': true };

  return (
    <span
      className={['uh-avatar', className].filter(Boolean).join(' ')}
      data-size={size}
      data-shape={shape}
      {...semantics}
    >
      {showImage ? (
        <img
          {...rest}
          className="uh-avatar__image"
          src={src}
          alt={alt ?? name ?? ''}
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : showInitials ? (
        <span className="uh-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <span className="uh-avatar__icon">
          <PersonIcon />
        </span>
      )}
    </span>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Avatar.displayName = 'Avatar';
}

export interface AvatarGroupProps {
  children: ReactNode;
  /** Avatars shown before the overflow counter takes over. */
  max?: number;
  size?: AvatarSize;
  shape?: AvatarShape;
  /** Accessible description of the hidden remainder. */
  overflowLabel?: (count: number) => string;
  className?: string | undefined;
}

export function AvatarGroup({
  children,
  max = 4,
  size = 'md',
  shape = 'circle',
  overflowLabel = (count) => `${count} more`,
  className,
}: AvatarGroupProps) {
  const items = Array.isArray(children) ? children.flat() : [children];
  const visible = items.slice(0, max);
  const hidden = Math.max(0, items.length - visible.length);

  return (
    <span className={['uh-avatar-group', className].filter(Boolean).join(' ')}>
      {visible}
      {hidden > 0 ? (
        <span
          className="uh-avatar uh-avatar-group__overflow"
          data-size={size}
          data-shape={shape}
          role="img"
          aria-label={overflowLabel(hidden)}
        >
          <span className="uh-avatar__initials" aria-hidden="true">
            +{hidden}
          </span>
        </span>
      ) : null}
    </span>
  );
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  AvatarGroup.displayName = 'AvatarGroup';
}
