# Update Energi Kosmis

Panduan harian energi kolektif dan personal berbasis kalkulasi astrologi. Dibangun murni dengan HTML, CSS, dan JavaScript — tanpa framework, tanpa backend, tanpa API eksternal.

Live: https://8xploit.github.io/EnergyUpdate  
Dibuat oleh [Kapten Nemo](https://8xploit.github.io/nemo) untuk [Kia Maheswari](https://8xploit.github.io/kia)

---

## Fitur Utama

### Energi Kolektif Hari Ini
Setiap hari menghasilkan kombinasi baru yang terdiri dari:
- **Dampak Kolektif** — 4 tema energi yang mungkin dirasakan banyak orang, lengkap dengan penjelasan makna dan tujuannya
- **Yang Dianjurkan** — 5 tindakan yang membantu menjaga kejernihan dan arah
- **Yang Dilarang** — 4 pola yang sebaiknya dihindari

Kombinasi ditentukan oleh tanggal hari ini menggunakan seed deterministik — hasilnya konsisten sepanjang hari dan otomatis berubah saat hari berganti. Jika halaman dibiarkan terbuka melewati tengah malam, data akan menyegarkan diri sendiri secara otomatis.

### Kalender Astrologi
Menampilkan peristiwa planet pada hari ini, peristiwa yang akan datang dalam tahun berjalan, dan peristiwa kosmik sepanjang bulan ini. Saat halaman dibuka, kalender mengambil feed terbaru dari [CosmyDay](https://cosmyday.com/api-docs), yang dihitung dengan Swiss Ephemeris dan dapat mencakup event hingga beberapa tahun ke depan.

### Tombol Salin Update
Menyalin seluruh rangkuman hari ini ke clipboard dalam format Markdown yang siap ditempel, mencakup:
- Judul dan tanggal
- Dampak kolektif, anjuran, dan larangan
- Informasi peristiwa astrologi
- Cap waktu penyalinan realtime beserta tautan sumber

### Energi Personal
Pengguna mengisi nama (opsional), tempat lahir, tanggal lahir, dan jam lahir untuk mendapatkan panduan energi yang dihitung khusus berdasarkan kombinasi Sun sign, Moon sign, dan Rising sign.

Kalkulasi dilakukan sepenuhnya di browser menggunakan:
- Metode Julian Day (Meeus)
- Aproksimasi posisi Bulan dari longitude ekliptika
- Local Sidereal Time untuk menghitung Ascendant
- Database koordinat kota Indonesia dan kota besar dunia

---

## Cara Kerja Data

### Energi Kolektif
Data kolektif tidak diambil dari server eksternal. Setiap hari menghasilkan hasil yang berbeda melalui mekanisme berikut:
1. Tanggal hari ini dikonversi menjadi angka seed (`YYYYMMDD`)
2. PRNG deterministik (mulberry32) menghasilkan urutan acak yang stabil untuk tanggal tersebut
3. Dari pool 16 dampak, 16 anjuran, dan 16 larangan, dipilih kombinasi harian yang unik
4. Data diperbarui otomatis setiap menit, dan direset penuh saat tanggal berganti

### Kalender Peristiwa Planet
Sumber utama adalah [CosmyDay Sky Events API](https://api.cosmyday.com/events/upcoming), sebuah feed JSON publik tanpa API key. Feed ini menyediakan event yang dihitung dengan Swiss Ephemeris, termasuk:
- Fase retrograde dan direct planet
- Pergantian musim zodiak (ingress Matahari)
- Bulan Purnama dan Bulan Baru
- Pergantian tanda planet

Situs memuat hingga 400 hari event terbaru dari feed. Jika feed sedang tidak tersedia, data cadangan lokal digunakan agar tampilan tidak kosong; label sumber di kartu kalender akan memberitahu pengguna saat kondisi ini terjadi. Karena API tersebut adalah layanan pihak ketiga, keberlanjutan pembaruan bergantung pada ketersediaan dan kebijakan layanan CosmyDay.

### Energi Personal
Hasil personal bersifat deterministik — input yang sama selalu menghasilkan output yang sama. Hasilnya tidak berubah setiap hari karena profil personal didasarkan pada data lahir, bukan tanggal hari ini.

---

## GitHub Pages

Proyek ini siap dipublikasikan sebagai situs statis di GitHub Pages:
- `index.html` berada di root dan menjadi halaman utama
- Semua aset memakai jalur relatif (`css/style.css` dan `js/app.js`)
- Tidak membutuhkan server, database, atau proses build untuk ditampilkan
- `.nojekyll` sudah tersedia agar GitHub Pages menyajikan file statis apa adanya
- `npm run build` tidak menghasilkan folder tambahan karena aplikasi ini adalah situs statis

Setelah proyek terhubung ke repositori GitHub, pilih branch utama dan folder root sebagai sumber GitHub Pages.

## Struktur File

```
index.html      Halaman utama (satu halaman, tidak ada routing)
css/style.css   Seluruh gaya visual, tema gelap/terang, responsif
js/app.js       Semua logika: kalkulasi astro, feed event, rendering, UI
.nojekyll       Menonaktifkan pemrosesan Jekyll untuk aset statis
```

---

## Ketersediaan Kota

Database koordinat mencakup kota-kota berikut:

**Indonesia:** Jakarta, Bandung, Surabaya, Medan, Semarang, Makassar, Palembang, Denpasar, Yogyakarta, Balikpapan, Banjarmasin, Padang, Pekanbaru, Manado, Pontianak, Surakarta, Malang, Samarinda, Jayapura, Kupang, Bogor, Tangerang, Bekasi, Depok, Batam, Bali

**Internasional:** Kuala Lumpur, Singapore, Tokyo, New York, London, Sydney, Paris, Dubai, Hong Kong, Seoul, Bangkok, Manila, Los Angeles, Berlin

Kota yang tidak ada di daftar tetap dapat diproses menggunakan hash deterministik berbasis nama kota, sehingga hasil tetap konsisten untuk kota yang sama.

---

## Catatan

- Semua pembacaan bersifat interpretatif dan untuk tujuan refleksi, bukan prediksi atau kepastian ilmiah.
- Data tempat lahir diproses di browser dan tidak dikirim ke server aplikasi ini.
- Kalender astrologi memerlukan koneksi internet saat halaman dibuka agar dapat mengambil feed CosmyDay terbaru.
- Sumber kalender: [CosmyDay](https://cosmyday.com), dihitung dengan Swiss Ephemeris.
- Pembacaan energi bersifat interpretatif dan bukan kepastian ilmiah.
