import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import {
  AgencyCard,
  Button,
  Card,
  Carousel,
  HotelCard,
  ItineraryTimeline,
  Modal,
  PriceBreakdown,
  PriceDisplay,
  Rating,
  RatingBreakdown,
  ReviewCard,
  Tabs,
  type CarouselSlide,
  type TabItem,
} from '@umrahhaji/ui';
import {
  LOCALE_TAG,
  PRICE,
  buildAgencies,
  buildItinerary,
  buildReviews,
  PACKAGE_TITLE,
  type CurrencyCode,
  type Lang,
} from './fixtures.js';

/*
 * Fase 6 test screen - see FASE6-REPORT.md. The two components this screen's
 * brief called for, Carousel (image gallery) and Tabs (section switcher),
 * were reported missing in Session 1 and built in Session 2 - see
 * FASE6-REPORT-V2.md. Both are wired in below rather than falling back.
 */

const COPY: Record<
  Lang,
  {
    overview: string;
    itinerary: string;
    hotel: string;
    reviews: string;
    bookNow: string;
    confirmTitle: string;
    confirmBody: string;
    confirmYes: string;
    confirmNo: string;
    from: string;
    perPerson: string;
    ratingBreakdown: string;
    sections: string;
    gallery: string;
    photo: (n: number) => string;
  }
> = {
  en: {
    overview: 'Overview',
    itinerary: 'Itinerary',
    hotel: 'Hotel',
    reviews: 'Reviews',
    bookNow: 'Book Now',
    confirmTitle: 'Continue to booking?',
    confirmBody: "You'll fill in passenger details and documents next. Nothing is charged yet.",
    confirmYes: 'Continue',
    confirmNo: 'Cancel',
    from: 'From',
    perPerson: 'per person',
    ratingBreakdown: 'Rating breakdown',
    sections: 'Package sections',
    gallery: 'Package photos',
    photo: (n) => `Photo ${n}`,
  },
  ms: {
    overview: 'Gambaran Keseluruhan',
    itinerary: 'Itinerari',
    hotel: 'Hotel',
    reviews: 'Ulasan',
    bookNow: 'Tempah Sekarang',
    confirmTitle: 'Teruskan ke tempahan?',
    confirmBody:
      'Anda akan mengisi butiran penumpang dan dokumen seterusnya. Belum ada caj dikenakan.',
    confirmYes: 'Teruskan',
    confirmNo: 'Batal',
    from: 'Bermula',
    perPerson: 'seorang',
    ratingBreakdown: 'Pecahan penilaian',
    sections: 'Bahagian pakej',
    gallery: 'Gambar pakej',
    photo: (n) => `Gambar ${n}`,
  },
  id: {
    overview: 'Ikhtisar',
    itinerary: 'Rencana Perjalanan',
    hotel: 'Hotel',
    reviews: 'Ulasan',
    bookNow: 'Pesan Sekarang',
    confirmTitle: 'Lanjutkan ke pemesanan?',
    confirmBody:
      'Anda akan mengisi detail penumpang dan dokumen berikutnya. Belum ada biaya yang dikenakan.',
    confirmYes: 'Lanjutkan',
    confirmNo: 'Batal',
    from: 'Mulai dari',
    perPerson: 'per orang',
    ratingBreakdown: 'Rincian rating',
    sections: 'Bagian paket',
    gallery: 'Foto paket',
    photo: (n) => `Foto ${n}`,
  },
};

interface ScreenProps {
  lang: Lang;
  currency: CurrencyCode;
  theme?: 'light' | 'dark';
  mobile?: boolean;
}

function PackageDetailScreen({ lang, currency, theme = 'light', mobile = false }: ScreenProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const t = COPY[lang];
  const locale = LOCALE_TAG[lang];
  const price = PRICE[currency];
  const title = PACKAGE_TITLE[lang][0]!;
  const agency = buildAgencies()[0]!;
  const days = buildItinerary(lang);
  const reviews = buildReviews(lang);

  const surface: CSSProperties = {
    background: 'var(--uh-color-bg-canvas)',
    color: 'var(--uh-color-text-primary)',
    minHeight: '100vh',
    paddingBottom: mobile ? 'var(--uh-size-tap-target-min)' : undefined,
  };

  /*
   * Mobile already has its own sticky CTA bar with a Book Now button (below).
   * An inline copy of the same button here as well showed two "Pesan
   * Sekarang" controls on screen at once before a mobile reader had
   * scrolled anywhere - found during the Fase 6 verification pass, logged
   * in FASE6-REPORT.md, and fixed here: the inline block keeps the price
   * breakdown (still useful to read in place) but only the desktop sticky
   * aside - which has no other CTA nearby - gets the button.
   */
  const priceSummary = (
    <div>
      <p
        className="uh-type-web-caption"
        style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
      >
        {t.from}
      </p>
      <PriceDisplay amount={price.base} currency={currency} locale={locale} size="lg" />
      <p
        className="uh-type-web-caption"
        style={{ margin: 0, color: 'var(--uh-color-text-tertiary)' }}
      >
        {t.perPerson}
      </p>
    </div>
  );

  const priceBreakdown = (
    <PriceBreakdown
      variant="inline"
      currency={currency}
      locale={locale}
      passengers={{ adults: 2, children: 0, infants: 0 }}
      items={[
        { label: 'Adults', amount: price.base, type: 'base', quantity: 2 },
        { label: 'Visa processing', amount: Math.round(price.base * 0.08), type: 'fee' },
        { label: 'Total', amount: price.base * 2 + Math.round(price.base * 0.08), type: 'total' },
      ]}
    />
  );

  const priceBlock = (
    <Card padding="lg">
      <div className="flex flex-col gap-16">
        {priceSummary}
        {priceBreakdown}
        <Button variant="primary" onClick={() => setConfirmOpen(true)}>
          {t.bookNow}
        </Button>
      </div>
    </Card>
  );

  const priceBlockNoCta = (
    <Card padding="lg">
      <div className="flex flex-col gap-16">
        {priceSummary}
        {priceBreakdown}
      </div>
    </Card>
  );

  /* No real photography in the fixtures - four toned frames stand in, purely
     so a language pass can see the gallery actually switch and swipe. */
  const gallerySlides: CarouselSlide[] = [1, 2, 3, 4].map((n) => ({
    id: String(n),
    label: t.photo(n),
    content: (
      <div
        style={{
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--uh-color-bg-muted)',
        }}
      >
        {/*
         * text-secondary, not text-tertiary: tertiary is only contrast-
         * verified against bg.surface and bg.canvas (see variables.css) -
         * 4.34:1 against bg.muted here, which real-browser axe caught and
         * jsdom's tests cannot (color-contrast is disabled there; see
         * test/a11y.ts). Found during the Fase 6 Session 2 guard run.
         */}
        <span className="uh-type-web-caption" style={{ color: 'var(--uh-color-text-secondary)' }}>
          {t.photo(n)}
        </span>
      </div>
    ),
  }));

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: t.overview,
      content: (
        <p
          style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
          className="uh-type-web-body-m"
        >
          {title}
        </p>
      ),
    },
    {
      id: 'itinerary',
      label: t.itinerary,
      content: <ItineraryTimeline days={days} locale={locale} />,
    },
    {
      id: 'hotel',
      label: t.hotel,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-16">
          <HotelCard
            name="Al Safwah Royale Orchid"
            city="Makkah"
            starRating={5}
            distanceToHaram={200}
            nights={5}
            locale={locale}
            variant="full"
          />
          <HotelCard
            name="Dar Al Iman InterContinental"
            city="Madinah"
            starRating={4}
            distanceToHaram={350}
            nights={4}
            locale={locale}
            variant="full"
          />
        </div>
      ),
    },
    {
      id: 'reviews',
      label: t.reviews,
      content: (
        <div className="flex flex-col gap-16">
          <Card padding="lg">
            <div className="flex flex-col gap-8">
              <p className="uh-type-web-label" style={{ margin: 0 }}>
                {t.ratingBreakdown}
              </p>
              <RatingBreakdown counts={{ 5: 96, 4: 22, 3: 7, 2: 2, 1: 1 }} locale={locale} />
            </div>
          </Card>
          <div className="flex flex-col gap-16">
            {reviews.map((review) => (
              <ReviewCard
                key={review.author.name}
                author={review.author}
                rating={review.rating}
                date={review.date}
                content={review.content}
                helpfulCount={review.helpfulCount}
                locale={locale}
              />
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div data-theme={theme} lang={lang} style={surface}>
      <div
        className={
          mobile
            ? 'flex flex-col gap-24 p-16'
            : 'grid grid-cols-[1fr_var(--uh-size-rail-lg)] gap-24 p-24'
        }
      >
        <div className="flex flex-col gap-24">
          <Carousel slides={gallerySlides} label={t.gallery} />

          <div className="flex flex-col gap-8">
            <h1 className="uh-type-web-h3" style={{ margin: 0 }}>
              {title}
            </h1>
            <Rating value={4.8} reviewCount={128} locale={locale} size="md" />
            <AgencyCard
              name={agency.name}
              licenseType={agency.licenseType}
              licenseNumber={agency.licenseNumber}
              verified={agency.verified}
              variant="compact"
              locale={locale}
            />
          </div>

          {!mobile ? null : priceBlockNoCta}

          <Tabs items={tabItems} label={t.sections} />
        </div>

        {!mobile ? (
          <aside
            style={{ position: 'sticky', top: 'var(--uh-spacing-24)', alignSelf: 'flex-start' }}
          >
            {priceBlock}
          </aside>
        ) : null}
      </div>

      {mobile ? (
        <div
          className="flex items-center justify-between gap-16 p-16"
          style={{
            position: 'fixed',
            insetInline: 0,
            bottom: 0,
            background: 'var(--uh-color-bg-surface)',
            borderBlockStart: 'var(--uh-border-width-hairline) solid var(--uh-color-border-subtle)',
          }}
        >
          <PriceDisplay amount={price.base} currency={currency} locale={locale} size="md" />
          <Button variant="primary" onClick={() => setConfirmOpen(true)}>
            {t.bookNow}
          </Button>
        </div>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={t.confirmTitle}
        description={t.confirmBody}
        variant="confirmation"
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t.confirmNo}
            </Button>
            <Button variant="primary" onClick={() => setConfirmOpen(false)}>
              {t.confirmYes}
            </Button>
          </>
        }
      />
    </div>
  );
}

const meta = {
  title: 'Patterns/PackageDetail',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Desktop1440: Story = {
  render: () => <PackageDetailScreen lang="en" currency="MYR" />,
};

export const Mobile360: Story = {
  render: () => <PackageDetailScreen lang="en" currency="MYR" mobile />,
};

export const Tablet768: Story = {
  render: () => <PackageDetailScreen lang="en" currency="MYR" />,
};

export const DarkMode1440: Story = {
  render: () => <PackageDetailScreen lang="en" currency="MYR" theme="dark" />,
};

export const LocaleMs360: Story = {
  render: () => <PackageDetailScreen lang="ms" currency="MYR" mobile />,
};

export const LocaleMs1440: Story = {
  render: () => <PackageDetailScreen lang="ms" currency="MYR" />,
};

export const LocaleId360: Story = {
  render: () => <PackageDetailScreen lang="id" currency="MYR" mobile />,
};

export const LocaleId1440: Story = {
  render: () => <PackageDetailScreen lang="id" currency="MYR" />,
};

export const CurrencyIDR360: Story = {
  render: () => <PackageDetailScreen lang="id" currency="IDR" mobile />,
};

export const CurrencyIDR1440: Story = {
  render: () => <PackageDetailScreen lang="id" currency="IDR" />,
};

export const BookingConfirmation: Story = {
  render: function ConfirmOpen() {
    return <PackageDetailScreen lang="en" currency="MYR" />;
  },
};
