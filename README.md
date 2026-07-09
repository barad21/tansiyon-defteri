# Tansiyon Defteri

Desktop blood pressure and pulse tracking app for Windows and Linux. Built with Tauri 2 + React.

## Features

- Sabah / Akşam (morning / evening) measurements per day
- Each period stores **initial** and **10-minute follow-up** readings in one log entry (displayed as `77 - 73`)
- Bar charts with daily delta indicators for pulse, systolic, and diastolic values
- Measurement log with edit and delete
- Excel export matching the paper logbook format (dash-separated dual values)
- Dark theme by default
- Turkish UI, English codebase

## Prerequisites (Linux development)

- Node.js 20+
- Rust (via [rustup](https://rustup.rs/))
- Linux system libraries — run `sudo bash scripts/setup-linux-deps.sh`

## Quick Start

**Important:** Use the desktop command, not the browser. Do not open `http://localhost:1420` manually.

```bash
npm install
bash scripts/generate-icons.sh   # optional if icons already generated
npm run tauri:dev
```

The first run compiles Rust and may take several minutes. Wait for the **Tansiyon Defteri** desktop window to open automatically with the app icon in your taskbar. The Vite dev server runs in the background only to feed the desktop window.

## Build

```bash
npm run tauri build
```

- Linux: `.deb` package in `src-tauri/target/release/bundle/deb/`
- Windows: `.exe` installer via GitHub Actions CI

## Project Structure

```
src/           React frontend (TypeScript)
src-tauri/     Rust backend + SQLite via tauri-plugin-sql
Logo/          App logo source (logo.png)
```

## Turkish UI / English Code

All user-facing Turkish strings live in `src/i18n/appStrings.ts`. Code identifiers are English only.

## Releases

Tag a version to trigger GitHub Actions:

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

## Kullanıcı Kılavuzu (Türkçe)

1. **Uygulamayı açın** — Tansiyon Defteri simgesine tıklayın
2. **Yeni ölçüm ekleyin** — Tarih seçin → Sabah veya Akşam → İlk ölçüm ve 10 dakika sonraki ölçüm değerlerini girin → Kaydet
3. **Grafikleri inceleyin** — Üstte üç grafik; her gün için günlük fark (Δ) altında gösterilir
4. **Excel'e aktarın** — Tarih aralığı seçin → Önizleme → Dosyayı kaydedin (herhangi bir adımda Kapat ile iptal edebilirsiniz)
