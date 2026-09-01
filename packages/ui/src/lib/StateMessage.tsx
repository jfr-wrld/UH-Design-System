import type { ReactNode } from 'react';

import { Button } from '../components/Button/Button.js';

export type StateMessageSize = 'sm' | 'md';
export type StateMessageTone = 'neutral' | 'error';

export interface StateMessageAction {
  label: string;
  onClick: () => void;
}

export interface StateMessageProps {
  icon: ReactNode;
  title: string;
  description?: string | undefined;
  action?: StateMessageAction | undefined;
  secondaryAction?: StateMessageAction | undefined;
  size?: StateMessageSize | undefined;
  /** Only colours the icon - error reads as "something is wrong" rather
      than the quieter "nothing here yet" neutral gives it. */
  tone?: StateMessageTone | undefined;
  /** status: a settled result, not worth interrupting for (EmptyState).
      alert: something failed and the person should be told now (ErrorState).
      undefined: no implicit live region at all. */
  role?: 'status' | 'alert' | undefined;
  rootClassName: string;
  className?: string | undefined;
}

/**
 * The shared shell behind EmptyState and ErrorState: an icon, a title, an
 * optional description, up to two actions - identical anatomy, different
 * defaults. Not part of the package's public API; each caller re-exports
 * its own props and default icon so consumers never import this directly.
 */
export function StateMessage(props: StateMessageProps) {
  const {
    icon,
    title,
    description,
    action,
    secondaryAction,
    size = 'md',
    tone = 'neutral',
    role,
    rootClassName,
    className,
  } = props;

  return (
    <div
      className={['uh-state-message', rootClassName, className].filter(Boolean).join(' ')}
      data-size={size}
      role={role}
    >
      <div className="uh-state-message__icon" aria-hidden="true" data-tone={tone}>
        {icon}
      </div>

      <p className="uh-state-message__title">{title}</p>
      {description ? <p className="uh-state-message__description">{description}</p> : null}

      {action || secondaryAction ? (
        <div className="uh-state-message__actions">
          {action ? (
            <Button variant="primary" size={size === 'sm' ? 'sm' : 'md'} onClick={action.onClick}>
              {action.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              variant="secondary"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
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
  StateMessage.displayName = 'StateMessage';
}
