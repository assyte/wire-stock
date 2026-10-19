# 📐 WireStock — Design Decisions

> **Son Güncelleme:** 19 Ekim 2026  
> **Sürüm:** v1.1.0 "DükkanDepo"

---

## 🎨 Tasarım Felsefesi

**"Bir usta/işveren için sade ama özgün."**

Üç temel ilke:
1. **Açık tema** — beyaz tonları, karanlık tema yok
2. **Sade** — boş alan çok olmalı, cramped değil
3. **Özgün** — generic template hissiyatı yok, elektrik sektörüne özel

---

## 🎨 Renk Paleti

### Light Mode (Final)

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--background` | `#FFFFFF` | Ana arka plan |
| `--surface` | `#F9FAFB` | Kartlar, modal arka plan |
| `--surface-elevated` | `#FFFFFF` | Dropdown, popover |
| `--border` | `#E5E7EB` | Input border, divider |
| `--border-strong` | `#D1D5DB` | Hover state border |
| `--text-primary` | `#111827` | Ana metin, başlıklar |
| `--text-secondary` | `#6B7280` | Açıklama, label |
| `--text-muted` | `#9CA3AF` | Placeholder, disabled |

### Brand & Semantic

| Token | Değer | Kullanım |
|-------|-------|----------|
| `--brand-primary` | `#059669` (yeşil) | Primary CTA, logo, accent |
| `--brand-hover` | `#047857` | Hover state |
| `--brand-soft` | `#D1FAE5` | Background tint |
| `--success` | `#10B981` | Onay, aktif state |
| `--warning` | `#F59E0B` | Düşük stok, uyarı |
| `--error` | `#EF4444` | Hata, silme |
| `--info` | `#3B82F6` | Bilgi badge |

**Neden yeşil?** Elektrik = enerji = yeşil. Sektörel kimlik.

### Kategori Renkleri (12 ana)

```
kablolar         → #3B82F6  (mavi)
tesisat          → #10B981  (yeşil)
anahtar-priz     → #8B5CF6  (mor)
sigortalar       → #EF4444  (kırmızı)
salt             → #F59E0B  (turuncu)
aydinlatma       → #FFB800  (sarı/amber)
pano             → #737373  (gri)
klemens          → #06B6D4  (cyan)
motor            → #84CC16  (lime)
topraklama       → #10B981  (yeşil)
endustriyel     → #F97316  (turuncu)
trafo-ups        → #7C3AED  (indigo)
sarf             → #737373  (gri)
```

---

## 🖼️ Tipografi

**Font ailesi:** Inter (Google Fonts)
- Variable font, tüm ağırlıklar tek dosya
- Tailwind `font-sans` default

| Element | Class | Boyut |
|---------|-------|-------|
| H1 (sayfa başlığı) | `text-3xl font-bold` | 30px |
| H2 (bölüm) | `text-2xl font-semibold` | 24px |
| H3 (kart başlığı) | `text-xl font-semibold` | 20px |
| H4 (modal başlık) | `text-lg font-semibold` | 18px |
| Body | `text-sm` | 14px |
| Small | `text-xs text-text-muted` | 12px |
| Display (stat) | `text-2xl font-bold` | 24px |

---

## 📐 Spacing & Layout

### Tailwind spacing scale (4px grid):
- `gap-2` (8px) — tight
- `gap-3` (12px) — compact
- `gap-4` (16px) — default
- `gap-6` (24px) — spacious
- `gap-8` (32px) — sections

### Container
- `max-w-7xl` (1280px) — full width pages
- `max-w-4xl` (896px) — forms, content
- `max-w-2xl` (672px) — modals

### Card padding
- Compact: `p-4` (16px)
- Default: `p-6` (24px)
- Spacious: `p-8` (32px)

---

## 🎭 Animasyon Standartları

### Duration
- **Micro** (hover): `duration-150`
- **Standard**: `duration-300`
- **Slow** (page transitions): `duration-500`

### Easing
- Default: `ease-out` (Tailwind)
- Smooth entrance: `ease-in-out`

### Standart animations

| Eylem | Animasyon |
|-------|-----------|
| Button hover | `transition-colors duration-150` |
| Card hover | `transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5` |
| Page load | Stagger children (100ms gecikme) |
| Modal | `transition-opacity + scale` |
| Sidebar item | Slide-in `duration-200` |
| Toast | Slide-in from top-right |

---

## 🧩 Component Stilleri

### Button
- **Primary**: `bg-brand-primary text-white hover:bg-brand-hover`
- **Secondary**: `bg-surface text-text-primary border hover:bg-surface-elevated`
- **Ghost**: `bg-transparent text-text-primary hover:bg-surface`
- **Danger**: `bg-error text-white hover:bg-error/90`
- **Sizes**: sm (h-8), md (h-10), lg (h-12)

### Card
- `bg-surface border rounded-lg p-6 shadow-sm hover:shadow-md transition`

### Input
- `bg-surface border rounded-md h-10 px-3 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20`

### Badge
- Default: `bg-surface text-text-secondary rounded-full px-2 py-0.5 text-xs`
- Brand: `bg-brand-soft text-brand-primary`
- Status colors: success/warning/error/info ile aynı pattern

---

## 📐 Layout Patterns

### Dashboard layout (3 bölüm)
1. **Top stats** — 3 KPI card, yatay grid
2. **Middle** — 2 sütun (recent movements + recent workers activities)
3. **Bottom** — Quick actions grid (4 buton)

### List page layout
1. Header (title + count + actions)
2. Filters bar (search + filter dropdowns)
3. Table veya card grid
4. Pagination (footer)

### Detail page
1. Header (title + breadcrumb + actions)
2. Info card (metadata)
3. Tabs veya sections
4. Related items

---

## 🌈 Gradient Patterns

### Brand gradient (logo, primary buttons)
```
bg-gradient-to-r from-brand-primary to-emerald-600
```

### Card hover (subtle)
```
hover:bg-gradient-to-br hover:from-brand-soft/30 hover:to-transparent
```

### Decorative (hero sections)
```
bg-gradient-to-br from-brand-soft/20 via-transparent to-transparent
```

---

## 📸 Empty States

### Pattern
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="rounded-full bg-surface p-3 mb-3">
    <Icon className="h-6 w-6 text-text-muted" />
  </div>
  <p className="text-sm text-text-secondary">Başlık</p>
  <p className="text-xs text-text-muted">Açıklayıcı metin</p>
  <Button className="mt-4">İlk öğeyi ekle</Button>
</div>
```

### Samimi mesajlar (Türkçe)
- "Henüz malzeme eklenmemiş" → "Hadi ilk malzemeyi ekleyelim!"
- "Müşteri yok" → "Henüz tanıdığımız müşteri yok"
- "Stokta ürün yok" → "Deponuz şu an boş"

---

## 📂 PNG İkonlar (Kategori)

### Konum: `apps/web/public/categories/`

### Liste (14 ana kategori)
- `kablolar.png` — NYM kablo kesiti
- `tesisat.png` — PVC boru ve buat
- `anahtar-priz.png` — Viko anahtar/priz
- `sigortalar.png` — NH sigorta veya MCB
- `salt.png` — Kontaktör
- `aydinlatma.png` — LED ampul
- `pano.png` — Pano kutusu (kare veya dikdörtgen)
- `klemens.png` — Klemens terminal
- `motor.png` — Asenkron motor
- `topraklama.png` — Bakır bara + klemens
- `endustriyel.png` — CEE fiş-priz (mavi)
- `trafo-ups.png` — Trafo veya UPS
- `alet.png` — Pense veya tornavida
- `sarf.png` — Kablo bağı veya bant

### Spec
- Format: PNG, **transparent background**
- Boyut: 512x512px (2x retina için)
- Stil: **Flat illustration** (basit, 2-3 renk)
- Tutarlı görsel dil: tüm ikonlar aynı çizerin elinden çıkmış gibi

### Kaynak önerileri
1. **Open source:** SVGRepo, Flaticon (ücretsiz)
2. **AI generated:** Midjourney, DALL-E, Leonardo.ai (telif hakkı konusunda dikkat)
3. **Custom:** Bir grafiker çizerse en iyisi

### Kullanım
```tsx
<Image
  src="/categories/kablolar.png"
  alt="Kablolar"
  width={120}
  height={120}
  className="object-contain"
/>
```

---

## 🖼️ Sayfa Görselleri

### Hero / Empty state görselleri
- **Boş depo**: `apps/web/public/illustrations/empty-warehouse.svg`
- **Login arka plan**: `apps/web/public/illustrations/login-bg.svg`
- **404 sayfası**: `apps/web/public/illustrations/404.svg`

Bu görseller de özel tasarım olmalı — generic illüstrasyon yerine **elektrik dükkanı teması**.

---

## 🚫 YAPMA — Kurallar

- ❌ Karanlık tema (sadece light)
- ❌ Emoji (PNG veya Lucide vector)
- ❌ Generic spinners (özel loading states)
- ❌ Tailwind palette'in default renkleri (mavi-500, kırmızı-500) — brand token kullan
- ❌ Inline stiller (Tailwind class kullan)
- ❌ Inline icon-color (text-brand-primary kullan)
- ❌ Çok sayıda renk (max 3 renk/sayfa)

## ✅ YAP — Kurallar

- ✅ Tek tip layout (tüm sayfalar aynı grid)
- ✅ Tutarlı spacing (4px grid)
- ✅ Net tipografi hierarchy
- ✅ Nefes alanı (boş yer bırak)
- ✅ 2-3 renk/sayfa max
- ✅ Custom illustrations (elektrik themed)
- ✅ Stagger animations (kartlar sırayla)
- ✅ Hover micro-interactions
- ✅ Samimi empty state mesajları

---

## 🔍 Erişilebilirlik (a11y)

- Tüm interaktif öğeler **focus-visible:ring-2** ile
- Renk kontrastı WCAG AA: text-text-primary bg-background ≥ 7:1
- Emoji yerine text label (her zaman)
- aria-label ikon-only button'larda
- Skip to content link (layout'ta)

---

## 📱 Responsive (Mobile-first)

- Mobile (< 640px): tek sütun, hamburger menü
- Tablet (640-1024px): 2 sütun grid
- Desktop (> 1024px): 3 sütun grid

**Tailwind breakpoints:** `sm` 640, `md` 768, `lg` 1024, `xl` 1280

---

## 📅 Geçerlilik

Bu kararlar **v1.1.0** ve sonrası için geçerlidir. v1.1.1'de küçük güncellemeler olabilir (ör: PNG ikonlar eklenince).

**Son değişiklik:** 19 Ekim 2026 — light mode renk paleti + kategori renkleri finalize edildi.