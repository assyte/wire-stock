/**
 * WireStock - Demo Barkod Ata (v1.1.1-alpha)
 *
 * İlk 30 ürüne EAN-13 barkod atar (müşteri demosu için).
 * 869 (Türkiye GS1 prefix) ile başlar.
 *
 * Çalıştırma:
 *   pnpm --filter @wire-stock/database exec tsx prisma/seed-barcodes.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateEAN13(): string {
  const random9 = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const base12 = '869' + random9;
  const sum = base12
    .split('')
    .map(Number)
    .reduce((acc, digit, idx) => acc + digit * (idx % 2 === 0 ? 1 : 3), 0);
  const checksum = (10 - (sum % 10)) % 10;
  return base12 + checksum;
}

async function main() {
  console.log('\n📦 Demo barkod atama başlıyor...\n');

  const org = await prisma.organization.findUnique({ where: { slug: 'demo-elektrik' } });
  if (!org) {
    console.error('❌ demo-elektrik organization bulunamadı.');
    return;
  }

  const products = await prisma.product.findMany({
    where: { organizationId: org.id, deletedAt: null, barcode: null },
    take: 30,
    orderBy: { createdAt: 'asc' },
  });

  if (products.length === 0) {
    console.log('ℹ️  Tüm ürünlerin zaten barkodu var.');
    return;
  }

  let updated = 0;
  for (const product of products) {
    let barcode = '';
    let attempts = 0;
    while (attempts < 5) {
      barcode = generateEAN13();
      const existing = await prisma.product.findFirst({
        where: { organizationId: org.id, barcode },
      });
      if (!existing) break;
      attempts++;
    }
    await prisma.product.update({
      where: { id: product.id },
      data: { barcode },
    });
    updated++;
    console.log(`  ✓ ${product.sku} → ${barcode}`);
  }

  console.log(`\n✅ ${updated} ürüne barkod atandı\n`);
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());