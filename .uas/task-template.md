# UAS Task Template — wire-stock

Bu dosya wire-stock için UAS görevlerinin nasıl yazılacağını gösterir. Her UAS çalıştırmasında bu pattern'i kullan.

## Standart Task Format

```
"NASIL yapılacak: [kısa eylem]. AMACI: [kullanıcı ihtiyacı]. KISITLAMALAR: [sınırlamalar]. KABUL KRİTERLERİ: [bitirme ölçütü]"
```

## Örnekler (Bu projeden)

### v1.1.0-alpha — Categories PNG'leri ve Animasyon

```
"NASIL: Her 14 ana kategori için 512x512px PNG üret, apps/web/public/categories/ altına koy. CategoryCard component'inde büyük PNG + gradient. Hover scale + rotate + glow animasyon ekle. AMACI: Usta için kategoriler görsel olarak anlaşılır olsun. KISITLAMALAR: light mode renklerine uy, transparan PNG, max 50KB. KABUL: PNG'ler yüklü, hover animasyonu çalışıyor, lint+build geçiyor."
```

### v1.1.0-alpha — Stock sayfası Worker search

```
"NASIL: /stock sayfasında 'hareket ekle' modalına 'kime verildi?' alanı ekle. /workers API'den dropdown çek. AMACI: Usta malzeme verirken alıcı seçebilsin. KABUL: Worker dropdown çalışıyor, hareket oluşturuluyor."
```

### v1.1.1-beta — Refactor

```
"NASIL: customers controller'da duplicate phone validation logic'i ortak bir DTO helper'a taşı. AMACI: Validation tutarlılığı. D2 sınıfı (default user review). KABUL: lint + typecheck + build geçiyor, davranış değişmemiş."
```

### v1.0.9-production — Test infrastructure

```
"NASIL: Jest + Supertest setup ekle. Backend'e unit + e2e test suite yaz. QAAgent-driven: lint+test+build CI. AMACI: %80 coverage backend'de, %70 frontend'de. KABUL: CI yeşil, tüm endpoint'ler test ediliyor."
```

## Komut Şablonları

### Manuel task çalıştırma:
```bash
cd C:\Users\asete\OneDrive\Desktop\agent-pack
node dist/cli/index.js run "[task açıklaması]"
```

### QA-sadece çalıştırma:
```bash
node dist/cli/index.js run --qa-only "lint + build kontrolü"
```

### Auto-approve ile (D0 görevleri):
```bash
node dist/cli/index.js run --auto "Typo fix"
```

### Lesson inceleme:
```bash
node dist/cli/index.js lessons --pending
node dist/cli/index.js approve les_001
```

### Memory sorgusu:
```bash
node dist/cli/index.js memory --scope=wire-stock:web-app
```

### Audit logu:
```bash
node dist/cli/index.js audit --type=task_complete
```

## Approve Workflow

D1+ görevler (refactor, schema, production) → kullanıcı review gerekir:
```bash
# Çalıştır
node dist/cli/index.js run "..."

# Çıktıyı kontrol et
node dist/cli/index.js status

# Onayla
node dist/cli/index.js approve task_001
# veya
node dist/cli/index.js reject task_001
```

## Hata Durumunda

```bash
node dist/cli/index.js audit --type=runtime_error
```

## Lessons'tan Faydalanma

Onaylanmış lessons otomatik olarak gelecek task'lere inject edilir. Mevcut lessons'ları görmek:
```bash
node dist/cli/index.js lessons
```

Yeni lesson oluşturmak için:
```bash
node dist/cli/index.js memory add --title="..." --body="..." --tags="web-app,best-practice"
```