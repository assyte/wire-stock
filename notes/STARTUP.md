# 🚀 WireStock — Hızlı Başlangıç

Her oturum başlangıcında çalıştırılacak komutlar.

## 1. Docker Servisleri (Postgres, Redis, MinIO, MailHog)

```powershell
cd C:\Users\asete\OneDrive\Desktop\dev\wire-stock
docker compose ps
```

Eğer servisler ayakta değilse:
```powershell
docker compose up -d
```

## 2. API'yi başlat (port 4000)

```powershell
cd C:\Users\asete\OneDrive\Desktop\dev\wire-stock\apps\api
pnpm build   # sadece kod değiştiyse
node -r tsconfig-paths/register dist/main.js
```

Ya da development mode:
```powershell
pnpm dev
```

## 3. Web'i başlat (port 3000)

```powershell
cd C:\Users\asete\OneDrive\Desktop\dev\wire-stock\apps\web
pnpm dev
```

## 4. Test et

- Web: http://localhost:3000/login
- API: http://localhost:4000/api/v1/health
- Swagger: http://localhost:4000/api/v1/docs

## Login (Demo)

```
Email:    admin@wirestock.com
Şifre:    demo123456
```

## ⚠️ Bilinen Sorunlar

- Web dev server 60 dakika sonra timeout oluyor → her oturum başında yeniden başlat
- Parantezli dizinler `app/(dashboard)` Windows'ta tool'ları bozabilir → `_dashboard` rename gerekirse
- Bazı node process'leri port'ta takılı kalabilir → aşağıdaki komutla temizle

## 🛠️ Port Temizleme

```powershell
# Port 3000 ve 4000'i temizle
Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 3
```