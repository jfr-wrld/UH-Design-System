import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import {
  AgencyCard,
  Badge,
  Button,
  DateRangePicker,
  PackageCard,
  PassengerStepper,
  ReviewCard,
  SearchCombobox,
  formatCount,
  type SearchOption,
} from '@umrahhaji/ui';
import {
  LOCALE_TAG,
  PRICE,
  buildAgencies,
  buildPackages,
  buildReviews,
  type CurrencyCode,
  type Lang,
} from './fixtures.js';

/*
 * This is a test screen, not a product page (Fase 6 charter). Every visual
 * piece is an existing packages/ui component; the only local code is the
 * page-level grid/flex scaffolding, done through Tailwind utility classes
 * that resolve to the same token scale (`gap-16` = `--uh-spacing-16`) rather
 * than inline style - see FASE6-REPORT.md for why that scaffolding itself is
 * evidence for a finding: there is no Stack/Grid/Container component yet.
 */

const HEADING: Record<
  Lang,
  { hero: string; sub: string; popular: string; trusted: string; testimonials: string; cta: string }
> = {
  en: {
    hero: 'Umrah, planned properly',
    sub: 'Compare licensed agencies and book with confidence.',
    popular: 'Popular packages',
    trusted: 'Trusted agencies',
    testimonials: 'What pilgrims say',
    cta: 'Search packages',
  },
  ms: {
    hero: 'Umrah, dirancang dengan teliti',
    sub: 'Bandingkan agensi bertauliah dan tempah dengan yakin.',
    popular: 'Pakej popular',
    trusted: 'Agensi dipercayai',
    testimonials: 'Kata jemaah',
    cta: 'Cari pakej',
  },
  id: {
    hero: 'Umrah, direncanakan dengan baik',
    sub: 'Bandingkan agen berlisensi dan pesan dengan yakin.',
    popular: 'Paket populer',
    trusted: 'Agen tepercaya',
    testimonials: 'Kata jemaah',
    cta: 'Cari paket',
  },
};

const DESTINATIONS: Record<Lang, SearchOption[]> = {
  en: [
    { id: 'jed', label: 'Jeddah', description: 'Saudi Arabia', group: 'Destinations' },
    { id: 'mad', label: 'Madinah', description: 'Saudi Arabia', group: 'Destinations' },
  ],
  ms: [
    { id: 'jed', label: 'Jeddah', description: 'Arab Saudi', group: 'Destinasi' },
    { id: 'mad', label: 'Madinah', description: 'Arab Saudi', group: 'Destinasi' },
  ],
  id: [
    { id: 'jed', label: 'Jeddah', description: 'Arab Saudi', group: 'Destinasi' },
    { id: 'mad', label: 'Madinah', description: 'Arab Saudi', group: 'Destinasi' },
  ],
};

interface HomepageProps {
  lang: Lang;
  currency: CurrencyCode;
  theme?: 'light' | 'dark';
}

function HomepageScreen({ lang, currency, theme = 'light' }: HomepageProps) {
  const t = HEADING[lang];
  const locale = LOCALE_TAG[lang];
  const price = PRICE[currency];
  const packages = buildPackages(lang);
  const agencies = buildAgencies();
  const reviews = buildReviews(lang);

  const surface: CSSProperties = {
    background: 'var(--uh-color-bg-canvas)',
    color: 'var(--uh-color-text-primary)',
    minHeight: '100vh',
  };

  return (
    <div data-theme={theme} lang={lang} style={surface} className="flex flex-col gap-48">
      {/* ------------------------------------------------------------ hero */}
      <section
        className="flex flex-col gap-24 p-24"
        style={{ background: 'var(--uh-color-bg-brand-subtle)' }}
      >
        <div className="flex flex-col gap-8">
          <h1 className="uh-type-web-h2" style={{ margin: 0 }}>
            {t.hero}
          </h1>
          <p
            className="uh-type-web-body-m"
            style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
          >
            {t.sub}
          </p>
        </div>

        <div
          className="flex flex-col gap-16 md:flex-row md:items-end p-16"
          style={{
            background: 'var(--uh-color-bg-surface)',
            borderRadius: 'var(--uh-radius-card)',
            border: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
          }}
        >
          <div className="flex-1" style={{ minWidth: 0 }}>
            <SearchCombobox
              label={lang === 'en' ? 'Destination' : lang === 'ms' ? 'Destinasi' : 'Tujuan'}
              options={DESTINATIONS[lang]}
              placeholder={
                lang === 'en' ? 'Where to?' : lang === 'ms' ? 'Ke mana?' : 'Mau ke mana?'
              }
            />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <DateRangePicker
              label={
                lang === 'en'
                  ? 'Travel dates'
                  : lang === 'ms'
                    ? 'Tarikh perjalanan'
                    : 'Tanggal perjalanan'
              }
              locale={locale}
            />
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <PassengerStepper
              legend={lang === 'en' ? 'Passengers' : lang === 'ms' ? 'Penumpang' : 'Penumpang'}
            />
          </div>
          <Button variant="primary">{t.cta}</Button>
        </div>
      </section>

      {/* --------------------------------------------------------- popular */}
      <section className="flex flex-col gap-16 px-24">
        <h2 className="uh-type-web-h4" style={{ margin: 0 }}>
          {t.popular}
        </h2>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16"
          style={{ gridAutoRows: '1fr' }}
        >
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.title}
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
      </section>

      {/* --------------------------------------------------------- trusted */}
      <section className="flex flex-col gap-16 px-24">
        <h2 className="uh-type-web-h4" style={{ margin: 0 }}>
          {t.trusted}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
          {agencies.map((agency) => (
            <AgencyCard
              key={agency.name}
              name={agency.name}
              licenseType={agency.licenseType}
              licenseNumber={agency.licenseNumber}
              rating={agency.rating}
              reviewCount={agency.reviewCount}
              operatingSince={agency.operatingSince}
              packageCount={agency.packageCount}
              verified={agency.verified}
              badges={agency.badges}
              variant="full"
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- testimonials */}
      <section className="flex flex-col gap-16 px-24">
        <h2 className="uh-type-web-h4" style={{ margin: 0 }}>
          {t.testimonials}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-16">
          {reviews.map((review) => (
            <ReviewCard
              key={review.author.name}
              author={review.author}
              rating={review.rating}
              date={review.date}
              content={review.content}
              helpfulCount={review.helpfulCount}
              packageName={review.packageName}
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- trust signals */}
      <section
        className="flex flex-wrap items-center gap-24 p-24"
        style={{ background: 'var(--uh-color-bg-surface-sunken)' }}
      >
        <Badge variant="success">
          {lang === 'en' ? 'TOB Licensed' : lang === 'ms' ? 'Bertauliah TOB' : 'Berlisensi TOB'}
        </Badge>
        <div className="flex flex-col">
          <span className="uh-type-web-h5" style={{ margin: 0 }}>
            {formatCount(48213, locale)}+
          </span>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            {lang === 'en'
              ? 'Pilgrims served'
              : lang === 'ms'
                ? 'Jemaah dilayan'
                : 'Jemaah dilayani'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="uh-type-web-h5" style={{ margin: 0 }}>
            12
          </span>
          <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
            {lang === 'en'
              ? 'Years operating'
              : lang === 'ms'
                ? 'Tahun beroperasi'
                : 'Tahun beroperasi'}
          </span>
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: 'Patterns/Homepage',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Desktop1440: Story = {
  render: () => <HomepageScreen lang="en" currency="MYR" />,
};

export const Mobile360: Story = {
  render: () => <HomepageScreen lang="en" currency="MYR" />,
};

export const Tablet768: Story = {
  render: () => <HomepageScreen lang="en" currency="MYR" />,
};

export const DarkMode1440: Story = {
  render: () => <HomepageScreen lang="en" currency="MYR" theme="dark" />,
};

export const LocaleMs360: Story = {
  render: () => <HomepageScreen lang="ms" currency="MYR" />,
};

export const LocaleMs1440: Story = {
  render: () => <HomepageScreen lang="ms" currency="MYR" />,
};

export const LocaleId360: Story = {
  render: () => <HomepageScreen lang="id" currency="MYR" />,
};

export const LocaleId1440: Story = {
  render: () => <HomepageScreen lang="id" currency="MYR" />,
};

export const CurrencyIDR360: Story = {
  render: () => <HomepageScreen lang="id" currency="IDR" />,
};

export const CurrencyIDR1440: Story = {
  render: () => <HomepageScreen lang="id" currency="IDR" />,
};
