# 🏗️ Mimari Notları

> **WireStock v1.1.0** — teknik kararlar ve nedenler

---

## 🎯 Genel Mimari

**Monorepo:** Turborepo + pnpm workspaces

```
wire-stock/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js 15 frontend
├── packages/
│   ├── database/     # Prisma schema + seed
│   ├── types/        # Paylaşılan TS tipleri
│   ├── utils/        # Paylaşılan fonksiyonlar
│   ├── tsconfig/     # Paylaşılan tsconfig
│   └── eslint-config/
├── notes/            # Tasarım ve mimari notları (BU DİZİN)
└── apps/web/public/  # Statik dosyalar (kategori PNG vb.)
```

---

## 📦 Backend (NestJS) Modüller (v1.1.0)

### Aktif modüller (6)

| Modül | Endpoint Sayısı | Amaç |
|-------|---------|-------|
| `AuthModule` | 5 | Login, register, refresh, logout, me |
| `ProductsModule` | 7 | CRUD, barcode, listeleme |
| `CategoriesModule` | 3 | Basit flat CRUD |
| `WarehousesModule` | 8 | CRUD + raflar |
| `StockModule` | 5 | IN, OUT, ADJUST, listeleme, low-stock |
| `WorkersModule` (yeni) | 5 | Çalışan CRUD |
| `UnitsModule` | 5 | Birim tanımları |
| `HealthModule` | 1 | Health check |

**Toplam:** ~50 endpoint (önceki: 60+)

### Silinen modüller
- ❌ CustomersModule (5 endpoint)
- ❌ SalesModule (5 endpoint)
- ❌ SuppliersModule (5 endpoint)
- ❌ OrganizationsModule (3 endpoint)

---

## 🗄️ Database (Prisma)

### Modeller (v1.1.0 sonrası)

**Korunan modeller (13):**
- Organization (basit)
- User
- Session
- Worker ← **YENİ**
- Product
- Unit
- Brand
- Category (flat, parentId opsiyonel)
- Warehouse
- Shelf
- StockLevel
- StockMovement (workerId eklendi)
- Warehouse (`isDefault`, `addressCity`, `addressDistrict` sadeleştirildi)

**Silinen modeller (11) — v1.1.1 migration:**
- ❌ Supplier
- ❌ SupplierProduct
- ❌ Customer
- ❌ SalesOrder
- ❌ SalesOrderItem
- ❌ PurchaseOrder
- ❌ PurchaseOrderItem
- ❌ Project
- ❌ ProjectItem
- ❌ Task
- ❌ Invoice
- ❌ InvoiceItem

---

## 🔐 Auth & Permissions

### JWT Flow
```
Login → accessToken (15m) + refreshToken (7d)
     → session DB'ye kaydedilir
     → her refresh'te eski session silinir (rotation)

API Request → JwtAuthGuard (global APP_GUARD)
            → Public decorator varsa skip
            → ThrottlerGuard (rate limit)
```

### Role enum (Worker tablosunda)
```typescript
enum WorkerRole {
  OWNER       // Patron
  TECHNICIAN  // Usta
  ASSISTANT   // Çırak
}
```

**Not:** User tablosunda `role` (UserRole) zaten var. Worker için ayrı `role` (WorkerRole) olacak. Bu kasıtlı — User login'den sorumlu, Worker fiziksel çalışan.

### Permission kuralları (v1.1.0)
- **OWNER**: Her şeyi yapabilir
- **TECHNICIAN**: Stok girişi/çıkışı, malzeme okuma, kendi adına çıkış
- **ASSISTANT**: Sadece stok çıkışı (basit mod)

**Backend implementasyon:**
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(WorkerRole.TECHNICIAN)
@Post('movements')
async createMovement(...) { ... }
```

---

## 🎨 Frontend (Next.js)

### App Router yapısı
```
app/
├── (auth)/              # Auth sayfaları (layout farklı)
│   ├── login/
│   └── register/
├── (dashboard)/         # Korumalı sayfalar (sidebar var)
│   ├── layout.tsx       # Sidebar + header
│   ├── dashboard/
│   ├── products/
│   ├── categories/
│   ├── warehouses/
│   ├── stock/
│   ├── workers/         ← YENİ (v1.1.0)
│   └── reports/
├── layout.tsx           # Root
└── page.tsx             # Landing → /login'e redirect
```

### State management
- **Zustand** — auth, ui state (sidebar açık/kapalı)
- **TanStack Query** — server data (henüz yok, v1.1.0'da eklenebilir)
- Şimdilik **fetch + useState** yeterli

### Path alias'lar
```json
{
  "@/*": ["./*"],
  "@/components/*": ["./components/*"],
  "@/lib/*": ["./lib/*"],
  "@/stores/*": ["./stores/*"]
}
```

---

## 🐳 Docker

### Servisler (docker-compose)
- **postgres:16-alpine** — DB
- **redis:7-alpine** — Cache (opsiyonel, v1.1.0'da kullanılmıyor)
- **alpine/minio** — File storage (v1.1.1'de)
- **mailhog** — Email testing

### MinIO notu
- Docker Hub'daki `minio/minio` imajı **artık mevcut değil** (2026'da kaldırıldı)
- `alpine/minio` resmi image, transparent BG ile çalışıyor
- Production'da **storage** opsiyonel — şu an yok

---

## 📊 TypeScript stratejisi

### Strict mode kararları

**Backend API:**
- TS strict ayarları **devre dışı** (v1.0.1'de yapıldı)
- Neden: class-validator ile runtime validation yapıyoruz
- TODO: v1.1.1'de strict mode geri aç

**Frontend Web:**
- Tüm sayfalar `tsc --noEmit` geçiyor (0 error)
- Hatalar runtime'da yakalanıyor
- TODO: v1.1.1'de strict mode

### Path resolution

**API:**
- TS derlerken: `paths` dist içinde relative path'e dönüşür
- Runtime'da: `tsconfig-paths/register` ile çalışır
- Alternative: webpack ile build (v1.0.9'da yapılabilir)

**Web:**
- Next.js path alias'ları tsconfig + next.config.js'te tanımlı
- Hem dev hem build'de çalışır

---

## 🔄 Web timeout sorunu (KRİTİK)

### Sorun
`pnpm exec next dev` 60 dakika sonra timeout'la ölüyor (shell session).

### Çözüm adayları
1. **Production build** (`pnpm exec next build && pnpm exec next start`) — kararlı, file watcher yok
2. **PM2 / systemd** — süreç yöneticisi, otomatik restart
3. **Disable file watcher** (`NEXT_DISABLE_FILE_WATCHER=1`) — test edildi, çalışıyor ama hâlâ timeout'a tabi

### Şu anki çözüm
- Arka planda çalıştırıyoruz (`background: true`)
- 60 dakikada bir yeniden başlatma gerekli
- Production build alternatif olarak denenebilir

---

## 📦 Package.json scripts

### Root (workspace)
```json
{
  "dev": "turbo run dev",
  "build": "turbo run build",
  "start": "turbo run start",
  "lint": "turbo run lint",
  "test": "turbo run test",
  "type-check": "turbo run type-check",
  "db:migrate": "pnpm --filter @wire-stock/database run migrate:dev",
  "db:seed": "pnpm --filter @wire-stock/database run seed",
  "docker:up": "docker compose -f docker/docker-compose.yml up -d",
  "docker:down": "docker compose -f docker/docker-compose.yml down"
}
```

### API
```json
{
  "dev": "nest start --watch",
  "build": "nest build",
  "start": "node -r tsconfig-paths/register dist/main.js",
  "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
  "type-check": "tsc --noEmit",
  "test": "jest --passWithNoTests"
}
```

### Web
```json
{
  "dev": "next dev --port 3000",
  "build": "next build",
  "start": "next start --port 3000",
  "lint": "eslint \"{app,components,lib,stores}/**/*.{ts,tsx}\"",
  "type-check": "tsc --noEmit"
}
```

### Database
```json
{
  "generate": "prisma generate",
  "migrate:dev": "prisma migrate dev",
  "migrate:deploy": "prisma migrate deploy",
  "migrate:reset": "prisma migrate reset",
  "studio": "prisma studio",
  "seed": "tsx prisma/seed.ts",
  "seed:v1.1.0": "tsx prisma/seed-v1.1.0.ts"
}
```

---

## 🚀 Deploy stratejisi (v1.0.9+)

### Şu an
- GitHub Actions CI: lint + typecheck + test + build
- Container yok, VPS'e direkt deploy
- API: PM2 ile çalıştırma
- Web: Nginx reverse proxy + PM2

### Hedef (production)
- **Docker compose** ile full stack
- **GitHub Container Registry**'e image push
- **Kubernetes** veya **Docker Swarm** ile orchestrate
- **PostgreSQL managed** (Supabase, Neon, RDS)
- **Redis managed** (Upstash, Redis Cloud)
- **CDN** ile static assets (Cloudflare, Vercel)

---

## 📋 TODO (v1.1.0)

- [x] Backend modüllerini sadeleştir (4 silindi)
- [x] Categories flat view
- [x] Web sidebar sadeleştir
- [ ] Workers backend modülü
- [ ] Workers frontend sayfası
- [ ] Stock sayfasında worker dropdown
- [ ] Dashboard sadeleştirme
- [ ] Açık tema (light mode)
- [ ] PNG ikonlar (14 kategori)
- [ ] Database migration (eski 11 modeli sil)
- [ ] seed-v1.1.0 çalıştır
- [ ] Lint + build + push v1.1.0

**Son güncelleme:** 19 Ekim 2026