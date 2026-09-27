# Gerdiary Web

Frontend Gerdiary untuk mencatat makanan dan gejala pencernaan, mengelola sesi pengguna, dan menampilkan alur onboarding. Aplikasi dibangun dengan React, TypeScript, dan Vite.

## Mulai

Gunakan Node.js 24 atau lebih baru.

```bash
npm install
npm run dev
```

Vite menjalankan aplikasi lokal. Permintaan ke `/api` diteruskan ke `http://127.0.0.1:5000` secara default.

Untuk memakai alamat API lain, atur `VITE_API_PROXY_TARGET` sebelum menjalankan Vite:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:5000 npm run dev
```

Jalankan backend Gerdiary secara terpisah agar login, onboarding, dan pemeriksaan kesehatan API dapat digunakan.

## Perintah

```bash
npm run dev        # Jalankan server pengembangan
npm run lint       # Periksa lint
npm run typecheck  # Periksa tipe TypeScript
npm run test       # Jalankan test
npm run build      # Buat build produksi
npm run preview    # Sajikan build lokal
```

## Struktur

```text
src/
├── app/                 # Shell dan tema aplikasi
├── features/
│   ├── foundation/      # Koneksi dan status API
│   └── identity/        # Login, pendaftaran, dan onboarding
├── App.tsx
└── main.tsx
```

## API

Frontend menggunakan endpoint `/api` melalui proxy Vite saat pengembangan. Proxy dapat diarahkan melalui `VITE_API_PROXY_TARGET`. Konfigurasi deployment produksi perlu mengarahkan `/api` ke Gerdiary API pada infrastruktur yang digunakan.
