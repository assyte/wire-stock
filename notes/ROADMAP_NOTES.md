# 🗺️ Gelecek Planları & Fikirler

> WireStock için v1.1.0 sonrası düşünceler ve ilham kaynakları

---

## 🎯 Kısa Vade (v1.1.1 — v1.1.9)

### v1.1.1 — Polish & Bugfix
- [ ] Database migration: 11 eski modeli sil (Project, Invoice, vb.)
- [ ] Worker sayfasında pagination
- [ ] Stock sayfasında tarih filtresi
- [ ] Production'a hazır auth (rate limit, captcha)

### v1.1.2 — Kategori PNG'ler
- [ ] 14 ana kategori için PNG üret (AI veya stok)
- [ ] `<CategoryIcon>` component
- [ ] WebP versiyonları

### v1.1.3 — Barkod Tarama
- [ ] Telefon kamerası ile barkod okuma (QuaggaJS veya ZXing)
- [ ] `/products?barcode=X` ile hızlı arama
- [ ] Barkod okuma animasyonu (tam ekran overlay)

### v1.1.4 — Raporlar Sayfası
- [ ] `/reports` sayfası
- [ ] Tarih aralığı filtresi
- [ ] Chart: Stok ekleme/çıkarma trendi (recharts)
- [ ] Çalışan bazlı aktivite raporu

### v1.1.5 — Dashboard v2
- [ ] Recharts grafikleri (pie, bar, line)
- [ ] Son 7 günlük özet
- [ ] Bugünkü işlemler widget'ı
- [ ] Düşük stok alarm widget'ı (renk kodlu)

### v1.1.6 — Çoklu Depo Transferi (geri geliyor)
- [ ] Kullanıcı geri bildirimi: "Birden fazla depo olunca transfer lazım"
- [ ] Depo arası transfer (shelves arası)
- [ ] Transfer form + history

### v1.1.7 — Hızlı İşlemler
- [ ] Barkod okutarak stok çıkışı (1 tıkla)
- [ ] "Son kullanılan" malzemeler (recent items)
- [ ] Sık kullanılan malzemeler favorilere

### v1.1.8 — Mobil-first PWA
- [ ] Progressive Web App
- [ ] Service worker
- [ ] Offline mode (cache)
- [ ] "Ana ekrana ekle" prompt

### v1.1.9 — Performance & SEO
- [ ] Web vitals (LCP, FID, CLS)
- [ ] Image optimization (next/image)
- [ ] Code splitting (dynamic imports)
- [ ] Lighthouse 90+ skoru

---

## 🚀 Orta Vade (v1.2.x — v1.4.x)

### v1.2 — Tedarikçi Yönetimi (geri dönüş)
- [ ] Tedarikçi CRUD (basit)
- [ ] Tedarikçi bazlı ürün fiyat karşılaştırma
- [ ] "En ucuz nerede?" sorusu

### v1.3 — Fatura Yönetimi (basit)
- [ ] PDF fatura oluşturma
- [ ] PDF'den ürün tanıma (AI OCR)
- [ ] Fatura arşivi

### v1.4 — Proje Bazlı Stok
- [ ] "Şantiye A" deposu oluştur
- [ ] Her proje için ayrı stok takibi
- [ ] Proje bazlı rapor

---

## 🌟 Uzun Vade (v2.0+)

### v2.0 — Mobil Uygulama
- [ ] React Native (Expo)
- [ ] iOS + Android
- [ ] Offline sync
- [ ] Push notifications

### v2.1 — AI Özellikleri
- [ ] AI fotoğraftan malzeme tanıma
- [ ] AI stok tahminleme
- [ ] AI fiyat karşılaştırma
- [ ] AI alışveriş önerisi

### v2.2 — Çoklu Şube & Gelir
- [ ] Şubeler arası transfer
- [ ] Merkez-şube hiyerarşisi
- [ ] Konsolide raporlar

### v2.3 — Entegrasyonlar
- [ ] e-Fatura / e-Arşiv (GİB)
- [ ] Logo / Paraşüt / Mikro ERP
- [ ] Banka API (otomatik ödeme)
- [ ] WhatsApp bildirim

### v2.4 — Multi-tenant SaaS
- [ ] Tenant yönetimi
- [ ] Plan/aboneleme sistemi (zaten schema'da var)
- [ ] Stripe / iyzico entegrasyonu
- [ ] Marketing site

---

## 💡 İlham & Referanslar

### Benzer projeler
- **Sortly** — Mobil öncelikli envanter yönetimi
- **Stockpile** — Depo yönetimi
- **inFlow Inventory** — KOBİ için stok
- **Cin7** — Çok kanallı envanter
- **Zoho Inventory** — Entegre ERP

### UX ilhamları
- **Linear.app** — Hızlı keyboard-first UX
- **Notion** — Sade ama güçlü UI
- **Stripe Dashboard** — Net finansal data
- **Vercel Dashboard** — Modern dev tools

### Tasarım ilhamları
- [Tailwind UI](https://tailwindui.com) — Component library
- [shadcn/ui](https://ui.shadcn.com) — Kopyala-yapıştır components
- [Radix UI](https://radix-ui.com) — Headless primitives

---

## 🎨 Açık Tema — Light Mode

### v1.1.0'da light mode'a geçiş

#### Plan
1. **Tailwind config** — dark mode kaldır, light default
2. **globals.css** — CSS variable'ları light palette'ye çevir
3. **Layout** — bg-background, text-text-primary
4. **Cards** — bg-surface, border subtle
5. **Buttons** — primary yeşil, hover koyu
6. **Inputs** — beyaz background, focus ring brand
7. **Sidebar** — açık gri background

### v1.1.0 ile birlikte
- ✅ Tüm sayfalar light mode'da
- ✅ Dark mode toggle kaldırıldı
- ✅ Görsel tutarlılık

---

## 🖼️ PNG İkon Üretimi

### Kaynak
- AI tools (Midjourney, Leonardo.ai, DALL-E 3)
- Stok siteler (Flaticon, Iconify)
- Custom tasarım (grafikçi)

### Plan
- v1.1.2: İlk 8 kategori PNG
- v1.1.3: Kalan 6 kategori PNG
- Toplam: 14 PNG, transparent background, flat illustration

### AI prompt template
```
Flat vector illustration of [ITEM], 2D, minimal style,
electric blue/green accent color, transparent background,
centered composition, professional, clean lines,
suitable for web UI, 512x512px
```

---

## 🐛 Bilinen Sorunlar (Backlog)

| # | Sorun | Öncelik | Plan |
|---|-------|----------|------|
| 1 | Web timeout (60dk) | 🔴 Yüksek | v1.0.9'da production build |
| 2 | Categories tree eski data | 🟡 Orta | v1.1.1'de cleanup |
| 3 | Worker API yok | 🔴 Yüksek | v1.1.0'da tamamlanacak |
| 4 | Stock worker dropdown yok | 🟡 Orta | v1.1.0'da |
| 5 | Dark mode tutarsızlığı | 🟢 Düşük | v1.1.0'da light mode'a geçiş |
| 6 | Eski DB modelleri (Project, Invoice) | 🟡 Orta | v1.1.1 migration |

---

## 💭 Beyin Fırtınası — Wild Ideas

Belki hiç yapılmayacak ama düşünmeye değer:

- 🎙️ **Sesli komut**: "Stoktan 5 metre NYM çıkar"
- 🤖 **WhatsApp bot**: "Bana NYM 3x2.5 stok durumu nedir?"
- 📱 **QR kod üretimi**: Depo raflarına QR yapıştır, tarayınca stok görsün
- 📷 **AI ile fatura tarama**: Kağıt faturanın fotoğrafını çek, otomatik ürün tanısın
- 🎯 **Stok tahminleme**: Geçmiş veriden "3 ay sonra X ürünü bitecek" desin
- 🌐 **Çoklu dil**: Türkçe + İngilizce (i18n)
- 📊 **Dashboard widget'ları**: Drag-drop ile özelleştirilebilir
- 🔔 **Push notifications**: "Stok X'in altına düştü" uyarısı
- 📱 **QR menü**: Usta telefonuyla QR okut → malzeme bilgisi
- 🤝 **Çalışan davet sistemi**: Patron çalışanı email ile davet eder

---

## 📈 Metrikler & KPI

### v1.1.0 başarı metrikleri
- [ ] Login time < 1s
- [ ] Malzeme listeleme < 500ms
- [ ] Stok girişi < 1s
- [ ] Dashboard yükleme < 2s
- [ ] Sayfa transition < 300ms
- [ ] Lighthouse score > 90

### İş metrikleri
- [ ] Günlük aktif kullanıcı sayısı
- [ ] Haftalık stok hareketi sayısı
- [ ] Ortalama session süresi
- [ ] En çok kullanılan sayfa

---

## 📞 Topluluk

### Açık kaynak mı yoksa ticari mi?
**Karar:** Ticari (UNLICENSED) — işveren için gelir modeli gerekli
- Lisans: Tüm hakları saklı (UNLICENSED)
- v2.0'da SaaS modeli düşünülebilir

### Dökümantasyon
- [x] README.md (İngilizce)
- [x] ROADMAP.md
- [x] CONTRIBUTING.md
- [ ] Kullanım kılavuzu (v1.1.0'da)
- [ ] Video tutorials (v1.2'de)
- [ ] API reference (Swagger zaten var)

**Son güncelleme:** 19 Ekim 2026