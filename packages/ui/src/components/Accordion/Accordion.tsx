import { useId, type ReactElement, type ReactNode } from 'react';

import { ChevronDownIcon } from '../../lib/icons.js';
import { useControllableState } from '../../hooks/useControllableState.js';
import {
  AccordionContext,
  AccordionItemContext,
  useAccordionContext,
  useAccordionItemContext,
  type AccordionContextValue,
} from './AccordionContext.js';

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;

/* ----------------------------------------------------------------- root */

export interface AccordionSingleProps {
  type: 'single';
  value?: string | null | undefined;
  defaultValue?: string | null | undefined;
  onValueChange?: ((value: string | null) => void) | undefined;
  /** Whether clicking the currently-open item's own trigger closes it
      again. `false` pins whichever item is open, useful for a "step" flow
      where going back is not an option.
      @default true */
  collapsible?: boolean | undefined;
}

export interface AccordionMultipleProps {
  type: 'multiple';
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
}

type AccordionModeProps = AccordionSingleProps | AccordionMultipleProps;

export type AccordionProps = AccordionModeProps & {
  children?: ReactNode | undefined;
  /** The heading level every `AccordionTrigger` in this accordion renders
      inside. The WAI-ARIA Accordion Pattern recommends wrapping each
      trigger in a heading so screen-reader users can jump between items
      the same way they jump between any other section heading - set this
      to whatever level is correct for where the accordion actually sits in
      the page's own outline, rather than always assuming `<h3>`.
      @default 3 */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  className?: string | undefined;
};

function useAccordionState(
  props: AccordionModeProps,
): Pick<AccordionContextValue, 'isOpen' | 'toggle'> {
  if (props.type === 'multiple') {
    const { value, defaultValue, onValueChange } = props;
    const [openValues, setOpenValues] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
    });
    return {
      isOpen: (itemValue) => openValues.includes(itemValue),
      toggle: (itemValue) =>
        setOpenValues(
          openValues.includes(itemValue)
            ? openValues.filter((v) => v !== itemValue)
            : [...openValues, itemValue],
        ),
    };
  }

  const { value, defaultValue, onValueChange, collapsible = true } = props;
  const [openValue, setOpenValue] = useControllableState<string | null>({
    value,
    defaultValue: defaultValue ?? null,
    onChange: onValueChange,
  });
  return {
    isOpen: (itemValue) => openValue === itemValue,
    toggle: (itemValue) => {
      if (openValue === itemValue) {
        if (collapsible) setOpenValue(null);
        return;
      }
      setOpenValue(itemValue);
    },
  };
}

/**
 * A list of expand/collapse panels - one open at a time by default
 * (`type="single"`), or any number at once (`type="multiple"`). No
 * dependency behind it: open state is plain context shared with
 * `AccordionItem`/`AccordionTrigger`/`AccordionContent`, the same way
 * `Command`'s grouped list shares its own state.
 *
 * `type` has no default on purpose - `single` and `multiple` genuinely
 * disagree about what `value` even is (a string versus a string array), so
 * leaving it unstated would either silently pick one or force `value`'s
 * type to lie about the other. Every `AccordionItem` still only needs its
 * own `value` prop either way; `Accordion` is what decides how many of
 * them can be open together.
 */
export function Accordion(props: AccordionProps): ReactElement {
  const { children, headingLevel = 3, className } = props;

  // `props` (an intersection of `AccordionModeProps` and the shared fields
  // above) is assignable to the narrower `AccordionModeProps` as-is - no
  // need to strip the shared fields out first, and doing that via a rest
  // spread would risk losing the union's own discriminant along the way.
  const state = useAccordionState(props);

  return (
    <AccordionContext.Provider value={{ ...state, headingLevel }}>
      <div className={['uh-accordion', className].filter(Boolean).join(' ')}>{children}</div>
    </AccordionContext.Provider>
  );
}

/* ----------------------------------------------------------------- item */

export interface AccordionItemProps {
  /** Identifies this item - what `Accordion`'s own `value` tracks as open. */
  value: string;
  disabled?: boolean | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function AccordionItem(props: AccordionItemProps): ReactElement {
  const { value, disabled = false, children, className } = props;
  const ctx = useAccordionContext('AccordionItem');
  const reactId = useId();
  const open = ctx.isOpen(value);

  return (
    <AccordionItemContext.Provider
      value={{
        value,
        disabled,
        open,
        triggerId: `${reactId}-trigger`,
        contentId: `${reactId}-content`,
      }}
    >
      <div
        className={['uh-accordion__item', className].filter(Boolean).join(' ')}
        data-open={open ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        {children}
      </div>
    </AccordionItemContext.Provider>
  );
}

/* -------------------------------------------------------------- trigger */

export interface AccordionTriggerProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function AccordionTrigger(props: AccordionTriggerProps): ReactElement {
  const { children, className } = props;
  const { headingLevel, toggle } = useAccordionContext('AccordionTrigger');
  const { value, disabled, open, triggerId, contentId } =
    useAccordionItemContext('AccordionTrigger');

  const Heading = HEADING_TAGS[headingLevel - 1]!;

  return (
    <Heading className="uh-accordion__heading">
      <button
        type="button"
        id={triggerId}
        aria-controls={contentId}
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        data-open={open ? 'true' : undefined}
        className={['uh-accordion__trigger', className].filter(Boolean).join(' ')}
        onClick={disabled ? undefined : () => toggle(value)}
      >
        <span className="uh-accordion__trigger-label">{children}</span>
        <span className="uh-accordion__chevron" data-open={open ? 'true' : undefined}>
          <ChevronDownIcon />
        </span>
      </button>
    </Heading>
  );
}

/* -------------------------------------------------------------- content */

export interface AccordionContentProps {
  children?: ReactNode | undefined;
  className?: string | undefined;
}

/*
 * Children always mount, `hidden` or not - the same reasoning `CommandGroup`
 * documents for its own hidden state: the native `hidden` attribute already
 * drops a closed panel from paint AND the accessibility tree on its own,
 * so unmounting on top of that (what the TailGrids reference itself does)
 * would only cost a remount and lose whatever state a consumer's own
 * children held across a collapse - a form draft inside a settings
 * accordion, say - for no accessibility benefit `hidden` did not already
 * provide.
 */
export function AccordionContent(props: AccordionContentProps): ReactElement {
  const { children, className } = props;
  const { open, triggerId, contentId } = useAccordionItemContext('AccordionContent');

  return (
    <div
      id={contentId}
      role="region"
      aria-labelledby={triggerId}
      hidden={!open}
      className={['uh-accordion__content', className].filter(Boolean).join(' ')}
    >
      <div className="uh-accordion__content-inner">{children}</div>
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Accordion.displayName = 'Accordion';
  AccordionItem.displayName = 'AccordionItem';
  AccordionTrigger.displayName = 'AccordionTrigger';
  AccordionContent.displayName = 'AccordionContent';
}
