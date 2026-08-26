/** Every string the combobox can put on screen, so a translator owns all of them. */
export interface SearchComboboxLabels {
  recentHeading: string;
  clearRecent: string;
  clearQuery: string;
  loading: string;
  cancel: string;
  resultCount: (count: number) => string;
}

export const DEFAULT_LABELS: SearchComboboxLabels = {
  recentHeading: 'Recent searches',
  clearRecent: 'Clear recent searches',
  clearQuery: 'Clear search',
  loading: 'Searching',
  cancel: 'Cancel',
  resultCount: (count) => `${count} result${count === 1 ? '' : 's'}`,
};

/**
 * The default empty state names what was searched for and what to do next.
 * "No results" tells a pilgrim nothing they did not already know.
 */
export const defaultEmptyMessage = (query: string): string =>
  `No packages found for '${query}'. Try a different keyword.`;
