import type { ReactNode } from 'react';
import { ErrorHexagon } from '@tailgrids/icons';

import { StateMessage } from '../../lib/StateMessage.js';

export type ErrorStateSize = 'sm' | 'md';

export interface ErrorStateAction {
  label: string;
  onClick: () => void;
}

export interface ErrorStateProps {
  /** A generic broken-connection glyph renders if omitted. */
  icon?: ReactNode | undefined;
  title: string;
  description?: string | undefined;
  /** Usually a retry: `{ label: 'Try again', onClick: refetch }`. */
  action?: ErrorStateAction | undefined;
  secondaryAction?: ErrorStateAction | undefined;
  /** sm sits inside a card or a section; md fills a whole page or tab. */
  size?: ErrorStateSize | undefined;
  className?: string | undefined;
}

function DefaultIcon() {
  return <ErrorHexagon aria-hidden="true" focusable="false" />;
}

/**
 * Something failed and the person should be told now - a request that
 * errored, a page that could not load. Unlike EmptyState, which is a
 * settled, expected result, this interrupts: role="alert" fires the moment
 * it mounts, the same reasoning Alert's error variant and Toast's error
 * announcement both follow. Only the icon tone and this role differ from
 * EmptyState - both compose the same shell (lib/StateMessage.tsx).
 */
export function ErrorState(props: ErrorStateProps) {
  const { icon, ...rest } = props;
  return (
    <StateMessage
      {...rest}
      icon={icon ?? <DefaultIcon />}
      rootClassName="uh-error-state"
      tone="error"
      role="alert"
    />
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
  ErrorState.displayName = 'ErrorState';
}
