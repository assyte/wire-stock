import { PrismaClient, BusinessType, Plan, UserRole, UnitType, CustomerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // 1. Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-elektrik' },
    update: {},
    create: {
      name: 'Demo Elektrik Ltd. Şti.',
      slug: 'demo-elektrik',
      taxNumber: '1234567890',
      taxOffice: 'Merkez',
      address: 'Atatürk Cad. No:123',
      city: 'İstanbul',
      district: 'Kadıköy',
      phone: '+90 216 123 45 67',
      email: 'info@demo-elektrik.com',
      businessType: BusinessType.MIXED,
      plan: Plan.PRO,
      currency: 'TRY',
    },
  });

  console.log('✅ Organization oluşturuldu:', org.name);

  // 2. Demo User
  const hashedPassword = await bcrypt.hash('demo123456', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@wirestock.com' },
    update: {},
    create: {
      email: 'admin@wirestock.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+90 555 123 45 67',
      role: UserRole.OWNER,
      organizationId: org.id,
    },
  });

  console.log('✅ User oluşturuldu:', user.email);

  // 3. Birimler
  const units = [
    { name: 'Adet', shortName: 'ad', type: UnitType.COUNT },
    { name: 'Metre', shortName: 'm', type: UnitType.LENGTH },
    { name: 'Kilogram', shortName: 'kg', type: UnitType.WEIGHT },
    { name: 'Litre', shortName: 'lt', type: UnitType.VOLUME },
    { name: 'Rulo', shortName: 'rl', type: UnitType.LENGTH },
    { name: 'Kutu', shortName: 'kt', type: UnitType.COUNT },
    { name: 'Metre', shortName: 'mt', type: UnitType.LENGTH },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { organizationId_shortName: { organizationId: org.id, shortName: unit.shortName } },
      update: {},
      create: { ...unit, organizationId: org.id },
    });
  }

  console.log('✅ Birimler oluşturuldu');

  // 4. Kategoriler
  const categories = [
    { name: 'Kablolar', slug: 'kablolar', icon: 'cable', color: '#00D9A3' },
    { name: 'Pano & Sigorta', slug: 'pano-sigorta', icon: 'shield', color: '#FFB800' },
    { name: 'Aydınlatma', slug: 'aydinlatma', icon: 'lightbulb', color: '#F59E0B' },
    { name: 'Anahtar & Priz', slug: 'anahtar-priz', icon: 'plug', color: '#3B82F6' },
    { name: 'Kanal & Boru', slug: 'kanal-boru', icon: 'package', color: '#8B5CF6' },
    { name: 'Topraklama', slug: 'topraklama', icon: 'shield-check', color: '#10B981' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: cat.slug } },
      update: {},
      create: { ...cat, organizationId: org.id },
    });
  }

  console.log('✅ Kategoriler oluşturuldu');

  // 5. Markalar
  const brands = ['Hes Hacılar', 'Öznur', 'Mutlusan', 'Schneider', 'Legrand', 'Siemens', 'ABB'];
  for (const brandName of brands) {
    await prisma.brand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: brandName } },
      update: {},
      create: { name: brandName, organizationId: org.id },
    });
  }

  console.log('✅ Markalar oluşturuldu');

  // 6. Depo & Raflar
  const warehouse = await prisma.warehouse.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'ANA' } },
    update: {},
    create: {
      name: 'Ana Depo',
      code: 'ANA',
      address: org.address || '',
      city: org.city || '',
      organizationId: org.id,
      isDefault: true,
    },
  });

  const shelfCodes = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1', 'C-2', 'D-1'];
  for (const code of shelfCodes) {
    await prisma.shelf.upsert({
      where: { warehouseId_code: { warehouseId: warehouse.id, code } },
      update: {},
      create: { code, warehouseId: warehouse.id },
    });
  }

  console.log('✅ Depo ve raflar oluşturuldu');

  // 7. Örnek Ürünler
  const cableCat = await prisma.category.findFirst({ where: { slug: 'kablolar', organizationId: org.id } });
  const hes = await prisma.brand.findFirst({ where: { name: 'Hes Hacılar', organizationId: org.id } });
  const metreUnit = await prisma.unit.findFirst({ where: { shortName: 'm', organizationId: org.id } });
  const adetUnit = await prisma.unit.findFirst({ where: { shortName: 'ad', organizationId: org.id } });

  if (cableCat && hes && metreUnit && adetUnit) {
    const products = [
      {
        sku: 'NYM-3X1.5',
        name: 'NYM 3x1.5 mm² Enerji Kablosu',
        description: 'PVC izoleli, çok damarlı enerji kablosu',
        categoryId: cableCat.id,
        brandId: hes.id,
        unitId: metreUnit.id,
        purchasePrice: 12.50,
        salePrice: 18.00,
        minStock: 100,
        criticalStock: 50,
        specifications: { voltaj: '300/500V', kesit: '1.5mm²', damar: 3, renk: 'gri' },
      },
      {
        sku: 'NYM-3X2.5',
        name: 'NYM 3x2.5 mm² Enerji Kablosu',
        description: 'PVC izoleli, çok damarlı enerji kablosu',
        categoryId: cableCat.id,
        brandId: hes.id,
        unitId: metreUnit.id,
        purchasePrice: 18.00,
        salePrice: 26.50,
        minStock: 100,
        criticalStock: 50,
        specifications: { voltaj: '300/500V', kesit: '2.5mm²', damar: 3, renk: 'gri' },
      },
      {
        sku: 'NYM-5X6',
        name: 'NYM 5x6 mm² Enerji Kablosu',
        description: 'Üç fazlı tesisat için kalın kablo',
        categoryId: cableCat.id,
        brandId: hes.id,
        unitId: metreUnit.id,
        purchasePrice: 65.00,
        salePrice: 89.00,
        minStock: 50,
        criticalStock: 20,
        specifications: { voltaj: '300/500V', kesit: '6mm²', damar: 5, renk: 'gri' },
      },
      {
        sku: 'SIG-C16-3P',
        name: 'C Tipi 16A 3P Sigorta',
        description: '3 kutuplu, 16 amper, C eğrisi otomatik sigorta',
        categoryId: cableCat.id,
        brandId: hes.id,
        unitId: adetUnit.id,
        purchasePrice: 85.00,
        salePrice: 125.00,
        minStock: 20,
        criticalStock: 10,
        specifications: { akim: '16A', kutup: 3, egri: 'C', marka: 'Schneider' },
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { organizationId_sku: { organizationId: org.id, sku: product.sku } },
        update: {},
        create: { ...product, organizationId: org.id },
      });
    }

    console.log('✅ Örnek ürünler oluşturuldu');
  }

  // 8. Tedarikçi
  await prisma.supplier.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'TED-001' } },
    update: {},
    create: {
      code: 'TED-001',
      name: 'ABC Elektrik Toptan Satış',
      taxNumber: '9876543210',
      taxOffice: 'Merkez',
      contactPerson: 'Mehmet Yılmaz',
      phone: '+90 212 555 11 22',
      email: 'satis@abcelektrik.com',
      address: 'Bayrampaşa',
      city: 'İstanbul',
      organizationId: org.id,
      paymentTerms: '30 gün',
    },
  });

  // 9. Müşteri
  await prisma.customer.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'MUS-001' } },
    update: {},
    create: {
      code: 'MUS-001',
      name: 'Yıldırım İnşaat A.Ş.',
      type: CustomerType.CONTRACTOR,
      taxNumber: '5556667778',
      taxOffice: 'Beşiktaş',
      contactPerson: 'Ali Yıldırım',
      phone: '+90 532 111 22 33',
      email: 'ali@yildirim.com',
      address: 'Levent',
      city: 'İstanbul',
      organizationId: org.id,
    },
  });

  console.log('✅ Tedarikçi ve müşteri oluşturuldu');
  console.log('');
  console.log('🎉 Seed tamamlandı!');
  console.log('');
  console.log('📧 Demo Giriş Bilgileri:');
  console.log('   Email: admin@wirestock.com');
  console.log('   Şifre: demo123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
