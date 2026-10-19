/**
 * WireStock v1.1.0 Seed — Minimal elektrik deposu
 *
 * Bir usta/işveren için sadeleştirilmiş katalog.
 * 14 ana kategori + temel ürünler + çalışanlar.
 *
 * Çalıştırma:
 *   pnpm exec tsx prisma/seed-v1.1.0.ts
 */
import {
  PrismaClient,
  BusinessType,
  Plan,
  UserRole,
  UnitType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =================================================================
// Minimal Kategoriler — Sadece ihtiyaç olan 14
// =================================================================
const CATEGORIES: Array<{
  slug: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}> = [
  { slug: 'kablolar', name: 'Kablolar', icon: 'cable', color: '#3B82F6', description: 'NYM, TTR, enerji ve data kabloları' },
  { slug: 'tesisat', name: 'Tesisat Malzemeleri', icon: 'package', color: '#10B981', description: 'Boru, kanal, buat, spiraller' },
  { slug: 'anahtar-priz', name: 'Anahtar & Priz', icon: 'plug', color: '#8B5CF6', description: 'Viko, Legrand anahtar ve priz çeşitleri' },
  { slug: 'sigortalar', name: 'Sigortalar', icon: 'shield', color: '#EF4444', description: 'NH, MCB, RCCB, D sigortalar' },
  { slug: 'salt', name: 'Şalt Malzemeleri', icon: 'zap', color: '#F59E0B', description: 'Kontaktör, termik, kompakt şalter' },
  { slug: 'aydinlatma', name: 'Aydınlatma', icon: 'lightbulb', color: '#FFB800', description: 'LED ampul, panel, projektör' },
  { slug: 'pano', name: 'Pano Malzemeleri', icon: 'box', color: '#737373', description: 'Pano kutusu, ray, kapak' },
  { slug: 'klemens', name: 'Klemens & Bağlantı', icon: 'zap', color: '#06B6D4', description: 'Tornavidalı, push-in, konnektör' },
  { slug: 'motor', name: 'Motor & Sürücü', icon: 'cpu', color: '#84CC16', description: 'Asenkron motor, frekans inverteri' },
  { slug: 'topraklama', name: 'Topraklama', icon: 'shield-check', color: '#10B981', description: 'Bara, klemens, paratoner' },
  { slug: 'endustriyel', name: 'Endüstriyel', icon: 'plug', color: '#F97316', description: 'CEE fiş-priz, IP44' },
  { slug: 'trafo-ups', name: 'Trafo & UPS', icon: 'battery', color: '#7C3AED', description: 'Trafo, akü, regülatör, UPS' },
  { slug: 'alet', name: 'Aletler', icon: 'wrench', color: '#EA580C', description: 'Pense, tornavida, kontrol kalemi' },
  { slug: 'sarf', name: 'Sarf & Montaj', icon: 'package', color: '#737373', description: 'Bant, kablo bağı, buat, vida' },
];

// =================================================================
// Birimler (12 adet — minimal)
// =================================================================
const UNITS = [
  { name: 'Adet', shortName: 'ad', type: UnitType.COUNT },
  { name: 'Metre', shortName: 'm', type: UnitType.LENGTH },
  { name: 'Kilogram', shortName: 'kg', type: UnitType.WEIGHT },
  { name: 'Litre', shortName: 'lt', type: UnitType.VOLUME },
  { name: 'Rulo', shortName: 'rl', type: UnitType.LENGTH },
  { name: 'Kutu', shortName: 'kt', type: UnitType.COUNT },
  { name: 'Metre (mt)', shortName: 'mt', type: UnitType.LENGTH },
  { name: 'Paket', shortName: 'pk', type: UnitType.COUNT },
];

// =================================================================
// Markalar (10 — en yaygın kullanılanlar)
// =================================================================
const BRANDS = [
  'Schneider Electric',
  'Siemens',
  'ABB',
  'Legrand',
  'Viko (Panasonic)',
  'Mutlusan',
  'Klemsan',
  'Federal Elektrik',
  'CATA',
  'Tunçmatik',
];

// =================================================================
// Çalışanlar (Karakterler)
// =================================================================
const WORKERS = [
  { firstName: "Faruk", lastName: "Yıldırım", title: "Usta Elektrikçi", phone: "+90 532 111 22 33" },
  { firstName: "Ahmet", lastName: "Demir", title: "Usta Elektrikçi", phone: "+90 535 222 33 44" },
  { firstName: "Murat", lastName: "Çelik", title: "Çırak", phone: "+90 538 333 44 55" },
  { firstName: "Hasan", lastName: "Yılmaz", title: "Çırak", phone: "+90 541 444 55 66" },
];

async function main() {
  console.log('\n🌱 WireStock v1.1.0 — Minimal seed başlıyor...\n');

  // Organization
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

  // Admin user
  const passwordHash = await bcrypt.hash('demo123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@wirestock.com' },
    update: { password: passwordHash },
    create: {
      email: 'admin@wirestock.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.OWNER,
      organizationId: org.id,
    },
  });
  console.log('✅ Organization + admin user');

  // Birimler
  for (const u of UNITS) {
    await prisma.unit.upsert({
      where: { organizationId_shortName: { organizationId: org.id, shortName: u.shortName } },
      update: {},
      create: { ...u, organizationId: org.id },
    });
  }
  console.log(`✅ ${UNITS.length} birim`);

  // Çalışanlar
  for (const w of WORKERS) {
    const existing = await prisma.worker.findFirst({
      where: { organizationId: org.id, firstName: w.firstName, lastName: w.lastName },
    });
    if (existing) {
      await prisma.worker.update({ where: { id: existing.id }, data: w });
    } else {
      await prisma.worker.create({
        data: { ...w, organizationId: org.id, isActive: true },
      });
    }
  }
  console.log(`✅ ${WORKERS.length} çalışan`);

  // Markalar
  const nameToBrand = new Map<string, string>();
  for (const b of BRANDS) {
    const existing = await prisma.brand.findFirst({ where: { organizationId: org.id, name: b } });
    const saved = existing ?? await prisma.brand.create({ data: { name: b, organizationId: org.id } });
    nameToBrand.set(b, saved.id);
  }
  console.log(`✅ ${BRANDS.length} marka`);

  // Kategoriler (sadece 14 — flat liste)
  const slugToId = new Map<string, string>();
  for (const c of CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { organizationId: org.id, slug: c.slug },
    });
    const saved = existing
      ? await prisma.category.update({ where: { id: existing.id }, data: c })
      : await prisma.category.create({
          data: { ...c, organizationId: org.id },
        });
    slugToId.set(c.slug, saved.id);
  }
  console.log(`✅ ${CATEGORIES.length} kategori`);

  // Birim map
  const unitShortNameToId = new Map<string, string>();
  const units = await prisma.unit.findMany({ where: { organizationId: org.id } });
  for (const u of units) unitShortNameToId.set(u.shortName, u.id);

  console.log('\n🎉 Temel seed tamamlandı!');
  console.log('📦 Not: Ürünler seed-v2.ts ile eklenir (komple katalog).');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });