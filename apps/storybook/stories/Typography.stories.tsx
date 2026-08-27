import type { Meta, StoryObj } from '@storybook/react';
import type { CSSProperties, ReactNode } from 'react';

import tokens from '@umrahhaji/tokens/json';

/* ------------------------------------------------------------------ types */

/**
 * Style Dictionary's `json/nested` output resolves every reference, so a style
 * arrives as plain values - not `{ $value }` wrappers like the source file.
 */
interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  fontWeight: number;
}

type Scale = Record<string, TypographyStyle>;

// The generated JSON is inferred structurally by TypeScript; narrow it to the
// shape this page actually uses.
const typography = tokens.typography as unknown as Record<string, Scale>;

const scaleOf = (name: string): Array<[string, TypographyStyle]> =>
  Object.entries(typography[name] ?? {}).filter(([key]) => !key.startsWith('$'));

/* ------------------------------------------------------------- primitives */

const page: CSSProperties = {
  background: 'var(--uh-color-bg-canvas)',
  color: 'var(--uh-color-text-primary)',
  padding: 'var(--uh-spacing-32)',
};

const surface: CSSProperties = {
  background: 'var(--uh-color-bg-surface)',
  border: '1px solid var(--uh-color-border-default)',
  borderRadius: 'var(--uh-radius-lg)',
  padding: 'var(--uh-spacing-24)',
};

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 'var(--uh-spacing-48)' }}>
      <h2 className="uh-type-web-h3" style={{ marginBottom: 'var(--uh-spacing-4)' }}>
        {title}
      </h2>
      {hint ? (
        <p
          className="uh-type-web-body-s uh-measure"
          style={{ color: 'var(--uh-color-text-secondary)', marginBottom: 'var(--uh-spacing-20)' }}
        >
          {hint}
        </p>
      ) : null}
      {children}
    </section>
  );
}

function Spec({ style }: { style: TypographyStyle }) {
  return (
    <span
      className="uh-type-web-caption"
      style={{ color: 'var(--uh-color-text-tertiary)', whiteSpace: 'nowrap' }}
    >
      {style.fontSize} / {style.lineHeight} / {style.letterSpacing} / {style.fontWeight}
    </span>
  );
}

function Row({
  token,
  style,
  className,
  children,
}: {
  token: string;
  style: TypographyStyle;
  className: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(7rem, 8rem) minmax(13rem, 13rem) minmax(0, 1fr)',
        gap: 'var(--uh-spacing-20)',
        alignItems: 'baseline',
        padding: 'var(--uh-spacing-16) 0',
        borderTop: '1px solid var(--uh-color-border-subtle)',
      }}
    >
      <code
        className="uh-type-web-caption"
        style={{ color: 'var(--uh-color-text-brand)', whiteSpace: 'nowrap' }}
      >
        {token}
      </code>
      <Spec style={style} />
      <div className={className}>{children}</div>
    </div>
  );
}

/* ------------------------------------------------ real Malay sample copy */

const MALAY: Record<string, string> = {
  'display-l': 'Jemaah pertama, sepenuh hati',
  'display-m': 'Umrah tanpa rasa terburu-buru',
  'display-s': 'Musim Ramadan 1447',
  h1: 'Pakej Umrah Ramadan 14 Hari',
  h2: 'Penginapan lima minit dari Masjidil Haram',
  h3: 'Apa yang termasuk dalam pakej ini',
  h4: 'Penerbangan dan pengangkutan',
  h5: 'Jadual harian di Makkah',
  h6: 'Syarat pendaftaran jemaah',
  'body-l':
    'Setiap pakej disusun supaya jemaah dapat menumpukan perhatian pada ibadah, bukan pada urusan logistik.',
  'body-m':
    'Harga termasuk penerbangan terus dari Kuala Lumpur, visa, penginapan bertaraf lima bintang, dan mutawwif berpengalaman yang menemani jemaah sepanjang perjalanan.',
  'body-s':
    'Bilik berempat disediakan untuk jemaah berkeluarga. Bilik berdua boleh ditempah dengan bayaran tambahan.',
  caption: 'Harga bagi setiap seorang, bilik berempat',
  overline: 'MUSIM 2026',
  label: 'Tarikh berlepas',
  'button-lg': 'Tempah Sekarang',
  'button-md': 'Lihat Jadual',
  'button-sm': 'Muat Turun Brosur',
  button: 'Tempah Sekarang',
};

const fallback = 'Perjalanan yang tenang bermula dengan persiapan yang teliti';

/* ------------------------------------------------------------ Arabic copy */

const ARABIC = {
  title: 'سُورَةُ ٱلْفَاتِحَة',
  lg: 'لَبَّيْكَ ٱللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ ٱلْحَمْدَ وَٱلنِّعْمَةَ لَكَ وَٱلْمُلْكَ، لَا شَرِيكَ لَكَ',
  md: 'إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَآئِرِ ٱللَّهِ',
  sm: 'طَوَاف',
} as const;

/**
 * Full sentences for the optical comparison. The scale listing above shows
 * `sm` as a single inline term, which is what it is for - but judging optical
 * weight needs a run of text in both scripts.
 */
const PAIRING = [
  {
    latin: 'body-m',
    arabic: 'sm',
    note: '16px Latin ↔ 18px Arabic',
    ms: 'Jemaah digalakkan memperbanyak zikir dan doa sepanjang perjalanan menuju Makkah.',
    ar: 'وَأَتِمُّوا۟ ٱلْحَجَّ وَٱلْعُمْرَةَ لِلَّهِ',
  },
  {
    latin: 'body-l',
    arabic: 'md',
    note: '18px Latin ↔ 20px Arabic',
    ms: 'Sa\u2019i bermula di Bukit Safa dan berakhir di Bukit Marwah, sebanyak tujuh pusingan.',
    ar: 'إِنَّ ٱلصَّفَا وَٱلْمَرْوَةَ مِن شَعَآئِرِ ٱللَّهِ',
  },
] as const;

const ARABIC_LABEL: Record<string, string> = {
  lg: 'Talbiah — doa panjang',
  md: 'Ayat pendek',
  sm: 'Istilah dalam baris teks',
  title: 'Nama surah',
};

/* ------------------------------------------------------------- the stories */

const meta = {
  title: 'Foundations/Typography',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Three scales — web, mobile and arabic — plus numeric styles that force tabular figures. ' +
          'Sample copy is real Bahasa Melayu from the product domain, so the rhythm and word ' +
          'lengths match what ships.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const WebScale: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Skala web"
        hint="Every row is the .uh-type-web-* utility class. Specs read size / line-height / letter-spacing / weight."
      >
        <div style={surface}>
          {scaleOf('web').map(([name, style]) => (
            <Row key={name} token={name} style={style} className={`uh-type-web-${name}`}>
              {MALAY[name] ?? fallback}
            </Row>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const MobileScale: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Skala mobile"
        hint="Tighter than web, but body-m never drops below 15px — the audience is 30–60 and often reads without reading glasses."
      >
        <div style={surface}>
          {scaleOf('mobile').map(([name, style]) => (
            <Row key={name} token={name} style={style} className={`uh-type-mobile-${name}`}>
              {MALAY[name] ?? fallback}
            </Row>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const Arabic: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Skala Arab"
        hint="Noto Naskh Arabic, always direction: rtl and text-align: right. Sizes run larger than the Latin scale so the two look optically equal."
      >
        <div style={surface}>
          {scaleOf('arabic').map(([name, style]) => (
            <Row key={name} token={name} style={style} className={`uh-type-arabic-${name}`}>
              <div>
                <div>{ARABIC[name as keyof typeof ARABIC]}</div>
                <div
                  className="uh-type-web-caption"
                  style={{
                    color: 'var(--uh-color-text-tertiary)',
                    direction: 'ltr',
                    textAlign: 'left',
                    marginTop: 'var(--uh-spacing-4)',
                  }}
                >
                  {ARABIC_LABEL[name]}
                </div>
              </div>
            </Row>
          ))}
        </div>
      </Section>
    </div>
  ),
};

export const OpticalPairing: Story = {
  name: 'Malay + Arabic pairing',
  render: () => (
    <div style={page}>
      <Section
        title="Kalibrasi optik"
        hint="Plus Jakarta Sans cap-height is 0.745em; Noto Naskh Arabic's alef is 0.671em. Matching those needs the Arabic roughly 1.11× larger — which is what 16→18 and 18→20 encode. Check each pair below: neither line should look heavier or larger than the other."
      >
        <div style={{ ...surface, display: 'grid', gap: 'var(--uh-spacing-32)' }}>
          {PAIRING.map(({ latin, arabic, note, ms, ar }) => (
            <div key={latin}>
              <div
                className="uh-type-web-overline"
                style={{ color: 'var(--uh-color-text-tertiary)' }}
              >
                {note}
              </div>
              {/* Both lines share one column so the comparison is like-for-like. */}
              <div className="uh-measure" style={{ marginTop: 'var(--uh-spacing-8)' }}>
                <p className={`uh-type-web-${latin}`}>{ms}</p>
                <p
                  className={`uh-type-arabic-${arabic}`}
                  style={{ marginTop: 'var(--uh-spacing-8)' }}
                >
                  {ar}
                </p>
              </div>
            </div>
          ))}

          <div>
            <div
              className="uh-type-web-overline"
              style={{ color: 'var(--uh-color-text-tertiary)' }}
            >
              Istilah Arab di dalam ayat Melayu
            </div>
            <p
              className="uh-type-web-body-m uh-measure"
              style={{ marginTop: 'var(--uh-spacing-8)' }}
            >
              Selepas sampai di Masjidil Haram, jemaah akan memulakan{' '}
              <span className="uh-type-arabic-sm" style={{ display: 'inline' }}>
                {ARABIC.sm}
              </span>{' '}
              sebanyak tujuh pusingan mengelilingi Kaabah.
            </p>
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const TabularNumerals: Story = {
  render: () => {
    const prices = ['RM 12,500', 'RM 9,800', 'RM 24,300'];
    return (
      <div style={page}>
        <Section
          title="Angka tabular"
          hint="Plus Jakarta Sans is proportional by default — its '1' is 371 units against '0' at 732. The numeric styles switch on tnum, pinning every digit to 600 units so price columns stop wobbling."
        >
          <div style={{ ...surface, display: 'grid', gap: 'var(--uh-spacing-32)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--uh-spacing-32)',
              }}
            >
              <div>
                <div
                  className="uh-type-web-overline"
                  style={{ color: 'var(--uh-color-feedback-error-text)' }}
                >
                  Tanpa tnum — lajur bergoyang
                </div>
                <div style={{ textAlign: 'right', marginTop: 'var(--uh-spacing-8)' }}>
                  {prices.map((p) => (
                    <div
                      key={p}
                      className="uh-type-web-h4"
                      style={{ fontVariantNumeric: 'normal' }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div
                  className="uh-type-web-overline"
                  style={{ color: 'var(--uh-color-feedback-success-text)' }}
                >
                  Dengan tnum — lajur lurus
                </div>
                <div style={{ textAlign: 'right', marginTop: 'var(--uh-spacing-8)' }}>
                  {prices.map((p) => (
                    <div key={p} className="uh-type-numeric-price-md">
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div
                className="uh-type-web-overline"
                style={{ color: 'var(--uh-color-text-tertiary)' }}
              >
                Pecahan harga — .uh-type-numeric-table
              </div>
              <table
                style={{
                  width: '100%',
                  marginTop: 'var(--uh-spacing-8)',
                  borderCollapse: 'collapse',
                }}
              >
                <tbody>
                  {[
                    ['Penerbangan pergi balik', 'RM 3,200'],
                    ['Penginapan 14 malam', 'RM 7,450'],
                    ['Visa dan pengurusan', 'RM 980'],
                    ['Pengangkutan darat', 'RM 870'],
                  ].map(([label, amount]) => (
                    <tr key={label}>
                      <td
                        className="uh-type-web-body-s"
                        style={{
                          padding: 'var(--uh-spacing-8) 0',
                          borderBottom: '1px solid var(--uh-color-border-subtle)',
                        }}
                      >
                        {label}
                      </td>
                      <td
                        className="uh-type-numeric-table"
                        style={{
                          padding: 'var(--uh-spacing-8) 0',
                          textAlign: 'right',
                          borderBottom: '1px solid var(--uh-color-border-subtle)',
                        }}
                      >
                        {amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p
              className="uh-type-web-body-s uh-measure"
              style={{
                color: 'var(--uh-color-feedback-warning-text)',
                background: 'var(--uh-color-feedback-warning-bg)',
                border: '1px solid var(--uh-color-feedback-warning-border)',
                borderRadius: 'var(--uh-radius-md)',
                padding: 'var(--uh-spacing-12)',
              }}
            >
              Tailwind&rsquo;s <code>text-numeric-price-lg</code> only carries size, line-height,
              letter-spacing and weight — the <code>--text-*</code> namespace has no slot for font
              feature settings. For prices, use the <code>.uh-type-numeric-*</code> class, or add
              Tailwind&rsquo;s <code>tabular-nums</code> alongside it.
            </p>
          </div>
        </Section>
      </div>
    );
  },
};

export const LineLengthAndTruncation: Story = {
  render: () => (
    <div style={page}>
      <Section
        title="Panjang baris dan pemotongan"
        hint="Body copy reads best between 60 and 75 characters. .uh-measure caps a column at 68ch."
      >
        <div style={{ ...surface, display: 'grid', gap: 'var(--uh-spacing-32)' }}>
          <div>
            <div
              className="uh-type-web-overline"
              style={{ color: 'var(--uh-color-text-tertiary)' }}
            >
              .uh-measure — 68ch
            </div>
            <p
              className="uh-type-web-body-m uh-measure"
              style={{ marginTop: 'var(--uh-spacing-8)' }}
            >
              {MALAY['body-m']} Jemaah juga akan menerima panduan bercetak dalam Bahasa Melayu
              sebelum berlepas, lengkap dengan jadual harian dan senarai barang yang perlu dibawa.
            </p>
          </div>

          <div>
            <div
              className="uh-type-web-overline"
              style={{ color: 'var(--uh-color-text-tertiary)' }}
            >
              Nama pakej di kad — wajib .uh-clamp-2
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--uh-spacing-16)',
                marginTop: 'var(--uh-spacing-8)',
              }}
            >
              {[
                'Pakej Umrah Ramadan 14 Hari Bersama Ustaz Terpilih dari Kuala Lumpur',
                'Pakej Umrah Ekonomi 10 Hari',
                'Pakej Umrah Musim Cuti Sekolah 12 Hari Penerbangan Terus',
              ].map((name) => (
                <article
                  key={name}
                  style={{
                    border: '1px solid var(--uh-color-border-default)',
                    borderRadius: 'var(--uh-radius-md)',
                    padding: 'var(--uh-spacing-16)',
                  }}
                >
                  <h3 className="uh-type-web-h6 uh-clamp-2">{name}</h3>
                  <div
                    className="uh-type-numeric-price-sm"
                    style={{ marginTop: 'var(--uh-spacing-8)' }}
                  >
                    RM 12,500
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div
              className="uh-type-web-overline"
              style={{ color: 'var(--uh-color-text-tertiary)' }}
            >
              .uh-clamp-1 / .uh-clamp-2 / .uh-clamp-3
            </div>
            {[1, 2, 3].map((n) => (
              <p
                key={n}
                className={`uh-type-web-body-s uh-clamp-${n}`}
                style={{ maxWidth: '32rem', marginTop: 'var(--uh-spacing-8)' }}
              >
                {MALAY['body-m']} {MALAY['body-s']}
              </p>
            ))}
          </div>
        </div>
      </Section>
    </div>
  ),
};

export const MixedMalayArabic: Story = {
  render: () => (
    <div style={{ padding: 'var(--uh-spacing-32)', maxWidth: '40rem' }}>
      <Section
        title="Mixed Malay-Arabic content"
        hint="The everyday bidirectional case: an Arabic run inside a Malay sentence. The run is wrapped in <bdi lang='ar'> so neighbouring punctuation and numbers keep their places, marked lang='ar' so screen readers switch voice, and set in the Arabic scale - which sits a step larger than the Latin around it, because Naskh at Latin size reads one to two points too small."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--uh-spacing-16)' }}>
          <p className="uh-type-web-body-m" style={{ margin: 0 }}>
            Selepas solat Subuh, jemaah dinasihatkan membaca{' '}
            <bdi lang="ar" className="uh-type-arabic-md">
              اللَّهُمَّ بَارِكْ لَنَا فِي رِحْلَتِنَا
            </bdi>{' '}
            sebanyak 3 kali sebelum menaiki bas ke Masjidil Haram.
          </p>
          <p className="uh-type-web-body-m" style={{ margin: 0 }}>
            Ziarah hari ini bermula di{' '}
            <bdi lang="ar" className="uh-type-arabic-md">
              مَسْجِد قُبَاء
            </bdi>
            , masjid pertama dalam sejarah Islam, pada 08:30.
          </p>
          <blockquote
            lang="ar"
            dir="rtl"
            className="uh-type-arabic-title"
            style={{
              margin: 0,
              padding: 'var(--uh-spacing-16)',
              borderInlineStart: 'var(--uh-border-width-thick) solid var(--uh-color-border-brand)',
              background: 'var(--uh-color-bg-brand-subtle)',
              borderRadius: 'var(--uh-radius-md)',
            }}
          >
            رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
          </blockquote>
          <p
            className="uh-type-web-caption"
            style={{ margin: 0, color: 'var(--uh-color-text-secondary)' }}
          >
            A block-level Arabic quote takes dir="rtl" of its own; inline runs take bdi. Both always
            carry lang="ar".
          </p>
        </div>
      </Section>
    </div>
  ),
};
