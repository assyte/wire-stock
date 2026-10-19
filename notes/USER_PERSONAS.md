# 👥 Karakterler & Personalar

> **WireStock v1.1.0 — "DükkanDepo"**

Üç ana kullanıcı tipi var. Her birinin ihtiyaçları farklı, UI onlara göre şekilleniyor.

---

## 👔 Patron (İşveren) — "Mahzur"

### Profil
- **Yaş:** 40-55
- **Teknik bilgi:** Elektrik mühendisi veya teknisyen
- **İş tipi:** Şirket sahibi, birden fazla şantiye yönetir
- **Günde kaç defa kullanır:** 2-5 defa (günde bir-iki kontrol)

### Ana ihtiyaçları
1. **"Depoda ne var?"** → Hızlı bakış (stok seviyeleri)
2. **"Bu ay ne aldım?"** → Raporlar
3. **"Ustalar ne aldı?"** → Çalışan bazlı geçmiş
4. **"Hangi malzeme bitti?"** → Düşük stok uyarıları

### UI tercihleri
- Bilgi-yoğun dashboard (çok KPI aynı anda)
- Trend grafikleri (recharts)
- Raporlama kolaylığı
- Bulk işlemler (toplu ekleme/silme)

### Yetkiler (tüm işlemler)
- ✅ Çalışan ekleme/silme/düzenleme
- ✅ Depo yönetimi
- ✅ Tüm malzeme CRUD
- ✅ Stok giriş/çıkış (her iki yönde)
- ✅ Raporlar

---

## 🔧 Usta (Elektrikçi) — "Usta"

### Profil
- **Yaş:** 25-50
- **Teknik bilgi:** Usta elektrikçi
- **İş tipi:** Sahada çalışır, malzeme alır-çıkar
- **Günde kaç defa kullanır:** 3-8 defa (sık)

### Ana ihtiyaçları
1. **"Şu malzemeyi alıyorum"** → Hızlı stok girişi (1-2 tık)
2. **"Şantiyeye götürüyorum"** → Hızlı çıkış (kime verildi seçilebilir)
3. **"Bitti mi?"** → Malzeme bazlı hızlı sorgu
4. **"Geçen ne aldım?"** → Kişisel geçmiş

### UI tercihleri
- **Hız!** Her işlem max 3 tıkla yapılmalı
- Mobil uyumlu (sahada telefonla kullanır)
- Barkod okuyucu (v1.1.1'de)
- Basit form, az alan
- Tek ekranda her şey

### Yetkiler
- ✅ Malzeme listeleme (okuma)
- ✅ Stok girişi (malzeme aldığında)
- ✅ Stok çıkışı (şantiyeye götürdüğünde, kendi adına)
- ✅ Malzeme arama (barkod veya isim)
- ❌ Çalışan yönetimi (sadece Patron)
- ❌ Depo yönetimi (sadece Patron)

---

## 🛒 Çırak — "Çırak"

### Profil
- **Yaş:** 18-25
- **Teknik bilgi:** Çırak, yeni öğreniyor
- **İş tipi:** Yardım eder, malzeme taşır
- **Günde kaç defa kullanır:** 1-3 defa

### Ana ihtiyaçları
1. **"Şu malzemeden alıyorum"** → Hızlı çıkış
2. **"Hangi malzeme nerede?"** → Depo listesi

### UI tercihleri
- **Çok basit**, mobil-first
- Sadece "Stok Çıkışı" butonu yeterli
- Öğretici ipuçları (tooltips)

### Yetkiler (en kısıtlı)
- ✅ Sadece "Stok Çıkışı" (malzeme verildi olarak)
- ❌ Stok girişi (Patron veya Usta yapar)
- ❌ Hiçbir CRUD

---

## 🔄 Permission Matrix

| İşlem | Patron | Usta | Çırak |
|-------|--------|------|-------|
| Dashboard görüntüle | ✅ | ✅ | ✅ (sade) |
| Malzeme listeleme | ✅ | ✅ | ❌ |
| Malzeme CRUD | ✅ | ❌ | ❌ |
| Depo listeleme | ✅ | ✅ | ❌ |
| Depo CRUD | ✅ | ❌ | ❌ |
| Stok girişi | ✅ | ✅ | ❌ |
| Stok çıkışı | ✅ | ✅ | ✅ |
| Kategori listeleme | ✅ | ✅ | ❌ |
| Kategori CRUD | ✅ | ❌ | ❌ |
| Çalışan listeleme | ✅ | ✅ | ❌ |
| Çalışan CRUD | ✅ | ❌ | ❌ |
| Raporlar | ✅ | ✅ (kişisel) | ❌ |

---

## 🎬 Günlük Senaryolar (User Stories)

### Senaryo 1: Patron sabah açıyor

```
1. Patron login olur → Dashboard
2. "Toplam Malzeme: 125" "Düşük Stoklu: 3" "Aktif Çalışan: 4" kartları görür
3. "Son Hareketler" listesinde dün akşam Ahmet'in aldığı malzemeleri görür
4. Hızlı işlem: "Stok Girişi" → Tedarikçiden gelen NYM kablo → 100 metre
5. Dashboard'a döner → yeni istatistikler görünür
```

### Senaryo 2: Usta şantiyeye gidiyor

```
1. Usta login → /stock sayfası
2. "Stok Çıkışı" formunu açar
3. Malzeme seçer: NYM 3x2.5
4. Miktar: 50 metre
5. Kime: "Ahmet Demir" (Patron da olabilir)
6. "Onayla" → Stok düşer, dashboard güncellenir
7. Şantiyeye gider, döner
```

### Senaryo 3: Çırak yardım ediyor

```
1. Çırak login → sadece Dashboard görür
2. Dashboard'da "Stok Çıkışı" butonu (sade çıkış için)
3. Tıklar → basit form: malzeme seç, miktar, patron/ustaya atayan kişi
4. "Çıkış yap" → malzeme çıkışı patron/ustaya atanır
```

---

## 🎨 UI'da karakter ayrımı

### Renk kodlaması (avatar/rol gösterimi)
- **Patron**: brand-primary (yeşil) badge — `#059669`
- **Usta**: info (mavi) badge — `#3B82F6`
- **Çırak**: warning (turuncu) badge — `#F59E0B`

### Sidebar'da gösterim
Kullanıcı adının yanında rol badge'i (küçük, hızlı bakış için):
```
[Patron] Faruk Yıldırım [👔]
[Usta]  Ahmet Demir    [🔧]
[Çırak] Murat Çelik    [🛒]
```

---

## 🚀 Plan

- [ ] Worker modelinde `role` enum ekle (`OWNER`, `TECHNICIAN`, `ASSISTANT`)
- [ ] Backend auth'ta worker bilgisi yükle (current-user dekoratörü)
- [ ] Frontend auth-store'da user.workerType
- [ ] Sidebar'da rol badge göster
- [ ] Stock sayfasında: Usta sadece kendi adına çıkış yapabilsin
- [ ] Çırak: sadece basit çıkış formu görsün (diğer tüm UI gizli)

**Son güncelleme:** 19 Ekim 2026