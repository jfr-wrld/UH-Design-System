import type { ReactElement, ReactNode } from 'react';
import { ChevronRight } from '@tailgrids/icons';

export interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: ReactNode | undefined;
}

export type BreadcrumbDivider = 'slash' | 'chevron' | 'dot';

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** @default 'slash' */
  dividerType?: BreadcrumbDivider | undefined;
  /** Accessible name for the `nav` landmark - required rather than
      defaulted, the same house rule `Pagination`'s own `label` prop
      follows: "Breadcrumb" would be right for most pages but wrong for a
      second trail on the same page (a wizard's own step trail, say), and a
      landmark with a name that turns out to be a lie is worse than one
      that forces the caller to say what it actually names. */
  label: string;
  className?: string | undefined;
}

function Divider({ type }: { type: BreadcrumbDivider }): ReactElement {
  if (type === 'chevron') {
    return (
      <span className="uh-breadcrumbs__divider" aria-hidden="true">
        <ChevronRight />
      </span>
    );
  }
  if (type === 'dot') {
    return <span className="uh-breadcrumbs__divider" data-shape="dot" aria-hidden="true" />;
  }
  return (
    <span className="uh-breadcrumbs__divider" aria-hidden="true">
      /
    </span>
  );
}

/**
 * A trail of links back up a page hierarchy, most recent last. Ordered list
 * inside a labelled `nav` landmark, one link each and the last one marked
 * `aria-current="page"` - the WAI-ARIA Breadcrumb Pattern's own shape,
 * which the TailGrids reference this was translated from does not quite
 * reach: no `nav` landmark at all there, no `aria-current`, and its
 * divider glyphs (`/`, a chevron, a dot) sit in the accessible tree
 * unlabelled. All three are fixed here rather than carried over - the
 * dividers are decoration a sighted reader gets from layout alone, the
 * same reasoning `CommandSeparator` already documents for its own divider.
 *
 * The current page still renders as a real `<a href>`, not a plain
 * `<span>`, matching every item's own shape from the `items` array as
 * handed in - `aria-current="page"` is what tells assistive technology
 * it's the one already open, not the markup shape.
 */
export function Breadcrumbs(props: BreadcrumbsProps): ReactElement {
  const { items, dividerType = 'slash', label, className } = props;

  return (
    <nav className={['uh-breadcrumbs', className].filter(Boolean).join(' ')} aria-label={label}>
      <ol className="uh-breadcrumbs__list">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={item.href} className="uh-breadcrumbs__item">
              {index > 0 ? <Divider type={dividerType} /> : null}
              <a
                href={item.href}
                aria-current={current ? 'page' : undefined}
                data-current={current ? 'true' : undefined}
                className="uh-breadcrumbs__link"
              >
                {item.icon ? (
                  <span className="uh-breadcrumbs__icon" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

if (process.env.NODE_ENV !== 'production') {
  Breadcrumbs.displayName = 'Breadcrumbs';
}
