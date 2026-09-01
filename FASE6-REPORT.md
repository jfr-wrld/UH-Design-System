# Fase 6 (Sesi 1 dari 2) — Laporan Layar Uji

**Tujuan sesi ini bukan membangun produk.** Empat layar (`Patterns/Homepage`,
`Patterns/SearchResults`, `Patterns/PackageDetail`, `Patterns/Checkout`) dibangun
sebagai alat uji untuk membuktikan apakah ~50 komponen `packages/ui` yang sudah ada
bisa dirangkai jadi layar nyata tanpa pecah dan tanpa saling bertabrakan. Layarnya
sendiri ada di Storybook, tapi **laporan ini adalah deliverable utamanya.**

Aturan yang dipegang: hanya komponen yang sudah ada di `packages/ui` yang dipakai;
tidak ada komponen baru dibuat di `packages/ui` — semua yang kurang dilaporkan di
bawah; tidak ada CSS di luar token kecuali yang secara eksplisit dicatat sebagai
temuan (bukan ditambal diam-diam); layout ditulis lewat Tailwind utility class yang
resolve ke skala token yang sama (`gap-16` = `--uh-spacing-16`), karena tidak ada
komponen Stack/Grid/Container — itu sendiri adalah Temuan #1 di bawah.

Semua kombinasi wajib sudah diverifikasi: ketiga bahasa di viewport 360 dan 1440,
MYR dan IDR di semua viewport, light/dark di 1440, dan viewport 768. Verifikasi
overflow dilakukan lewat pengukuran DOM langsung (`scrollWidth` vs `clientWidth`),
bukan cuma dilihat sekilas — dan setidaknya satu klaim yang awalnya salah baca
(lihat Bagian 5) ditemukan dan dikoreksi sebelum masuk laporan ini.

---

## 1. Komponen yang HILANG

| Komponen                     | Dibutuhkan di | Untuk apa                                                       | Severity                                                                                                                                                                                |
| ---------------------------- | ------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FilterPanel**              | SearchResults | Sidebar filter desktop + varian sheet mobile                    | **Blocker** untuk SearchResults sungguhan — tanpa ini, filter harus dirakit ulang manual di setiap layar yang butuh (bukan sekali dibangun, dipakai berkali-kali)                       |
| **Tabs**                     | PackageDetail | Beralih antar section Overview / Itinerary / Hotel / Reviews    | **Major** — tanpa ini, halaman detail paket jadi satu scroll panjang tanpa navigasi cepat antar-section, yang biasanya justru paling dibutuhkan di halaman terpanjang di seluruh produk |
| **Carousel**                 | PackageDetail | Galeri foto paket (banyak foto, swipe)                          | **Major** — PackageDetail hanya bisa menampilkan satu foto placeholder statis, padahal galeri foto adalah alasan utama orang percaya sebuah paket nyata                                 |
| **Pagination**               | SearchResults | Navigasi hasil pencarian (biasanya lebih dari 9-20 paket)       | **Major** — diganti tombol "Load more" (Button biasa) yang fungsional tapi tidak memberi pilihan lompat ke halaman tertentu atau tahu total halaman                                     |
| **Stack / Grid / Container** | Keempat layar | Komponen layout terkomposisi (bukan cuma `display:flex` mentah) | **Blocker untuk konsistensi jangka panjang** — lihat penjelasan di bawah                                                                                                                |

**Soal Stack/Grid/Container:** instruksi Fase 6 poin 4 secara eksplisit bilang
"Layout pakai Stack / Grid / Container yang sudah ada" — tapi `ls
packages/ui/src/components` mengonfirmasi ketiganya **tidak ada**. Setiap scaffolding
layout di keempat layar ini ditulis lewat Tailwind utility class (`flex`,
`flex-col`, `grid-cols-*`, `gap-*`) yang setidaknya masih resolve ke token yang
sama, bukan `style={{gap: '16px'}}` mentah — tapi ini tetap bukan solusi jangka
panjang yang benar: tidak ada API bertingkat (`<Stack gap="md" direction={{base:
'column', md:'row'}}>`), tidak ada dokumentasi pola, dan setiap penulis layar baru
akan menebak ulang kombinasi class Tailwind yang sama dari nol.

---

## 2. Komponen yang KURANG varian/props

| Temuan                                                             | Severity                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tidak ada token lebar untuk **sidebar/rail konten**                | **Major**                  | SearchResults butuh sidebar filter (ditulis `grid-cols-[280px_1fr]`, nilai piksel mentah) dan PackageDetail butuh panel booking sticky (`grid-cols-[1fr_360px]`). Dua layar, dua nilai piksel yang ditebak berbeda (280 vs 360) untuk konsep yang sama — inilah bukti bahwa tokennya memang hilang, bukan sekadar kemalasan menulis token. Token terdekat yang ada (`size.calendar-panel = 320px`) salah secara semantik untuk dipakai ulang. |
| `PackageCard.loading` mewajibkan prop lain diisi                   | **Minor**                  | `title`, `agency`, `price` tetap wajib diisi walau tak dirender saat `loading=true` — friksi kecil (`title=""` dsb dipaksakan), bukan blocker, tapi API akan lebih bersih kalau semua prop selain `loading`/`variant` opsional saat loading.                                                                                                                                                                                                  |
| Tidak ada token lebar untuk **select/field ukuran ringkas inline** | **Minor**                  | Sort control dan filter-select memakai `minWidth: '220px'`/`'160px'` inline — nilai piksel lain yang ditebak, bukan token.                                                                                                                                                                                                                                                                                                                    |
| Komponen `labels` prop butuh diisi penuh untuk lokalisasi lengkap  | **Major** (lihat Bagian 3) | PassengerStepper, Select, dan kemungkinan komponen lain menyimpan copy mikro internal berbahasa Inggris secara default; disebutkan detail lengkap di Bagian 3 karena dampaknya lebih ke arah breakage bahasa.                                                                                                                                                                                                                                 |

---

## 3. Layout BREAKAGE (ms/id)

**Tidak ditemukan overflow atau wrap yang benar-benar pecah** di ms/id pada
viewport 360 maupun 1440, di keempat layar — diverifikasi lewat pengukuran
`scrollWidth`/`clientWidth` otomatis (bukan cuma dilihat), nol elemen yang
overflow secara nyata (di luar `.uh-sr-only` yang memang sengaja 1px dan lapisan
fill `Rating` yang memang sengaja lebih sempit dari lapisan dasarnya).

Yang ditemukan justru bukan pecah tata letak, tapi **risiko bahasa campur**:

| Temuan                                                            | Komponen                         | Viewport   | Bahasa | Severity  |
| ----------------------------------------------------------------- | -------------------------------- | ---------- | ------ | --------- |
| Sub-label internal tetap Inggris meski legend sudah diterjemahkan | `PassengerStepper`               | 360 & 1440 | id     | **Major** |
| Placeholder Select tidak diterjemahkan                            | `Select` (field Kewarganegaraan) | 360        | id     | **Minor** |

Detail: `PassengerStepper` (dan kemungkinan komponen lain dengan prop `labels` —
mis. pesan kosong `SearchCombobox`) menyimpan copy mikro internal ("Adults" /
"Children" / "Infants") berbahasa Inggris secara default, **kecuali** konsumen
mengoper objek `labels` lengkap per komponen per bahasa secara eksplisit. Di
Homepage/id, legend-nya sudah "Penumpang" tapi tiga baris di bawahnya
("Adults"/"Children"/"Infants") tetap Inggris — kontrol berbahasa campur secara
diam-diam. Ini **sesuai desain** (rumah tidak membangun i18n bawaan) tapi risikonya
nyata: layar yang sudah menerjemahkan copy-nya sendiri tetap bisa mengirim
komponen setengah-Inggris kalau lupa satu `labels` prop bersarang, dan tidak ada
peringatan apa pun saat itu terjadi. Ditemukan di dua tempat independen
(PassengerStepper di Homepage, placeholder Select di Checkout) — cukup untuk
disimpulkan sebagai pola sistemik, bukan kebetulan satu kali. Tidak dilakukan
penerjemahan menyeluruh ulang di semua `labels` prop lintas keempat layar (di
luar proporsi untuk sesi uji-layar), tapi polanya sudah terbukti dan dicatat di
sini.

**Saran perbaikan:** bukan mengubah komponen (i18n-bawaan memang bukan tujuannya),
tapi menambahkan catatan eksplisit di dokumentasi setiap komponen berprop
`labels`: "kalau layar Anda multibahasa, prop ini WAJIB diisi penuh, bukan
opsional" — supaya risikonya terlihat saat menulis, bukan saat QA menemukan teks
campur di produksi.

---

## 4. Currency OVERFLOW

**Tidak ditemukan overflow IDR** di viewport manapun (360/768/1440), di keempat
layar — diverifikasi lewat pengukuran DOM yang sama seperti Bagian 3, bukan
sekadar dilihat.

`Rp 45.000.000` (IDR) dibandingkan `RM 12.500` (MYR) — hampir tiga kali lebih
panjang secara karakter — tetap muat satu baris tanpa wrap maupun overflow di
`PriceDisplay`, baik di dalam `PackageCard` (grid 3-4 kolom di 1440, satu kolom di 360) maupun di `PriceBreakdown` (varian inline dan card). Ini kabar baik yang
konkret, bukan asumsi: `PriceDisplay` jelas sudah dirancang dengan `font-variant-
numeric: tabular-nums` dan tanpa lebar tetap, jadi ia benar-benar menyusut/
melebar mengikuti kontennya alih-alih memotong.

Satu catatan bukan-blocker: `PriceBreakdown` varian `card`/`inline` yang dipakai
di sidebar booking (lebar tetap 360px via token yang hilang di Bagian 1) belum
diuji dengan IDR pada nilai yang JAUH lebih besar dari `Rp 45.000.000` (mis.
paket keluarga dengan multiplier tinggi, bisa masuk ratusan juta) — pada skala
sebesar itu kemungkinan overflow belum nol, hanya belum teruji di sesi ini.
**Severity: Minor / catatan untuk sesi lanjutan**, bukan temuan aktif.

---

## 5. INKONSISTENSI antar komponen

Ini bagian paling berharga per instruksi awal — dan tepat karena itu, setiap
klaim di sini diverifikasi lewat pengukuran DOM nyata (`getBoundingClientRect`,
`getComputedStyle`), bukan tebakan visual. Satu klaim yang SALAH ("Select
tingginya cuma separuh Input") sempat muncul dari pengukuran ceroboh pertama dan
dikoreksi setelah diverifikasi ulang lebih presisi — dicatat di sini juga sebagai
bukti proses verifikasi, bukan disembunyikan.

### 5.1 — Duplikasi progress bar: FileUpload vs ProgressBar (Blocker untuk refactor, bukan untuk fungsi)

`FileUpload.tsx` punya progress bar buatan sendiri
(`.uh-upload__progress`/`.uh-upload__progress-fill`, `inlineSize:
file.progress%` ditulis manual) yang **menduplikasi persis** apa yang sekarang
dilakukan komponen `ProgressBar` — bahkan memakai token yang sama
(`--uh-size-progress-track`). `FileUpload` dibangun di Fase 4, `ProgressBar` di
Fase 5.6 — `FileUpload` tidak pernah di-refactor untuk memakainya.

Brief Checkout secara harfiah meminta "FileUpload dengan ProgressBar" — jawaban
jujurnya: `FileUpload` **sudah** menampilkan progress-nya sendiri secara
internal, jadi menempelkan `ProgressBar` terpisah di sampingnya justru akan
menampilkan **dua indikator progress untuk satu unggahan**. Layar Checkout di
sesi ini memakai progress internal `FileUpload` apa adanya, bukan memaksakan
duplikat kedua.

**Saran perbaikan:** refactor `FileUpload` agar memakai `ProgressBar` secara
internal untuk baris progress-nya — persis pola yang sudah dilakukan untuk
keluarga Card (`PackageCard`/`HotelCard`/`ReviewCard` → shell `.uh-card`
bersama) di sesi audit sebelumnya. **Severity: Major** (bukan bug yang terlihat
pengguna, tapi duplikasi kode nyata yang akan makin menyimpang seiring waktu).

### 5.2 — Tinggi kontrol: NumberStepper 2px lebih tinggi dari yang lain

Diukur berdampingan di form Checkout (DOM asli, bukan kira-kira):

| Kontrol                                                                     | Tinggi terukur |
| --------------------------------------------------------------------------- | -------------- |
| Input (`.uh-field__control`)                                                | 44px           |
| Select (`.uh-field__control` yang dipakai bersama — lihat catatan di bawah) | 44px           |
| PhoneInput trigger                                                          | 44px           |
| DateRangePicker trigger                                                     | 44px           |
| Button                                                                      | 44px           |
| **NumberStepper (`.uh-stepper__control`)**                                  | **46px**       |

Akar penyebab dikonfirmasi di `NumberStepper.css:43-50`: `.uh-stepper__control`
punya `border: var(--uh-border-width-1) solid ...` tapi **tanpa `height`
eksplisit**, jadi border 1px atas+bawah **menambah** ke tinggi konten 44px-nya,
bukan diserap ke dalam tinggi tetap seperti yang dilakukan `.uh-field__control`
milik Input. **Perbaikan:** tambahkan `height: var(--uh-size-tap-target-min);
box-sizing: border-box;` ke `.uh-stepper__control`. **Severity: Minor** (selisih
2px, tak terlihat tanpa mengukur — tapi akar penyebabnya pasti, bukan tebakan).

_Catatan proses:_ pengukuran pertama sempat salah baca `.uh-select__control`
(24px) sebagai tinggi penuh Select, seolah Select cuma separuh tinggi Input —
setelah diverifikasi ulang, `.uh-select__control` ternyata cuma div internal
(analog `.uh-field__input` milik Input yang juga 24px); tinggi sungguhannya
diambil dari `.uh-field__control` pembungkus bersama yang memang 44px, sama
seperti Input. Diperbaiki sebelum ditulis di sini — poin ini justru menunjukkan
Select **konsisten**, bukan yang tadinya dikira tidak.

### 5.3 — Radius/border/token drift (sudah diperbaiki di sesi audit sebelum ini)

Bukan temuan baru, tapi relevan disebut: audit lintas-komponen sebelum sesi ini
sudah menemukan dan memperbaiki drift primitif-vs-semantik yang serupa (24 kali
`--uh-border-width-1` dipakai langsung alih-alih `--uh-border-width-hairline`,
10+ kali radius primitif dipakai alih-alih alias semantiknya). Sesi Fase 6 ini
tidak menemukan drift token BARU dari jenis yang sama di luar dua nilai piksel
mentah pada Bagian 2 di atas — sinyal bahwa audit sebelumnya cukup efektif.

---

## 6. Komponen TIDAK TERPAKAI

Dicek dengan mencocokkan setiap nama komponen ke empat file layar (word-boundary
match), lalu **diverifikasi manual satu per satu** — pengecekan mentah pertama
sempat menandai `Toast` sebagai tidak terpakai, padahal itu keliru: `Toast` tidak
punya simbol ekspor bernama `Toast` sama sekali, hanya `ToastProvider`/
`useToast`, dan keduanya benar-benar dipakai di Checkout.

**Sama sekali tidak tersentuh, langsung maupun tidak langsung, di keempat layar:**
`Drawer`, `Popover`, `Tooltip`, `Spinner`, `Switch`, `OTPInput`, `CurrencyInput`,
dan `DatePicker` (varian tanggal tunggal — `DateRangePicker` dipakai di semua
tempat yang butuh tanggal, karena setiap alur di sini memang rentang perjalanan,
bukan tanggal tunggal).

**Dipakai secara tidak langsung** (tidak pernah diimpor langsung oleh layar,
tapi dipakai lewat komposit yang memang dipakai) — bukan benar-benar "tidak
terpakai", hanya tidak pernah jadi pilihan langsung di sesi ini:
`Avatar` (lewat logo agensi di `AgencyCard`/`PackageCard`), `Skeleton` (lewat
prop `loading` milik `PackageCard`).

**Memang tidak dimaksudkan dipakai langsung** (primitif internal di bawah
`Input`/`Checkbox`/`Radio`/`Select`) — benar jika absen dari kode level-layar:
`Field`, `Choice`.

Tidak ada yang dihapus — daftar ini murni informasi, sesuai instruksi.

---

## Ringkasan severity

| Severity    | Jumlah | Item                                                                                                                                  |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Blocker** | 1      | FilterPanel (tanpa ini, filter harus dirakit ulang tiap layar)                                                                        |
| **Major**   | 6      | Tabs, Carousel, Pagination, token lebar rail konten, duplikasi FileUpload/ProgressBar, risiko bahasa campur (labels prop)             |
| **Minor**   | 4      | Prop wajib `PackageCard.loading`, token select ringkas, tinggi NumberStepper 2px, PriceBreakdown pada IDR sangat besar (belum teruji) |

Sesi berikutnya (2 dari 2) — menunggu instruksi Anda.
