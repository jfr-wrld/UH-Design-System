import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { PackageCard, type PackageCardProps } from './PackageCard.js';
import type { PackageCardLabels } from './labels.js';
import type { Currency } from '../../lib/money.js';
import COVER from './fixtures/cover.svg';

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

function Page({ theme = 'light', children }: { theme?: 'light' | 'dark'; children: ReactNode }) {
  return (
    <div data-theme={theme} style={surface}>
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="uh-type-web-overline" style={{ color: 'var(--uh-color-text-tertiary)' }}>
      {children}
    </div>
  );
}

/**
 * Four columns of a 1200px page, which is the tightest the grid card gets.
 *
 * `gridAutoRows: 1fr` is the consumer's half of the height contract: the card
 * is already `height: 100%`, and this is what makes every row match the tallest
 * one rather than only matching within itself. Without it the rows are each
 * internally level but differ from one another down the page.
 */
const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gridAutoRows: '1fr',
  gap: 'var(--uh-spacing-16)',
  alignItems: 'stretch',
};

const base: PackageCardProps = {
  image: [COVER],
  title: '14-Day Ramadan Umrah Package, 5-Star Hotel 200m from Haram',
  agency: { name: 'Madinah Travel & Tours', verified: true },
  rating: 4.8,
  reviewCount: 128,
  departureDate: new Date(2026, 2, 15),
  durationDays: 14,
  hotelDistance: { makkah: 200, madinah: 450 },
  price: 12500,
  originalPrice: 15000,
  currency: 'MYR',
  locale: 'en-MY',
  seatsRemaining: 4,
  badge: 'promo',
};

const meta = {
  title: 'Components/PackageCard',
  component: PackageCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A package, assembled from Avatar, Badge, Rating, PriceDisplay and Skeleton. ' +
          'Nothing here re-implements any of them, and no number is formatted by hand: the ' +
          'price goes through `PriceDisplay`, the date through `Intl.DateTimeFormat`, and ' +
          'the duration and walking distances through `Intl.NumberFormat`, which translates ' +
          'and pluralises "14 days" into "14 hari" without a table of ours.\n\n' +
          '**One tab stop for the card.** The whole card is clickable through the title ' +
          'button, whose `::after` is stretched over the card; the wishlist control sits ' +
          'above that layer. That gives a single focusable element with the package name as ' +
          'its accessible name, and no interactive element nested inside another.\n\n' +
          '**Two lines of title, always.** Clamped at two so a long name cannot make a card ' +
          'taller than its neighbours, and floored at two so a short one cannot make it ' +
          'shorter. The price is pinned to the bottom, so prices line up across a row.',
      },
    },
  },
} satisfies Meta<typeof PackageCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/* --------------------------------------------------------------- layouts */

export const Variants: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The grid card is drawn at the width four columns of a 1200px page would give it. ' +
          'The list card runs horizontally with the image down the left; the mobile card ' +
          'fills the width it is given.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <div>
          <Caption>grid</Caption>
          <div style={{ width: '282px' }}>
            <PackageCard {...base} variant="grid" />
          </div>
        </div>
        <div>
          <Caption>list</Caption>
          <div style={{ maxWidth: '720px' }}>
            <PackageCard {...base} variant="list" />
          </div>
        </div>
        <div>
          <Caption>mobile</Caption>
          <div style={{ width: '340px' }}>
            <PackageCard {...base} variant="mobile" />
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* ----------------------------------------------------------------- states */

export const States: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'Sold out puts a scrim and a label over the image and takes the package action out ' +
          'of use with `aria-disabled`, so the card keeps its tab stop and can still be read. ' +
          'The body is not dimmed: fading it would have taken the secondary text from 6.92:1 ' +
          'down to about 4.2:1, and the scrim already says what has happened. The wishlist ' +
          'stays live, because a trip that has gone is exactly the one worth watching for ' +
          'next season.',
      },
    },
  },
  render: function StateRow() {
    const [saved, setSaved] = useState(false);
    return (
      <Page>
        <div style={grid}>
          <div>
            <Caption>default</Caption>
            <PackageCard {...base} isWishlisted={saved} onWishlist={setSaved} onClick={() => {}} />
          </div>
          <div>
            <Caption>wishlisted</Caption>
            <PackageCard {...base} isWishlisted onWishlist={() => {}} />
          </div>
          <div>
            <Caption>loading</Caption>
            <PackageCard {...base} loading />
          </div>
          <div>
            <Caption>sold out</Caption>
            <PackageCard {...base} soldOut onWishlist={() => {}} />
          </div>
        </div>
      </Page>
    );
  },
};

export const Hover: Story = {
  args: base,
  parameters: {
    pseudo: { hover: true },
    docs: { description: { story: 'The hover lift, forced on so it can be seen at rest.' } },
  },
  render: () => (
    <Page>
      <div style={{ width: '282px' }}>
        <PackageCard {...base} />
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------- equal heights */

const TITLES = [
  'Umrah Express 9 Days',
  '14-Day Ramadan Umrah Package, 5-Star Hotel 200m from Haram',
  'Umrah Plus Istanbul, 16 Days',
  'Premium Ramadan Umrah with Direct Flights and Full Board Meals from Kuala Lumpur',
  'Umrah Ekonomi 12 Hari',
  'Family Umrah Package, Two Adults and Two Children, Hotel 400m from Haram',
];

export const GridOfSix: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'Six cards whose titles run from three words to twelve, in a three-column grid, ' +
          'with the rows below the title deliberately varied: some have a rating, some have ' +
          'a seat count, one has neither and no promo.\n\n' +
          'Every card is the same height and every price sits on the same line. Three things ' +
          'do that together: the title always occupies two lines whatever it holds, the ' +
          'price block is pushed to the bottom of whatever height the card settles on, and ' +
          'the card is `height: 100%` so a grid with `grid-auto-rows: 1fr` can level every ' +
          'row against the tallest rather than only levelling within each row.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ ...grid, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        {TITLES.map((title, index) => (
          <PackageCard
            {...base}
            key={title}
            title={title}
            /* Varied on purpose: the rows below the title differ from card to
               card, and the price should still line up. */
            {...(index % 2 === 0 ? {} : { rating: undefined, reviewCount: undefined })}
            {...(index % 3 === 0 ? {} : { seatsRemaining: undefined })}
            {...(index === 4 ? { badge: null, originalPrice: undefined } : {})}
          />
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually-Canvas-able examples for PackageCard.mdx's
 * "Contoh penggunaan" section - `base` is spread directly onto the
 * component in each render rather than routed through Story['args'],
 * because PackageCardProps is a discriminated union on `loading` and
 * Partial<union> collapses to the two branches' common keys, which would
 * reject `loading`/`soldOut` overrides at the Story['args'] type. Direct
 * JSX spreading is what the rest of this file already does for the same
 * reason (see States, GridOfSix, IncompleteData above).
 */

export const StandardCard: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The card at rest, grid variant, with every optional field filled in: rating, ' +
          'trip dates, hotel distance, a promo badge and a struck-through original price.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ width: '282px' }}>
        <PackageCard {...base} onClick={() => {}} onWishlist={() => {}} />
      </div>
    </Page>
  ),
};

export const LoadingSkeleton: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The `loading: true` branch of the props union. Title, agency and price become ' +
          'optional the moment `loading` is `true`, so a skeleton-loading grid only ever ' +
          'has to pass `loading` and `variant` - never invented placeholder strings for ' +
          'data that has not arrived yet. Two skeleton lines match the two-line title the ' +
          'loaded card reserves, so the grid does not jump once real data lands.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ width: '282px' }}>
        <PackageCard loading variant="grid" />
      </div>
    </Page>
  ),
};

export const SoldOutCard: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'A scrim and label cover the image and the package action gets `aria-disabled` ' +
          'instead of losing its tab stop; the wishlist control stays live, since a trip ' +
          'that has sold out is exactly the one worth watching for next season.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ width: '282px' }}>
        <PackageCard {...base} soldOut onWishlist={() => {}} />
      </div>
    </Page>
  ),
};

/* -------------------------------------------------------- incomplete data */

export const IncompleteData: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'What a half-filled agency record looks like. A missing rating draws no stars ' +
          'rather than zero of them, which would libel the agency. A missing image draws a ' +
          'flat placeholder rather than a broken one. Nothing collapses, and every card is ' +
          'still the same height as the ones beside it.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ ...grid, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        {[
          { caption: 'everything', props: {} },
          { caption: 'no rating', props: { rating: undefined, reviewCount: undefined } },
          { caption: 'no promo', props: { originalPrice: undefined } },
          { caption: 'no badge', props: { badge: null } },
          { caption: 'no seats', props: { seatsRemaining: undefined } },
          { caption: 'no image', props: { image: undefined } },
          { caption: 'agency unverified', props: { agency: { name: 'Small Tours' } } },
          {
            caption: 'title and price only',
            props: {
              image: undefined,
              rating: undefined,
              reviewCount: undefined,
              departureDate: undefined,
              durationDays: undefined,
              hotelDistance: undefined,
              originalPrice: undefined,
              seatsRemaining: undefined,
              badge: null,
              agency: { name: 'Unknown agency' },
            },
          },
        ].map((testCase) => (
          <div key={testCase.caption}>
            <Caption>{testCase.caption}</Caption>
            <PackageCard {...base} {...testCase.props} />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- text expansion */

const MS: Partial<PackageCardLabels> = {
  badges: { bestSeller: 'Paling laris', promo: 'Promosi', almostFull: 'Hampir penuh' },
  verified: 'Agensi disahkan',
  makkahDistance: (d) => `${d} dari Masjidil Haram`,
  madinahDistance: (d) => `${d} dari Masjid Nabawi`,
  seatsLeft: (count) => `${count} tempat lagi`,
  soldOut: 'Habis dijual',
  addToWishlist: (title) => `Simpan ${title}`,
  removeFromWishlist: (title) => `Buang ${title} daripada simpanan`,
  rating: (value, max, count) =>
    count === undefined ? `${value} daripada ${max}` : `${value} daripada ${max}, ${count} ulasan`,
};

const ID: Partial<PackageCardLabels> = {
  badges: { bestSeller: 'Paling laris', promo: 'Promo', almostFull: 'Hampir penuh' },
  verified: 'Agen terverifikasi',
  makkahDistance: (d) => `${d} dari Masjidil Haram`,
  madinahDistance: (d) => `${d} dari Masjid Nabawi`,
  seatsLeft: (count) => `${count} kursi tersisa`,
  soldOut: 'Habis terjual',
  addToWishlist: (title) => `Simpan ${title}`,
  removeFromWishlist: (title) => `Hapus ${title} dari simpanan`,
  rating: (value, max, count) =>
    count === undefined ? `${value} dari ${max}` : `${value} dari ${max}, ${count} ulasan`,
};

const EXPANSION = [
  {
    lang: 'en',
    locale: 'en-MY',
    title: '14-Day Ramadan Umrah Package — 5-Star Hotel, 200m from Haram',
    labels: undefined,
  },
  {
    lang: 'ms',
    locale: 'ms-MY',
    title: 'Pakej Umrah Ramadan 14 Hari — Hotel 5 Bintang, 200m dari Masjidil Haram',
    labels: MS,
  },
  {
    lang: 'id',
    locale: 'id-ID',
    title: 'Paket Umrah Ramadan 14 Hari — Hotel Bintang 5, 200m dari Masjidil Haram',
    labels: ID,
  },
] as const;

export const TextExpansion: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The same package in three languages, at the four-column grid width. The Malay and ' +
          'Indonesian names run about eighteen percent longer than the English, and all ' +
          'three have to fit inside two lines without the copy being cut.\n\n' +
          'That is why the grid card steps its title down to 14px while the list and mobile ' +
          'cards, which are wider, keep 16px. Shortening the package name was not an option: ' +
          'it is the agency’s wording, and the parts that would go first are exactly the ' +
          'parts a pilgrim is comparing on.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-32)' }}>
        <div>
          <Caption>grid, four columns</Caption>
          <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)' }}>
            {EXPANSION.map((copy) => (
              <div key={copy.lang} lang={copy.lang} style={{ width: '282px' }}>
                <Caption>{copy.lang}</Caption>
                <PackageCard
                  {...base}
                  title={copy.title}
                  locale={copy.locale}
                  {...(copy.labels ? { labels: copy.labels } : {})}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <Caption>mobile</Caption>
          <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', flexWrap: 'wrap' }}>
            {EXPANSION.map((copy) => (
              <div key={copy.lang} lang={copy.lang} style={{ width: '340px' }}>
                <Caption>{copy.lang}</Caption>
                <PackageCard
                  {...base}
                  variant="mobile"
                  title={copy.title}
                  locale={copy.locale}
                  {...(copy.labels ? { labels: copy.labels } : {})}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  ),
};

/* ----------------------------------------------------- currency expansion */

const AMOUNTS: Record<Currency, { price: number; original: number }> = {
  MYR: { price: 12500, original: 15000 },
  IDR: { price: 45000000, original: 52000000 },
  SGD: { price: 4200, original: 4900 },
};

export const CurrencyExpansion: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The same card in three currencies at the 340px mobile width. Rupiah is more than ' +
          'twice the length of ringgit, and the discounted variant asks for two of them at ' +
          'once; the price row wraps to a second line rather than pushing the card sideways.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', gap: 'var(--uh-spacing-16)', flexWrap: 'wrap' }}>
        {(Object.keys(AMOUNTS) as Currency[]).map((currency) => (
          <div key={currency} style={{ width: '340px' }}>
            <Caption>{currency}</Caption>
            <PackageCard
              {...base}
              variant="mobile"
              currency={currency}
              price={AMOUNTS[currency].price}
              originalPrice={AMOUNTS[currency].original}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};

/* ------------------------------------------------------------- dark mode */

export const DarkMode: Story = {
  args: base,
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div style={{ ...grid, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <PackageCard {...base} />
        <PackageCard {...base} isWishlisted badge="bestSeller" originalPrice={undefined} />
        <PackageCard {...base} soldOut />
      </div>
    </Page>
  ),
};
