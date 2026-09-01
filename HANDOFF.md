# UmrahHaji Design System — Handoff

## Mulai dari sini

1. Storybook: **[not yet deployed]** - CI (`.github/workflows/ci.yml`) builds
   and deploys it to GitHub Pages on every merge to `main`, but that needs
   GitHub Pages turned on once in this repo's Settings → Pages (source:
   GitHub Actions) before the first deploy succeeds. The repo now has a
   `git remote` - `main` was pushed to
   [github.com/jfr-wrld/UH-Design-System](https://github.com/jfr-wrld/UH-Design-System)
   on 1 Sep 2026, so CI will actually run from here on; Pages just hasn't
   been switched on yet. Until then: `pnpm dev` from the repo root runs it
   locally at `localhost:6006`.
2. `npm install @umrahhaji/ui @umrahhaji/tokens`
3. Ikuti **Getting Started** di Storybook.

Kalau ada yang tidak jelas dalam 15 menit pertama, itu bug dokumentasi —
laporkan, jangan cari sendiri di source code.

---

## Apa yang ADA

Semua di bawah punya halaman dokumentasi sendiri di Storybook (**Components/\***)
dan lolos axe di browser sungguhan (`pnpm test:a11y` - satu test axe per
story, jumlahnya naik seiring komponen baru; jalankan sendiri untuk angka
terkini, jangan percaya angka statis di sini). Unit test murni
(`pnpm --filter @umrahhaji/ui test`) ada di 1.401 dan hijau per 1 Sep 2026.

### Tier 1 — dokumentasi penuh (7 bagian: deskripsi, kapan pakai/jangan,

anatomi, props table, contoh penggunaan, aksesibilitas, catatan i18n)

Button, Input, Select, DateRangePicker, FileUpload, SearchCombobox, Modal,
BottomSheet, Toast, PackageCard, PriceDisplay, PriceBreakdown, **FilterPanel**

FilterPanel dibangun setelah sebelumnya dilaporkan sebagai Blocker (lihat
`FASE6-REPORT.md`) — komposisi checkbox-group + Apply/Clear yang tadinya
dirakit manual dari `Checkbox`+`Button` di setiap layar daftar sekarang jadi
satu komponen; `Patterns/SearchResults` (rail desktop maupun sheet mobile)
sudah dipindah untuk memakainya, bukan cuma didokumentasikan terpisah.

### Tier 2 — deskripsi, kapan pakai/jangan, props table, contoh, aksesibilitas

Checkbox, Radio, Switch, Badge, Avatar, NumberStepper, CurrencyInput,
PhoneInput, OTPInput, Drawer, Popover, Alert, ProgressBar, EmptyState,
ErrorState, Card, Chip, Rating, AgencyCard, HotelCard, ReviewCard,
BookingStatusTracker, ItineraryTimeline, **Tabs, Carousel, Pagination**,
**Separator, Dropdown, DateField, AspectRatio, Collapsible, List,
NativeSelect**

Tiga yang dicetak tebal pertama (Tabs/Carousel/Pagination) tidak ada di
daftar tier asli — dibangun di sesi sebelumnya (Fase 6 Sesi 2) untuk
mengisi gap nyata yang ditemukan saat menguji `PackageDetail`/
`SearchResults`, dan ditambahkan ke Tier 2 di sini karena kompleksitasnya
sebanding.

Tujuh yang dicetak tebal kedua dibangun setelah gap analysis menyeluruh
terhadap katalog TailGrids sendiri (61 komponen) dibanding yang sudah ada
di sini. Dua nama yang sempat direkomendasikan dari analisis itu ternyata
BUKAN gap sungguhan begitu dicek langsung: "AlertDialog" sudah tercakup
`Modal` (varian `destructive`/`confirmation` +
`closeOnOverlayClick={false}`/`closeOnEsc={false}`), dan "Stepper/Wizard"
sudah tercakup `BookingStatusTracker`'s `steps`/`currentStep` yang generik
— keduanya tidak dibangun ulang secara terpisah, cuma didokumentasikan
ulang di halaman yang sudah ada.

### Tier 3 — deskripsi singkat + props table

Spinner, Skeleton, Tooltip, **Stack, Grid, Container**

Tiga yang dicetak tebal juga tadinya dilaporkan sebagai Blocker (drift lebar
rail/container yang berulang di setiap layar `Patterns/*`) — kini sudah ada,
lengkap dengan token ukuran baru (`size.container.sm/md/lg/xl`) untuk
`Container`. `Divider` dan `AspectRatio` dari daftar tier asli sekarang
juga ada (sebagai `Separator` dan `AspectRatio` sendiri, di Tier 2 di
atas); `Box`, `Spacer`, `VisuallyHidden`, `Icon`, `Show` masih belum —
lihat "Apa yang TIDAK ADA".

### Halaman lain

Getting Started, Contributing, Troubleshooting, plus seluruh **Foundations**
(token layer, dirender langsung dari build) dan **Patterns** (empat layar uji
utuh: Homepage, SearchResults, PackageDetail, Checkout).

---

## Apa yang TIDAK ADA

Supaya kalian tidak menunggu sesuatu yang tidak akan datang — ini semua
dicek langsung di kode (`packages/ui/src/components/`, `src/index.ts`),
bukan diasumsikan:

- **Box, Spacer, VisuallyHidden, Icon, Show.** Lima dari tiga belas nama di
  daftar Tier 3 asli — tidak satu pun ada. `Stack`/`Grid`/`Container` (tiga
  lainnya) dan `FilterPanel` sudah dibangun; `Divider` dan `AspectRatio`
  (dua nama tersisa di daftar asli) juga sudah dibangun sejak, sebagai
  `Separator` dan `AspectRatio` sendiri — lihat "Apa yang ADA" di atas.
- **Link, Calendar, RangeCalendar.** Dicek langsung terhadap katalog
  TailGrids sendiri: `Link` bukan gap sungguhan — sudah tercakup penuh oleh
  `Button`'s `as="a"` + `variant="link"` + `leftIcon`/`rightIcon`.
  `Calendar`/`RangeCalendar` sengaja tidak dibangun - referensi TailGrids-nya
  sendiri butuh `react-aria-components` + `@internationalized/date`,
  dependency baru yang berat dan tidak konsisten dengan grid kalender
  hand-rolled yang sudah ada di dalam `DatePicker`
  (`packages/ui/src/components/DatePicker/Calendar.tsx`) tanpa dependency
  itu sama sekali.
- **ContextMenu, HoverCard, InputGroup.** Tidak ada padanan di katalog
  TailGrids sendiri (61 komponen) — genuinely niche untuk produk travel
  ini. Belum dibangun secara sengaja, bukan belum sempat.
- **`DesignSystemProvider`.** Diminta sebagai bagian dari Getting Started —
  tidak ada, dan ternyata tidak dibutuhkan: setiap komponen membaca
  langsung dari CSS custom property begitu `@umrahhaji/ui/styles.css`
  di-import, tanpa React context di antaranya. Satu-satunya provider yang
  betulan ada adalah `ToastProvider`, khusus untuk `Toast`. Halaman
  Getting Started mendokumentasikan yang sungguhan ini, bukan yang diminta.
- **Layar produk.** Design system ini hanya foundation + komponen +
  (sebagai bukti-konsep) empat layar uji di `Patterns/*` yang dirakit murni
  dari komponen yang sudah ada. Bukan produk yang siap pakai.
- **Logika bisnis, API client, state management.** Di luar cakupan sama
  sekali — tidak direncanakan, bukan sekadar belum sempat.

---

## Aturan yang tidak bisa dinegosiasi

1. **Tidak boleh hardcode warna/spacing/radius/shadow — semua dari token.**
   `pnpm --filter @umrahhaji/ui verify:tokens` menggagalkan build kalau ada
   literal di stylesheet komponen. `pnpm lint:ds` (lihat di bawah)
   menjalankan kelas pengecekan yang sama di repo yang lebih luas —
   termasuk repo app kalian sendiri, bukan cuma repo DS ini.
2. **Tidak boleh format angka/tanggal manual — pakai formatter dari DS**
   (`formatMoney`, `formatCount`, `formatDistance`, `formatDateShort`, dst.,
   semua berbasis `Intl`). `pnpm lint:ds` menandai `.toFixed(`/
   `.toLocaleString(` langsung di kode komponen sebagai pelanggaran.
3. **`currency` dan `language` adalah dua hal TERPISAH.** `currency` tidak
   pernah diturunkan dari `locale` — seorang admin berbahasa Inggris bisa
   saja sedang melihat harga dalam Rupiah, seorang jemaah berbahasa
   Indonesia bisa saja sedang melihat harga dalam Ringgit. Setiap komponen
   harga menerima keduanya sebagai prop independen. Lihat **Troubleshooting**
   → "Currency salah format" untuk gejala paling umum ketika aturan ini
   dilanggar.
4. **Setiap teks UI harus lolos uji ms/id (15-30% lebih panjang dari
   English).** Story `TextExpansion` di setiap komponen Tier 1/2 membuktikan
   ini secara langsung, bukan diasumsikan.

Guard otomatis: `pnpm lint:ds` memeriksa hex literal, `z-index`/`box-shadow`/
`border-radius` mentah, `.toFixed`/`.toLocaleString` manual, `@media` manual
(kecuali `prefers-*`, yang memang bukan breakpoint), komponen tanpa file
`.stories`, komponen interaktif dengan story yang terlalu tipis untuk
dianggap mewakili semua state, dan kontrak kontras token. Script ini
portabel — jalankan dari repo app kalian sendiri dengan
`node path/to/lint-ds.mjs --dir src`, bukan cuma dari repo DS ini.

---

## Catatan versi

Ini **v0.9.x**, bukan v1.0.0. Nilai token visual (radius, spacing, elevation)
masih mungkin disetel dan akan dirilis sebagai **MINOR**, bukan patch — lihat
`.changeset/README.md` untuk tabel semver v0.x lengkap dan alasannya.
Tampilan bisa bergeser sedikit setelah update semacam itu; itu disengaja,
bukan bug. v1.0.0 keluar setelah beberapa layar produksi jadi dan karakter
visual dikunci.

`@umrahhaji/tokens` dan `@umrahhaji/ui` versioned bersama (fixed via
Changesets) — tidak pernah ada kombinasi versi yang mismatch antara
keduanya.

**Status rilis saat ini: infrastruktur siap, belum benar-benar di-tag.**
`bundle-size-baseline.json` sudah dicatat di root repo (67 komponen,
rata-rata 2.5 kB gzip, terbesar `DateRangePicker` di 6.3 kB — lihat file
itu untuk baseline penuh), `.changeset/config.json` sudah dikonfigurasi
fixed-version, dan CI (`.github/workflows/ci.yml`) sudah lengkap. Repo ini
sekarang punya `git remote` (`origin` → GitHub, `main` ter-push per
1 Sep 2026), jadi CI akan mulai benar-benar berjalan mulai push
berikutnya — tapi GitHub Pages belum dinyalakan sekali di Settings repo
(Settings → Pages → source: GitHub Actions), jadi job `deploy-storybook`
masih akan gagal sampai itu dilakukan. Yang belum: paket
`packages/ui`/`packages/tokens` masih bertanda `"private": true` di
`package.json` masing-masing (menandakan belum pernah diputuskan untuk
dipublikasikan ke registry npm, dan ke registry mana). **Menjalankan
`changeset publish` sungguhan, membuka akses paket, dan mendorong tag
`v0.9.0` adalah keputusan yang sengaja tidak dieksekusi di sini** — itu
tindakan publikasi nyata dan tidak bisa ditarik balik dengan mudah begitu
ada yang meng-install-nya.

---

## Kalau butuh komponen baru

1. Cek dulu apakah komponen yang ada bisa diperluas dengan props — baca
   halaman **Contributing** di Storybook untuk kriteria lengkapnya sebelum
   membuka issue.
2. Kalau tidak — buka issue dengan use case, mockup/deskripsi, dan dipakai
   di layar mana.
3. **JANGAN bikin komponen lokal di app.** Kalau terpaksa sementara, beri
   komentar `// TODO: pindah ke DS` dan buka issue di saat yang sama, bukan
   nanti-nanti.

---

## Bug & kontak

Belum ada maintainer resmi yang ditentukan untuk hand-off ini, tapi repo
sekarang punya alamat:
[github.com/jfr-wrld/UH-Design-System](https://github.com/jfr-wrld/UH-Design-System)
— issue tracker-nya di situ begitu maintainer ditentukan. Sampai saat itu,
laporkan lewat jalur yang sama dengan permintaan yang menghasilkan dokumen
ini.
