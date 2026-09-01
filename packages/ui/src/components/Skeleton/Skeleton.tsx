import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';

export type SkeletonVariant = 'text' | 'circle' | 'rect';
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  variant?: SkeletonVariant;
  /* Explicitly `| undefined`: exactOptionalPropertyTypes otherwise rejects a
     value computed as undefined at the call site. */
  width?: string | number | undefined;
  height?: string | number | undefined;
  /** Only meaningful for `text`: renders that many bars, the last one short. */
  lines?: number;
  animation?: SkeletonAnimation;
  className?: string | undefined;
}

const toLength = (value: string | number | undefined): string | undefined =>
  typeof value === 'number' ? `${value}px` : value;

/**
 * The bars themselves are hidden from assistive tech. A screen reader gains
 * nothing from "seven grey rectangles"; the announcement belongs to the
 * container that knows what is loading, which is what the presets provide.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse',
  className,
  style,
  ...rest
}: SkeletonProps) {
  const shared = {
    className: ['uh-skeleton', className].filter(Boolean).join(' '),
    'data-variant': variant,
    'data-animation': animation,
    'aria-hidden': true as const,
  };

  const box: CSSProperties = {
    ...style,
    ...(toLength(width) !== undefined ? { width: toLength(width) } : {}),
    ...(toLength(height) !== undefined ? { height: toLength(height) } : {}),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="uh-skeleton-text" aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <div
            {...rest}
            key={index}
            {...shared}
            style={{
              ...box,
              /* A paragraph's last line is short; a full-width final bar reads
                 as a table row rather than prose. */
              ...(index === lines - 1 ? { width: '60%' } : {}),
            }}
          />
        ))}
      </div>
    );
  }

  return <div {...rest} {...shared} style={box} />;
}

/*
 * Guarded, not a bare assignment: an unconditional property write is a
 * side effect no bundler can prove away, which pins this whole file
 * together for tree-shaking - see scripts/bundle-size.mjs. Stripped from
 * production builds by dead-code elimination once NODE_ENV is inlined,
 * same as every mature React library does this.
 */
if (process.env.NODE_ENV !== 'production') {
  Skeleton.displayName = 'Skeleton';
}

/* ---------------------------------------------------------------- presets */

interface PresetProps {
  animation?: SkeletonAnimation;
  /** Announced while the placeholder is on screen. */
  label?: string;
  className?: string | undefined;
}

/**
 * Wraps a placeholder so the loading state is spoken once, by something that
 * knows what is loading.
 */
function Loading({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <div className={className} role="status" aria-busy="true">
      <span className="uh-sr-only">{label}</span>
      {children}
    </div>
  );
}

export function SkeletonCard({
  animation = 'pulse',
  label = 'Loading package',
  className,
}: PresetProps) {
  return (
    <Loading label={label} className={['uh-skeleton-card', className].filter(Boolean).join(' ')}>
      <Skeleton variant="rect" height={140} animation={animation} />
      <Skeleton variant="text" lines={2} animation={animation} />
      <Skeleton variant="text" width="40%" animation={animation} />
    </Loading>
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
  SkeletonCard.displayName = 'SkeletonCard';
}

export interface SkeletonListProps extends PresetProps {
  rows?: number;
}

export function SkeletonList({
  rows = 3,
  animation = 'pulse',
  label = 'Loading list',
  className,
}: SkeletonListProps) {
  return (
    <Loading label={label} className={['uh-skeleton-list', className].filter(Boolean).join(' ')}>
      {Array.from({ length: rows }, (_, index) => (
        <div className="uh-skeleton-list__row" key={index}>
          <Skeleton variant="circle" width={40} height={40} animation={animation} />
          <div className="uh-skeleton-list__body">
            <Skeleton variant="text" width="55%" animation={animation} />
            <Skeleton variant="text" width="35%" animation={animation} />
          </div>
        </div>
      ))}
    </Loading>
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
  SkeletonList.displayName = 'SkeletonList';
}

export interface SkeletonTableProps extends PresetProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({
  rows = 4,
  columns = 4,
  animation = 'pulse',
  label = 'Loading table',
  className,
}: SkeletonTableProps) {
  /* The last column is the amount, which is narrower and right-aligned. */
  const template = `repeat(${Math.max(1, columns - 1)}, 1fr) minmax(0, 6rem)`;

  return (
    <Loading label={label} className={['uh-skeleton-table', className].filter(Boolean).join(' ')}>
      {Array.from({ length: rows }, (_, row) => (
        <div className="uh-skeleton-table__row" key={row} style={{ gridTemplateColumns: template }}>
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton
              key={column}
              variant="text"
              animation={animation}
              width={column === columns - 1 ? '70%' : undefined}
            />
          ))}
        </div>
      ))}
    </Loading>
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
  SkeletonTable.displayName = 'SkeletonTable';
}
