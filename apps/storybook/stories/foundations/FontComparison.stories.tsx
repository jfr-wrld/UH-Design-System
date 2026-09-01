import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties } from 'react';

import { Button, Input, PackageCard, PriceBreakdown, type PackageCardLabels } from '@umrahhaji/ui';
import './FontComparison.css';

/*
 * Foundations/Font Comparison - a one-off evaluation page, not a shipped
 * pattern. Four columns, one font-family swapped per column via the
 * [data-font] rule in FontComparison.css; every other token (size, weight,
 * color, spacing) is identical across all four. See FontComparison.css for
 * why the override needs !important, and the Session 2 report for the
 * findings this page produced.
 */

type FontId = 'jakarta' | 'geist' | 'manrope' | 'hanken' | 'dongle';

const FONTS: { id: FontId; label: string }[] = [
  { id: 'jakarta', label: 'Plus Jakarta Sans (current)' },
  { id: 'geist', label: 'Geist' },
  { id: 'manrope', label: 'Manrope' },
  { id: 'hanken', label: 'Hanken Grotesk' },
  { id: 'dongle', label: 'Dongle' },
];

type Lang = 'en' | 'ms' | 'id';

interface Copy {
  title: string;
  agency: string;
  breakdownTitle: string;
  totalLabel: string;
  items: { label: string; amount: number }[];
  total: number;
  primaryCta: string;
  secondaryCta: string;
  inputLabel: string;
  inputHelper: string;
  smallLabel: string;
  packageLabels: Partial<PackageCardLabels>;
}

const COPY: Record<Lang, Copy> = {
  en: {
    title: '12-Day Umrah Family Package with Madinah Ziarah and Makkah Extension',
    agency: 'Madinah Travel & Tours',
    breakdownTitle: 'Price breakdown',
    totalLabel: 'Total',
    items: [
      { label: 'Adults x 2', amount: 19600 },
      { label: 'Visa processing', amount: 1200 },
      { label: 'Airport transfer', amount: 450 },
      { label: 'Travel insurance', amount: 380 },
    ],
    total: 21630,
    primaryCta: 'Continue to booking',
    secondaryCta: 'Save for later',
    inputLabel: 'Full name (as per passport)',
    inputHelper: 'Must match your passport exactly, including middle names.',
    smallLabel: '9-Day Umrah Package',
    packageLabels: {
      badges: { bestSeller: 'Best seller', promo: 'Promo', almostFull: 'Almost full' },
      seatsLeft: (count) => `${count} seats left`,
      verified: 'Verified agency',
    },
  },
  ms: {
    title: 'Pakej Umrah Keluarga 12 Hari dengan Ziarah Madinah dan Lanjutan Makkah',
    agency: 'Madinah Travel & Tours',
    breakdownTitle: 'Pecahan harga',
    totalLabel: 'Jumlah',
    items: [
      { label: 'Dewasa x 2', amount: 19600 },
      { label: 'Pemprosesan visa', amount: 1200 },
      { label: 'Pemindahan lapangan terbang', amount: 450 },
      { label: 'Insurans perjalanan', amount: 380 },
    ],
    total: 21630,
    primaryCta: 'Teruskan ke tempahan',
    secondaryCta: 'Simpan untuk kemudian',
    inputLabel: 'Nama penuh (mengikut pasport)',
    inputHelper: 'Perlu sepadan dengan pasport anda sepenuhnya, termasuk nama tengah.',
    smallLabel: 'Pakej Umrah 9 Hari',
    packageLabels: {
      badges: { bestSeller: 'Paling laris', promo: 'Promosi', almostFull: 'Hampir penuh' },
      seatsLeft: (count) => `${count} tempat lagi`,
      verified: 'Agensi disahkan',
    },
  },
  id: {
    title: 'Paket Umrah Keluarga 12 Hari dengan Ziarah Madinah dan Perpanjangan Makkah',
    agency: 'Madinah Travel & Tours',
    breakdownTitle: 'Rincian harga',
    totalLabel: 'Total',
    items: [
      { label: 'Dewasa x 2', amount: 19600 },
      { label: 'Pemrosesan visa', amount: 1200 },
      { label: 'Antar-jemput bandara', amount: 450 },
      { label: 'Asuransi perjalanan', amount: 380 },
    ],
    total: 21630,
    primaryCta: 'Lanjutkan ke pemesanan',
    secondaryCta: 'Simpan untuk nanti',
    inputLabel: 'Nama lengkap (sesuai paspor)',
    inputHelper: 'Harus sama persis dengan paspor Anda, termasuk nama tengah.',
    smallLabel: 'Paket Umrah 9 Hari',
    packageLabels: {
      badges: { bestSeller: 'Terlaris', promo: 'Promo', almostFull: 'Hampir penuh' },
      seatsLeft: (count) => `Tersisa ${count} kursi`,
      verified: 'Agensi terverifikasi',
    },
  },
};

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-24)',
};

function Column({ font, lang }: { font: FontId; lang: Lang }) {
  const c = COPY[lang];
  const items = [
    ...c.items.map((item, i) => ({
      label: item.label,
      amount: item.amount,
      type: (i === 0 ? 'base' : 'fee') as 'base' | 'fee',
    })),
    { label: c.totalLabel, amount: c.total, type: 'total' as const },
  ];

  return (
    <div
      data-font={font}
      className="flex flex-col gap-24"
      style={{ minWidth: '280px', maxWidth: '320px' }}
    >
      <PackageCard
        title={c.title}
        agency={{ name: c.agency, verified: true }}
        rating={4.8}
        reviewCount={128}
        departureDate={new Date(2026, 2, 15)}
        durationDays={9}
        price={9800}
        originalPrice={12500}
        currency="MYR"
        locale={lang}
        seatsRemaining={4}
        badge="promo"
        variant="grid"
        labels={c.packageLabels}
      />

      <div className="flex flex-col gap-8">
        <p className="uh-type-web-label" style={{ margin: 0 }}>
          {c.breakdownTitle}
        </p>
        <PriceBreakdown variant="inline" currency="MYR" locale={lang} items={items} />
      </div>

      <div className="flex gap-8">
        <Button variant="primary">{c.primaryCta}</Button>
        <Button variant="secondary">{c.secondaryCta}</Button>
      </div>

      <Input label={c.inputLabel} helperText={c.inputHelper} placeholder="Ahmad bin Ismail" />

      <p
        className="uh-type-web-caption"
        style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
      >
        {c.smallLabel}
      </p>
    </div>
  );
}

function ComparisonPage({ lang }: { lang: Lang }) {
  return (
    <div lang={lang} style={surface} className="flex flex-wrap gap-32">
      {FONTS.map((font) => (
        <div key={font.id} className="flex flex-col gap-16">
          <p className="uh-type-web-h6" style={{ margin: 0 }}>
            {font.label}
          </p>
          <Column font={font.id} lang={lang} />
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Font Comparison',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Five self-hosted candidate typefaces (Plus Jakarta Sans - current, Geist, ' +
          'Manrope, Hanken Grotesk, Dongle), one font-family swap per column, every other ' +
          'token identical. No CDN: all five load from @fontsource packages already in ' +
          'node_modules. Rendered in English, Malay and Indonesian to see which face holds ' +
          'up best under longer copy. Dongle ships only 300/400/700 - weight 500 and 600 ' +
          'requests fall back to the nearest declared weight (see FontComparison.css). ' +
          'Findings (tabular-numeral alignment, 12px legibility, text-width differences) ' +
          'are reported alongside this page, not on it.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const English: Story = {
  render: () => <ComparisonPage lang="en" />,
};

export const Malay: Story = {
  render: () => <ComparisonPage lang="ms" />,
};

export const Indonesian: Story = {
  render: () => <ComparisonPage lang="id" />,
};
