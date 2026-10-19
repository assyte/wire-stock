# WireStock — Changelog

Tüm önemli değişiklikler bu dosyada takip edilir.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Bu proje [Semantic Versioning](https://semver.org/) takip eder.

---

## [Unreleased] — v1.1.1-alpha (Planlanıyor: 20 Ekim 2026)

### 🎯 Sprint: Barkod MVP + Müşteri Demo Hazırlığı

### Eklenecek
- Barkod üretim sistemi (EAN-13 formatında 13 haneli kod)
- Etiket basma UI (PNG indirme + yazdırma)
- Barkod okuma (kamera + klavye fallback)
- `/scan` sayfası — hızlı tüketim workflow
- Sidebar'a "Tara" linki (Stok bölümü)
- Demo seed: 30+ gerçek Türk elektrik markası
  - Kablo: Öznür NYM, Hes Hacılar, 2M, Türk Prysmian
  - Anahtar/Priz: Viko, Schneider, Legrand, Makel, Bemis
  - Sigorta/Pano: Schneider, Legrand, ABB, Siemens
  - Klemens: Mutlusan, Klemsan
- Demo script (müşteriye 10dk akış)

### Hedef Versiyon
**v1.1.1-alpha** — Pazartesi sabahı

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