# ✅ Definition of Done (DoD)

> WireStock için **net olmalı** kuralları. Her sürüm/release için geçerli.

---

## 🎯 Genel DoD Kuralları

Bir özellik/hata düzeltmesi "tamamlandı" sayılması için:

### 1. Kod kalitesi
- [ ] Tüm TypeScript hataları giderildi (`tsc --noEmit` exit 0)
- [ ] Lint uyarıları 0 (error: 0, warning: en fazla proje standardı kadar)
- [ ] Console.log / debug.log temizlendi
- [ ] TODO/FIXME kalmadı (yeni özellik için)
- [ ] Kullanılmayan import'lar silindi
- [ ] Kod okunabilir ve anlaşılır

### 2. Test
- [ ] Manuel test tarayıcıda yapıldı (her sayfa)
- [ ] API endpoint'leri test edildi (curl/Postman)
- [ ] Mevcut özellikler bozulmamış (regression)
- [ ] Verilen örnek senaryo (user story) çalışıyor
- [ ] Build hatasız (lint + type-check + build)

### 3. Belgelendirme
- [ ] CHANGELOG.md güncellendi
- [ ] Yeni endpoint varsa Swagger decorator var
- [ ] README'de güncellenecek bir şey varsa güncellendi
- [ ] notes/DESIGN_DECISIONS.md'ye önemli karar eklendiyse eklendi

### 4. Git & GitHub
- [ ] Conventional commit message (feat:/fix:/docs:)
- [ ] Tüm değişiklikler commit'lendi
- [ ] CI pipeline yeşil (lint + typecheck + test + build)
- [ ] Tag eklendi (v1.x.y)
- [ ] GitHub Release yazıldı (kullanıcılar için)
- [ ] Token revoke edildi (güvenlik)

### 5. Dokümantasyon (kullanıcı)
- [ ] Yeni ekran/işlev için basit açıklama
- [ ] Ekran görüntüsü veya gif (mümkünse)
- [ ] Bilinen sınırlamalar (varsa) dokümante edildi

---

## 🧪 Özellik Bazlı DoD

### Yeni sayfa eklendiğinde
- [ ] Layout'a sidebar link eklendi
- [ ] Empty state eklendi (henüz veri yoksa)
- [ ] Loading state eklendi (veri yüklenirken)
- [ ] Error state eklendi (API hata verirse)
- [ ] Sayfa boşken de hata vermiyor
- [ ] Sayfa doluyken de hata vermiyor
- [ ] Tüm CRUD işlemleri çalışıyor
- [ ] Toast mesajları doğru (success/error)

### Yeni API endpoint'i
- [ ] DTO validation çalışıyor (class-validator)
- [ ] Hata durumları handle ediliyor (404, 400, 401)
- [ ] Swagger dokümantasyonu (@ApiOperation, @ApiResponse)
- [ ] Auth guard var (JwtAuthGuard)
- [ ] Throttle var (rate limit)
- [ ] Permission kontrolü var (RolesGuard)

### Yeni veritabanı tablosu/model
- [ ] Index'ler eklendi (@@index)
- [ ] İlişkiler tanımlı (relation)
- [ ] Soft delete (deletedAt) — uygunsa
- [ ] Default değerler (default)
- [ ] Migration oluşturuldu

### Yeni UI komponenti
- [ ] TypeScript prop'lar tanımlı
- [ ] Farklı state'lerde test edildi (loading, empty, error)
- [ ] Mobile responsive
- [ ] Accessibility (aria-label, keyboard nav)
- [ ] Loading ve disabled state'leri handle ediyor

---

## 🚦 Sürüm Tipleri (alpha, beta, release)

### Alpha (iç test)
- Temel işlevsellik var
- Veri kalıcılığı çalışıyor
- Hatalar olabilir (expected)
- **Kullanıcı:** Sadece ekip
- **DoD:** Temel işlevsellik + veri kayıt/okuma

### Beta (sınırlı kullanıcı)
- Tüm kritik özellikler çalışıyor
- Veri kayıpları yok
- Mobile responsive
- **Kullanıcı:** Erken benimseyenler (5-10 kişi)
- **DoD:** Alpha + UI responsive + hata senaryoları handle + temel accessibility

### Release Candidate (RC)
- Bilinen kritik bug yok
- Tüm modüller entegre
- Performans kabul edilebilir
- **Kullanıcı:** Geniş beta kullanıcıları
- **DoD:** Beta + Lighthouse > 80 + LCP < 3s + dokümantasyon tamamlanmış

### Release (GA — General Availability)
- Production-ready
- Tüm bilinen buglar düzeltilmiş
- Migration stratejisi var
- **Kullanıcı:** Herkes
- **DoD:** RC + güvenlik kontrolü + migration başarılı + rollback planı

---

## 📊 Ölçüm Kriterleri

### v1.1.0 "DükkanDepo" (Release) için:

**İşlevsellik (100%):**
- ✅ Auth: login + logout + register
- ✅ Products: CRUD + arama + filtreleme
- ✅ Categories: CRUD + flat liste
- ✅ Warehouses: CRUD + raflar (auto-create)
- ✅ Stock: IN + OUT + ADJUST + listeleme
- ✅ Workers: CRUD (yeni)
- ✅ Dashboard: 3 KPI + 2 liste + 4 quick action
- ⏳ Categories PNG ikonlar (v1.1.2)
- ⏳ Barkod okuyucu (v1.1.3)

**Performans:**
- ⏳ Sayfa yükleme < 2s
- ⏳ API response < 500ms (p95)
- ⏳ Lighthouse Performance > 80

**Kalite:**
- ✅ 0 lint errors
- ✅ 0 TypeScript errors
- ✅ Tüm sayfalar login sonrası erişilebilir
- ✅ Mobil responsive (375px, 768px, 1280px)
- ⏳ Lighthouse Accessibility > 90
- ⏳ Lighthouse Best Practices > 85

**Veri:**
- ✅ 14 ana kategori
- ✅ 8 birim (ad, m, kg, lt, rl, kt, mt, pk)
- ✅ 10 marka
- ✅ 4 çalışan (Patron + Usta + 2 Çırak)
- ⏳ Stok hareketi (demo için seed verisi)

---

## 📋 Sürüm Checklist Template

Her release'te:

- [ ] `package.json` versiyon bump
- [ ] GitHub Release notu yazıldı
- [ ] CHANGELOG.md güncellendi
- [ ] notes/ güncellendi (ilgiliyse)
- [ ] Tüm CI job'ları yeşil
- [ ] Production build çalışıyor
- [ ] Demo veriler temizlendi (gerekirse)
- [ ] Token revoke edildi

---

## 🎯 "Release Hazır" Kontrol Listesi

### v1.1.0 için her şey tamam mı?

- [ ] Tüm yukarıdaki DoD'lar yeşil
- [ ] Tüm 14 kategori PNG hazır (veya placeholder SVG)
- [ ] Workers backend + frontend tamam
- [ ] Stock sayfası worker dropdown
- [ ] Dashboard sadeleştirilmiş
- [ ] Light mode aktive
- [ ] Migration uygulandı
- [ ] Seed-v1.1.0 çalıştırıldı
- [ ] Tüm sayfalar smoke test
- [ ] CI yeşil (lint + typecheck + test + build)
- [ ] GitHub Release yazıldı

---

## 📅 Son Güncelleme

19 Ekim 2026 — v1.1.0 sprint devam ediyor

**Sonraki adım:** `notes/ROADMAP.md` oluştur, alpha/beta/release timeline'ı belirle