# 🔒 Güvenlik Politikası / Security Policy

> **Bu repo PRIVATE'dır.** Ticari sır içerir. Paylaşmayın.

---

## 🛡️ Hassas Bilgi Yönetimi

### ❌ Asla Commit'lenmemesi Gerekenler

Bu bilgiler **asla** Git'e gitmemeli:

- `.env` dosyaları (gerçek değerler)
- API anahtarları (Stripe, AWS, OpenAI, vs.)
- Veritabanı şifreleri
- JWT secret'ları
- Lisans anahtarları
- Müşteri verileri
- Kişisel bilgiler

### ✅ Commit'lenebilir Olanlar

- `.env.example` — placeholder değerlerle şablon
- Public test anahtarları
- Dokümantasyon

---

## 📋 Mevcut Durum (v1.1.1-alpha)

### ✅ .gitignore Kontrol Edildi

Aşağıdaki dosyalar `.gitignore`'da, Git'te **tracked değil**:

- ✅ `.env`
- ✅ `.env.local`
- ✅ `apps/*/.env`
- ✅ `packages/database/.env`

### ✅ Source Code Taraması Yapıldı

- ✅ Hardcoded password yok
- ✅ JWT secret env'den okunuyor
- ✅ Placeholder secret'ler kullanılıyor (`change-me-to-...`)

### ⚠️ Production Öncesi Yapılacaklar

Production'a geçmeden önce **kesinlikle** değiştir:

1. `JWT_SECRET` → 32+ karakter random string
2. `JWT_REFRESH_SECRET` → farklı 32+ karakter random string
3. `DATABASE_URL` → production database connection
5. `REDIS_PASSWORD` → güçlü şifre
6. `BCRYPT_ROUNDS` → 12+ (şu an 12, yeterli)

---

## 🔐 Token Rotation

### Personal Access Token (PAT)

- 90 günde bir yenile
- **asla** commit'lenecek bir yere yazma
- **asla** chat'e yapıştırma (yapay zekilere dahil)
- Repo'ya sadece `repo` + `workflow` scope

### Eğer Token Sızarsa

1. GitHub → Settings → Tokens → ilgili token → **Revoke**
2. Yeni token oluştur
3. `.git-credentials` dosyasını sil:
   - Windows: `C:\Users\<USER>\.git-credentials`
4. Tüm eski secret'ları rotate et

---

## 🐛 Güvenlik Açığı Bildirimi

Bir güvenlik açığı bulursanız:

1. **GitHub Issue açma** — public görünür
3. Bunun yerine: doğrudan sahibiyle iletişime geçin

---

## 📜 Lisans

Bu proje **UNLICENSED** (özel mülk). İzinsiz kopyalanamaz, dağıtılamaz veya reverse-engineering yapılamaz.

---

**Son güncelleme:** 2026-10-19