import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import {
  BottomSheet,
  Button,
  Card,
  Chip,
  EmptyState,
  ErrorState,
  FilterPanel,
  PackageCard,
  Pagination,
  Select,
  type FilterOption,
} from '@umrahhaji/ui';
import {
  LOCALE_TAG,
  PRICE,
  buildPackages,
  FILTER_LABEL,
  type CurrencyCode,
  type Lang,
} from './fixtures.js';

/*
 * Fase 6 test screen - see FASE6-REPORT.md. Originally composed directly
 * from Card + Checkbox + Button (desktop) and BottomSheet + the same
 * controls (mobile) because no FilterPanel existed - reported rather than
 * built at the time. FilterPanel now exists (see its own .mdx for why) and
 * this screen was the reference this pattern extracted it from, so it is
 * wired up to use it below instead of the hand-rolled version. Pagination,
 * previously also missing, was built in Session 2 (see FASE6-REPORT-V2.md).
 */

/* 47 results, 9 per page - realistic enough to actually exercise multiple
   pages, rather than the single page the 9-card fixture set alone would
   produce. */
const TOTAL_RESULTS = 47;
const PAGE_SIZE = 9;

const COPY: Record<
  Lang,
  {
    results: (n: number) => string;
    sort: string;
    filters: string;
    applyFilters: string;
    clearAll: string;
    sortOptions: { value: string; label: string }[];
    resultsNav: string;
    noResultsTitle: string;
    noResultsDesc: string;
    clearFilters: string;
    errorTitle: string;
    errorDesc: string;
    retry: string;
  }
> = {
  en: {
    results: (n) => `${n} packages found`,
    sort: 'Sort by',
    filters: 'Filters',
    applyFilters: 'Apply filters',
    clearAll: 'Clear all',
    resultsNav: 'Search results pages',
    noResultsTitle: 'No packages match your filters',
    noResultsDesc: 'Try widening your travel dates or removing a filter.',
    clearFilters: 'Clear filters',
    errorTitle: 'Could not load packages',
    errorDesc: 'Check your connection and try again.',
    retry: 'Try again',
    sortOptions: [
      { value: 'recommended', label: 'Recommended' },
      { value: 'price-asc', label: 'Price: low to high' },
      { value: 'price-desc', label: 'Price: high to low' },
      { value: 'rating', label: 'Highest rated' },
    ],
  },
  ms: {
    results: (n) => `${n} pakej ditemui`,
    sort: 'Susun mengikut',
    filters: 'Tapisan',
    applyFilters: 'Guna tapisan',
    clearAll: 'Kosongkan semua',
    resultsNav: 'Halaman hasil carian',
    noResultsTitle: 'Tiada pakej sepadan dengan tapisan anda',
    noResultsDesc: 'Cuba luaskan tarikh perjalanan atau alih keluar satu tapisan.',
    clearFilters: 'Kosongkan tapisan',
    errorTitle: 'Tidak dapat memuatkan pakej',
    errorDesc: 'Semak sambungan anda dan cuba lagi.',
    retry: 'Cuba lagi',
    sortOptions: [
      { value: 'recommended', label: 'Disyorkan' },
      { value: 'price-asc', label: 'Harga: rendah ke tinggi' },
      { value: 'price-desc', label: 'Harga: tinggi ke rendah' },
      { value: 'rating', label: 'Penilaian tertinggi' },
    ],
  },
  id: {
    results: (n) => `${n} paket ditemukan`,
    sort: 'Urutkan berdasarkan',
    filters: 'Filter',
    applyFilters: 'Terapkan filter',
    clearAll: 'Hapus semua',
    resultsNav: 'Halaman hasil pencarian',
    noResultsTitle: 'Tidak ada paket yang cocok dengan filter Anda',
    noResultsDesc: 'Coba perluas tanggal perjalanan atau hapus salah satu filter.',
    clearFilters: 'Hapus filter',
    errorTitle: 'Tidak dapat memuat paket',
    errorDesc: 'Periksa koneksi Anda dan coba lagi.',
    retry: 'Coba lagi',
    sortOptions: [
      { value: 'recommended', label: 'Direkomendasikan' },
      { value: 'price-asc', label: 'Harga: rendah ke tinggi' },
      { value: 'price-desc', label: 'Harga: tinggi ke rendah' },
      { value: 'rating', label: 'Rating tertinggi' },
    ],
  },
};

const DEFAULT_FILTERS = ['direct', 'breakfast'];

function filterOptions(lang: Lang): FilterOption[] {
  const f = FILTER_LABEL[lang];
  return [
    { id: 'direct', label: f.direct },
    { id: 'halal', label: f.halal },
    { id: 'breakfast', label: f.breakfast },
    { id: 'fiveStar', label: f.fiveStar },
    { id: 'nearHaram', label: f.nearHaram },
  ];
}

interface ScreenProps {
  lang: Lang;
  currency: CurrencyCode;
  theme?: 'light' | 'dark';
  mobile?: boolean;
  state?: 'default' | 'empty' | 'loading' | 'error';
}

function SearchResultsScreen({
  lang,
  currency,
  theme = 'light',
  mobile = false,
  state = 'default',
}: ScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<string[]>(DEFAULT_FILTERS);
  const pageCount = Math.ceil(TOTAL_RESULTS / PAGE_SIZE);
  const t = COPY[lang];
  const options = filterOptions(lang);
  const locale = LOCALE_TAG[lang];
  const price = PRICE[currency];
  const base = buildPackages(lang);
  /*
   * One page's worth of cards: repeats the four fixtures with light
   * variation so the grid is not visibly four cards tiled three times, and
   * folds `page` into that same variation so paging actually changes what
   * is on screen - real enough to prove Pagination's onChange is wired to
   * something, without pretending this is a real search index.
   */
  const packages = Array.from({ length: PAGE_SIZE }, (_, i) => {
    const n = (page - 1) * PAGE_SIZE + i;
    const pkg = base[n % base.length]!;
    return {
      ...pkg,
      title: `${pkg.title}${n >= base.length ? ` #${Math.floor(n / base.length) + 1}` : ''}`,
    };
  });

  const surface: CSSProperties = {
    background: 'var(--uh-color-bg-canvas)',
    color: 'var(--uh-color-text-primary)',
    minHeight: '100vh',
  };

  const activeOptions = options.filter((option) => filters.includes(option.id));
  const appliedChips =
    activeOptions.length > 0 ? (
      <div className="flex flex-wrap gap-8">
        {activeOptions.map((option) => (
          <Chip
            key={option.id}
            removable
            onRemove={() => setFilters((current) => current.filter((id) => id !== option.id))}
          >
            {option.label}
          </Chip>
        ))}
        <Button variant="link" size="sm" onClick={() => setFilters([])}>
          {t.clearAll}
        </Button>
      </div>
    ) : null;

  const resultsHeader = (
    <div className="flex items-center justify-between flex-wrap gap-16">
      <p className="uh-type-web-label" style={{ margin: 0 }}>
        {t.results(TOTAL_RESULTS)}
      </p>
      <Select label={t.sort} options={t.sortOptions} defaultValue="recommended" size="sm" />
    </div>
  );

  function body() {
    if (state === 'loading') {
      return (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16"
          style={{ gridAutoRows: '1fr' }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <PackageCard key={i} loading variant="grid" />
          ))}
        </div>
      );
    }
    if (state === 'empty') {
      return (
        <EmptyState
          title={t.noResultsTitle}
          description={t.noResultsDesc}
          action={{ label: t.clearFilters, onClick: () => {} }}
        />
      );
    }
    if (state === 'error') {
      return (
        <ErrorState
          title={t.errorTitle}
          description={t.errorDesc}
          action={{ label: t.retry, onClick: () => {} }}
        />
      );
    }
    return (
      <>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16"
          style={{ gridAutoRows: '1fr' }}
        >
          {packages.map((pkg, i) => (
            <PackageCard
              key={`${pkg.title}-${i}`}
              title={pkg.title}
              agency={{ name: pkg.agency, verified: pkg.verified }}
              rating={pkg.rating}
              reviewCount={pkg.reviewCount}
              departureDate={pkg.departureDate}
              durationDays={pkg.durationDays}
              hotelDistance={{ makkah: pkg.makkahDistance, madinah: pkg.madinahDistance }}
              price={price.base}
              originalPrice={pkg.badge === 'promo' ? price.original : undefined}
              currency={currency}
              locale={locale}
              seatsRemaining={pkg.seatsRemaining}
              badge={pkg.badge}
              variant="grid"
            />
          ))}
        </div>
        <div className="flex justify-center p-24">
          <Pagination
            page={page}
            pageCount={pageCount}
            onChange={setPage}
            label={t.resultsNav}
            locale={locale}
          />
        </div>
      </>
    );
  }

  if (mobile) {
    return (
      <div data-theme={theme} lang={lang} style={surface} className="flex flex-col gap-16 p-16">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            {t.filters}
          </Button>
          <Select label={t.sort} options={t.sortOptions} defaultValue="recommended" size="sm" />
        </div>
        {appliedChips}
        <p className="uh-type-web-label" style={{ margin: 0 }}>
          {t.results(TOTAL_RESULTS)}
        </p>
        {body()}
        <BottomSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={t.filters}
          scrollable
          footer={
            <Button variant="primary" onClick={() => setSheetOpen(false)}>
              {t.applyFilters}
            </Button>
          }
        >
          {/* showTitle={false}: the sheet's own title already says "Filters" -
              no onApply/onClear here either, since BottomSheet's footer above
              already carries Apply and this pattern never offered Clear all
              on mobile, only on the desktop rail below. */}
          <FilterPanel options={options} value={filters} onChange={setFilters} showTitle={false} />
        </BottomSheet>
      </div>
    );
  }

  return (
    <div
      data-theme={theme}
      lang={lang}
      style={surface}
      className="grid grid-cols-[var(--uh-size-rail-sm)_1fr] gap-24 p-24"
    >
      <aside>
        <Card padding="lg">
          <FilterPanel
            options={options}
            value={filters}
            onChange={setFilters}
            onApply={() => {}}
            onClear={() => setFilters([])}
            labels={{ title: t.filters, applyFilters: t.applyFilters, clearAll: t.clearAll }}
          />
        </Card>
      </aside>
      <div className="flex flex-col gap-16">
        {appliedChips}
        {resultsHeader}
        {body()}
      </div>
    </div>
  );
}

const meta = {
  title: 'Patterns/SearchResults',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Desktop1440: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" />,
};

export const Mobile360: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" mobile />,
};

export const Tablet768: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" />,
};

export const DarkMode1440: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" theme="dark" />,
};

export const LocaleMs360: Story = {
  render: () => <SearchResultsScreen lang="ms" currency="MYR" mobile />,
};

export const LocaleMs1440: Story = {
  render: () => <SearchResultsScreen lang="ms" currency="MYR" />,
};

export const LocaleId360: Story = {
  render: () => <SearchResultsScreen lang="id" currency="MYR" mobile />,
};

export const LocaleId1440: Story = {
  render: () => <SearchResultsScreen lang="id" currency="MYR" />,
};

export const CurrencyIDR360: Story = {
  render: () => <SearchResultsScreen lang="id" currency="IDR" mobile />,
};

export const CurrencyIDR1440: Story = {
  render: () => <SearchResultsScreen lang="id" currency="IDR" />,
};

export const EmptyResults: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" state="empty" />,
};

export const Loading: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" state="loading" />,
};

export const ErrorLoading: Story = {
  render: () => <SearchResultsScreen lang="en" currency="MYR" state="error" />,
};
