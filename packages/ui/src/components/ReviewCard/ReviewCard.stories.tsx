import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ReviewCard, type ReviewCardProps } from './ReviewCard.js';
import { RatingBreakdown } from './RatingBreakdown.js';
import type { ReviewCardLabels } from './labels.js';
import SCAN from '../FileUpload/fixtures/scan.svg';

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

const column: CSSProperties = { maxWidth: '480px' };

/* Two weeks before the story's "today"; the date line reads relatively. */
const RECENT = new Date(Date.now() - 14 * 86_400_000);
const OLD = new Date(2025, 9, 12);

const base: ReviewCardProps = {
  author: { name: 'Aisyah Rahman', verified: true },
  rating: 5,
  date: RECENT,
  content:
    'Alhamdulillah, everything was taken care of from the airport to the hotel. The mutawwif was patient with my parents and the hotel really was two minutes from the Haram.',
  packageName: '14-Day Ramadan Umrah Package',
  helpfulCount: 12,
};

const LONG_CONTENT =
  'Alhamdulillah, this was our first Umrah and the agency held our hands through every step. ' +
  'The visa paperwork was collected a month early, the briefing before departure covered ' +
  'everything from ihram to the du’a for entering the Haram, and the mutawwif never once ' +
  'rushed my elderly parents. The hotel was genuinely two minutes of slow walking from the ' +
  'courtyard, which mattered five times a day. Food was Malaysian kitchen at both hotels, ' +
  'and when my mother fell ill in Madinah the tour leader arranged a clinic visit within the ' +
  'hour and rearranged the ziarah so she missed nothing. The bus to Jeddah was the only ' +
  'rough patch, an hour late, but the agency kept us informed the whole time. We have ' +
  'already booked again for next Ramadan with the same team, and I would tell anyone ' +
  'taking their parents: pay for the nearer hotel, it is worth every ringgit.';

const meta = {
  title: 'Components/ReviewCard',
  component: ReviewCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A pilgrim’s words about a package. Four lines are shown, and the clamp is ' +
          'measured rather than guessed: Read more appears only when the text genuinely ' +
          'overflows, so a short review never grows a dead control.\n\n' +
          'The date is relative inside thirty days ("2 weeks ago", through ' +
          '`Intl.RelativeTimeFormat`, which also gives "yesterday" its word in every ' +
          'locale) and absolute after, because "19 weeks ago" makes a reader do arithmetic ' +
          'a date does for free. The machine-readable instant stays on the `<time>` element ' +
          'either way.\n\n' +
          '"Verified purchase" appears only when the platform can vouch the reviewer booked ' +
          'the package - in words, not an unlabelled tick.\n\n' +
          'Photo thumbnails become buttons only when `onPhotoClick` is supplied: the ' +
          'lightbox is a modal dialog, and there is no Modal primitive in the system yet, ' +
          'so opening one is the consumer’s to do - reported rather than re-invented here.',
      },
    },
  },
} satisfies Meta<typeof ReviewCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: base,
  render: (args) => (
    <Page>
      <div style={column}>
        <ReviewCard {...args} />
      </div>
    </Page>
  ),
};

export const VeryLongReview: Story = {
  args: { ...base, content: LONG_CONTENT },
  parameters: {
    docs: {
      description: {
        story:
          'A review far past four lines. The clamp holds it to four, Read more unclamps it, ' +
          'Show less folds it back; the control carries `aria-expanded` so the state is ' +
          'spoken as well as seen.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <ReviewCard {...args} />
      </div>
    </Page>
  ),
};

export const WithPhotos: Story = {
  args: base,
  render: (args) => (
    <Page>
      <div style={column}>
        <ReviewCard
          {...args}
          content={LONG_CONTENT}
          photos={[
            { src: SCAN, alt: 'The hotel room' },
            { src: SCAN, alt: 'View towards the Haram' },
            { src: SCAN },
          ]}
          onPhotoClick={() => {}}
        />
      </div>
    </Page>
  ),
};

export const Dates: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story: 'Fresh reviews read relatively; anything older than thirty days gets the date.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{ ...column, display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}
      >
        <ReviewCard {...base} date={new Date(Date.now() - 3 * 86_400_000)} />
        <ReviewCard {...base} author={{ name: 'Hafiz Omar', verified: true }} date={RECENT} />
        <ReviewCard {...base} author={{ name: 'Nur Iman' }} rating={4} date={OLD} locale="en-MY" />
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
          'No rating, no date, no photos, unverified, or nothing but a name and the words. ' +
          'Each missing piece vanishes; none leaves a hole.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{ ...column, display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}
      >
        <ReviewCard
          author={{ name: 'Fatimah Zahra' }}
          content="Sangat baik, semua urusan lancar dari awal hingga akhir."
        />
        <ReviewCard {...base} rating={undefined} helpfulCount={undefined} />
      </div>
    </Page>
  ),
};

export const Breakdown: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The aggregate, as its own component. The weighted average is computed from the ' +
          'counts - unlike money totals, a mean has exactly one right answer, and asking for ' +
          'it separately is asking for the two to disagree. Both digit columns are tabular ' +
          'and right-aligned; every row reads as a sentence.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <RatingBreakdown counts={{ 5: 96, 4: 20, 3: 8, 2: 3, 1: 1 }} />
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
        style={{ ...column, display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-24)' }}
      >
        <ReviewCard
          {...base}
          content={LONG_CONTENT}
          photos={[{ src: SCAN, alt: 'The hotel room' }]}
          onPhotoClick={() => {}}
        />
        <RatingBreakdown counts={{ 5: 96, 4: 20, 3: 8, 2: 3, 1: 1 }} />
      </div>
    </Page>
  ),
};

const MS: Partial<ReviewCardLabels> = {
  readMore: 'Baca lagi',
  showLess: 'Tunjuk kurang',
  verifiedPurchase: 'Pembelian disahkan',
  helpful: (count) => `Membantu (${count})`,
  photo: (position, total) => `Foto ${position} daripada ${total}`,
};

const ID_LABELS: Partial<ReviewCardLabels> = {
  readMore: 'Baca selengkapnya',
  showLess: 'Tampilkan lebih sedikit',
  verifiedPurchase: 'Pembelian terverifikasi',
  helpful: (count) => `Membantu (${count})`,
  photo: (position, total) => `Foto ${position} dari ${total}`,
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for ReviewCard.mdx's
 * "Contoh penggunaan" section - args-only stories so the Docs Source panel
 * reconstructs clean `<ReviewCard ... />` JSX instead of a render function
 * body. Kept separate from the stories above, which exist to prove the
 * whole surface works, not to be copied verbatim.
 */

export const Basic: Story = {
  parameters: { layout: 'centered' },
  args: {
    author: { name: 'Aisyah Rahman', verified: true },
    rating: 5,
    date: RECENT,
    content:
      'Alhamdulillah, everything was taken care of from the airport to the hotel. The mutawwif was patient with my parents.',
    packageName: '14-Day Ramadan Umrah Package',
  },
};

export const WithHelpfulVote: Story = {
  parameters: { layout: 'centered' },
  args: {
    author: { name: 'Hafiz Omar' },
    rating: 4,
    date: OLD,
    content: 'Good value overall, though the Jeddah transfer ran an hour late.',
    helpfulCount: 8,
    onHelpful: () => {},
  },
};

export const PhotoGallery: Story = {
  parameters: { layout: 'centered' },
  args: {
    author: { name: 'Nur Iman', verified: true },
    rating: 5,
    date: RECENT,
    content: 'The room really was two minutes from the Haram, exactly as promised.',
    photos: [
      { src: SCAN, alt: 'The hotel room' },
      { src: SCAN, alt: 'View towards the Haram' },
    ],
    onPhotoClick: () => {},
  },
};

export const TextExpansion: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          '"Pembelian terverifikasi" doubles the English badge, and "Baca selengkapnya" is ' +
          'twice "Read more"; both sit on wrapping rows, so they take a line rather than ' +
          'pushing anything sideways. The date words come from Intl, not the labels. ' +
          'Columns are 300px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
        {[
          { lang: 'en', labels: undefined, locale: 'en-MY', content: LONG_CONTENT },
          {
            lang: 'ms',
            labels: MS,
            locale: 'ms-MY',
            content:
              'Alhamdulillah, semuanya diuruskan dengan baik dari lapangan terbang hingga ke hotel. Mutawwif sangat sabar melayan ibu bapa saya dan hotel benar-benar dua minit dari Masjidil Haram. Kami akan tempah lagi untuk Ramadan tahun hadapan, insya-Allah, dengan pasukan yang sama.',
          },
          {
            lang: 'id',
            labels: ID_LABELS,
            locale: 'id-ID',
            content:
              'Alhamdulillah, semuanya diurus dengan baik dari bandara sampai hotel. Mutawwif sangat sabar mendampingi orang tua saya dan hotelnya benar-benar dua menit dari Masjidil Haram. Kami akan memesan lagi untuk Ramadan tahun depan, insya Allah, dengan tim yang sama.',
          },
        ].map((copy) => (
          <div key={copy.lang} lang={copy.lang} style={{ width: '300px' }}>
            <Caption>{copy.lang}</Caption>
            <ReviewCard
              {...base}
              locale={copy.locale}
              content={copy.content}
              {...(copy.labels ? { labels: copy.labels } : {})}
            />
          </div>
        ))}
      </div>
    </Page>
  ),
};
