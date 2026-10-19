# 🚀 WireStock — Ürün Yol Haritası

> **Kapsamlı geliştirme planı: Alpha → Beta → Production → SaaS**

**Felsefe:** Önce **ürünü oturt**, sonra **pazarla**, sonra **ölçeklendir**.

---

## 🌟 Vizyon

**"Türkiye'nin her elektrikçisinin, taahhütçüsünün ve tesisatçısının dijital deposu."**

3 ana hedef:
1. ⚡ **Hız** — Her işlem max 3 tık
2. 🎨 **Özgün** — Generic template değil
3. 🇹🇷 **Türk pazarına özel** — Türk ustanın gerçek iş akışı

---

## 📦 Ürün Konfigürasyonu (3 Deployment)

```
┌─────────────────────────────────────────────────────────┐
│ WIRE-STOCK - 3 DEPLOYMENT MODEL                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🏠 YEREL (LOCAL) — Kullanıcının kendi PC'si            │
│  ├─ Tek kullanıcı                                       │
│  ├─ Docker compose + lisans anahtarı                   │
│  ├─ Offline çalışır                                     │
│  └─ Lisans: ₺499-1999/ay                               │
│                                                          │
│  ☁️ CLOUD (SaaS) — Bizim sunucumuzda                     │
│  ├─ Multi-tenant                                        │
│  ├─ Stripe/iyzico entegrasyonu                          │
│  ├─ Otomatik güncelleme                                  │
│  └─ Lisans: ₺799-2999/ay                               │
│                                                          │
│  🏢 SELF-HOSTED (Business) — Müşteri kendi sunucusu      │
│  ├─ Tek tenant (premium)                                │
│  ├─ Lisans anahtarı + remote validation                 │
│  ├─ Update: opt-in                                      │
│  └─ Lisans: ₺999-3999/ay                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Fiyatlandırma

| Plan | Yerel | Cloud | Self-hosted |
|------|-------|-------|-------------|
| Starter | ₺499 | ₺799 | ₺999 |
| Pro | ₺999 | ₺1499 | ₺1999 |
| Enterprise | ₺1999 | ₺2999 | ₺3999 |

**Ödeme:** Aylık / Yıllık (%20 indirim) / Ömür boyu (5 yıl)

---

## 📈 Hedef Kitle

### Primary (İlk 6 ay)
- **Küçük elektrik parça satıcıları** (1-3 çalışan, esnaf)
- **Bireysel taahhüt firmaları**
- **Pano atölyeleri**

### Secondary (6-12 ay)
- **Orta ölçek taahhüt** (5-20 çalışan)
- **Fabrika tesisat ekipleri**
- **Bayi zincirleri**

### Tertiary (12+ ay)
- **Kurumsal fabrikalar**
- **Çok lokasyonlu firmalar**
- **ERP entegrasyonu müşterileri**

---

## 🗓️ Zaman Çizelgesi

```
─────────────────────────────────────────────────
   Q4 2026       Q1 2027      Q2 2027     Q3 2027
─────────────────────────────────────────────────
v1.1.0-alpha   v1.1.0-release  v1.2.0-beta  v1.5.0
v1.1.1-alpha   v1.2.0-alpha
v1.1.2-alpha
─────────────────────────────────────────────────
       │            │            │          │
       ▼            ▼            ▼          ▼
   Müşteri     Multi-tenant  Stripe    Marketing
   keşfi       mimari        entegrasyonu + Scale
```

---

## 🚦 FAZLAR

### ✅ ALPHA (v1.1.0-alpha) — "Temel Oturmuş"

**Tarih:** 19-25 Ekim 2026
**Durum:** ✅ Tamamlandı

**İçerik:**
- ✅ Auth (JWT, refresh token, bcrypt)
- ✅ Products CRUD (125 ürün seed)
- ✅ Categories flat liste + hiyerarşi (80 kategori)
- ✅ Warehouses + raf sistemi
- ✅ Stock movements (IN/OUT/RETURN/DAMAGE/TRANSFER/ADJUSTMENT)
- ✅ Workers CRUD (Usta/Çırak/İşveren)
- ✅ Reports modülü (kritik stok, satın alma, hareket analizi)
- ✅ Light mode + özgün tasarım (kraft + BigPanels)
- ✅ BigPanel component library

---

### 🔄 ALPHA+ (v1.1.1-alpha) — "Barkod MVP"

**Tarih:** 20 Ekim 2026
**Durum:** 🔄 Yarın başlanacak
**Hedef:** Müşteriye demo yapabilir hale gelmek

**İçerik:**
- [ ] Barkod üretim (EAN-13)
- [ ] Etiket basma (PNG, yazdırılabilir)
- [ ] Barkod okuma (kamera + klavye)
- [ ] Hızlı tüketim workflow
- [ ] Demo seed: 30+ Türk markası (Öznür, Hes, Legrand, Schneider, Viko, Siemens...)
- [ ] Demo script

---

### 📋 ALPHA++ (v1.1.2-alpha) — "Müşteri Geri Bildirimi"

**Tarih:** 21-26 Ekim 2026
**Hedef:** İlk 2-3 müşteri demosu, feedback toplama

**İçerik:**
- [ ] 2-3 müşteri demosu (küçük esnaf, taahhüt, tesisat)
- [ ] Feedback analizi
- [ ] Acil feature'lar (feedback'e göre)
- [ ] Yıllık sayım modülü (talep edildiyse)

---

### 🎯 BETA (v1.2.0-beta) — "Multi-Tenant Mimari"

**Tarih:** 27 Ekim - 15 Kasım 2026
**Hedef:** SaaS altyapısı hazır

**İçerik:**
- [ ] Tenant middleware (her query'de organizationId enforce)
- [ ] Self-serve signup
- [ ] Trial süresi (14 gün)
- [ ] Tenant ayrımı testleri
- [ ] Subscription tier field
- [ ] Lisans anahtarı sistemi (LOCAL + SELF-HOSTED)
- [ ] Offline mode (LOCAL için)

---

### 💳 RC (v1.3.0-rc) — "Ödeme + Landing"

**Tarih:** 16 Kasım - 7 Aralık 2026
**Hedef:** İlk ödeme alınabilir

**İçerik:**
- [ ] Stripe / iyzico entegrasyonu
- [ ] Pricing page
- [ ] Marketing site (wire-stock.com)
- [ ] Self-serve onboarding flow
- [ ] Fatura oluşturma
- [ ] Demo video

---

### 🚀 RELEASE (v1.4.0-release) — "İlk Satış"

**Tarih:** 8-31 Aralık 2026
**Hedef:** İlk 5 ödeme yapan müşteri

**İçerik:**
- [ ] İlk 5 pilot müşteri (ücretsiz 3 ay)
- [ ] Müşteri destek sistemi (e-posta + ticket)
- [ ] Feedback döngüsü
- [ ] Bug fixes

---

### 📈 SCALE (v2.0.0) — "Büyüme"

**Tarih:** Q1 2027
**Hedef:** 50+ müşteri

**İçerik:**
- [ ] Marketing (Instagram, LinkedIn, Google Ads)
- [ ] SEO + content marketing
- [ ] Referral program
- [ ] Mobile PWA (sahada barkod okutmak için)
- [ ] Multi-lokasyon (fabrika tesisatçıları için)
- [ ] ERP entegrasyonu

---

## 🎯 Şu An (v1.0.7 → v1.1.1-alpha) — Kritik Yol

### Tamamlananlar ✅
- [x] Backend 10 modül (Auth, Products, Categories, Warehouses, Stock, Workers, Reports, Users, Units, Health)
- [x] Frontend 7 sayfa (Login, Dashboard, Categories, Products, Stock, Warehouses, Workers, Reports)
- [x] 80 kategori (23 ana + 57 alt)
- [x] 125 ürün seed
- [x] JWT auth + refresh token
- [x] Light mode + kraft paper + BigPanels
- [x] Reports modülü (5 rapor)

### Sırada ⭐
- [ ] **Barkod MVP** (v1.1.1-alpha) — YARIN
- [ ] Müşteri demo + feedback (v1.1.2-alpha)
- [ ] Multi-tenant mimari (v1.2.0-beta)
- [ ] Ödeme + landing (v1.3.0-rc)
- [ ] İlk satış (v1.4.0-release)

---

## 💰 Gelir Projeksiyonu

### 6 ay hedefi (Mart 2027)
- 30 müşteri × ₺1000 ortalama = **₺30,000/ay**
- **Yıllık run rate: ₺360,000**

### 12 ay hedefi (Eylül 2027)
- 100 müşteri × ₺1200 ortalama = **₺120,000/ay**
- **Yıllık run rate: ₺1,440,000**

### 24 ay hedefi (Eylül 2028)
- 500 müşteri × ₺1500 ortalama = **₺750,000/ay**
- **Yıllık run rate: ₺9,000,000**

*Bu projeksiyonlar agresif. Gerçekçi olarak ilk 6 ayda 5-10 müşteri beklenir.*

---

## 📝 Notlar

- **Multi-tenant mimari KRİTİK** — olmadan SaaS olamaz
- **Stripe entegrasyonu Türkiye'de sorunlu** — iyzico daha iyi alternatif
- **Lisans anahtarı sistemi** = LOCAL/SELF-HOSTED için, CLOUD'da Stripe webhook'u yeterli
- **Mobile PWA** = sahada barkod okutmak için olmazsa olmaz (Q1 2027'de)
- **Türk pazarı** = influencer marketing (Instagram'da elektrik ustaları çok takip ediliyor)

---

**Son güncelleme:** 2026-10-19
**Sahibi:** WireStock Team
**Lisans:** UNLICENSED (şirket içi)