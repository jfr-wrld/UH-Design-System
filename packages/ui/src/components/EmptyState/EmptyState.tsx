import type { ReactNode } from 'react';
import { Page } from '@tailgrids/icons';

import { StateMessage } from '../../lib/StateMessage.js';

export type EmptyStateSize = 'sm' | 'md';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** A generic open-box glyph renders if omitted; pass anything - an icon,
      an <img>, a custom illustration - to make the state specific to what
      is actually missing (a suitcase for no bookings, a heart for an empty
      wishlist). */
  icon?: ReactNode | undefined;
  title: string;
  description?: string | undefined;
  action?: EmptyStateAction | undefined;
  secondaryAction?: EmptyStateAction | undefined;
  /** sm sits inside a card or a section; md fills a whole page or tab. */
  size?: EmptyStateSize | undefined;
  className?: string | undefined;
}

function DefaultIcon() {
  return <Page aria-hidden="true" focusable="false" />;
}

/**
 * The resting state of a list, a search, a tab with nothing in it yet -
 * "No packages match your filters", "Your wishlist is empty". No implicit
 * live-region role: EmptyState is usually the settled result of an action
 * the person just took (a search, a filter), not an interruption, and a
 * surrounding list that already announces its own result count would
 * otherwise be announced twice. Compare ErrorState, which does interrupt.
 */
export function EmptyState(props: EmptyStateProps) {
  const { icon, ...rest } = props;
  return (
    <StateMessage
      {...rest}
      icon={icon ?? <DefaultIcon />}
      rootClassName="uh-empty-state"
      tone="neutral"
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
  EmptyState.displayName = 'EmptyState';
}
