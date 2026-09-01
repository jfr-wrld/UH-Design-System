import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'outlined' | 'elevated' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardCommonProps {
  children?: ReactNode | undefined;
  variant?: CardVariant | undefined;
  padding?: CardPadding | undefined;
  /** Off only to freeze a card that would otherwise hover-elevate - a
      selected item in a list, a card mid-drag. Defaults to whatever the
      card would naturally do: interactive cards hover, static ones don't. */
  hoverable?: boolean | undefined;
  className?: string | undefined;
}

/** A plain container: no link, no button, nothing to click as a whole. */
interface CardStaticProps extends CardCommonProps {
  href?: undefined;
  onClick?: undefined;
  label?: undefined;
  disabled?: undefined;
}

interface CardLinkProps extends CardCommonProps {
  href: string;
  onClick?: undefined;
  /**
   * Names the whole-card hit area for a screen reader. Required: a package
   * photo and a price read as nothing on their own - PackageCard's actual
   * card name ("9-Day Umrah Package - Istanbul Transit") is what a person
   * needs to hear, not "link".
   */
  label: string;
  disabled?: undefined;
  linkProps?: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'aria-label'> | undefined;
}

interface CardButtonProps extends CardCommonProps {
  href?: undefined;
  onClick: () => void;
  label: string;
  disabled?: boolean | undefined;
  buttonProps?:
    | Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'aria-label' | 'disabled'>
    | undefined;
}

export type CardProps = CardStaticProps | CardLinkProps | CardButtonProps;

/**
 * The card shell every card-shaped composite (PackageCard, AgencyCard,
 * HotelCard, ReviewCard) is meant to sit on: a surface, a border or
 * elevation treatment, and - when interactive - one whole-card hit area
 * that nested content can still escape.
 *
 * The whole-card link or button carries no visible content of its own; it
 * is absolutely positioned to fill the card and named by `label`. Anything
 * inside `children` that must stay independently clickable - a wishlist
 * heart, a "share" icon - needs `position: relative` (or its own z-index):
 * a positioned box always paints above a non-positioned one regardless of
 * DOM order, so the hit-area link is written first and everything
 * `position`-anything after it in the tree paints on top and intercepts
 * its own clicks first. `.uh-card__action` applies this for you.
 */
export function Card(props: CardProps) {
  const { children, variant = 'outlined', padding = 'md', hoverable, className } = props;

  const interactive = Boolean(props.href || props.onClick);
  const hover = hoverable ?? interactive;

  return (
    <div
      className={['uh-card', className].filter(Boolean).join(' ')}
      data-card-variant={variant}
      data-padding={padding}
      data-hoverable={hover ? 'true' : undefined}
      data-interactive={interactive ? 'true' : undefined}
    >
      {props.href ? (
        <a
          {...props.linkProps}
          href={props.href}
          aria-label={props.label}
          className="uh-card__hit-area"
        />
      ) : props.onClick ? (
        <button
          {...props.buttonProps}
          type="button"
          onClick={props.onClick}
          disabled={props.disabled}
          aria-label={props.label}
          className="uh-card__hit-area"
        />
      ) : null}

      <div className="uh-card__content">{children}</div>
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
  Card.displayName = 'Card';
}
