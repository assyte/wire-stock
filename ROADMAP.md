# 🗺️ WireStock — Development Roadmap

> **Sürüm Stratejisi:** Semantic Versioning (SemVer)
> - **MAJOR (v2.0.0):** Büyük feature release, breaking changes
> - **MINOR (v1.x.0):** Major özellikler, geriye uyumlu
> - **PATCH (v1.0.x):** Bugfix, küçük iyileştirmeler — sık sık (max 9 patch)
>
> Her patch bir **GitHub commit + tag** olur. Her minor/major bir **GitHub Release** olur.

---

## 📦 v1.0.x — MVP & Production Ready (Patch Serisi)

| Sürüm | Kapsam | Tahmini Süre | Durum |
|-------|--------|--------------|-------|
| **v1.0.0** | Initial Release — Altyapı, monorepo, Docker, API shell, Web shell | ✅ Tamamlandı | ✅ |
| **v1.0.1** | Auth flow polish, dashboard temel stats, error handling | 1 sprint | 🔄 Planlanan |
| **v1.0.2** | Products & Categories CRUD (UI + API entegrasyonu) | 1 sprint | 📋 Beklemede |
| **v1.0.3** | Warehouses & Stock Movements (IN/OUT/TRANSFER) | 1 sprint | 📋 Beklemede |
| **v1.0.4** | Customers & Sales Orders | 1 sprint | 📋 Beklemede |
| **v1.0.5** | Suppliers & Purchase Orders | 1 sprint | 📋 Beklemede |
| **v1.0.6** | Reports, Dashboard analytics, charts | 1 sprint | 📋 Beklemede |
| **v1.0.7** | Multi-user management, RBAC, invites | 1 sprint | 📋 Beklemede |
| **v1.0.8** | File uploads (MinIO), e-Fatura entegrasyonu | 1 sprint | 📋 Beklemede |
| **v1.0.9** | Production hardening: security audit, tests, CI/CD, docs | 1 sprint | 📋 Beklemede |

---

## 🚀 v2.0.0 — Major Features (Gelecek)

- 📱 **Mobile App** — React Native, saha uygulaması
- 🤖 **AI-Powered Insights** — Smart reordering, satış tahmini
- 🔌 **e-Fatura / e-Arşiv** — GİB entegrasyonu
- 💬 **WhatsApp & SMS** — Twilio + Meta API
- 🏢 **Multi-Branch** — Şube yönetimi
- 📊 **Advanced Analytics** — BI dashboard, cohort analysis
- 🔐 **SSO** — SAML/OAuth kurumsal giriş

---

## 🔁 Git Workflow

Her sürüm için:

```bash
# 1. Değişiklikleri yap
# 2. Test et
pnpm test

# 3. Commit (Conventional Commits)
git add .
git commit -m "feat(scope): description"

# 4. Patch bump (örn. 1.0.0 → 1.0.1)
npm version patch -m "chore(release): v1.0.1"

# 5. Push
git push origin main --follow-tags
```

### Commit Prefix'leri
- `feat:` — Yeni özellik
- `fix:` — Bug fix
- `docs:` — Sadece doküman
- `style:` — Formatting, eksik noktalama virgül
- `refactor:` — Kod değişikliği (yeni feature/fix değil)
- `perf:` — Performans iyileştirmesi
- `test:` — Test ekleme/düzeltme
- `chore:` — Build, dependencies, meta

---

## 📌 v1.0.0 — Initial Release Detay

### ✅ Tamamlanan
- [x] Monorepo setup (Turborepo + pnpm workspaces)
- [x] Docker Compose (Postgres, Redis, MinIO, MailHog)
- [x] Prisma schema (17 model, multi-tenant)
- [x] NestJS API (8 modül: auth, users, organizations, warehouses, products, categories, stock, health)
- [x] Next.js Web (login, register, dashboard shell)
- [x] JWT authentication (access + refresh tokens)
- [x] Demo seed data
- [x] Turkish UI

### 📝 Notlar
- API versioning kapatıldı (MVP için `/api/v1/...` temiz URL)
- TS strict mode API'de geçici olarak yumuşatıldı (sprint'te düzeltilecek)
- Path alias: `@/*` hem src hem dist için ayarlandı
- MinIO image: `alpine/minio` (yeni resmi image)

---

**Son güncelleme:** 2026-10-18
**Mevcut sürüm:** v1.0.0