# WireStock — Dev Notları & Kaldığımız Yer

**Tarih:** 2026-10-18
**Durum:** v1.0.0 hazır. Sistem tamamen çalışır durumda, GitHub'a push için hazırlanıyor.

---

## 📍 Şu anki sürüm: v1.0.0 (Initial Release)

Tüm altyapı ayakta:
- ✅ Docker: Postgres 16, Redis 7, MinIO (alpine/minio), MailHog — hepsi **healthy**
- ✅ MinIO `wirestock` bucket'ı otomatik oluşturuldu
- ✅ NestJS API (8 modül): http://localhost:4000/api/v1
- ✅ Next.js Web: http://localhost:3000
- ✅ JWT auth + demo data (admin@wirestock.com / demo123456)
- ✅ Türkçe UI

## 🗺️ Sıradaki patch'ler

Detaylı plan için → [ROADMAP.md](ROADMAP.md)

- **v1.0.1** → Auth flow polish, dashboard stats
- **v1.0.2** → Products & Categories CRUD
- **v1.0.3** → Warehouses & Stock Movements
- ...devamı ROADMAP'ta

---

## ✅ Tamamlanan Adımlar

### 1. Araçlar yüklü
- ✅ **Docker Desktop 29.8.2** — yüklü, ayarlar açık
- ✅ **Docker Compose v5.6.0** — çalışıyor
- ✅ **Podman Desktop 1.30.5** — yüklü (GUI)
- ✅ **Podman CLI 5.8.3** — yüklü

### 2. Proje yapısı (önceki oturumdan)
- 📁 `C:\Users\asete\OneDrive\Desktop\dev\wire-stock\`
- 📁 `docker/` — `docker-compose.yml` (Postgres, Redis, MinIO, MailHog) hazır
- 📄 `.env` — tüm environment variable'lar ayarlı
- 📁 `apps/` ve `packages/` — monorepo (turbo + pnpm workspaces)

### 3. docker-compose.yml servisleri
- **postgres** (port 5432) — Wirestock DB
- **redis** (port 6379) — Cache & Queue
- **minio** (port 9000 + console 9001) — S3 uyumlu dosya depolama
- **mailhog** (1025 + 8025) — Geliştirme e-posta
- **minio-init** (no ports) — `wirestock` bucket'ını otomatik oluşturur

### 4. MinIO değişiklikleri (Ekim 2026)
- ❌ `minio/minio` ve `minio/mc` image'ları Docker Hub'dan kaldırıldı (Ekim 2026)
- ✅ Yeni resmi image: `alpine/minio:RELEASE.2025-10-15T17-29-55Z`
- ✅ UID 1001 → `user: "0:0"` ile root olarak çalıştırılıyor (dev ortamı)
- ✅ Bucket oluşturma: `amazon/aws-cli:2.18.0` ile imzalı S3 PUT

---

## ❌ Bundan Sonraki Yapılacaklar

### ADIM 1 — Proje bağımlılıkları
```powershell
cd C:\Users\asete\OneDrive\Desktop\dev\wire-stock
pnpm install
```

### ADIM 2 — DB migration'larını çalıştır
```powershell
pnpm db:migrate
```

### ADIM 3 — Uygulamaları başlat
```powershell
pnpm dev   # turbo ile api + web paralel
```

### ADIM 4 — Doğrulama
- API → `http://localhost:3000` (?)
- Web → `http://localhost:3001` (?)
- MinIO Console → `http://localhost:9001` (wirestock / wirestock-secret)
- MailHog → `http://localhost:8025`
- DB Studio → `pnpm db:studio`

> ⚠️ MinIO image değişikliği nedeniyle eğer bir gün `docker compose down -v` yapıp
> volume'leri silersen, yeniden başlatınca `minio-init` bucket'ı tekrar oluşturacak.

---

## 🔑 Önemli Bilgiler

### Veritabanı bağlantı bilgileri (.env'den)
```
POSTGRES_USER=wirestock
POSTGRES_PASSWORD=wirestock
POSTGRES_DB=wirestock
POSTGRES_PORT=5432
DATABASE_URL=postgresql://wirestock:wirestock@localhost:5432/wirestock?schema=public
```

### MinIO bağlantısı
```
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=wirestock
MINIO_SECRET_KEY=wirestock-secret
MINIO_BUCKET=wirestock
```

### JWT (production'da değiştir!)
```
JWT_SECRET=change-me-to-a-strong-random-secret-key-min-32-chars
JWT_REFRESH_SECRET=change-me-to-another-strong-random-secret-min-32-chars
```

---

## 🛠️ Sorun Giderme Notları

### Docker daemon bağlanmıyor
- Docker Desktop kapalıysa: başlat, sistem tray'e yerleşmesini bekle
- Service başlamıyorsa: Docker Desktop'ı kapat, `com.docker.service` çalışıyor mu kontrol et
- WSL hatası: `wsl --status` ile WSL hazır mı bak

### Port çakışması
- Postgres 5432 başka bir yerde kullanılıyorsa `.env`'de `POSTGRES_PORT` değiştir
- Aynı şekilde Redis, MinIO portları da override edilebilir

### Container rebuild
```powershell
docker compose down -v       # volume'ler dahil sil
docker compose up -d --build
```

---

## 📂 Faydalı Yollar

| Ne | Yol |
|---|---|
| Proje kökü | `C:\Users\asete\OneDrive\Desktop\dev\wire-stock\` |
| Docker config | `C:\Users\asete\OneDrive\Desktop\dev\wire-stock\docker\` |
| Env dosyası | `C:\Users\asete\OneDrive\Desktop\dev\wire-stock\.env` |
| WSL kurulum script | `C:\Users\asete\OneDrive\Desktop\dev\install-wsl.ps1` |
| Bu notlar | `C:\Users\asete\OneDrive\Desktop\dev\wire-stock\DEV-NOTES.md` |

---

## 📝 Yarın Hatırlatmalar

- [ ] Bilgisayarı yeniden başlat
- [ ] Yönetici PowerShell'de WSL 2 kurulumunu tamamla
- [ ] Ubuntu kur + kullanıcı adı/şifre belirle
- [ ] Bilgisayarı tekrar başlat (gerekirse)
- [ ] Docker Desktop'ı aç, daemon hazır olmasını bekle
- [ ] `docker compose up -d` ile servisleri başlat
- [ ] `docker compose ps` ile doğrula
- [ ] `pnpm install` ve `pnpm dev`
- [ ] MinIO console'a gir, `wirestock` bucket'ını oluştur (yoksa)