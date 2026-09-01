import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  /** Removes the outer rounded corners and side borders so the table can sit
      flush against the edges of whatever contains it (a full-width card, a
      page section) instead of reading as its own separate panel.
      @default false */
  fullBleed?: boolean | undefined;
  className?: string | undefined;
}

/**
 * A thin, composable wrapper around the native `<table>` family -
 * `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` map
 * 1:1 onto `table`/`thead`/`tbody`/`tr`/`th`/`td`, each just adding the
 * token-driven paint this design system's tables share. Every native table
 * attribute still works (`onClick` on a row, `colSpan` on a cell, `id`,
 * `data-*`, ...) since each part extends its element's real HTML attribute
 * type rather than inventing a narrower prop surface.
 *
 * `Table` itself also supplies the horizontal-scroll wrapper: a data table
 * is exactly the kind of content that must never force the page itself to
 * scroll sideways (see the mobile rule this system holds every component
 * to) - it scrolls in its own box instead, with the rest of the page still
 * intact.
 */
export function Table(props: TableProps) {
  const {
    fullBleed = false,
    className,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rest
  } = props;
  /*
   * A caller's `aria-label`/`aria-labelledby` moves to the wrapper rather
   * than staying on `<table>` - the wrapper is the element that is actually
   * focusable and scrollable (see the tabIndex comment below), so it is the
   * one that needs a name of its own for a screen-reader user tabbing to
   * it, the same way Carousel's own scrollable viewport carries `role`
   * `region` + its own `aria-label` rather than leaving it to the content
   * inside. Only wearing `role="region"` once a name is actually supplied
   * keeps an unlabelled `<Table>` exactly as before - a bare region with no
   * name is its own, worse, accessibility gap.
   */
  return (
    // A wide table scrolls inside this box rather than the page, which
    // means it is a scrollable region in its own right - one a keyboard
    // user has no way to reach without it being in the tab order (WCAG
    // 2.1.1). `tabIndex={0}` is unconditional rather than only added once
    // the table is measured as actually overflowing: whether it overflows
    // depends on the viewport and the data, both of which can change after
    // this first render, and a keyboard user should never lose access to a
    // scroll they can already see.
    <div
      className="uh-table__wrapper"
      tabIndex={0}
      role={ariaLabel || ariaLabelledBy ? 'region' : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
    >
      <table
        {...rest}
        className={['uh-table', className].filter(Boolean).join(' ')}
        data-full-bleed={fullBleed ? 'true' : undefined}
      >
        {children}
      </table>
    </div>
  );
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string | undefined;
}

export function TableHeader(props: TableHeaderProps) {
  const { className, ...rest } = props;
  return <thead {...rest} className={['uh-table__header', className].filter(Boolean).join(' ')} />;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  className?: string | undefined;
}

export function TableBody(props: TableBodyProps) {
  const { className, ...rest } = props;
  return <tbody {...rest} className={['uh-table__body', className].filter(Boolean).join(' ')} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  className?: string | undefined;
}

export function TableRow(props: TableRowProps) {
  const { className, ...rest } = props;
  return <tr {...rest} className={['uh-table__row', className].filter(Boolean).join(' ')} />;
}

export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  className?: string | undefined;
}

/**
 * A header cell (`<th>`). `scope="col"` by default - the overwhelming
 * majority of header cells in a typical table label a column, and a screen
 * reader cannot infer that on its own the way a sighted reader infers it
 * from position; pass `scope="row"` explicitly for a row-header cell inside
 * `TableBody` instead.
 */
export function TableHead(props: TableHeadProps) {
  const { className, scope = 'col', ...rest } = props;
  return (
    <th
      {...rest}
      scope={scope}
      className={['uh-table__head', className].filter(Boolean).join(' ')}
    />
  );
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  className?: string | undefined;
}

export function TableCell(props: TableCellProps) {
  const { className, ...rest } = props;
  return <td {...rest} className={['uh-table__cell', className].filter(Boolean).join(' ')} />;
}

if (process.env.NODE_ENV !== 'production') {
  Table.displayName = 'Table';
  TableHeader.displayName = 'TableHeader';
  TableBody.displayName = 'TableBody';
  TableRow.displayName = 'TableRow';
  TableHead.displayName = 'TableHead';
  TableCell.displayName = 'TableCell';
}
