import { describe, expect, it } from 'vitest';

import { formatReviewDate } from './reviewDate.js';

const NOW = new Date(2026, 2, 15, 12, 0, 0);
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 86_400_000);
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * 3_600_000);

describe('formatReviewDate', () => {
  it('reads a fresh review relatively', () => {
    expect(formatReviewDate(daysAgo(14), 'en', NOW)).toBe('2 weeks ago');
    expect(formatReviewDate(daysAgo(3), 'en', NOW)).toBe('3 days ago');
    expect(formatReviewDate(hoursAgo(5), 'en', NOW)).toBe('5 hours ago');
  });

  /* numeric:'auto' is what turns -1 into a word instead of a count. */
  it('says yesterday, not 1 day ago', () => {
    expect(formatReviewDate(daysAgo(1), 'en', NOW)).toBe('yesterday');
  });

  it('says now for a review seconds old', () => {
    expect(formatReviewDate(new Date(NOW.getTime() - 5000), 'en', NOW)).toBe('now');
  });

  /* Beyond a month, "5 weeks ago" makes the reader do arithmetic that the
     date does for free. */
  it('switches to the absolute date at thirty days', () => {
    expect(formatReviewDate(daysAgo(29), 'en', NOW)).toBe('4 weeks ago');
    expect(formatReviewDate(daysAgo(30), 'en-MY', NOW)).toBe('13 Feb 2026');
    expect(formatReviewDate(daysAgo(200), 'en-MY', NOW)).toBe('27 Aug 2025');
  });

  it('speaks the locale, not a table of ours', () => {
    expect(formatReviewDate(daysAgo(14), 'ms-MY', NOW)).toBe('2 minggu lalu');
    expect(formatReviewDate(daysAgo(14), 'id-ID', NOW)).toBe('2 minggu yang lalu');
  });

  /* Clock skew is not the future; "in 2 hours" on a review is nonsense. */
  it('reads a future timestamp as an absolute date', () => {
    expect(formatReviewDate(new Date(NOW.getTime() + 7_200_000), 'en-MY', NOW)).toBe('15 Mar 2026');
  });
});
