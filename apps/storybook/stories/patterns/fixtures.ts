/**
 * Shared content for the four Fase 6 test screens. One place, reused by
 * Homepage/SearchResults/PackageDetail/Checkout, so the same agency and the
 * same package mean the same thing everywhere they appear.
 *
 * Currency and locale are kept orthogonal on purpose (house rule): amount
 * sets are keyed by currency alone, copy sets by language alone. A story
 * picks both independently, the way a real consumer would.
 */

export type Lang = 'en' | 'ms' | 'id';
export type CurrencyCode = 'MYR' | 'IDR';

export const LOCALE_TAG: Record<Lang, string> = {
  en: 'en-MY',
  ms: 'ms-MY',
  id: 'id-ID',
};

/** MYR stays three-to-five digits; IDR the same trip runs seven-to-eight -
    the exact gap the currency-overflow pass exists to catch. */
export const PRICE: Record<CurrencyCode, { base: number; original: number; deposit: number }> = {
  MYR: { base: 12500, original: 15000, deposit: 2500 },
  IDR: { base: 45000000, original: 52000000, deposit: 9000000 },
};

export const PACKAGE_TITLE: Record<Lang, string[]> = {
  en: [
    '9-Day Umrah Package - Istanbul Transit',
    '14-Day Ramadan Umrah, 5-Star Hotel 200m from Haram',
    '12-Day Umrah Family Package with Madinah Ziarah',
    '7-Day Express Umrah - Direct Flight',
  ],
  ms: [
    'Pakej Umrah 9 Hari - Transit Istanbul',
    'Umrah Ramadan 14 Hari, Hotel 5 Bintang 200m dari Haram',
    'Pakej Umrah Keluarga 12 Hari dengan Ziarah Madinah',
    'Umrah Ekspres 7 Hari - Penerbangan Terus',
  ],
  id: [
    'Paket Umrah 9 Hari - Transit Istanbul',
    'Umrah Ramadan 14 Hari, Hotel Bintang 5 200m dari Haram',
    'Paket Umrah Keluarga 12 Hari dengan Ziarah Madinah',
    'Umrah Ekspres 7 Hari - Penerbangan Langsung',
  ],
};

export const AGENCY_NAME = [
  'Madinah Travel & Tours',
  'Baitullah Journeys',
  'Al-Safar Umrah Services',
] as const;

export const REVIEWER_NAME = [
  'Aisyah Rahman',
  'Muhammad Faiz',
  'Nur Hidayah',
  'Ahmad Zulkifli',
] as const;

export const REVIEW_CONTENT: Record<Lang, string[]> = {
  en: [
    'Alhamdulillah, everything was taken care of from the airport to the hotel. The mutawwif was patient with my parents and the hotel really was two minutes from the Haram.',
    'Good value for the price. Food could be better but the ziarah schedule was well organised and nothing felt rushed.',
    'This was our third Umrah with this agency and they never disappoint. Documents were handled early, no last-minute surprises.',
  ],
  ms: [
    'Alhamdulillah, semuanya diuruskan dari lapangan terbang hingga ke hotel. Mutawwif sangat sabar dengan ibu bapa saya dan hotel memang dua minit dari Haram.',
    'Nilai yang baik untuk harga tersebut. Makanan boleh ditambah baik tetapi jadual ziarah tersusun rapi dan tiada yang tergesa-gesa.',
    'Ini kali ketiga kami Umrah dengan agensi ini dan mereka tidak pernah mengecewakan. Dokumen diuruskan awal, tiada kejutan saat akhir.',
  ],
  id: [
    'Alhamdulillah, semuanya diurus dari bandara sampai hotel. Muthawwif sangat sabar dengan orang tua saya dan hotelnya benar-benar dua menit dari Haram.',
    'Sepadan dengan harganya. Makanan bisa lebih baik lagi tapi jadwal ziarah tersusun rapi dan tidak ada yang terburu-buru.',
    'Ini Umrah ketiga kami bersama agen ini dan mereka tidak pernah mengecewakan. Dokumen diurus lebih awal, tidak ada kejutan di menit terakhir.',
  ],
};

export interface FilterLabels {
  direct: string;
  halal: string;
  breakfast: string;
  fiveStar: string;
  nearHaram: string;
}

export const FILTER_LABEL: Record<Lang, FilterLabels> = {
  en: {
    direct: 'Direct flights only',
    halal: 'Halal certified',
    breakfast: 'Breakfast included',
    fiveStar: '5-star hotel',
    nearHaram: 'Within 500m of the Haram',
  },
  ms: {
    direct: 'Penerbangan terus sahaja',
    halal: 'Halal bertauliah',
    breakfast: 'Termasuk sarapan',
    fiveStar: 'Hotel 5 bintang',
    nearHaram: 'Dalam 500m dari Haram',
  },
  id: {
    direct: 'Hanya penerbangan langsung',
    halal: 'Halal bersertifikat',
    breakfast: 'Termasuk sarapan',
    fiveStar: 'Hotel bintang 5',
    nearHaram: 'Dalam 500m dari Haram',
  },
};

export interface PackageFixture {
  title: string;
  agency: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  departureDate: Date;
  durationDays: number;
  makkahDistance: number;
  madinahDistance: number;
  seatsRemaining?: number;
  badge?: 'bestSeller' | 'promo' | 'almostFull' | null;
}

export function buildPackages(lang: Lang): PackageFixture[] {
  const titles = PACKAGE_TITLE[lang];
  return [
    {
      title: titles[0]!,
      agency: AGENCY_NAME[0],
      verified: true,
      rating: 4.8,
      reviewCount: 128,
      departureDate: new Date(2026, 2, 15),
      durationDays: 9,
      makkahDistance: 350,
      madinahDistance: 480,
      badge: 'bestSeller',
    },
    {
      title: titles[1]!,
      agency: AGENCY_NAME[1],
      verified: true,
      rating: 4.6,
      reviewCount: 84,
      departureDate: new Date(2026, 2, 22),
      durationDays: 14,
      makkahDistance: 200,
      madinahDistance: 300,
      badge: 'promo',
    },
    {
      title: titles[2]!,
      agency: AGENCY_NAME[2],
      verified: false,
      rating: 4.3,
      reviewCount: 41,
      departureDate: new Date(2026, 3, 3),
      durationDays: 12,
      makkahDistance: 620,
      madinahDistance: 550,
      seatsRemaining: 4,
      badge: 'almostFull',
    },
    {
      title: titles[3]!,
      agency: AGENCY_NAME[0],
      verified: true,
      rating: 4.9,
      reviewCount: 203,
      departureDate: new Date(2026, 3, 10),
      durationDays: 7,
      makkahDistance: 150,
      madinahDistance: 220,
      seatsRemaining: 9,
      badge: null,
    },
  ];
}

export interface AgencyFixture {
  name: string;
  licenseType: 'TOB' | 'MOFA' | 'IATA';
  licenseNumber: string;
  rating: number;
  reviewCount: number;
  operatingSince: number;
  packageCount: number;
  verified: boolean;
  badges: string[];
}

export function buildAgencies(): AgencyFixture[] {
  return [
    {
      name: AGENCY_NAME[0],
      licenseType: 'TOB',
      licenseNumber: 'KPK/LN 8821',
      rating: 4.8,
      reviewCount: 1284,
      operatingSince: 2014,
      packageCount: 38,
      verified: true,
      badges: ['Top rated 2026', 'Halal certified'],
    },
    {
      name: AGENCY_NAME[1],
      licenseType: 'MOFA',
      licenseNumber: 'MOFA-2019-4471',
      rating: 4.6,
      reviewCount: 592,
      operatingSince: 2009,
      packageCount: 22,
      verified: true,
      badges: ['Halal certified'],
    },
    {
      name: AGENCY_NAME[2],
      licenseType: 'IATA',
      licenseNumber: 'IATA/88213045',
      rating: 4.2,
      reviewCount: 167,
      operatingSince: 2019,
      packageCount: 11,
      verified: false,
      badges: [],
    },
  ];
}

export function buildReviews(lang: Lang) {
  const content = REVIEW_CONTENT[lang];
  return [
    {
      author: { name: REVIEWER_NAME[0] },
      rating: 5,
      date: new Date(2026, 1, 10),
      content: content[0]!,
      helpfulCount: 12,
      packageName: PACKAGE_TITLE[lang][1],
    },
    {
      author: { name: REVIEWER_NAME[1] },
      rating: 4,
      date: new Date(2026, 0, 28),
      content: content[1]!,
      helpfulCount: 5,
      packageName: PACKAGE_TITLE[lang][0],
    },
    {
      author: { name: REVIEWER_NAME[2] },
      rating: 5,
      date: new Date(2025, 11, 15),
      content: content[2]!,
      helpfulCount: 21,
      packageName: PACKAGE_TITLE[lang][0],
    },
  ];
}

export const ITINERARY_TITLE: Record<Lang, string[]> = {
  en: [
    'Arrival in Madinah',
    'Ziarah in Madinah',
    'Travel to Makkah',
    'Umrah Rites',
    'Free Day',
    'Departure',
  ],
  ms: [
    'Ketibaan di Madinah',
    'Ziarah di Madinah',
    'Perjalanan ke Makkah',
    'Ibadah Umrah',
    'Hari Bebas',
    'Berlepas Pulang',
  ],
  id: [
    'Kedatangan di Madinah',
    'Ziarah di Madinah',
    'Perjalanan ke Makkah',
    'Ibadah Umrah',
    'Hari Bebas',
    'Kepulangan',
  ],
};

export function buildItinerary(lang: Lang) {
  const titles = ITINERARY_TITLE[lang];
  return [
    {
      dayNumber: 1,
      date: new Date(2026, 2, 15),
      title: titles[0]!,
      activities: [{ type: 'flight', label: 'Kuala Lumpur - Madinah' }],
    },
    {
      dayNumber: 2,
      date: new Date(2026, 2, 16),
      title: titles[1]!,
      activities: [
        { type: 'ziarah', label: 'Quba Mosque, Qiblatain Mosque' },
        { type: 'ibadah', label: 'Raudhah visit' },
      ],
    },
    {
      dayNumber: 4,
      date: new Date(2026, 2, 18),
      title: titles[2]!,
      activities: [{ type: 'flight', label: 'Bus to Makkah' }],
    },
    {
      dayNumber: 5,
      date: new Date(2026, 2, 19),
      title: titles[3]!,
      activities: [{ type: 'ibadah', label: "Tawaf and Sa'i" }],
    },
    {
      dayNumber: 7,
      date: new Date(2026, 2, 21),
      title: titles[4]!,
      activities: [{ type: 'meal', label: 'Free time, dinner at hotel' }],
    },
    {
      dayNumber: 9,
      date: new Date(2026, 2, 23),
      title: titles[5]!,
      activities: [{ type: 'flight', label: 'Jeddah - Kuala Lumpur' }],
    },
  ] as const;
}
