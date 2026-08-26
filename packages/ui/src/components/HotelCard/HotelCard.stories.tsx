import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { HotelCard, type HotelCardProps } from './HotelCard.js';
import type { HotelCardLabels } from './labels.js';
import type { Amenity } from './amenities.js';
import COVER from '../PackageCard/fixtures/cover.svg';

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

const AMENITIES: Amenity[] = [
  { id: 'wifi', label: 'Free Wi-Fi' },
  { id: 'breakfast', label: 'Breakfast included' },
  { id: 'shuttle', label: 'Haram shuttle' },
  { id: 'prayer', label: 'Prayer room' },
  { id: 'elevator', label: 'Lift' },
  { id: 'laundry', label: 'Laundry service' },
  { id: 'restaurant', label: 'Restaurant' },
];

const base: HotelCardProps = {
  image: COVER,
  name: 'Al Safwah Royale Orchid',
  starRating: 5,
  city: 'Makkah',
  distanceToHaram: 200,
  nights: 5,
  amenities: AMENITIES,
};

const meta = {
  title: 'Components/HotelCard',
  component: HotelCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A hotel inside a package, with its hierarchy deliberately upside-down from a ' +
          'booking site’s habit: the distance to the mosque outranks the hotel’s own name, ' +
          'because it is the number pilgrims choose on. The distance runs through the shared ' +
          'formatter - metres below a kilometre, kilometres above, tabular either way - and ' +
          'the landmark follows the city: the Haram in Makkah, the Nabawi in Madinah.\n\n' +
          'Stars are the hotel’s classification, drawn by the `Rating` primitive with a ' +
          'sentence for a name ("5 out of 5 stars"), never a bare row of glyphs. Amenities ' +
          'are labelled icon buttons: the tooltip repeats the label, so nothing is conveyed ' +
          'by tooltip alone, and the keyboard reaches every one.',
      },
    },
  },
} satisfies Meta<typeof HotelCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Compact: Story = {
  args: base,
  render: (args) => (
    <Page>
      <div style={{ maxWidth: '420px' }}>
        <HotelCard {...args} />
      </div>
    </Page>
  ),
};

export const Full: Story = {
  args: base,
  render: (args) => (
    <Page>
      <div style={{ maxWidth: '340px' }}>
        <HotelCard {...args} variant="full" />
      </div>
    </Page>
  ),
};

export const BothCities: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The landmark follows the city. The prop is named `distanceToHaram` either way, ' +
          'but a Madinah hotel is measured from the Prophet’s Mosque and says so.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '420px',
        }}
      >
        <HotelCard {...base} />
        <HotelCard
          {...base}
          name="Dar Al Taqwa"
          city="Madinah"
          starRating={4}
          distanceToHaram={150}
          nights={3}
        />
        <HotelCard {...base} name="Grand Makkah View" distanceToHaram={1200} starRating={3} />
      </div>
    </Page>
  ),
};

export const IncompleteData: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'Half-filled hotel records: no class, no distance, no amenities, or nothing but a ' +
          'name. Missing pieces vanish rather than leaving labels with holes after them, ' +
          'and an amenity id nobody has drawn falls back to a generic mark that keeps its ' +
          'label.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: 'var(--uh-spacing-16)',
          alignItems: 'start',
        }}
      >
        {[
          { caption: 'everything', props: {} },
          { caption: 'no stars', props: { starRating: undefined } },
          { caption: 'no distance', props: { distanceToHaram: undefined } },
          { caption: 'no amenities', props: { amenities: undefined } },
          {
            caption: 'unknown amenity id',
            props: { amenities: [{ id: 'rooftop-majlis', label: 'Rooftop majlis' }] },
          },
          {
            caption: 'name and city only',
            props: {
              image: undefined,
              starRating: undefined,
              distanceToHaram: undefined,
              nights: undefined,
              amenities: undefined,
            },
          },
        ].map((testCase) => (
          <div key={testCase.caption}>
            <Caption>{testCase.caption}</Caption>
            <HotelCard {...base} {...testCase.props} />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: base,
  parameters: { backgrounds: { disable: true } },
  render: () => (
    <Page theme="dark">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
          maxWidth: '420px',
        }}
      >
        <HotelCard {...base} />
        <HotelCard
          {...base}
          variant="full"
          name="Dar Al Taqwa"
          city="Madinah"
          distanceToHaram={150}
        />
      </div>
    </Page>
  ),
};

const MS: Partial<HotelCardLabels> = {
  fromHaram: (d) => `${d} dari Masjidil Haram`,
  fromNabawi: (d) => `${d} dari Masjid Nabawi`,
  nights: (count) => `${count} malam`,
  stars: (count) => `${count} daripada 5 bintang`,
};

const ID_LABELS: Partial<HotelCardLabels> = {
  fromHaram: (d) => `${d} dari Masjidil Haram`,
  fromNabawi: (d) => `${d} dari Masjid Nabawi`,
  nights: (count) => `${count} malam`,
  stars: (count) => `${count} dari 5 bintang`,
};

export const TextExpansion: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The distance line is the one that grows: "200 m dari Masjidil Haram" is half ' +
          'again the English. It owns its row, so it wraps under the name rather than ' +
          'fighting it. Amenity labels live in tooltips and accessible names, so their ' +
          'length never moves the layout. Columns are 300px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
        {[
          { lang: 'en', labels: undefined, locale: 'en-MY' },
          { lang: 'ms', labels: MS, locale: 'ms-MY' },
          { lang: 'id', labels: ID_LABELS, locale: 'id-ID' },
        ].map((copy) => (
          <div key={copy.lang} lang={copy.lang} style={{ width: '300px' }}>
            <Caption>{copy.lang}</Caption>
            <HotelCard
              {...base}
              variant="full"
              locale={copy.locale}
              {...(copy.labels ? { labels: copy.labels } : {})}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
