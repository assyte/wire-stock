# ⚡ WireStock

> **Modern, fast inventory & warehouse management platform built specifically for the Turkish electrical & electronics industry. Single-binary desktop install, offline-first.**

[![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange.svg)](https://pnpm.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue.svg)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)](docker/docker-compose.yml)

[**Features**](#-features) • [**Quick Start**](#-quick-start) • [**Architecture**](#-architecture) • [**Roadmap**](#-roadmap) • [**Contributing**](#-contributing)

---

## 🎯 About

WireStock is a **desktop application** designed specifically for the Turkish electrical & electronics supply chain — electrical contractors, retailers, wholesalers, panel builders, and field service teams. It replaces error-prone paper ledgers and fragmented spreadsheets with a single, fast, intuitive system that runs on a single shop's computer.

**Why desktop?** Turkish small business owners prefer one-time licenses over monthly subscriptions, and they need to work even when their internet is down. WireStock runs offline with all features.

### Who is it for?

- 🏪 **Retail & wholesale** electrical supply stores
- 🏗️ **Contractors & installers** managing project materials
- 🔌 **Cable distributors** & lighting importers
- 🏭 **Manufacturers** & panel builders
- 🔧 **Service & maintenance** companies

---

## ✨ Features

### Core
- 📦 **Warehouse & Shelf Management** — Multi-warehouse, shelf-level tracking, location-based stock
- 📊 **Smart Inventory Tracking** — Barcode, SKU, min/critical stock alerts
- 🏷️ **Product Catalog** — Categories, brands, units, technical specs (JSON), images
- 🚚 **Purchase & Supplier Management** — Supplier cards, price history, lead times, auto-reorder suggestions
- 💼 **Sales & Customer Management** — Receivables, quick sale, quotations
- 🏗️ **Project Management (Contractor)** — Bill of materials, labor tracking, progress
- 📄 **Invoicing** — e-Invoice ready, waybills, proforma
- 📈 **Reports & Analytics** — Stock, sales, P&L, customer analytics

### Advanced
- 🤖 **AI-Powered Suggestions** — Smart reordering, demand forecasting
- 📱 **Mobile App** — Field app for technicians (coming in v2.0.0)
- 🔄 **Multi-Branch Support** — Multiple warehouses/branches per organization
- 🔌 **e-Invoice & e-Archive** — Turkish GİB compliance
- 💬 **WhatsApp & SMS Notifications** — Automated alerts
- 🔐 **Role-Based Access Control** — Owner, admin, manager, member, viewer

---

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Next.js 15** — App Router, React Server Components, SSR
- **TypeScript** — Strict mode (gradually enabled)
- **Tailwind CSS** — Utility-first styling
- **Radix UI** — Accessible primitives
- **TanStack Query** — Server state management
- **Zustand** — Client state
- **React Hook Form + Zod** — Forms & validation
- **Framer Motion** — Animations
- **Recharts** — Charts & graphs

### Backend (`apps/api`)
- **NestJS 10** — Enterprise-grade Node.js framework
- **Prisma ORM 5** — Type-safe database access
- **PostgreSQL 16** — Primary OLTP database
- **Redis 7** — Cache & session storage
- **MinIO** — S3-compatible object storage (files, images, exports)
- **JWT** — Access + refresh token authentication
- **Helmet + Throttler** — Security & rate limiting
- **Swagger** — Auto-generated API documentation

### Infrastructure
- **Monorepo:** [Turborepo](https://turbo.build) + [pnpm workspaces](https://pnpm.io/workspaces)
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (planned)
- **Quality:** Husky + lint-staged + ESLint + Prettier
- **Email:** MailHog (dev) / SMTP (prod)

---

## 🏗️ Architecture

```
wire-stock/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   └── api/              # NestJS backend  (port 4000)
├── packages/
│   ├── database/         # Prisma schema, migrations, seed
│   ├── ui/               # Shared UI components (placeholder)
│   ├── types/            # Shared TypeScript types
│   ├── utils/            # Shared utility functions
│   ├── eslint-config/    # Shared ESLint configuration
│   └── tsconfig/         # Shared TypeScript configurations
├── docker/
│   ├── docker-compose.yml  # Postgres, Redis, MinIO, MailHog
│   └── init-scripts/       # Database init scripts
├── docs/                 # Architecture decisions, guides
├── .github/              # GitHub Actions workflows
├── ROADMAP.md            # Versioned development plan
└── README.md             # ← you are here
```

### Data Model (17 models)

WireStock uses a **multi-tenant architecture** where every record is scoped to an `Organization`:

`Organization` → `User`, `Warehouse`, `Product`, `Customer`, `Supplier`, `Project`, `Order`, `Invoice`, `Category`, `Brand`, `Unit`, `StockMovement`

See [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma) for the full schema.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20.x — [download](https://nodejs.org)
- **pnpm** ≥ 9.x — `npm install -g pnpm`
- **Docker Desktop** with WSL2 backend — [download](https://www.docker.com/products/docker-desktop/)
- **Git** ≥ 2.x

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/wire-stock.git
cd wire-stock

# 2. Install dependencies (uses pnpm workspaces)
pnpm install

# 3. Copy environment files
cp .env.example .env
cp apps/web/.env.local.example apps/web/.env.local

# 4. Start infrastructure services (PostgreSQL, Redis, MinIO, MailHog)
cd docker && docker compose up -d && cd ..

# 5. Generate Prisma client & run migrations
pnpm db:generate
pnpm db:migrate

# 6. (Optional) Load demo seed data
pnpm db:seed
#   Demo credentials: admin@wirestock.com / demo123456

# 7. Start development servers (API + Web via Turbo)
pnpm dev
```

### Access Points

Once everything is running:

| Service | URL | Credentials |
|---------|-----|-------------|
| 🌐 **Web App** | http://localhost:3000 | `admin@wirestock.com` / `demo123456` |
| 🚀 **API** | http://localhost:4000/api/v1 | Bearer JWT |
| 📚 **API Docs (Swagger)** | http://localhost:4000/api/v1/docs | — |
| 🗄️ **Prisma Studio** | http://localhost:5555 | run `pnpm db:studio` |
| 📦 **MinIO Console** | http://localhost:9001 | `wirestock` / `wirestock-secret` |
| 📧 **MailHog** | http://localhost:8025 | (dev only, no auth) |

---

## 📜 NPM Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode (API + Web) |
| `pnpm build` | Production build for all apps |
| `pnpm start` | Start production builds |
| `pnpm lint` | Run ESLint across the monorepo |
| `pnpm format` | Format all files with Prettier |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Apply database migrations (dev) |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Load demo data |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |
| `pnpm clean` | Clean all build artifacts & node_modules |

---

## 🧪 Testing

```bash
pnpm test              # Run unit tests
pnpm test:watch        # Watch mode
pnpm test:e2e          # End-to-end tests (API)
pnpm test:cov          # With coverage report
```

*(Test suite expansion planned in v1.0.9)*

---

## 🗺️ Roadmap

We follow strict [Semantic Versioning](https://semver.org/):

- **MAJOR** (v2.0.0) — breaking changes, big new features
- **MINOR** (v1.x.0) — major features, backward-compatible
- **PATCH** (v1.0.x) — bugfixes, small improvements (max 9 per minor)

### v1.0.x — MVP & Production Ready

| Version | Scope | Status |
|---------|-------|--------|
| v1.0.0 | Initial Release — Infrastructure, monorepo, API & Web shells | ✅ Done |
| v1.0.1 | Auth flow polish, dashboard stats, error handling | 📋 Planned |
| v1.0.2 | Products & Categories CRUD | 📋 Planned |
| v1.0.3 | Warehouses & Stock Movements (IN/OUT/TRANSFER) | 📋 Planned |
| v1.0.4 | Customers & Sales Orders | 📋 Planned |
| v1.0.5 | Suppliers & Purchase Orders | 📋 Planned |
| v1.0.6 | Reports & analytics, dashboard charts | 📋 Planned |
| v1.0.7 | Multi-user management, RBAC, invites | 📋 Planned |
| v1.0.8 | File uploads (MinIO), e-Fatura integration | 📋 Planned |
| v1.0.9 | Production hardening: security audit, tests, CI/CD | 📋 Planned |

### v2.0.0 — Major Features (Future)

- 📱 Mobile app (React Native)
- 🤖 AI-powered insights
- 🔌 e-Invoice / e-Archive (Turkish GİB)
- 💬 WhatsApp & SMS notifications
- 🏢 Multi-branch
- 🔐 SSO (SAML/OAuth)

See the full roadmap in [ROADMAP.md](ROADMAP.md).

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

### Development Workflow

1. Fork & clone the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
4. Ensure lint & tests pass: `pnpm lint && pnpm test`
5. Push & open a Pull Request

### Code Style

- TypeScript strict mode (gradually enforced)
- ESLint + Prettier (run `pnpm format` before committing)
- Husky pre-commit hooks enabled

---

## 🔒 Security

- 🔐 All passwords hashed with **bcrypt** (configurable rounds)
- 🎫 JWT with **access + refresh token** rotation
- 🛡️ **Helmet** for HTTP headers (CSP, HSTS, etc.)
- ⏱️ **Throttler** rate limiting (100 req/min default)
- 🌐 **CORS** properly configured
- ✅ Input validation with **class-validator** + DTOs
- 🔒 Soft deletes (`deletedAt`) on sensitive entities

For security issues, please email **security@wirestock.local** (do not open public issues).

---

## 📄 License

**UNLICENSED** — All rights reserved. This is proprietary software.

Contact [info@wirestock.local](mailto:info@wirestock.local) for licensing inquiries.

---

## 📞 Contact

- 🌐 **Website:** https://wirestock.com (coming soon)
- 📧 **Email:** info@wirestock.local
- 🐛 **Issues:** [GitHub Issues](https://github.com/<your-username>/wire-stock/issues)

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org) • [NestJS](https://nestjs.com) • [Prisma](https://prisma.io)
- [PostgreSQL](https://postgresql.org) • [Redis](https://redis.io) • [MinIO](https://min.io)
- [TanStack Query](https://tanstack.com/query) • [Radix UI](https://radix-ui.com) • [Tailwind CSS](https://tailwindcss.com)

---

<div align="center">

⚡ **WireStock** — _Modern electricals, smart inventory._

Made with ❤️ in Turkey

</div>