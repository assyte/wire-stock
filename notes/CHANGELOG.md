# WireStock — Changelog

Tüm önemli değişiklikler bu dosyada takip edilir.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Bu proje [Semantic Versioning](https://semver.org/) takip eder.

---

## [Unreleased] — v1.2.0-desktop-alpha (Planlanıyor: 20 Ekim 2026)

### 🎯 Sprint: Masaüstü Uygulaması (Electron MVP)

### Planlanan
- Electron wrapper (`apps/desktop/`)
- NestJS embedded (main process'te)
- Next.js static export
- SQLite database (Prisma)
- Tek .exe installer (Windows NSIS)
- Auto-shutdown (uygulama kapanınca backend kapanır)

### Hedef Versiyon
**v1.2.0-desktop-alpha** — Pazartesi günü

---

## [1.1.1-alpha] — 2026-10-19 ✅

### ✅ Eklenen
- **Barkod üretim sistemi**:
  - `POST /products/:id/generate-barcode` — EAN-13 (869 Türkiye prefix)
  - `GET /products/lookup/:barcode` — zenginleştirilmiş (stok + raf + son hareket)
  - `lib/ean13.ts` — checksum hesaplama
- **/scan sayfası** (barkod tarayıcı):
  - Kamera (html5-qrcode)
  - Klavye fallback
  - Ürün kartı (stok + raf + son hareket)
  - Hızlı tüketim workflow
  - Ses efektleri (Web Audio API)
  - Recent scans listesi
- **BarcodePrintModal**:
  - Barkod üret (jsbarcode → SVG)
  - 50×25mm etiket yazdırma
  - PNG indirme
- **Demo veriler**:
  - `seed-barcodes.ts` — 30 ürüne barkod atandı (SIG, NYY, CAT6, NH, MCB, RCD, Viko)
  - `seed-product-brands.ts` — SKU prefix → marka mapping
- **Dokümanlar**:
  - `notes/DEMO_SCRIPT.md` — Müşteri demo akışı (10dk) + 5 satış sorusu
  - `notes/SPRINT_2026_10_20.md` — Sprint planı

### Sidebar'a eklendi
- **"Barkod Tara"** linki (Stok bölümünde)

---

## [1.1.0-alpha] — 2026-10-19

### ✅ Eklenen
- **Reports modülü** — 6 yeni endpoint:
  - `GET /reports/dashboard-summary` (toplam ürün, değer, hareket, alarmlar)
  - `GET /reports/low-stock` (OUT/CRITICAL/LOW filtrelenebilir)
  - `GET /reports/dead-stock?days=90` (hareket görmeyenler)
  - `GET /reports/top-movement?days=30&type=OUT` (en çok tüketilenler)
  - `GET /reports/movement-summary` (tarih aralığı özet)
  - `GET /reports/purchase-suggestion?limit=50` (acil + hesaplama)
- **Reports sayfası** (`/reports`) — 5 tab'lı rapor merkezi:
  - Genel Bakış (KPI + alarm banner)
  - Kritik Stok (filtrelenebilir liste)
  - Satın Alma (mega hero ₺10.790 + sipariş listesi)
  - Hareket Analizi (top consumed + bar grafik)
  - Ölü Stok (90g+ hareket görmeyenler)
- **BigPanel component library** (`components/big-panel.tsx`):
  - KpiPanel — büyük sayı + trend
  - StatusPanel — alarm/aksiyon
  - GaugePanel — progress/oran
  - MiniStatPanel — operasyonel küçük bilgi
- **Kategoriler redesign** — "Dükkan" konsepti:
  - Featured (ilk büyük kart) + Showcase grid (22 küçük kart)
  - Texture'lar taşıyor (-translate-y-2 + drop-shadow)
  - Warm kraft paper background
  - 23 özgün renk paleti (lib/category-palette.ts)
  - "Raf" dili (tezgah yerine)
- **/categories/[slug]** — Yeni detay sayfası
  - Hero (texture + isim + alt raf + ürün)
  - Alt kategoriler grid
  - Ürünler listesi

### 🐛 Düzeltilen
- **ValidationPipe bug** — `enableImplicitConversion: false` yapıldı
  - Önce: `/products?categoryId=X` → "numeric string is expected" hatası
  - Şimdi: 125 ürün döner, query parametreleri düzgün çalışır
- **/dashboard 404 hatası** — `app/(dashboard)/layout.tsx` boş kalmıştı
  - Şimdi: Sidebar + AuthGuard + user card içeren tam layout
- **Sidebar "Operasyon" bölümü** kaldırıldı
  - Şimdi: Stok + Raporlar + Yönetim (sadece Çalışanlar)
- **Sidebar icon cleanup** — kullanılmayan Truck/ShoppingCart/Users import'ları silindi

### 🔧 Değişen
- **Categories backend** genişletildi:
  - `GET /categories?parentId=X` — filtreleme
  - `GET /categories?rootsOnly=true` — sadece ana kategoriler
  - `GET /categories/slug/:slug` — tek kategori + children + counts
- **Tailwind config** — kraft paper bg + kraft shadow + blob-float animasyonları
- **Global CSS** — light mode renk paleti (yeşil brand #059669)

---

## [1.0.7] — 2026-10-17

### Eklenen
- Workers modülü (Usta/Çırak/İşveren)
- Workers seed (5 demo worker)
- Stock movements'ta worker atama
- Sidebar'da "Çalışanlar" linki

### Düzeltilen
- Migration: 11 Worker tablosu eklendi
- Prisma schema basitleştirildi

---

## [1.0.5] — 2026-10-15

### Eklenen
- Light mode + özgün tasarım
- 23 ana kategori (kraft + BigPanels)

### Kaldırılan
- Customers modülü
- Sales modülü
- Suppliers modülü
- Organizations modülü
- "DükkanDepo" sadeleştirme

---

## [1.0.0] — 2026-10-01

### İlk Sürüm
- Auth (login, register, JWT, refresh)
- Products CRUD
- Categories (flat liste)
- Warehouses + raflar
- Stock movements (IN/OUT/TRANSFER/ADJUSTMENT/RETURN/DAMAGE)
- Users CRUD
- Units CRUD
- Health check
- Docker compose (Postgres, Redis, MinIO, MailHog)

---

## 🛣️ Gelecek

### v1.2.0-beta — Multi-Tenant Mimari
- Tenant middleware (her query'de organizationId enforce)
- Self-serve signup + 14 gün trial
- Subscription tier field
- Lisans anahtarı sistemi

### v1.3.0-rc — Ödeme + Landing
- Stripe/iyzico entegrasyonu
- Pricing page
- Marketing site

### v1.4.0-release — İlk Satış
- İlk 5 pilot müşteri
- Müşteri destek sistemi

### v2.0.0 — Scale
- 100+ müşteri
- Mobile PWA
- ERP entegrasyonu

---

**Son güncelleme:** 2026-10-19