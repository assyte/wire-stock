/**
 * WireStock - Ürün Brand Mapping (v1.1.1-alpha)
 *
 * Mevcut ürünlere brand ataması yapar (SKU prefix'inden marka tespit eder).
 * Türk elektrik piyasasındaki gerçek markalar.
 *
 * Çalıştırma:
 *   pnpm --filter @wire-stock/database exec tsx prisma/seed-product-brands.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BRAND_MAP: Array<{ prefix: string; brand: string }> = [
  { prefix: 'OZN', brand: 'Öznur' },
  { prefix: 'HES', brand: 'Hes Hacılar' },
  { prefix: '2M', brand: '2M Kablo' },
  { prefix: 'PRY', brand: 'Türk Prysmian' },
  { prefix: 'VKO', brand: 'Viko' },
  { prefix: 'SCH', brand: 'Schneider Electric' },
  { prefix: 'LGR', brand: 'Legrand' },
  { prefix: 'MKL', brand: 'Makel' },
  { prefix: 'BMS', brand: 'Bemis' },
  { prefix: 'ABB', brand: 'ABB' },
  { prefix: 'SMS', brand: 'Siemens' },
  { prefix: 'MTL', brand: 'Mutlusan' },
  { prefix: 'KLM', brand: 'Klemsan' },
  { prefix: 'WD', brand: 'Weidmüller' },
  { prefix: 'STN', brand: 'Stanley' },
  { prefix: 'KNP', brand: 'Knipex' },
  { prefix: 'BHC', brand: 'Bahco' },
];

async function main() {
  console.log('\n🏷️  Ürün brand mapping başlıyor...\n');

  const org = await prisma.organization.findUnique({ where: { slug: 'demo-elektrik' } });
  if (!org) {
    console.error('❌ demo-elektrik organization bulunamadı. Önce seed-v1.1.0 çalıştırın.');
    return;
  }

  // Brand'leri oluştur / bul
  const brandNameToId = new Map<string, string>();
  for (const { brand } of BRAND_MAP) {
    const existing = await prisma.brand.findFirst({
      where: { organizationId: org.id, name: brand },
    });
    const saved =
      existing ||
        (await prisma.brand.create({
          data: { name: brand, organizationId: org.id },
        }));
    brandNameToId.set(brand, saved.id);
  }
  console.log(`✅ ${BRAND_MAP.length} marka hazır`);

  // Ürünleri güncelle (SKU prefix'inden)
  const products = await prisma.product.findMany({
    where: { organizationId: org.id, deletedAt: null },
    select: { id: true, sku: true, brandId: true },
  });

  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (product.brandId) {
      skipped++;
      continue;
    }
    const prefix = product.sku.split('-')[0]?.toUpperCase();
    const match = BRAND_MAP.find((b) => b.prefix === prefix);
    if (!match) continue;

    await prisma.product.update({
      where: { id: product.id },
      data: { brandId: brandNameToId.get(match.brand) },
    });
    updated++;
  }

  console.log(`✅ ${updated} ürüne marka atandı (${skipped} zaten markalıydı)`);
  console.log('\n🎉 Brand mapping tamamlandı!\n');
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());