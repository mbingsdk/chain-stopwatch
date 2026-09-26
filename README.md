# Chain Stopwatch

Stopwatch berantai berbasis static HTML, CSS, dan JavaScript. Dirancang agar ringan, mudah dirawat, dan bisa langsung dipublish melalui GitHub Pages tanpa build step.

## Cara kerja

1. Tekan **Start** untuk memulai sesi pertama.
2. Isi **Keterangan sesi** jika ingin memberi nama atau catatan pada waktu yang sedang berjalan.
3. Tekan **Stop & Next** untuk menyimpan waktu beserta keterangannya dan langsung memulai sesi berikutnya.
4. Tekan **Finish All** untuk menyimpan sesi terakhir dan menghentikan stopwatch.
5. Keterangan sesi yang sudah tersimpan masih dapat diedit dari riwayat.
6. Hasil beserta keterangannya tersimpan lokal di browser dan dapat disalin atau diekspor ke CSV.

Pada transisi **Stop & Next**, sesi yang selesai dan sesi baru memakai timestamp transisi yang sama sehingga tidak ada celah waktu buatan di antara keduanya.

## Shortcut

| Tombol | Aksi |
| --- | --- |
| `Space` | Stop & Next saat berjalan, Start saat idle |
| `Esc` | Finish All |
| `Enter` | Start saat idle |

## Struktur project

```text
.
├── CNAME
├── .nojekyll
├── index.html
├── README.md
├── CHANGELOG.md
└── assets
    ├── css
    │   └── main.css
    └── js
        ├── app.js
        ├── config.js
        ├── core
        │   ├── stats.js
        │   ├── storage.js
        │   └── stopwatch.js
        └── utils
            ├── export.js
            └── time.js
```

### Pembagian modul

- `index.html`: struktur halaman saja.
- `assets/css/main.css`: seluruh styling dan responsive layout.
- `assets/js/app.js`: menghubungkan UI dengan logic aplikasi.
- `assets/js/config.js`: konfigurasi aplikasi dan versi.
- `assets/js/core/stopwatch.js`: state machine stopwatch.
- `assets/js/core/storage.js`: penyimpanan `localStorage`.
- `assets/js/core/stats.js`: perhitungan statistik sesi.
- `assets/js/utils/time.js`: format waktu.
- `assets/js/utils/export.js`: copy/export data.

Dengan struktur ini, fitur baru bisa ditambahkan tanpa menumpuk semuanya di satu file HTML.

## GitHub Pages

Project ini tidak memakai Node.js, npm, bundler, atau framework. Publish langsung dari branch `main` dengan folder `/ (root)`.

1. Push seluruh isi project ke root repository.
2. Buka **Settings → Pages**.
3. Pilih **Deploy from a branch**.
4. Pilih `main` dan `/ (root)`.
5. Simpan.

## Custom domain

Repository sudah memiliki file `CNAME`:

```text
stopwatch.mbingsdk.my.id
```

Di DNS domain, arahkan subdomain `stopwatch` ke hostname GitHub Pages akun/repository yang digunakan. Setelah DNS aktif, GitHub Pages akan membaca domain tersebut dari file `CNAME`.

## Update versi

Nomor versi aplikasi berada di:

```js
// assets/js/config.js
version: '2.1.0'
```

Saat membuat perubahan fitur, update nilai tersebut dan catat perubahannya di `CHANGELOG.md`.
