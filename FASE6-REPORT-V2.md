# Fase 6 (Sesi 2 dari 2) — Laporan Perbaikan

Sesi ini membaca `FASE6-REPORT.md` (Sesi 1) dan memperbaiki temuan sesuai
urutan prioritas yang diminta: layout breakage dulu, lalu inkonsistensi token,
lalu props yang kurang, lalu komponen yang benar-benar dilaporkan hilang, lalu
laporan ulang komponen tak terpakai. Setelah semua perbaikan, keempat layar
dirender ulang dengan matrix pengujian yang sama, dan guard command dijalankan.

**Ringkasan cepat:** semua temuan Blocker/Major/Minor di V1 yang masuk daftar
prioritas sudah diperbaiki atau — untuk yang memang di luar wewenang sesi ini
(FilterPanel, Stack/Grid/Container, risiko bahasa campur) — dikonfirmasi masih
terbuka dan alasannya dicatat ulang. Verifikasi ulang menemukan **tiga masalah
baru yang tidak ada di V1**: satu overflow layout di Checkout/768px (akibat
pola yang sama dengan temuan rail-token V1, tapi di file yang berbeda), dan dua
pelanggaran WCAG kontras warna + satu pelanggaran landmark-unique — ketiganya
dari komponen baru yang dibangun sesi ini sendiri, ditemukan lewat
`pnpm test:a11y` (axe di browser sungguhan), bukan lewat pengujian visual
manual. Semua tiga sudah diperbaiki dan diverifikasi. Guard command bersih
kecuali satu kategori yang secara sengaja tetap terbuka (dijelaskan di bagian
Guard di bawah) — itu sendiri adalah bukti hidup untuk Temuan #1 V1
(Stack/Grid/Container) yang belum dibangun.

---

## 1. Prioritas 1 — Layout breakage & currency overflow

| Temuan V1                                                                             | Status                 | Bukti                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PackageCard` judul Indonesia/Melayu panjang tidak ter-clamp, tinggi kartu tidak rata | **DIPERBAIKI**         | Clamp dipindah dari `<h3>` pembungkus ke `.uh-package__action` (elemen yang benar-benar memegang teks) — lihat [`PackageCard.css`](packages/ui/src/components/PackageCard/PackageCard.css). Diverifikasi: 50/50 test `PackageCard` lolos; DOM-measured, 4 kartu Homepage/id-1440 sama tinggi (507px) dan Homepage/id-360 sama tinggi (491px); `.uh-package__action` konsisten 2 baris (43px) di semua kartu yang dicek. |
| Tidak ditemukan overflow ms/id di 360/1440 (V1)                                       | **DIKONFIRMASI ULANG** | Disapu ulang `scrollWidth` vs `innerWidth` di 360, 768, 1440 untuk ms/id/en × keempat layar (lihat Bagian 6) — nol overflow, kecuali satu kasus **baru** ditemukan di Checkout/768 (bukan ms/id-spesifik — lihat Bagian 6).                                                                                                                                                                                             |
| Tidak ditemukan overflow IDR (V1)                                                     | **DIKONFIRMASI ULANG** | `docW === innerW` di IDR/360 dan IDR/1440 untuk keempat layar.                                                                                                                                                                                                                                                                                                                                                          |

---

## 2. Prioritas 2 — Inkonsistensi

| Temuan V1                                                                                                             | Status                                                      | Bukti                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tidak ada token lebar untuk sidebar/rail konten (`280px`/`360px` ditebak beda-beda)                                   | **DIPERBAIKI — naik ke token**                              | `size.rail.sm = 280px`, `size.rail.lg = 360px` ditambahkan ke `packages/tokens` (light + dark identik, keduanya struktural bukan warna). `SearchResults.stories.tsx` dan `PackageDetail.stories.tsx` dipindah ke `grid-cols-[var(--uh-size-rail-sm)_1fr]` / `grid-cols-[1fr_var(--uh-size-rail-lg)]`. Contrast contracts re-verified 174/174.                                                                                                                                                        |
| `NumberStepper` 2px lebih tinggi dari kontrol 44px lain                                                               | **DIPERBAIKI**                                              | `.uh-stepper__control` dipindah dari `border` ke `outline` (dengan `outline-offset` negatif) — border menambah tinggi total karena dua tombol anak sudah 44px non-negotiable; outline menggambar tepi yang sama tanpa menambah kotak layout. Diverifikasi: `.uh-stepper__control` dan `.uh-field__control` sama-sama 44px persis via `getBoundingClientRect()`; 40/40 test `NumberStepper` lolos; sudah dicek ulang di Homepage/id-1440 (3 stepper, semua 44px) dan Checkout/1440 (1 stepper, 44px). |
| Tidak ada token lebar untuk select/field ringkas inline (`minWidth: '220px'`/`'160px'` ditebak)                       | **DIPERBAIKI — dihapus, bukan ditambal token baru**         | Severity-nya Minor dan pesan V1 sendiri bilang ini "nilai piksel lain yang ditebak" — jadi bukan kebutuhan lebar nyata yang butuh token, hanya jaga-jaga yang tidak perlu. `minWidth` inline dihapus dari kedua pemakaian `Select` (sort control desktop & mobile) di `SearchResults.stories.tsx`; ukuran alami `Select` sudah cukup, diverifikasi visual di 360 dan 1440, termasuk dengan opsi terpanjang bahasa Indonesia ("Direkomendasikan") — tidak ada overflow atau kliping.                  |
| Komponen `labels` prop butuh diisi penuh untuk lokalisasi lengkap (risiko bahasa campur, `PassengerStepper`/`Select`) | **TIDAK DIUBAH — sesuai desain, di luar wewenang sesi ini** | Ini bukan bug, ini trade-off desain (rumah tidak membangun i18n bawaan) yang sudah dicatat di V1 sebagai risiko sistemik, bukan sesuatu untuk "diperbaiki" per instruksi Prioritas 2 (Prioritas 2 secara eksplisit tentang token yang kurang, bukan pola i18n). Dikonfirmasi masih ada: Homepage/id masih menampilkan "Adults"/"Children"/"Infants" berbahasa Inggris di bawah legend "Penumpang" yang sudah diterjemahkan.                                                                          |

**Item Prioritas 2 tambahan yang ditemukan saat perbaikan** — duplikasi
`FileUpload`/`ProgressBar` (Bagian 5.1 di V1, ditandai "Blocker untuk refactor,
bukan untuk fungsi"): **DIPERBAIKI**. `FileUpload`'s hand-rolled progress
track/fill diganti dengan `<ProgressBar>` sungguhan (lihat
[`FileUpload.tsx`](packages/ui/src/components/FileUpload/FileUpload.tsx)).
Ini juga memperbaiki bug laten yang tidak dilaporkan di V1: progres yang tidak
terukur (`progress === undefined`) sebelumnya jatuh ke 0% diam-diam alih-alih
menampilkan strip indeterminate — sekarang `indeterminate={file.progress ===
undefined}` benar. Diverifikasi: seluruh 1082 test `packages/ui` lolos,
`verify-tokens.mjs` bersih, dicek visual di Storybook (`FileUpload` stories
dan `Checkout/DocumentsStep`) di kedua tema.

---

## 3. Prioritas 3 — Komponen kurang varian/props

| Temuan V1                                                                                          | Status         | Bukti                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PackageCard.loading` mewajibkan `title`/`agency`/`price`/`currency`/`locale` walau tidak dirender | **DIPERBAIKI** | `PackageCardProps` dipecah jadi discriminated union: `loading: true` membuat kelima prop itu opsional; `loading` false/absen tetap mewajibkannya (dibaca saat itu juga). Situs pemanggilan di `SearchResults.stories.tsx` (grid loading state) disederhanakan dari `<PackageCard loading title="" agency={{name:''}} price={0} currency={currency} locale={locale} variant="grid" />` jadi `<PackageCard loading variant="grid" />`. Diverifikasi: `tsc --noEmit` bersih di `packages/ui` **dan** `apps/storybook` (setelah `pnpm build` ulang paket `ui` — lihat catatan di Bagian 7 soal jebakan dist stale), skeleton grid tetap tampil benar di Storybook. |

---

## 4. Prioritas 4 — Komponen yang hilang

Dibangun **hanya** tiga yang benar-benar dilaporkan dibutuhkan layar uji:
**Tabs**, **Carousel**, **Pagination**. Tidak membangun Accordion atau
Breadcrumb (tidak dilaporkan dibutuhkan) atau FilterPanel/Stack/Grid/Container
(dilaporkan dibutuhkan tapi bukan bagian dari daftar kandidat sesi ini).

### Tabs

`packages/ui/src/components/Tabs/` — Overview/Itinerary/Hotel/Reviews di
`PackageDetail`. Automatic activation (panah kiri/kanan memindah fokus
sekaligus memilih), Home/End ke ujung, tab disabled dilewati navigasi
keyboard, hanya panel terpilih yang di-render. Daftar tab bisa discroll
horizontal — perlu, karena "Gambaran Keseluruhan" (ms) dan "Rencana
Perjalanan" (id) mendorong strip melebihi lebar 360px, dibuktikan langsung di
story TextExpansion. Token-only CSS, 9 test lolos, 4 bagian story
(Playground/Matrix/DarkMode/TextExpansion), 0 pelanggaran a11y.

### Carousel

`packages/ui/src/components/Carousel/` — galeri foto `PackageDetail` (dulunya
satu frame statis). Swipe berasal dari CSS `scroll-snap`, bukan library
sentuhan — track yang scroll horizontal dengan snap sudah jadi carousel yang
bisa di-swipe di perangkat sentuh secara gratis. Prev/Next dan dot memanggil
`scrollTo` pada track yang sama, jadi satu sumber kebenaran posisi. Tidak
loop — Prev nonaktif di slide pertama, Next di slide terakhir (galeri foto
paket adalah himpunan berurutan tetap, bukan tiket berjalan). 9 test lolos, 4
bagian story, 0 pelanggaran a11y (setelah perbaikan warna — lihat Bagian 6).

Satu bug ditemukan dan diperbaiki saat pembuatan sendiri (bukan dari V1):
posisi awal track tidak sinkron dengan `defaultIndex`/`index` terkontrol saat
mount — `active` state benar tapi track secara visual tetap di slide pertama.
Diperbaiki dengan `useLayoutEffect` yang memposisikan track secara instan saat
mount, terpisah dari transisi `smooth` untuk navigasi setelahnya. Diverifikasi
lewat screenshot: story "Started on the last slide" awalnya menampilkan
"Exterior" (salah, slide 1) sebelum perbaikan; sekarang menampilkan "Pool"
(benar, slide 4) dengan Next dinonaktifkan dan dot ke-4 aktif.

### Pagination

`packages/ui/src/components/Pagination/` — navigasi halaman `SearchResults`
(dulunya tombol "Load more"). Algoritma rentang halaman (`range.ts`, diuji
terpisah lewat 5 test termasuk satu property-based test yang mengecek 1-30
halaman × semua posisi halaman) selalu menampilkan halaman 1, halaman
terakhir, dan tetangga langsung dari halaman aktif, mengumpulkan sisanya di
belakang satu ellipsis per sisi — hanya jika total halaman memang tidak muat
tanpa itu. Selalu terkontrol (tidak ada mode uncontrolled — perubahan halaman
berarti refetch data, jadi tidak ada versi "berdiri sendiri" yang masuk akal).
Render `null` untuk satu halaman. Tombol angka halaman digambar 36px tapi
tetap membawa target sentuh 44px lewat overlay `::after` tak terlihat (trik
yang sama dengan tombol kecil `NumberStepper` dan dot `Carousel`). 13 + 38
test lolos, 4 bagian story, 0 pelanggaran a11y (setelah perbaikan landmark —
lihat Bagian 6).

Diwirekan ke `SearchResults.stories.tsx` dengan data yang realistis: 47 hasil,
9 per halaman (6 halaman) — bukan cuma 9 kartu fixture yang kalau dipakai apa
adanya hanya menghasilkan satu halaman dan tidak benar-benar menguji
Pagination. Berpindah halaman sekarang benar-benar mengubah kartu yang
ditampilkan (judul diberi akhiran `#N` berbeda per halaman), bukan sekadar
angka aktif yang berubah tanpa konten berubah.

---

## 5. Prioritas 5 — Komponen tidak terpakai

Daftar dari V1 dilaporkan ulang **tanpa perubahan** (tidak ada yang dihapus,
sesuai instruksi):

**Sama sekali tidak tersentuh** di keempat layar: `Drawer`, `Popover`,
`Tooltip`, `Spinner`, `Switch`, `OTPInput`, `CurrencyInput`, `DatePicker`
(varian tanggal tunggal).

**Dipakai tidak langsung** (lewat komposit yang memang dipakai): `Avatar`
(logo agensi), `Skeleton` (prop `loading` `PackageCard`).

**Memang tidak dimaksudkan dipakai langsung**: `Field`, `Choice`.

Tidak ada perubahan pada daftar ini karena tidak ada komponen dari daftar
Prioritas 4 (Tabs/Carousel/Pagination) yang tumpang tindih dengan daftar ini —
ketiganya benar-benar baru dibuat, bukan yang sudah ada tapi tidak terpakai.

---

## 6. Masalah BARU yang muncul akibat perbaikan

Tiga temuan, tidak ada satupun yang ada di V1 — persis pola yang diminta
diwaspadai ("perbaikan sering memunculkan masalah lain").

### 6.1 — Overflow 11px di Checkout/768px (grid rail hardcoded ketiga)

Saat menyapu ulang `scrollWidth` vs `innerWidth` di seluruh matrix, satu kasus
gagal: `Checkout` di viewport 768 (`docW: 779` vs `innerW: 768`). Akar
masalah **bukan** dari perbaikan Sesi 2 — ini instans **ketiga** dari pola
yang sama dengan Temuan rail-token V1 (`280px`/`360px` ditebak beda-beda di
`SearchResults`/`PackageDetail`): `Checkout.stories.tsx` punya
`grid-cols-[1fr_360px]` sendiri yang tidak ikut diperbaiki saat token
`size.rail.lg` dibuat, karena V1 hanya menyebut dua file itu secara eksplisit.
Ditemukan sekarang karena sesi ini menguji 768px untuk overflow secara
sistematis, sesuatu yang laporan V1 sendiri tidak eksplisit klaim sudah
dicek untuk kategori ini (V1 hanya menyebut 360/1440 di bagian layout
breakage).

Dua perbaikan digabung:

1. `360px` mentah → `var(--uh-size-rail-lg)` (token yang sama, konsisten
   dengan dua layar lain).
2. Akar penyebab overflow-nya sendiri: kolom `1fr` grid tidak menyusut di
   bawah lebar minimum kontennya (`min-width: auto` implisit CSS Grid) —
   form (`PhoneInput` + `DateRangePicker`) cukup lebar untuk mendorong kolom
   ke 395px padahal jatahnya cuma 384px. Diperbaiki dengan `min-width: 0`
   pada wrapper `<div>` di sekitar `<Card>` — pola yang sama yang sudah
   dipakai `Homepage.stories.tsx` untuk masalah serupa.

Diverifikasi: `docW === innerW === 768` setelah perbaikan; dicek ulang visual
via screenshot (form dan ringkasan harga sama-sama pas); dicek ulang 1440 dan
360 (tidak regresi).

### 6.2 — Dua pelanggaran WCAG kontras warna (ditemukan lewat `pnpm test:a11y`, bukan visual)

`pnpm test:a11y` menjalankan axe di **browser sungguhan** (Playwright),
berbeda dari test `vitest` yang menonaktifkan `color-contrast` karena jsdom
tidak punya mesin layout untuk mengukur piksel (lihat komentar di
`test/a11y.ts`). Ini pertama kalinya sesi Fase 6 menjalankan varian browser
sungguhan itu setelah membangun komponen baru — dan itu menemukan dua
pelanggaran nyata, keduanya di kode contoh (`.stories.tsx`) yang ditulis sesi
ini sendiri, bukan di komponen:

- **`PackageDetail.stories.tsx`**: keterangan foto galeri memakai
  `text-tertiary` di atas `bg-muted` — 4.34:1, gagal ambang 4.5:1 teks normal.
  Komentar token sendiri (`variables.css`) sudah menyatakan `text-tertiary`
  hanya diverifikasi kontrasnya terhadap `bg.surface` dan `bg.canvas`, tidak
  terhadap `bg.muted`. Diperbaiki ke `text-secondary` (6.92:1 terhadap
  `bg.muted`, dihitung ulang lewat `contrast-check.py`).
- **`Carousel.stories.tsx`**: empat frame warna demo memakai satu
  `text-inverse` (putih) untuk semua, padahal token `feedback-warning-solid`
  dan `feedback-success-solid` sendiri berkomentar "Pair only with on-solid"
  — pasangan gelap (`neutral-950`), bukan putih. Diperbaiki dengan memasangkan
  tiap warna latar dengan token `-on-solid` miliknya sendiri; keempat pasangan
  diverifikasi ulang satu per satu (teal+putih 5.19:1, amber+gelap 8.72:1,
  hijau+gelap 8.22:1, merah+putih 4.83:1) — semua lolos ambang teks normal.

### 6.3 — Satu pelanggaran `landmark-unique` (ditemukan lewat `pnpm test:a11y`)

Story `Matrix` untuk `Carousel` dan `Pagination` menumpuk beberapa instans
komponen di satu halaman untuk perbandingan visual — masing-masing memakai
`aria-label` yang sama (mis. "Hotel photos" × 3, "Search results" × 7). Axe
menandai ini benar: beberapa landmark `role="region"`/`<nav>` dengan nama
aksesibel identik di satu halaman melanggar `landmark-unique`. Ini murni
artefak story pembanding — satu layar nyata hanya pernah merender satu
`Carousel`/`Pagination`, jadi bukan bug komponen. Diperbaiki dengan memberi
setiap baris label unik (mis. "Hotel photos - default", "Search results -
Middle of a long run..."). Story `TextExpansion` `Carousel` (3 instans, satu
per bahasa) mendapat perbaikan yang sama.

**Kenapa ini penting dicatat**: guard command `pnpm test` yang dijalankan
sepanjang sesi (setelah tiap komponen selesai) tidak pernah menangkap
ketiganya — hanya `pnpm test:a11y` yang menjalankannya, dan itu baru
dijalankan di akhir sesi sebagai bagian dari checklist wajib. Build statis
Storybook (`storybook-static`) yang dipakai `test:a11y:ci` juga sempat basi
(dibangun sebelum Tabs/Carousel/Pagination ditambahkan) sehingga run pertama
gagal dengan error "story not found after HMR" alih-alih menjalankan
pemeriksaan sungguhan — `pnpm --filter storybook build` harus dijalankan
ulang secara eksplisit sebelum `pnpm test:a11y` berarti apa-apa.

---

## 7. Verifikasi ulang — hasil

Keempat layar dirender ulang dengan matrix yang sama seperti V1 (3 bahasa ×
360/1440, MYR/IDR di semua viewport, light/dark di 1440, viewport 768),
diverifikasi lewat `document.documentElement.scrollWidth` vs
`window.innerWidth` (bukan dilihat sekilas) di setiap kombinasi, plus
pengukuran DOM langsung untuk tinggi kartu/kontrol pada titik-titik yang
diperbaiki sesi ini. Nol overflow tersisa setelah perbaikan Bagian 6.1.

Satu jebakan proses dicatat untuk sesi berikutnya: `apps/storybook` melakukan
type-check terhadap `packages/ui/dist/index.d.ts` (bukan `src`), jadi setiap
perubahan API komponen (`PackageCard` discriminated union, props baru
`Tabs`/`Carousel`/`Pagination`) sempat terlihat gagal type-check di
`storybook` padahal `packages/ui` sendiri sudah bersih — sampai `pnpm build`
dijalankan ulang di `packages/ui`. Bukan bug, tapi menegaskan urutan yang
benar setelah mengubah komponen: `tsc` di `ui` → `pnpm build` di `ui` →
`tsc` di `storybook`.

---

## 8. Guard command

```
grep -rn "#[0-9a-fA-F]\{3,6\}" packages/ui apps/storybook --include="*.tsx"
```

**Bersih.** Nol kecocokan.

```
grep -rn "style={{" apps/storybook --include="*.tsx"
```

**Tidak bersih — dan sengaja tidak dipaksa bersih.** 31 kecocokan di keempat
layar Patterns (naik dari perkiraan sebelumnya karena perbaikan Bagian 2 dan
6.1 menambah satu di Checkout). Setiap satu diperiksa manual: semuanya
resolve ke token (`var(--uh-color-...)`, `var(--uh-size-rail-lg)`) atau
mekanika CSS murni tanpa padanan Tailwind yang tersedia di setup proyek ini
(`position: sticky`, `aspect-ratio`, `gridAutoRows`, `minWidth: 0`) — bukan
nilai piksel/warna yang ditebak. Ini persis bukti hidup untuk Temuan #1 V1:
tidak ada komponen `Stack`/`Grid`/`Container`, jadi setiap layar menulis ulang
kombinasi utility yang sama dari nol, dan beberapa kebutuhan layout dasar
(reset margin, sticky, aspect-ratio) tidak punya rumah selain inline style.
Stack/Grid/Container **bukan** bagian dari daftar kandidat Prioritas 4 sesi
ini, jadi kesenjangan ini tetap terbuka dengan sengaja, bukan diabaikan.

```
grep -rn "z-index\|box-shadow\|border-radius:" packages/ui/src
```

**Setiap kecocokan sudah diverifikasi satu per satu — semuanya `var(--uh-...)`
atau reset non-token yang sah** (`z-index: 0`/`1` untuk stacking-context lokal
di `Card`, `border-radius: 0`/`box-shadow: none` untuk menghapus gaya di
`SearchCombobox`, `box-shadow: 0 0 0 var(--uh-border-width-2) ...` untuk
cincin avatar). Grep mentah ini cocok pada nama properti, bukan nilainya, jadi
selalu menghasilkan banyak baris — pemeriksa yang sebenarnya adalah
`node scripts/verify-tokens.mjs`, yang lolos 41/41 stylesheet (naik dari 38 di
awal sesi, sesuai tiga file CSS komponen baru).

```
pnpm test
```

**Lolos.** 174/174 kontrak kontras, verifikasi numeral tabular lolos, 41/41
stylesheet `packages/ui` bersih, **1082/1082** test `packages/ui` lolos (naik
dari 1051 di awal sesi — 31 test baru dari Tabs/Carousel/Pagination/range.ts).

```
pnpm test:a11y
```

**Lolos setelah dua putaran perbaikan** (lihat Bagian 6.2 dan 6.3).
**301/301** test lolos, 59/59 test suite lolos, nol pelanggaran aksesibilitas
di seluruh Storybook — termasuk keempat layar Patterns di semua kombinasi
bahasa/tema yang dites.

---

## Ringkasan severity (setelah Sesi 2)

| Severity                      | Jumlah | Status                                                                                                                                                                                                                                                      |
| ----------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Blocker**                   | 2      | `FilterPanel` dan `Stack`/`Grid`/`Container` — **tetap terbuka**, keduanya di luar daftar kandidat Prioritas 4 sesi ini, dicatat ulang tanpa perubahan                                                                                                      |
| **Major**                     | 1      | Risiko bahasa campur lewat prop `labels` — **tetap terbuka**, sesuai desain (bukan bug token/komponen), di luar wewenang sesi perbaikan token/komponen                                                                                                      |
| **Minor**                     | 1      | `PriceBreakdown` pada IDR sangat besar — **sebagian diverifikasi ulang** (tidak ada overflow di semua viewport IDR yang dites), belum ada pengecekan wrapping visual detail di luar itu                                                                     |
| **Baru (ditemukan sesi ini)** | 3      | Overflow Checkout/768 (Bagian 6.1) — **diperbaiki**; dua pelanggaran kontras warna (Bagian 6.2) — **diperbaiki**; satu pelanggaran landmark-unique (Bagian 6.3) — **diperbaiki**                                                                            |
| **Diperbaiki sesi ini**       | 8      | PackageCard clamp, rail token, NumberStepper 44px, minWidth Select dihapus, FileUpload/ProgressBar disatukan, PackageCard.loading dilonggarkan, Tabs dibangun, Carousel dibangun, Pagination dibangun _(dihitung sebagai kelompok, bukan baris individual)_ |

Tidak ada yang dihapus dari packages/ui atau dari layar uji sepanjang sesi ini
selain kode yang secara eksplisit digantikan oleh perbaikannya sendiri (mis.
markup fallback Carousel/Tabs yang lama, tombol "Load more").
