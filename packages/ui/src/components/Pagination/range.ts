export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

function range(start: number, end: number): number[] {
  const length = Math.max(end - start + 1, 0);
  return Array.from({ length }, (_, i) => start + i);
}

/**
 * Always shows page 1, the last page, and the current page's immediate
 * neighbours; collapses everything else behind one ellipsis per side once
 * there is a genuine gap to hide. Below the point where showing every page
 * would cost more room than the collapsed form saves, it just returns every
 * page instead - the algorithm exists to prevent forty buttons in a row, not
 * to force an ellipsis onto six pages that would fit without one.
 */
export function paginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1,
): PaginationItem[] {
  const totalVisible = siblingCount * 2 + 5;
  if (pageCount <= totalVisible) return range(1, pageCount);

  const leftSibling = Math.max(page - siblingCount, 1);
  const rightSibling = Math.min(page + siblingCount, pageCount);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < pageCount - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + siblingCount * 2), 'ellipsis-end', pageCount];
  }
  if (showLeftEllipsis && !showRightEllipsis) {
    return [1, 'ellipsis-start', ...range(pageCount - (2 + siblingCount * 2), pageCount)];
  }
  return [1, 'ellipsis-start', ...range(leftSibling, rightSibling), 'ellipsis-end', pageCount];
}
