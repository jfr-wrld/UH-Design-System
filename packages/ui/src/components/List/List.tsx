import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react';

export type ListDirection = 'vertical' | 'horizontal';

export interface ListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
  /** `vertical` stacks rows full-width with dividers between them (a
      settings screen, an order summary). `horizontal` lays rows side by
      side, each sized to its own content (a compact filter strip). */
  direction?: ListDirection | undefined;
  /** Off by default: the border between rows is what turns a `<ul>` into a
      readable group instead of a wall of text. Set true for a list whose
      rows already carry enough separation of their own (spacious padding,
      a leading avatar) that a second line would be visual noise. */
  hideDividers?: boolean | undefined;
  children?: ReactNode | undefined;
}

/**
 * A bordered card of rows: order summary lines, settings entries, a
 * package's included/excluded facilities. Deliberately not an interactive
 * widget - no `role="menu"` or roving focus like `Dropdown`, no
 * expand/collapse like `Accordion`/`Collapsible`. Reach for one of those
 * instead the moment the list needs to *behave* like something beyond a
 * group of rows that can individually link or click.
 */
export function List({
  direction = 'vertical',
  hideDividers = false,
  className,
  children,
  ...rest
}: ListProps) {
  return (
    <ul
      className={['uh-list', className].filter(Boolean).join(' ')}
      data-direction={direction}
      data-hide-dividers={hideDividers ? 'true' : undefined}
      {...rest}
    >
      {children}
    </ul>
  );
}

interface ListItemCommonProps {
  children?: ReactNode | undefined;
  /** Decorative; pair a meaningful glyph with `children` text, never rely
      on the icon alone to carry information (see `antislop-human`'s
      color/icon-only guidance - the same reasoning applies to icons). */
  leadingIcon?: ReactNode | undefined;
  /** A count badge, a chevron, a short meta string - pushed to the row's
      trailing edge. */
  trailing?: ReactNode | undefined;
  /** Marks the row as the current one in a set (a selected filter, the
      active nav entry) - a tinted background and brand text color, not a
      color-only signal since `children` still carries the row's own name. */
  active?: boolean | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

interface ListItemStaticProps extends ListItemCommonProps {
  href?: undefined;
  onClick?: undefined;
}

interface ListItemLinkProps extends ListItemCommonProps {
  href: string;
  onClick?: undefined;
  linkProps?:
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'onClick'> | undefined;
}

interface ListItemButtonProps extends ListItemCommonProps {
  href?: undefined;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  buttonProps?:
    | Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'className' | 'type'>
    | undefined;
}

/** A plain row (`href`/`onClick` both omitted), a link row, or a button
    row - never more than one of `href`/`onClick`, matching `Card`'s own
    three-way split for the same reason: a row is either static or it has
    exactly one way to activate it. */
export type ListItemProps = ListItemStaticProps | ListItemLinkProps | ListItemButtonProps;

export function ListItem(props: ListItemProps) {
  const { children, leadingIcon, trailing, active, disabled, className } = props;
  const rowClassName = ['uh-list__row', className].filter(Boolean).join(' ');

  const content = (
    <>
      {leadingIcon ? (
        <span className="uh-list__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="uh-list__label">{children}</span>
      {trailing ? <span className="uh-list__trailing">{trailing}</span> : null}
    </>
  );

  let row: ReactNode;
  if (props.href) {
    /*
     * `aria-disabled` rather than dropping `href`, same reasoning as
     * Button's own `as="a"` case: removing the href would pull the row out
     * of the tab order instead of just marking it unavailable.
     */
    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    row = (
      <a
        className={rowClassName}
        href={props.href}
        aria-disabled={disabled ? true : undefined}
        data-active={active ? 'true' : undefined}
        onClick={handleClick}
        {...props.linkProps}
      >
        {content}
      </a>
    );
  } else if (props.onClick) {
    row = (
      <button
        type="button"
        className={rowClassName}
        onClick={props.onClick}
        disabled={disabled}
        data-active={active ? 'true' : undefined}
        {...props.buttonProps}
      >
        {content}
      </button>
    );
  } else {
    row = (
      <div
        className={rowClassName}
        data-active={active ? 'true' : undefined}
        data-disabled={disabled ? 'true' : undefined}
      >
        {content}
      </div>
    );
  }

  return <li className="uh-list__item">{row}</li>;
}

if (process.env.NODE_ENV !== 'production') {
  List.displayName = 'List';
  ListItem.displayName = 'ListItem';
}
