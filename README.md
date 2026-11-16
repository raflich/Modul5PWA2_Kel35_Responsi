# TentCraft — Toko Alat Tenda & Outdoor Equipment PWA

Aplikasi **Progressive Web App (PWA)** bertema **Penjualan & Persewaan Alat Tenda Outdoor** yang dibuat untuk memenuhi tugas **Responsi Modul 5 Praktikum Pemrograman Perangkat Bergerak (PPB)** Departemen Teknik Komputer, Universitas Diponegoro.

---

## Identitas Praktikan

| Informasi | Keterangan |
| :--- | :--- |
| **Nama Mahasiswa** | **Muhammad Rafli Buchori** |
| **NIM** | **21120124130095** |
| **Kelompok** | **Kelompok 35** |
| **Program Studi** | Teknik Komputer |
| **Fakultas / Universitas** | Fakultas Teknik / Universitas Diponegoro |
| **Mata Kuliah** | Praktikum Pemrograman Perangkat Bergerak (PPB) |
| **Modul** | Modul 5 — Progressive Web App (PWA) II |

---

## Pemenuhan Syarat Tugas

Aplikasi ini telah memenuhi seluruh syarat yang diwajibkan:

1. **Teknologi yang Sama dengan Modul Praktikum**:
   - **React 19** (`react`, `react-dom`)
   - **Vite 8** (`vite`, `@vitejs/plugin-react`)
   - **vite-plugin-pwa** (Workbox, autoUpdate service worker, offline runtime caching)
   - **Tailwind CSS 4 & Custom Modular CSS** (Dark rugged outdoor theme)
   - **Lucide React** (Vector icons)
   - **Axios & SWR Query Caching Architecture**

2. **Minimal 3 Halaman Navigasi (Tersedia 5 Halaman Lengkap)**:
   - 🏕️ **Halaman 1: Katalog Produk (`Catalog`)**: Menampilkan daftar alat tenda outdoor, pencarian dinamis, filter kategori (Tenda Dome, Tunnel & Family, Flysheet & Tarp, Pasak, Aksesoris), sorting (harga, nama, rating, stok), pagination, dan modal detail produk.
   - ⚙️ **Halaman 2: Kelola Inventaris (`Manage` - Halaman CRUD Fungsional)**: Dashboard manajemen produk untuk Create, Read, Update, Delete, filter tabel, statistik valuasi stok, dan reset bawaan.
   - 🛒 **Halaman 3: Favorit & Reservasi (`Favorites`)**: Menyimpan item tenda yang disukai secara offline, estimasi biaya sewa harian (15%), dan simulasi checkout reservasi.
   - 👤 **Halaman 4: Profil Mahasiswa (`Profile`)**: Menampilkan identitas praktikan (**Nama, NIM, Kelompok, Prodi, Undip**), fitur copy NIM, tombol edit profil, pengelolaan draft formulir offline, serta pembersihan cache kueri.
   - 🧭 **Halaman 5: Panduan & Info Toko (`Guide`)**: Panduan memilih tenda (peringkat waterproof PU mm, bahan tiang frame, anti-kondensasi), FAQ, lokasi outlet fisik di Tembalang, serta jam layanan.

3. **Halaman Profil Berisi Nama, NIM, dan Kelompok**:
   - Memiliki kartu profil terverifikasi yang secara default memuat:
     - **Nama**: Muhammad Rafli Buchori
     - **NIM**: 21120124130095
     - **Kelompok**: Kelompok 35
   - Dilengkapi modal **Edit Profil** untuk mengubah data profil secara dinamis di `localStorage`.

4. **CRUD Fungsional Penuh**:
   - **Create (Tambah)**: Mendaftarkan tenda baru dengan validasi input (nama, kategori, kapasitas, harga, stok, waterproof rating, bobot, deskripsi, pemilihan ikon visual, spesifikasi dinamis, dan poin fitur).
   - **Read (Lihat)**: Menampilkan data dalam bentuk grid kartu interaktif, tabel inventaris, dan modal detail spesifikasi lengkap.
   - **Update (Ubah)**: Formulir pengeditan data produk yang telah ada dengan auto-fill dan preview langsung.
   - **Delete (Hapus)**: Menghapus data produk dengan modal konfirmasi keselamatan untuk mencegah salah klik.
   - **Auto-Save Drafts**: Perubahan formulir yang belum disimpan tersimpan otomatis di perangkat lokal agar tidak hilang saat pengguna berpindah halaman atau koneksi terputus.

5. **Fungsionalitas PWA (Dapat Di-install & Bekerja Offline)**:
   - **Web App Manifest** (`manifest.webmanifest`): Dikonfigurasi dengan nama aplikasi, short name, warna tema (`#0f172a`), start URL, ikon multi-resolusi (192x192 PNG, 512x512 PNG, SVG maskable), dan App Shortcuts.
   - **Service Worker Precaching**: 36 aset web (HTML, JS, CSS, SVG, Webmanifest) di-precache ke Cache Storage perangkat.
   - **Workbox Runtime Caching**: Strategi `NetworkFirst` untuk kueri data dan `CacheFirst` untuk seluruh aset gambar/vektor.
   - **Offline Banner & Install Prompt**: Terpasang komponen `PWABadge` yang menangkap event `beforeinstallprompt` (menampilkan tombol install aplikasi ke layar utama) serta event `offline`/`online` (menampilkan notifikasi banner mode offline).

6. **Siap Di-deploy ke Vercel**:
   - Berkas `vercel.json` telah dikonfigurasi untuk Single Page Application (SPA) rewrites dan header caching service worker.
   - Build produksi (`npm run build`) berjalan bersih tanpa error dengan code-splitting optimal.

---

## Struktur Berkas Proyek

```
Responsi/
├── index.html                        # HTML Shell aplikasi & injeksi PWA
├── vite.config.js                    # Konfigurasi Vite & vite-plugin-pwa (Workbox)
├── vercel.json                       # Konfigurasi deployment Vercel (SPA routing & SW headers)
├── package.json                      # Dependensi & skrip npm
├── public/
│   ├── icon.svg                      # Logo vektor tenda outdoor
│   ├── icon-192.png                  # PWA Icon 192x192
│   ├── icon-512.png                  # PWA Icon 512x512
│   └── tents/                        # Ilustrasi vektor produk alat tenda
│       ├── dome.svg                  # Tenda Dome
│       ├── tunnel.svg                # Tenda Tunnel
│       ├── family.svg                # Tenda Villa Keluarga
│       ├── flysheet.svg              # Flysheet & Kanopi
│       ├── pegs.svg                  # Pasak & Palu
│       └── accessories.svg           # Lampu LED & Matras
└── src/
    ├── main.jsx                      # Entry point React
    ├── App.jsx                       # App shell, tab router, deep-link sync
    ├── index.css                     # Design tokens & core CSS
    ├── App.css                       # Stylesheet komponen & halaman
    ├── components/
    │   ├── Header.jsx                # Sticky navbar, logo & mobile drawer
    │   ├── Footer.jsx                # Footer identitas praktikan & navigasi
    │   ├── PWABadge.jsx              # Banner install PWA & status offline
    │   ├── common/
    │   │   ├── AdvancedFilter.jsx    # Search bar, category pills, sort select
    │   │   ├── FavoriteButton.jsx    # Tombol toggle favorit (heart)
    │   │   ├── Pagination.jsx        # Kontrol navigasi halaman
    │   │   └── ShareButton.jsx       # Web Share API & copy link
    │   ├── modals/
    │   │   └── ConfirmModal.jsx      # Modal konfirmasi aksi & delete
    │   └── tent/
    │       ├── TentCard.jsx          # Kartu produk tenda
    │       └── TentDetailModal.jsx   # Modal detail spesifikasi teknis
    ├── config/
    │   └── api.js                    # Konfigurasi Axios & interseptor
    ├── data/
    │   └── tents.js                  # Katalog awal bawaan 8 produk tenda
    ├── hooks/
    │   ├── useFavorites.js           # Hook reaktif daftar favorit
    │   └── useTents.js               # Hook query data tenda (SWR cache)
    ├── pages/
    │   ├── Catalog.jsx               # Halaman 1: Katalog Alat Tenda
    │   ├── ManagePage.jsx            # Halaman 2: Kelola CRUD & Inventaris
    │   ├── FavoritesPage.jsx         # Halaman 3: Favorit & Reservasi Sewa
    │   ├── ProfilePage.jsx           # Halaman 4: Profil Mahasiswa Praktikan
    │   ├── GuidePage.jsx             # Halaman 5: Panduan Tenda & Kontak
    │   └── ProductFormPage.jsx       # Formulir Create & Edit Produk
    ├── services/
    │   ├── favoriteService.js        # Service favorit & event listener
    │   ├── tentService.js            # Service CRUD inventaris tenda
    │   └── userService.js            # Service identitas profil mahasiswa
    └── utils/
        ├── draftStorage.js           # Auto-save formulir offline
        ├── helpers.js                # Format rupiah, filter, sorting, UUID
        └── queryCache.js             # Dual-tier SWR query cache
```

---

## Menjalankan Proyek Secara Lokal

### 1. Prasyarat
- Pastikan telah terpasang **Node.js** (versi 18 atau lebih baru).

### 2. Membuka Folder Proyek
```bash
cd "D:\Documents\Semester 5\Praktikum PPB\MOD5\Responsi"
```

### 3. Menginstal Dependensi (Jika belum)
```bash
npm install
```

### 4. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Buka peramban pada alamat `http://localhost:5173`.

### 5. Melakukan Build Produksi
```bash
npm run build
```
Hasil build akan terbuat di folder `dist/` lengkap dengan berkas `manifest.webmanifest`, `sw.js`, dan modul ter-bundle.

### 6. Menjalankan Preview Build Produksi
```bash
npm run preview
```

---

## Panduan Deployment ke Vercel

Proyek ini telah dilengkapi dengan berkas `vercel.json` dan struktur yang 100% kompatibel dengan platform **Vercel**.

### Cara 1: Menggunakan Vercel CLI (Direkomendasikan)
1. Buka terminal pada folder `Responsi`:
   ```bash
   cd "D:\Documents\Semester 5\Praktikum PPB\MOD5\Responsi"
   ```
2. Jalankan perintah deploy Vercel:
   ```bash
   npx vercel
   ```
3. Ikuti langkah yang muncul pada terminal:
   - *Set up and deploy?* Ketik `y` lalu Enter.
   - *Which scope do you want to deploy to?* Pilih akun Vercel Anda.
   - *Link to existing project?* Ketik `n` (buat proyek baru).
   - *What's your project's name?* Ketik `tentcraft-pwa` (atau nama pilihan Anda).
   - *In which directory is your code located?* Tekan Enter (`./`).
   - *Want to modify settings?* Ketik `n`.
4. Untuk deploy ke **Production**:
   ```bash
   npx vercel --prod
   ```
5. Salin link domain Vercel yang dihasilkan (misal: `https://tentcraft-pwa.vercel.app`) untuk dikumpulkan pada link praktikum.

---

### Cara 2: Melalui Dashboard Vercel (GitHub Integration)
1. Buat repositori baru di akun **GitHub** Anda (misalnya dengan nama `tentcraft-pwa`).
2. Hubungkan folder lokal `Responsi` ke repositori GitHub:
   ```bash
   git remote add origin https://github.com/<username-github>/tentcraft-pwa.git
   git branch -M main
   git push -u origin main
   ```
3. Buka dashboard [vercel.com](https://vercel.com) dan login.
4. Klik tombol **"Add New..."** -> **"Project"**.
5. Pilih repositori `tentcraft-pwa` yang baru di-push.
6. Pada pengaturan project:
   - **Framework Preset**: Pilih `Vite`.
   - **Root Directory**: `./` (default).
   - **Build Command**: `vite build` (default).
   - **Output Directory**: `dist` (default).
7. Klik **"Deploy"**. Vercel akan memproses build secara otomatis dalam waktu ~1 menit.
8. Salin URL publik yang diberikan oleh Vercel.

---

## Panduan Pengujian Fitur PWA

1. **Uji Instalasi PWA (Add to Home Screen)**:
   - Buka aplikasi di Google Chrome / Edge / Safari.
   - Klik tombol **"Install Sekarang"** pada banner yang muncul di kanan bawah, atau klik ikon **Install App** pada address bar peramban.
   - Aplikasi akan terpasang di komputer/ponsel dan dapat dibuka melalui desktop shortcut layaknya aplikasi native.

2. **Uji Kemampuan Bekerja Offline**:
   - Buka DevTools peramban (tekan `F12` atau `Ctrl + Shift + I`).
   - Masuk ke tab **Network** -> ubah dropdown dari *No Throttling* menjadi **Offline**.
   - Muat ulang halaman (`F5`) atau buka halaman lain.
   - Aplikasi akan tetap tampil secara utuh, menampilkan banner `"Mode Offline Aktif"`, serta seluruh fitur katalog, detail, favorit, dan CRUD tetap dapat digunakan secara offline.

3. **Uji CRUD**:
   - Buka menu **Kelola CRUD** atau klik **Tambah Tenda**.
   - Masukkan data produk tenda baru beserta spesifikasinya, lalu klik simpan.
   - Data akan langsung muncul di katalog dan tersimpan permanen pada penyimpanan lokal.
   - Anda juga dapat mengedit atau menghapus produk dengan aman melalui dialog konfirmasi.

