# 🎬 Müşteri Demo Scripti — WireStock

> **Hedef:** Müşteriye 10 dakikada WireStock'ın değerini göstermek.
> **Sonuç:** "₺499/ay öder misiniz?" sorusunu sormak.

---

## 📋 Ön Hazırlık (Mağazaya Girmeden Önce)

- [ ] Laptop + şarj aleti
- [ ] Mouse (sunum için trackpad yeterli değil)
- [ ] Demo telefonu (kamera test için)
- [ ] Yazıcıdan çıkarılmış 2-3 örnek barkod etiketi (göstermek için)
- [ ] Yazıcı etiket (müşteri de deneyebilir)

## 🌐 Demo Ortamı

- URL: http://localhost:3000
- Kullanıcı: `admin@wirestock.com`
- Şifre: `demo123456`

## 📞 Açılış (1 dakika)

> "Merhaba [İsim]. 10 dakikan var mı? Sana depolarını nasıl dijitalleştirebileceğini göstereyim."

### Açılış Sorusu
> "Şu an stok takibini nasıl yapıyorsun? Excel mi, kâğıt mı?"

**Dinle.** Not al. **Bunu hatırla** — sonunda referans olacak.

---

## 🎬 DEMO AKIŞI (10 dakika)

### 1️⃣ LOGIN (30 saniye)

**Yap:**
1. `http://localhost:3000/login` aç
2. Login ol
3. Sidebar'ı göster

**Söyle:**
> "Bu senin panelin. Soldaki menüden her şeye ulaşabilirsin."

---

### 2️⃣ PANEL DASHBOARD (45 saniye)

**Yap:**
1. `/dashboard` (default zaten burası)

**Söyle:**
> "Burası depolarının kalbi. Bak: ₺37.230 değerinde malın var. **124 ürünün stoğu bitmiş** — bunları hemen tedarik etmen lazım."

**Göster:**
- 4 KPI paneli (Ürün sayısı, değer, satış potansiyeli, bugünkü hareket)
- Kırmızı alarm banner (124 ürün dikkat bekliyor)

---

### 3️⃣ KATEGORİLER + YENİ ÜRÜN (1.5 dakika)

**Yap:**
1. Sidebar → "Kategoriler"
2. 23 ana kategoriyi göster (kraft tasarım + texture'lar)
3. **Aydınlatma** kartına tıkla → alt kategoriler
4. Bir alt kategoriye tıkla → ürünler
5. **Geri dön → Ürünler**
6. Bir ürün seç (örn. NYM 3x2.5 Kablo)

**Söyle:**
> "Bak, bütün ürünlerin raf raf düzenlenmiş. Aydınlatmaya tıklayınca sadece aydınlatma malzemeleri geliyor. Hiç karışmıyor."

---

### 4️⃣ BARKOD BASMA (1.5 dakika) ⭐ YENİ!

**Yap:**
1. Ürün tablosunda **barkod ikonuna** tıkla (yeşil/mor renkli)
2. Modal açılır
3. **"Barkod Üret"** tıkla → 13 haneli barkod oluşur
4. **"Etiket Yazdır"** tıkla → yazdırma penceresi açılır
5. Veya **"PNG İndir"** → dosya iner

**Söyle:**
> "Şimdi bu ürüne bir barkod atayalım. Sistem otomatik 13 haneli barkod üretti — Türkiye prefix'iyle (869). Etiket yazıcıyla bunu bastığında, malzemenin üstüne yapıştırıyorsun. **Bir kere basıyorsun, sonsuza kadar kullanıyorsun.**"

**Etki:** "Yazıcıdan çıkardığım örnek etiketi gösteriyorum. Bu [müşteri adı] senin için."

---

### 5️⃣ BARKOD TARAMA + HIZLI TÜKETİM (1.5 dakika) ⭐ YENİ!

**Yap:**
1. Sidebar → **"Barkod Tara"**
3. **Klavye** sekmesine geç (kamera zor olabilir, önce klavye)
4. Bir barkod yaz (örn. `8693803019595` SIG-C16-3P) → **Tara**
5. Ürün kartı açılır — bilgiler + mevcut stok + raf
6. "Miktar" input'a `3` yaz
7. **"Düş"** tıkla → ses efekti + yeşil toast + sağa "Son Tarama" düşer

**Söyle:**
> "Sahada çalışırken, elindeki barkodu okutuyorsun. Ürün bilgisi, mevcut stok, hangi rafta — hepsi önünde. İş başında '5 metre kablo kullandım' diyorsun, **stok otomatik düşüyor**. Akşam raporuna yansıyor."

> "**Bonus:** Telefonun kamerasıyla okutabilirsin. Barkod yapıştırılmış etikete yaklaştırdığın an tarıyor."

---

### 6️⃣ RAPORLAR (2 dakika)

**Yap:**
1. Sidebar → **"Raporlar & Analiz"**
2. **"Genel Bakış"** tab'ı (zaten default)
3. **"Kritik Stok"** tab'ına geç
4. Filtrele: "Kritik" → ürünler
5. **"Satın Alma"** tab'ına geç
6. Mega hero: "Bugün Satın Al — ₺10.790"

**Söyle:**
> "Sana her sabah 3 rapor veriyor: Ne bitti? Ne azalıyor? Ne almalıyım? **₺10.790'lık** sipariş listesi hazır. Tedarikçini arıyorsun, listeyi söylüyorsun, iş bitti."

---

### 7️⃣ FİYATLANDIRMA (1 dakika) ⭐ ÖNEMLİ

**Yap:**
> Kapatmadan hemen önce söyle:

> "Şimdi sana fiyat modelinden bahsedeyim. 3 farklı şekilde kullanabilirsin:
>
> 1. **Kendi bilgisayarına kuruyorsun** — ₺499/ay. İnternet olmasa bile çalışır.
> 2. **Bizim sunucumuzda barındırıyoruz** — ₺799/ay. Sıfır kurulum, biz yönetiyoruz.
> 3. **Kendi sunucusuna kuruyoruz** — ₺999/ay. Tam kontrol.
>
> Hepsi aynı özellik. Aylık, yıllık veya ömür boyu ödeyebilirsin."

---

### 8️⃣ KAPANIŞ + 5 SORU (2 dakika)

**5 Satış Sorusu:**

1. **"Şu an en çok ne seni zorluyor?"** — Problem tanımı
2. **"Malzeme bitti mi diye sık sık depoya gidiyor musun?"** — Acı noktası
3. **"İş başında kaç metre kablo harcadığınızı takip edebiliyor musun?"** — Ölçüm
4. **"Yıl sonu sayımı kaç gün sürüyor?"** — Zaman
6. **"Bunu ₺499/ay'a kullansan, ne düşünürsün?"** — Pricing testi

**Kapanış:**
> "Seni 1 hafta ücretsiz denemen için çağırayım. Telefonuma yaz, hesabını açayım."

---

## ❌ YAPMA

- ❌ **Çok hızlı geçme.** Hız değil, anlama önemli.
- ❌ **Teknik detaylara dalma.** "PostgreSQL sharding" gibi şeyler söyleme.
- ❌ **İlk 5 dakikada fiyat söyleme.** Önce değeri göster.
- ❌ **Olmayan özellik vaat etme.** "Yapay zeka ile X olacak" gibi.
- ❌ **Demo'da hata yapma.** Önceden test et. ## ✅ YAP

- ✅ **Müşterinin eline dokunmadan önce sor.** "Şu an nasıl yapıyorsun?"
- ✅ **Müşterinin gözüne bak.** Ekranı değil.
- ✅ **Örnek barkod etiketini göster.** Fiziksel.
- ✅ **Müşteri telefonuyla kendi okutsun.**
- ✅ **Sonunda sessiz kal.** Cevabı bekle.

---

## 🎯 Hedef Metrikler

| Metrik | Hedef |
|--------|-------|
| Demo süresi | 10-15 dakika |
| Fiyat sorusu sorma | Her demo'da |
| "₺499/ay öderim" cevabı | %30+ müşteri |
| Demo sonrası takip | 24 saat içinde |

---

## 📞 Sonrası

Müşteri "düşüneceğim" derse:
- 24 saat içinde aramayı unutma
- "₺499/ay 1 yıllık ömür boyu lisans ₺4999" — %50 off döndür
- Müşterinin en acil ihtiyacını not al, takip et

Müşteri "evet" derse:
- Email + telefon al
- Hemen hesap aç
- 1 hafta ücretsiz dene, sonra ödeme

---

**Son güncelleme:** 2026-10-19