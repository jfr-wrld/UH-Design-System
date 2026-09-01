import { ChevronDownIcon } from '../../lib/icons.js';
import { paginationRange } from './range.js';

export interface PaginationLabels {
  previous: string;
  next: string;
  goToPage: (page: number) => string;
  currentPage: (page: number) => string;
}

const DEFAULT_LABELS: PaginationLabels = {
  previous: 'Previous page',
  next: 'Next page',
  goToPage: (page) => `Go to page ${page}`,
  currentPage: (page) => `Page ${page}, current page`,
};

export interface PaginationProps {
  /** 1-based. Always controlled - a page change means a refetch, so there is
      no self-contained "uncontrolled" version of this component. */
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** Accessible name for the nav landmark. */
  label: string;
  /** Drives page-number formatting. Malay and Indonesian both use Latin
      digits, but this stays Intl-driven rather than a bare template string
      on the same house rule as every other number in the system. */
  locale?: string | undefined;
  labels?: Partial<PaginationLabels> | undefined;
  className?: string | undefined;
}

/**
 * Built for Fase 6 (see FASE6-REPORT.md) - SearchResults previously ended in
 * a "Load more" button, functional but unable to say how many pages there
 * were or jump to one directly.
 *
 * `pageCount <= 1` renders nothing: a single page of results has nothing to
 * paginate, and a nav landmark with one disabled button in it says nothing a
 * reader needs.
 */
export function Pagination(props: PaginationProps) {
  const {
    page,
    pageCount,
    onChange,
    label,
    locale = 'en',
    labels: labelOverrides,
    className,
  } = props;
  const labels: PaginationLabels = { ...DEFAULT_LABELS, ...labelOverrides };

  if (pageCount <= 1) return null;

  const format = new Intl.NumberFormat(locale);
  const items = paginationRange(page, pageCount);

  function go(next: number) {
    const clamped = Math.min(Math.max(next, 1), pageCount);
    if (clamped !== page) onChange(clamped);
  }

  return (
    <nav className={['uh-pagination', className].filter(Boolean).join(' ')} aria-label={label}>
      <ul className="uh-pagination__list">
        <li>
          <button
            type="button"
            className="uh-pagination__nav"
            aria-label={labels.previous}
            disabled={page === 1}
            onClick={() => go(page - 1)}
          >
            <span className="uh-pagination__chevron" data-direction="prev">
              <ChevronDownIcon />
            </span>
          </button>
        </li>

        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className="uh-pagination__page"
                aria-label={item === page ? labels.currentPage(item) : labels.goToPage(item)}
                aria-current={item === page ? 'page' : undefined}
                data-active={item === page ? 'true' : undefined}
                onClick={() => go(item)}
              >
                {format.format(item)}
              </button>
            </li>
          ) : (
            <li key={item} className="uh-pagination__ellipsis" aria-hidden="true">
              &hellip;
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            className="uh-pagination__nav"
            aria-label={labels.next}
            disabled={page === pageCount}
            onClick={() => go(page + 1)}
          >
            <span className="uh-pagination__chevron" data-direction="next">
              <ChevronDownIcon />
            </span>
          </button>
        </li>
      </ul>
    </nav>
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
  Pagination.displayName = 'Pagination';
}
