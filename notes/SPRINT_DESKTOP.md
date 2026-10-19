# 🚀 Yarın Sprint — Masaüstü Uygulaması (Electron MVP)

> **Motto:** *"Tek .exe indir, çift tıkla, çalışsın."*

**Sprint Tipi:** 3 saat
**Hedef Versiyon:** `v1.2.0-desktop-alpha`
**Ana Tema:** Electron wrapper + SQLite + offline çalışma

---

## 🎯 Sprint Hedefi

Müşteri WireStock'u **kendi bilgisayarına kurabilsin**:
1. `WireStock-Setup-v1.2.0.exe` indirsin
3. Kurulum sihirbazı tamamlansın (Next → Next → Install)
4. Masaüstünde **"WireStock"** kısayolu belirirsin
5. Çift tıkla → uygulama açılsın (native window)
6. Login ekranı gelirsin
7. `admin@wirestock.com` / `demo123456` ile girsin
8. Ürün ekleyebilsin, barkod tarayabilsin

---

## 📋 Mimari Kararlar

### Veritabanı
- **SQLite** (embedded, sıfır kurulum)
- Prisma provider: `sqlite`
- DB dosyası konumu: `%APPDATA%/WireStock/wirestock.db` (Windows)
- Yedekleme: tek dosya kopyası

### Backend (NestJS)
- Electron main process'te embedded
- HTTP server: `localhost:4000` (sadece localhost)
- Static frontend serve: Next.js `out/` klasörü
- Auto-shutdown: uygulama kapanınca backend de kapanır

### Frontend (Next.js)
- `output: 'export'` ile static build
- `out/` klasörü Electron'a gömülür
- API URL: env variable ile `http://localhost:4000/api/v1`

### Auto-updater
- electron-updater
- Update server: GitHub Releases (v1.2.0-tauri-alpha, etc.)
- Manuel check + otomatik indir
- Kullanıcıya "Yeni sürüm var" bildirimi

### Sistem Tray
- Sağ altta küçük ikon
- "Aç", "Çıkış" menüsü
- Kapatınca tray'e küçül

---

## 🛠️ Teknik Yapı

### Yeni Dizin Yapısı
```
wire-stock/
├── apps/
│   ├── api/        # NestJS (mevcut)
│   ├── web/        # Next.js (mevcut)
│   └── desktop/    # 🆕 Electron wrapper
│       ├── package.json
│       ├── electron/
│       │   ├── main.ts         # Ana process
│       │   ├── preload.ts      # Renderer bridge
│       │   ├── nestjs.ts       # Backend spawn
│       │   ├── window.ts       # Window yönetimi
│       │   ├── tray.ts         # System tray
│       │   ├── autoupdate.ts   # Güncelleme
│       │   └── license.ts      # Lisans yönetimi (placeholder)
│       ├── resources/
│       │   ├── icons/         # App icons (.ico, .icns)
│       │   └── next-out/      # Next.js static build (symlink)
│       ├── electron-builder.json
│       └── tsconfig.json
├── packages/
│   └── database/  # SQLite + Prisma
```

### Backend Değişiklikleri

**Prisma schema (packages/database/prisma/schema.prisma):**
```prisma
datasource db {
  provider = "sqlite"  // postgresql → sqlite
  url      = env("DATABASE_URL")
}
```

**Yeni env variable (apps/api/.env):**
```
DATABASE_URL=file:./data/wirestock.db
```

### Frontend Değişiklikleri

**apps/web/next.config.js:**
```javascript
module.exports = {
  output: 'export',  // Static export
  images: { unoptimized: true },
  // ... mevcut config
}
```

**apps/web/.env.production:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 📅 Yarın Sprint Planı (3 saat)

### 🕘 BÖLÜM A — Electron Temeli (1 saat) ⭐

**Amaç:** Boş bir Electron penceresi açılsın

1. **Proje kurulumu**
   - `apps/desktop/` dizini oluştur
   - `pnpm init -y` ve `package.json` düzenle
   - `electron`, `electron-builder`, `typescript`, `tsx`, `electron-updater` yükle

2. **Ana process (`electron/main.ts`)**
   - `app.whenReady()` → pencere oluştur
   - `BrowserWindow` config: 1280×800, min 1024×768, dark title bar
   - Icon, başlık, sandbox

3. **Preload script (`electron/preload.ts`)**
   - `contextBridge` üzerinden güvenli API
   - `wireStock.platform`, `wireStock.version` gibi

4. **İlk çalıştırma**
   - `pnpm dev` → `electron .` → pencere açılır
   - Hello WireStock başlığı görünür

### 🕐 BÖLÜM B — Next.js + Nest.js Gömme (1.5 saat) ⭐

**Amaç:** Uygulama açılınca login ekranı gelsin

1. **Next.js static export**
   - `apps/web/next.config.js` → `output: 'export'`
   - `pnpm build` → `out/` klasörü oluşur
   - API URL: `http://localhost:4000/api/v1`

2. **NestJS embedded (`electron/nestjs.ts`)**
   - `child_process.spawn` ile `node dist/main.js` başlat
   - 5 saniye bekle, sonra pencere yüklenir
   - Hata olursa: "Backend başlatılamadı" mesajı

3. **Window load URL**
   - Dev: `http://localhost:3000`
   - Prod: `file://.../out/index.html`

4. **API URL'i frontend'e inject**
   - Preload script ile `window.wireStock.apiUrl` set et
   - Frontend bu değeri axios baseURL olarak kullanır

5. **Test:**
   - Electron → pencere açılır → login → başarılı
   - DevTools açıksa network gör

### 🕒 BÖLÜM C — SQLite + Veri Setup (30 dk)

**Amaç:** Ürün eklenebilsin

1. **Prisma SQLite**
   - `schema.prisma` → `provider = "sqlite"`
   - Yeni migration oluştur
   - `pnpm prisma db push` → SQLite dosyası oluşur

2. **Backend port değişikliği**
   - `.env`: `DATABASE_URL=file:./data/wirestock.db`
   - `data/` dizini oluştur

3. **Seed çalıştır**
   - NestJS başlarken otomatik seed
   - Admin user + 5 demo worker + 10 demo product

4. **Test:**
   - Login ol → ürün ekle → kaydet → listele → gör

---

## 🚫 YAPILMAYACAKLAR (Bu Sprint)

| Item | Neden | Ne Zaman |
|------|-------|----------|
| Lisans sistemi | Henüz tek bilgisayar demo | Sprint 2 |
| Auto-updater | GitHub Releases setup gerek | Sprint 2 |
| Code signing | Ücretli sertifika gerekir | Production |
| Mac/Linux build | Önce Windows | İleride |
| Sistem tray | Önce pencere | Sprint 3 |
| App icon tasarımı | Placeholder kullan | Sprint 4 |
| Çoklu PC sync | Karar verilmedi (tek bilgisay) | İleride |
| Production build (.exe) | electron-builder config uzun | Sprint 2 |

---

## 🎯 Definition of Done

- [ ] `pnpm dev` ile Electron uygulaması açılıyor
- [ ] Pencere: 1280×800, dark title bar
- [ ] Login sayfası geliyor (Next.js)
- [ ] `admin@wirestock.com` / `demo123456` ile giriliyor
- [ ] Ürün listesi geliyor (NestJS + SQLite)
- [ ] Yeni ürün eklenebiliyor
- [ ] Backend Electron main process'te çalışıyor
- [ ] Type-check + build temiz
- [ ] Commit

---

## 💡 Notlar

- **electron-builder** ilk build 5-10 dakika sürebilir (Windows + Wine)
- **Prisma SQLite** otomatik dosya oluşturur, init script ekleyebiliriz
- **Next.js static export** = Server Components, API Routes, middleware ÇALIŞMAZ
  - Auth-guard istemci tarafında olmalı (zaten öyle)
  - Middleware'i client tarafına taşıyabiliriz
- **Port yönetimi**: Electron main process port 4000'ü kontrol eder, çakışma varsa alternatif port (4001, 4002)

---

## 🎁 Bonus: İlk .exe Build (Sprint 2'ye Hazırlık)

electron-builder.json:
```json
{
  "appId": "com.wirestock.desktop",
  "productName": "WireStock",
  "files": ["dist-electron/**/*", "out/**/*", "node_modules/**/*"],
  "win": { "target": "nsis", "icon": "resources/icons/icon.ico" },
  "mac": { "target": "dmg", "icon": "resources/icons/icon.icns" },
  "linux": { "target": "AppImage" },
  "nsis": { "oneClick": false, "perMachine": false }
}
```

---

**Hazırlayan:** AI Agent
**Tarih:** 2026-10-19
**Başlangıç:** Yarın sabah (devtools açık tut, debug kolay olsun)**