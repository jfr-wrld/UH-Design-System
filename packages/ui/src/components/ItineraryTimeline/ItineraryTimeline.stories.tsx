import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { ItineraryTimeline, type ItineraryDay } from './ItineraryTimeline.js';
import type { ItineraryTimelineLabels } from './labels.js';

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

const start = new Date(2026, 2, 15);
const onDay = (offset: number) => new Date(2026, 2, 15 + offset);

/** A realistic 9-day Madinah-first route. */
const NINE_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: start,
    title: 'Arrival in Madinah',
    location: 'Madinah',
    activities: [
      { type: 'flight', label: 'KUL to MED, direct', time: '08:30' },
      { type: 'hotel', label: 'Check in at Dar Al Taqwa' },
      { type: 'ibadah', label: 'Maghrib and Isyak at Masjid Nabawi' },
    ],
  },
  {
    dayNumber: 2,
    date: onDay(1),
    title: 'Raudhah and rest',
    location: 'Madinah',
    activities: [
      { type: 'ibadah', label: 'Raudhah visit, group slot', time: '09:00' },
      { type: 'meal', label: 'Lunch at the hotel' },
    ],
  },
  {
    dayNumber: 3,
    date: onDay(2),
    title: 'Ziarah in Madinah',
    location: 'Madinah',
    activities: [
      { type: 'ziarah', label: 'Quba Mosque, Uhud and Khandaq' },
      { type: 'meal', label: 'Dinner at the hotel' },
    ],
  },
  {
    dayNumber: 4,
    date: onDay(3),
    title: 'Travel to Makkah',
    location: 'Makkah',
    activities: [
      { type: 'flight', label: 'Coach to Makkah, miqat at Dhul Hulaifah' },
      { type: 'hotel', label: 'Check in at Al Safwah Royale Orchid' },
      { type: 'ibadah', label: 'Umrah on arrival' },
    ],
  },
  {
    dayNumber: 5,
    date: onDay(4),
    title: 'Ibadah in Makkah',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Five prayers at the Haram' }],
  },
  {
    dayNumber: 6,
    date: onDay(5),
    title: 'Ziarah in Makkah',
    location: 'Makkah',
    activities: [
      { type: 'ziarah', label: 'Jabal Thur, Arafah, Muzdalifah and Mina' },
      { type: 'meal', label: 'Packed lunch on the coach' },
    ],
  },
  {
    dayNumber: 7,
    date: onDay(6),
    title: 'Second umrah, optional',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Miqat at Tan’im for those able' }],
  },
  {
    dayNumber: 8,
    date: onDay(7),
    title: 'Farewell tawaf',
    location: 'Makkah',
    activities: [
      { type: 'ibadah', label: 'Tawaf wida before departure' },
      { type: 'hotel', label: 'Check out by noon' },
    ],
  },
  {
    dayNumber: 9,
    date: onDay(8),
    title: 'Home via Jeddah',
    location: 'Jeddah',
    activities: [{ type: 'flight', label: 'JED to KUL, overnight', time: '22:40' }],
  },
];

/** The 14-day route stretches the same shape; the extra days deepen Makkah. */
const FOURTEEN_DAYS: ItineraryDay[] = [
  /* Days 1 to 7 are identical; the farewell moves to the true last days. */
  ...NINE_DAYS.slice(0, 7),
  {
    dayNumber: 8,
    date: onDay(7),
    title: 'Ibadah in Makkah',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Five prayers at the Haram' }],
  },
  {
    dayNumber: 9,
    date: onDay(8),
    title: 'Taif excursion',
    location: 'Makkah',
    activities: [{ type: 'ziarah', label: 'Taif and the Abbas Mosque' }],
  },
  {
    dayNumber: 10,
    date: onDay(9),
    title: 'Ibadah in Makkah',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Five prayers at the Haram' }],
  },
  {
    dayNumber: 11,
    date: onDay(10),
    title: 'Second umrah, optional',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Miqat at Ji’ranah' }],
  },
  {
    dayNumber: 12,
    date: onDay(11),
    title: 'Rest and ibadah',
    location: 'Makkah',
    activities: [{ type: 'ibadah', label: 'Own schedule at the Haram' }],
  },
  {
    dayNumber: 13,
    date: onDay(12),
    title: 'Farewell tawaf',
    location: 'Makkah',
    activities: [
      { type: 'ibadah', label: 'Tawaf wida before departure' },
      { type: 'hotel', label: 'Check out by noon' },
    ],
  },
  {
    dayNumber: 14,
    date: onDay(13),
    title: 'Home via Jeddah',
    location: 'Jeddah',
    activities: [{ type: 'flight', label: 'JED to KUL, overnight', time: '22:40' }],
  },
];

const meta = {
  title: 'Components/ItineraryTimeline',
  component: ItineraryTimeline,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The days of a package, down a single line. Each day is a disclosure - day one ' +
          'open by default, because "how does this start" is the question most readers ' +
          'arrive with - and several can stand open at once. With `collapsible` off there ' +
          'are no buttons at all, for print-like surfaces.\n\n' +
          'Dates run through `Intl.DateTimeFormat`; activity times arrive preformatted, ' +
          'because prayer times are lookups, not clock arithmetic. Activity icons follow ' +
          'the type - flight, hotel, ziarah, ibadah, meal - and an unknown type falls back ' +
          'to a dot and loses nothing, since the words beside the icon carry the meaning. ' +
          'The connecting line hangs off each item rather than being measured, so it holds ' +
          'whether days are folded or open.',
      },
    },
  },
} satisfies Meta<typeof ItineraryTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NineDays: Story = {
  args: { days: NINE_DAYS, locale: 'en-MY' },
  render: (args) => (
    <Page>
      <div style={column}>
        <ItineraryTimeline {...args} />
      </div>
    </Page>
  ),
};

export const FourteenDays: Story = {
  args: { days: FOURTEEN_DAYS, locale: 'en-MY' },
  parameters: {
    docs: {
      description: {
        story:
          'The long package. Fourteen folded rows stay scannable, which is what the ' +
          'collapse is for; the line runs unbroken however many days are open.',
      },
    },
  },
  render: (args) => (
    <Page>
      <div style={column}>
        <ItineraryTimeline {...args} />
      </div>
    </Page>
  ),
};

export const AllOpen: Story = {
  args: { days: NINE_DAYS, locale: 'en-MY', collapsible: false },
  render: (args) => (
    <Page>
      <div style={column}>
        <ItineraryTimeline {...args} />
      </div>
    </Page>
  ),
};

export const DarkMode: Story = {
  args: { days: NINE_DAYS.slice(0, 4), locale: 'en-MY' },
  parameters: { backgrounds: { disable: true } },
  render: (args) => (
    <Page theme="dark">
      <div style={column}>
        <ItineraryTimeline {...args} />
      </div>
    </Page>
  ),
};

/* --------------------------------------------------------- documentation
 * Three small, individually copy-pasteable examples for
 * ItineraryTimeline.mdx's "Contoh penggunaan" section - args-only stories
 * so the Docs Source panel reconstructs clean `<ItineraryTimeline ... />`
 * JSX instead of a render function body. Kept separate from the stories
 * above, which exist to prove the whole surface works, not to be copied
 * verbatim.
 */

export const SingleDayCollapsed: Story = {
  parameters: { layout: 'centered' },
  args: {
    days: [
      {
        dayNumber: 1,
        date: start,
        title: 'Arrival in Madinah',
        location: 'Madinah',
        activities: [
          { type: 'flight', label: 'KUL to MED, direct', time: '08:30' },
          { type: 'hotel', label: 'Check in at Dar Al Taqwa' },
        ],
      },
    ],
    locale: 'en-MY',
  },
};

export const MultiDayOpen: Story = {
  parameters: { layout: 'padded' },
  args: { days: NINE_DAYS.slice(0, 3), locale: 'en-MY', collapsible: false },
};

export const WithoutDates: Story = {
  parameters: { layout: 'centered' },
  args: {
    days: [
      { dayNumber: 1, title: 'Arrival' },
      { dayNumber: 2, title: 'Ziarah day' },
    ],
  },
};

const MS_LABELS: Partial<ItineraryTimelineLabels> = {
  itinerary: 'Jadual perjalanan',
  day: (n) => `Hari ${n}`,
};

const ID_LABELS: Partial<ItineraryTimelineLabels> = {
  itinerary: 'Rencana perjalanan',
  day: (n) => `Hari ${n}`,
};

const MS_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: start,
    title: 'Ketibaan di Madinah',
    location: 'Madinah',
    activities: [
      { type: 'flight', label: 'KUL ke MED, penerbangan terus', time: '08:30' },
      { type: 'hotel', label: 'Daftar masuk di Dar Al Taqwa' },
      { type: 'ibadah', label: 'Maghrib dan Isyak di Masjid Nabawi' },
    ],
  },
  {
    dayNumber: 2,
    date: onDay(1),
    title: 'Ziarah di Madinah',
    location: 'Madinah',
    activities: [{ type: 'ziarah', label: 'Masjid Quba, Uhud dan Khandaq' }],
  },
];

const ID_DAYS: ItineraryDay[] = [
  {
    dayNumber: 1,
    date: start,
    title: 'Kedatangan di Madinah',
    location: 'Madinah',
    activities: [
      { type: 'flight', label: 'CGK ke MED, penerbangan langsung', time: '08:30' },
      { type: 'hotel', label: 'Check in di Dar Al Taqwa' },
      { type: 'ibadah', label: 'Maghrib dan Isya di Masjid Nabawi' },
    ],
  },
  {
    dayNumber: 2,
    date: onDay(1),
    title: 'Ziarah di Madinah',
    location: 'Madinah',
    activities: [{ type: 'ziarah', label: 'Masjid Quba, Uhud dan Khandaq' }],
  },
];

export const TextExpansion: Story = {
  args: { days: NINE_DAYS, locale: 'en-MY' },
  parameters: {
    docs: {
      description: {
        story:
          'The same two days in the three languages. Day titles and activity labels come ' +
          'translated from the consumer; the timeline owns only "Day", the dates - "15 Mac ' +
          '2026" in Malay - and the layout, whose activity rows put the time on its own ' +
          'no-wrap edge so a longer label wraps under itself rather than pushing the time ' +
          'off the card. Columns are 320px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-32)' }}>
        <div lang="en" style={{ width: '320px' }}>
          <Caption>en</Caption>
          <ItineraryTimeline days={NINE_DAYS.slice(0, 2)} locale="en-MY" />
        </div>
        <div lang="ms" style={{ width: '320px' }}>
          <Caption>ms</Caption>
          <ItineraryTimeline days={MS_DAYS} locale="ms-MY" labels={MS_LABELS} />
        </div>
        <div lang="id" style={{ width: '320px' }}>
          <Caption>id</Caption>
          <ItineraryTimeline days={ID_DAYS} locale="id-ID" labels={ID_LABELS} />
        </div>
      </div>
    </Page>
  ),
};
