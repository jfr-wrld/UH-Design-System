import { useId, type ReactElement, type ReactNode } from 'react';

import { ChevronDownIcon } from '../../lib/icons.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import { CollapsibleContext, useCollapsibleContext } from './CollapsibleContext.js';

/* ----------------------------------------------------------------- root */

export interface CollapsibleProps {
  /** A `CollapsibleTrigger` and a `CollapsibleContent`. */
  children?: ReactNode | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  /** Wraps the trigger in an `h{headingLevel}`, the way every `Accordion`
      trigger always does. Left unset by default here rather than assuming
      one - `Accordion`'s heading wrapper earns its keep because a screen
      reader user genuinely benefits from jumping between several
      sibling sections; a single, standalone "Show more" toggle is rarely
      a page section worth that same heading-navigation entry, and
      injecting an unrequested `<h3>` into whatever the caller's own
      document outline already is would be the surprise, not the help.
      Set it explicitly for the cases where this one really is its own
      section (an FAQ-style block, say). */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  className?: string | undefined;
}

/**
 * A single expand/collapse toggle - "Show more", a truncated description,
 * one FAQ entry read on its own - `Accordion`'s own sibling, simplified
 * down to exactly one section instead of a group. Reach for `Accordion`
 * instead the moment there is more than one of these sitting together:
 * `Collapsible` has no group concept at all, on purpose, so it never
 * tempts a second one next to it into silently needing one.
 */
export function Collapsible(props: CollapsibleProps): ReactElement {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    disabled = false,
    headingLevel,
    className,
  } = props;

  const reactId = useId();
  const triggerId = `${reactId}-trigger`;
  const contentId = `${reactId}-content`;

  const [open, setOpen] = useControllableState<boolean>({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  function toggle() {
    if (disabled) return;
    setOpen(!open);
  }

  return (
    <CollapsibleContext.Provider
      value={{ open, toggle, disabled, headingLevel, triggerId, contentId }}
    >
      <div
        className={['uh-collapsible', className].filter(Boolean).join(' ')}
        data-open={open ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
}

/* -------------------------------------------------------------- trigger */

export interface CollapsibleTriggerProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

export function CollapsibleTrigger(props: CollapsibleTriggerProps): ReactElement {
  const { children, className } = props;
  const { open, toggle, disabled, headingLevel, triggerId, contentId } =
    useCollapsibleContext('CollapsibleTrigger');

  const button = (
    <button
      type="button"
      id={triggerId}
      aria-controls={contentId}
      aria-expanded={open}
      disabled={disabled}
      data-open={open ? 'true' : undefined}
      className={['uh-collapsible__trigger', className].filter(Boolean).join(' ')}
      onClick={toggle}
    >
      <span className="uh-collapsible__trigger-label">{children}</span>
      <span className="uh-collapsible__chevron" data-open={open ? 'true' : undefined}>
        <ChevronDownIcon />
      </span>
    </button>
  );

  if (headingLevel === undefined) return button;

  const Heading = HEADING_TAGS[headingLevel - 1]!;
  return <Heading className="uh-collapsible__heading">{button}</Heading>;
}

/* -------------------------------------------------------------- content */

export interface CollapsibleContentProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

/*
 * Children always mount, `hidden` or not - the same reasoning
 * `CommandGroup`/`AccordionContent` already document for their own hidden
 * state: the native `hidden` attribute already drops a closed panel from
 * paint AND the accessibility tree on its own, so unmounting on top of
 * that would only cost a remount and lose whatever state a consumer's own
 * children held across a collapse, for no accessibility benefit `hidden`
 * did not already provide.
 */
export function CollapsibleContent(props: CollapsibleContentProps): ReactElement {
  const { children, className } = props;
  const { open, triggerId, contentId } = useCollapsibleContext('CollapsibleContent');

  return (
    <div
      id={contentId}
      aria-labelledby={triggerId}
      hidden={!open}
      className={['uh-collapsible__content', className].filter(Boolean).join(' ')}
    >
      <div className="uh-collapsible__content-inner">{children}</div>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Collapsible.displayName = 'Collapsible';
  CollapsibleTrigger.displayName = 'CollapsibleTrigger';
  CollapsibleContent.displayName = 'CollapsibleContent';
}
