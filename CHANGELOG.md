# Changelog

Semua perubahan penting pada Chain Stopwatch dicatat di file ini.

## 2.0.0 - 2026-09-26

### Added
- Struktur project modular untuk GitHub Pages tanpa build step.
- Custom domain melalui `CNAME` untuk `stopwatch.mbingsdk.my.id`.
- Modul terpisah untuk stopwatch, storage, statistik, format waktu, dan export.
- Toast feedback untuk copy dan export CSV.
- Metadata versi aplikasi.
- `.nojekyll` untuk deployment GitHub Pages yang lebih predictable.

### Changed
- UI dibuat ulang dengan layout yang lebih rapi dan responsive.
- Transisi Stop & Next memakai satu timestamp bersama agar tidak menciptakan gap buatan antar sesi.
- Event handler history memakai event delegation agar lebih mudah dirawat.
