import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import { AgencyCard, type AgencyCardProps } from './AgencyCard.js';
import type { AgencyCardLabels } from './labels.js';
import { PackageCard } from '../PackageCard/PackageCard.js';
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

const base: AgencyCardProps = {
  name: 'Madinah Travel & Tours',
  licenseNumber: 'KPK/LN 8821',
  licenseType: 'TOB',
  rating: 4.8,
  reviewCount: 1284,
  operatingSince: 2014,
  packageCount: 38,
  verified: true,
  badges: ['Top rated 2026', 'Halal certified'],
};

const meta = {
  title: 'Components/AgencyCard',
  component: AgencyCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The trust card. Booking an Umrah package means wiring five figures to a company ' +
          'the pilgrim has never met, and this card is where the platform says the company ' +
          'is real: the licence number is set at label size in tabular figures with the ' +
          'scheme beside it, and the verified mark is a worded row rather than an unlabelled ' +
          'tick, because colour-plus-shape is not a message everyone receives.\n\n' +
          '`operatingSince` takes the year operations began, never a pre-counted "12": a ' +
          'stored count is right for one year and silently wrong for every year after it. ' +
          'The count is worked out at render time, and an impossible year - a count passed ' +
          'by mistake, a year in the future - shows nothing rather than "2,014 years in ' +
          'operation".\n\n' +
          'The card is a button only when given `onClick`. The compact form rides inside ' +
          '`PackageCard`, whose whole surface is already clickable; a nested interactive ' +
          'layer there would fight it, so the consumer leaves the handler off.',
      },
    },
  },
} satisfies Meta<typeof AgencyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: base,
  render: () => (
    <Page>
      <div style={{ maxWidth: '480px' }}>
        <AgencyCard {...base} variant="full" onClick={() => {}} />
      </div>
    </Page>
  ),
};

export const Compact: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The form that rides inside another card: no border of its own, no facts row, and ' +
          'no click handler, because the surface it sits on is already clickable.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ maxWidth: '360px' }}>
        <AgencyCard {...base} variant="compact" />
      </div>
    </Page>
  ),
};

export const BesidePackageContent: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The compact card on a package detail surface, under the card the pilgrim came ' +
          'from. This is the composition the compact form is shaped for: it has no border, ' +
          'no background and no click of its own, so it inherits whatever surface it is ' +
          'placed on.\n\n' +
          'Note what this story is not: `PackageCard` in a listing still draws its own ' +
          'lighter agency row (name and verified mark only). Putting the licence number on ' +
          'every card in a thirty-card grid would repeat it thirty times, which is the ' +
          'opposite of making it legible. Whether the listing row should become this ' +
          'component is an open product call, recorded in the component docs.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--uh-spacing-16)',
        }}
      >
        <PackageCard
          image={[COVER]}
          title="14-Day Ramadan Umrah Package, 5-Star Hotel 200m from Haram"
          agency={{ name: 'Madinah Travel & Tours', verified: true }}
          rating={4.8}
          reviewCount={128}
          price={12500}
          currency="MYR"
          locale="en-MY"
          variant="mobile"
        />
        <div
          style={{
            padding: 'var(--uh-spacing-16)',
            border: 'var(--uh-border-width-1) solid var(--uh-color-border-subtle)',
            borderRadius: 'var(--uh-radius-lg)',
            background: 'var(--uh-color-bg-surface)',
          }}
        >
          <Caption>Offered by</Caption>
          <AgencyCard {...base} variant="compact" />
        </div>
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
          'Half-filled records. A missing rating draws no stars rather than zero; a missing ' +
          'licence drops the whole line rather than printing a label with nothing after it; ' +
          'an `operatingSince` that cannot be a year - a count of 12 passed by mistake - ' +
          'shows nothing rather than two thousand years of history.',
      },
    },
  },
  render: () => (
    <Page>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--uh-spacing-16)',
          alignItems: 'start',
        }}
      >
        {[
          { caption: 'everything', props: {} },
          { caption: 'no rating', props: { rating: undefined, reviewCount: undefined } },
          { caption: 'no licence', props: { licenseNumber: undefined, licenseType: undefined } },
          { caption: 'unverified', props: { verified: false } },
          { caption: 'no badges', props: { badges: undefined } },
          { caption: 'count passed as year', props: { operatingSince: 12 } },
          {
            caption: 'name only',
            props: {
              licenseNumber: undefined,
              licenseType: undefined,
              rating: undefined,
              reviewCount: undefined,
              operatingSince: undefined,
              packageCount: undefined,
              verified: false,
              badges: undefined,
            },
          },
        ].map((testCase) => (
          <div key={testCase.caption}>
            <Caption>{testCase.caption}</Caption>
            <AgencyCard {...base} variant="full" {...testCase.props} />
          </div>
        ))}
      </div>
    </Page>
  ),
};

export const LicenseSchemes: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'TOB is Malaysia’s outbound travel licence and PPIU Indonesia’s Umrah operator ' +
          'permit; anything else is printed as given, so a Singaporean or Bruneian scheme ' +
          'needs no code change.',
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
        <AgencyCard {...base} licenseType="TOB" licenseNumber="KPK/LN 8821" />
        <AgencyCard
          {...base}
          name="Al Hijrah Wisata"
          licenseType="PPIU"
          licenseNumber="U.437/2020"
        />
        <AgencyCard
          {...base}
          name="Safar Travel Pte Ltd"
          licenseType="STB"
          licenseNumber="TA03412"
        />
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
          maxWidth: '480px',
        }}
      >
        <AgencyCard {...base} variant="full" onClick={() => {}} />
        <AgencyCard {...base} variant="compact" />
      </div>
    </Page>
  ),
};

const MS: Partial<AgencyCardLabels> = {
  verified: 'Agensi Disahkan',
  licenseNumber: 'No. Lesen',
  yearsOperating: (years) => `${years} tahun beroperasi`,
  packages: (count) => `${count} pakej`,
  rating: (value, max, count) =>
    count === undefined ? `${value} daripada ${max}` : `${value} daripada ${max}, ${count} ulasan`,
};

const ID: Partial<AgencyCardLabels> = {
  verified: 'Agen Terverifikasi',
  licenseNumber: 'No. Izin',
  yearsOperating: (years) => `${years} tahun beroperasi`,
  packages: (count) => `${count} paket`,
  rating: (value, max, count) =>
    count === undefined ? `${value} dari ${max}` : `${value} dari ${max}, ${count} ulasan`,
};

export const TextExpansion: Story = {
  args: base,
  parameters: {
    docs: {
      description: {
        story:
          'The verified mark is the string under pressure: "Agen Terverifikasi" is a third ' +
          'longer than "Verified Agency", and it shares a row with the agency name. The row ' +
          'wraps, so a long name in Malay pushes the mark to its own line rather than ' +
          'squeezing either. Columns are 300px.',
      },
    },
  },
  render: () => (
    <Page>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--uh-spacing-24)' }}>
        {[
          { lang: 'en', labels: undefined, locale: 'en' },
          { lang: 'ms', labels: MS, locale: 'ms-MY' },
          { lang: 'id', labels: ID, locale: 'id-ID' },
        ].map((copy) => (
          <div key={copy.lang} lang={copy.lang} style={{ width: '300px' }}>
            <Caption>{copy.lang}</Caption>
            <AgencyCard
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
