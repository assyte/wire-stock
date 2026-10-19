# 🖼️ Kategori PNG İkonlar

> **Hedef:** 14 ana kategori için profesyonel PNG ikon (512x512, transparent BG)

---

## 📋 Liste & Açıklamalar

| # | Slug | Ad | Görsel Açıklama | Kaynak Öneri |
|---|------|----|--------------------|---------------|
| 1 | `kablolar` | Kablolar | NYM kablo kesiti, 3 damarlı, yatay/dikey | Flaticon "cable" |
| 2 | `tesisat` | Tesisat Malzemeleri | PVC boru + buat, sıva altı/üstü | Flaticon "pvc pipe" |
| 3 | `anahtar-priz` | Anahtar & Priz | Viko beyaz anahtar, oval/yuvarlak | "switch icon flat" |
| 4 | `sigortalar` | Sigortalar | NH bıçaklı sigorta veya MCB otomat | "fuse icon" |
| 5 | `salt` | Şalt Malzemeleri | Kontaktör 3 kutuplu veya kompakt şalter | "contactor icon" |
| 6 | `aydinlatma` | Aydınlatma | LED ampul (modern, yuvarlak) veya panel | "led light icon" |
| 7 | `pano` | Pano Malzemeleri | Dikdörtgen pano kutusu, önden görünüm | "electrical box" |
| 8 | `klemens` | Klemens & Bağlantı | Phoenix Contact tarzı terminal blok | "terminal block" |
| 9 | `motor` | Motor & Sürücü | Asenkron motor yuvarlak veya frekans inverter | "electric motor" |
| 10 | `topraklama` | Topraklama | Bakır bara + klemens veya paratoner | "grounding icon" |
| 11 | `endustriyel` | Endüstriyel | CEE mavi fiş-priz (IP44) | "industrial plug" |
| 12 | `trafo-ups` | Trafo & UPS | Trafo dikdörtgen veya UPS tower | "transformer icon" |
| 13 | `alet` | Aletler | Pense veya tornavida (elektrikçi aleti) | "pliers icon" |
| 14 | `sarf` | Sarf & Montaj | Kablo bağı veya siyah izole bant | "cable tie" |

---

## 🎨 Görsel Stil Kılavuzu

### Tutarlılık için 5 kural

1. **Aynı çizer stili**: Tüm ikonlar aynı elden çıkmalı
   - Öneri: Bir AI'dan tüm seti aynı prompt ile üretmek

2. **Aynı renk paleti**: Her ikon **brand primary yeşil (#059669) + bir vurgu rengi** içermeli
   - Brand: yeşil (elektrik enerjisi)
   - Vurgu: kategoriye özel (kablo → mavi, sigorta → kırmızı)

3. **Aynı kalınlık**: Tüm çizgiler 2-3px stroke kalınlığında
   - Flat illustration, kalın outline

4. **Aynı padding**: Her PNG'de görsel asıl alanı dışında **%10 padding** olsun
   - 512x512 → iç alan 460x460

5. **Aynı background**: Hepsi transparent PNG
   - Beyaz background'a karşı yumuşak shadow ile göster

---

## 📐 Spec

| Özellik | Değer |
|---------|-------|
| Format | PNG |
| Boyut | 512x512px |
| Renk alanı | RGBA (transparent background) |
| Padding | %10 (46px her kenarda) |
| File size | Max 50KB (compression ile) |
| Format alt. | WebP fallback için `.webp` da düşün |

---

## 🚀 Uygulama

### Component kullanımı

```tsx
// components/CategoryIcon.tsx
import Image from 'next/image';

interface Props {
  slug: string;
  size?: number;
  className?: string;
}

export function CategoryIcon({ slug, size = 80, className }: Props) {
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center rounded-2xl',
        'bg-gradient-to-br from-brand-soft/30 to-transparent',
        'transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={`/categories/${slug}.png`}
        alt={slug}
        width={size * 0.7}
        height={size * 0.7}
        className="object-contain"
      />
    </div>
  );
}
```

### Fallback (PNG yoksa)

```tsx
<Image
  src={`/categories/${slug}.png`}
  alt={slug}
  ...
  onError={(e) => {
    e.currentTarget.src = `/categories/${slug}.svg`; // veya Lucide fallback
  }}
/>
```

---

## 📥 Kaynak Listesi (ücretsiz)

### Öncelikli siteler
1. **[Flaticon](https://flaticon.com)** — "electrical" kategorisi
2. **[SVGRepo](https://svgrepo.com)** — açık kaynak SVG'ler (PNG'ye çevir)
3. **[Iconify](https://iconify.design)** — 200,000+ icon

### AI generated (ücretli ama özgün)
1. Midjourney — `flat illustration of [item], transparent background, vector style, green accent color`
2. DALL-E 3 — aynı prompt
3. Leonardo.ai (ücretsiz tier var) — **önerim**

### AI prompt template
```
Flat vector illustration of [ITEM], 2D, minimal style, 
electric blue/green accent color, transparent background, 
centered composition, professional, clean lines, 
suitable for web UI, 512x512px
```

---

## ✅ Yapılacaklar

- [ ] Tüm 14 PNG'yi üret (AI veya stok foto)
- [ ] `apps/web/public/categories/` dizinine koy
- [ ] WebP versiyonlarını da üret (performans)
- [ ] `<CategoryIcon>` component'i oluştur
- [ ] Categories sayfasında hero bölümünde kullan
- [ ] Sidebar menüde de göster (küçük boy)

---

## 📝 Notlar

- PNG yoksa **emoji** veya **Lucide icon** fallback
- Her PNG `<title>` ve `alt` attribute içermeli (a11y)
- CDN'de değil, repo içinde tut (self-hosted)

**Son güncelleme:** 19 Ekim 2026