/**
 * WireStock v2 Seed — Kapsamlı elektrik-elektronik katalogu
 *
 * Mevcut seed'in üstüne eklenir (idempotent: upsert).
 * Kategoriler: Türkiye piyasasındaki tüm ana segmentler
 * Ürünler: Gerçek marka/model örnekleri (Schneider, Siemens, ABB, Legrand, Viko, Mutlusan, Klemsan...)
 */
import {
  PrismaClient,
  BusinessType,
  Plan,
  UserRole,
  UnitType,
  MovementType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =================================================================
// 1) ORGANIZATION + USERS
// =================================================================
async function seedOrganization() {
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
  return org;
}

// =================================================================
// 2) UNITS
// =================================================================
async function seedUnits(orgId: string) {
  const units = [
    { name: 'Adet', shortName: 'ad', type: UnitType.COUNT },
    { name: 'Metre', shortName: 'm', type: UnitType.LENGTH },
    { name: 'Kilogram', shortName: 'kg', type: UnitType.WEIGHT },
    { name: 'Litre', shortName: 'lt', type: UnitType.VOLUME },
    { name: 'Rulo', shortName: 'rl', type: UnitType.LENGTH },
    { name: 'Kutu', shortName: 'kt', type: UnitType.COUNT },
    { name: 'Metre (mt)', shortName: 'mt', type: UnitType.LENGTH },
    { name: 'Paket', shortName: 'pk', type: UnitType.COUNT },
    { name: 'Çift', shortName: 'çf', type: UnitType.COUNT },
    { name: 'Set', shortName: 'st', type: UnitType.COUNT },
    { name: 'm²', shortName: 'm²', type: UnitType.AREA },
    { name: 'm³', shortName: 'm³', type: UnitType.VOLUME },
  ];
  for (const u of units) {
    await prisma.unit.upsert({
      where: { organizationId_shortName: { organizationId: orgId, shortName: u.shortName } },
      update: {},
      create: { ...u, organizationId: orgId },
    });
  }
  console.log(`✅ ${units.length} units`);
}

// =================================================================
// 3) KATEGORİLER — Türkiye piyasasının tüm ana segmentleri
// =================================================================
const CATEGORIES: Array<{ slug: string; name: string; icon: string; color: string; parent?: string; sortOrder: number }> = [
  // ─── Ana kategoriler ───
  { slug: 'kablolar', name: 'Kablolar & Tesisat', icon: 'cable', color: '#3B82F6', sortOrder: 1 },
  { slug: 'anahtar-priz', name: 'Anahtar & Priz', icon: 'plug', color: '#10B981', sortOrder: 2 },
  { slug: 'aydinlatma', name: 'Aydınlatma', icon: 'lightbulb', color: '#F59E0B', sortOrder: 3 },
  { slug: 'salt-malzemeleri', name: 'Şalt Malzemeleri & Koruma', icon: 'shield', color: '#EF4444', sortOrder: 4 },
  { slug: 'pano-malzemeleri', name: 'Pano & Şalt Tesisleri', icon: 'package', color: '#8B5CF6', sortOrder: 5 },
  { slug: 'klemens', name: 'Klemens & Bağlantı', icon: 'zap', color: '#06B6D4', sortOrder: 6 },
  { slug: 'kanal-boru', name: 'Kanal, Boru & Buat', icon: 'package', color: '#84CC16', sortOrder: 7 },
  { slug: 'aksesuar', name: 'Aksesuar & Montaj', icon: 'wrench', color: '#F97316', sortOrder: 8 },
  { slug: 'test-olcum', name: 'Test & Ölçüm', icon: 'cpu', color: '#A855F7', sortOrder: 9 },
  { slug: 'motor-surucu', name: 'Motor, Sürücü & Kontaktör', icon: 'bolt', color: '#EAB308', sortOrder: 10 },
  { slug: 'otomasyon', name: 'Otomasyon & Kontrol', icon: 'cpu', color: '#14B8A6', sortOrder: 11 },
  { slug: 'topraklama', name: 'Topraklama & Yıldırım Koruma', icon: 'shield-check', color: '#10B981', sortOrder: 12 },
  { slug: 'guvenlik', name: 'Güvenlik & Alarm', icon: 'shield', color: '#DC2626', sortOrder: 13 },
  { slug: 'yangin', name: 'Yangın Algılama & Alarm', icon: 'shield', color: '#DC2626', sortOrder: 14 },
  { slug: 'zayif-akim', name: 'Zayıf Akım & Data', icon: 'cpu', color: '#0EA5E9', sortOrder: 15 },
  { slug: 'endustriyel', name: 'Endüstriyel Fiş & Priz', icon: 'plug', color: '#F97316', sortOrder: 16 },
  { slug: 'kompanzasyon', name: 'Kompanzasyon & Harmonik', icon: 'zap', color: '#A855F7', sortOrder: 17 },
  { slug: 'ups-jenerator', name: 'UPS & Jeneratör', icon: 'battery', color: '#16A34A', sortOrder: 18 },
  { slug: 'trafolar', name: 'Trafo & Regülatör', icon: 'zap', color: '#7C3AED', sortOrder: 19 },
  { slug: 'ev-akilli', name: 'Akıllı Ev & Bina Otomasyonu', icon: 'cpu', color: '#0EA5E9', sortOrder: 20 },
  { slug: 'el-aletleri', name: 'El Aletleri & Sıkma Penseleri', icon: 'wrench', color: '#EA580C', sortOrder: 21 },
  { slug: 'izole-bant', name: 'İzole Bant & Yapıştırıcı', icon: 'package', color: '#737373', sortOrder: 22 },

  // ─── Alt kategoriler: Kablolar ───
  { slug: 'nya-kablolar', name: 'NYA / TTR Kablolar', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 1 },
  { slug: 'nym-kablolar', name: 'NYM Antistatik Kablolar', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 2 },
  { slug: 'nyp-kablolar', name: 'NYP Tesisat Kabloları', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 3 },
  { slug: 'xlpe-kablolar', name: 'XLPE Enerji Kabloları', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 4 },
  { slug: 'koaksiyel-kablo', name: 'Koaksiyel & Uydu Kabloları', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 5 },
  { slug: 'cat-data-kablo', name: 'CAT5/6/7 Data Kabloları', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 6 },
  { slug: 'fiber-kablo', name: 'Fiber Optik Kablo', icon: 'cable', color: '#3B82F6', parent: 'kablolar', sortOrder: 7 },

  // ─── Alt kategoriler: Anahtar & Priz ───
  { slug: 'anahtar', name: 'Anahtarlar (Vavien, Komütatör)', icon: 'plug', color: '#10B981', parent: 'anahtar-priz', sortOrder: 1 },
  { slug: 'priz', name: 'Prizler (Standart, UPS, Topraklı)', icon: 'plug', color: '#10B981', parent: 'anahtar-priz', sortOrder: 2 },
  { slug: 'dimmer', name: 'Dimmer & Dimmer Anahtar', icon: 'plug', color: '#10B981', parent: 'anahtar-priz', sortOrder: 3 },
  { slug: 'grup-priz', name: 'Grup Priz & Uzatma', icon: 'plug', color: '#10B981', parent: 'anahtar-priz', sortOrder: 4 },
  { slug: 'cerceve', name: 'Çerçeveler (1-2-3-4-6 lı)', icon: 'plug', color: '#10B981', parent: 'anahtar-priz', sortOrder: 5 },
  { slug: 'akilli-anahtar', name: 'Akıllı Anahtar & Priz', icon: 'cpu', color: '#10B981', parent: 'anahtar-priz', sortOrder: 6 },

  // ─── Alt kategoriler: Şalt ───
  { slug: 'woltmetrik-sigorta', name: 'W Otomatik Sigortalar (MCB)', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 1 },
  { slug: 'kacak-akim', name: 'Kaçak Akım Rölesi (RCD/RCCB)', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 2 },
  { slug: 'nh-sigorta', name: 'NH Bıçaklı Sigortalar', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 3 },
  { slug: 'silindirik-sigorta', name: 'D/D0 Silindirik Sigortalar', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 4 },
  { slug: 'kompakt-salter', name: 'Kompakt Şalter (MCCB)', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 5 },
  { slug: 'ac-dc-koruma', name: 'AC/DC Kaçak Akım Koruma', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 6 },
  { slug: 'sigorta-kutusu', name: 'Sigorta Kutusu', icon: 'shield', color: '#EF4444', parent: 'salt-malzemeleri', sortOrder: 7 },

  // ─── Alt kategoriler: Aydınlatma ───
  { slug: 'led-ampul', name: 'LED Ampul (E27, E14, GU10)', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 1 },
  { slug: 'led-panel', name: 'LED Panel & Downlight', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 2 },
  { slug: 'led-projektor', name: 'LED Projektör & Spot', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 3 },
  { slug: 'led-serit', name: 'LED Şerit & Profil', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 4 },
  { slug: 'armatur', name: 'Armatür & Aplik', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 5 },
  { slug: 'floresan', name: 'Floresan & Kompakt', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 6 },
  { slug: 'dis-mekan', name: 'Dış Mekan & Projektör', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 7 },
  { slug: 'el-feneri', name: 'El Feneri & Şarjlı Lamba', icon: 'lightbulb', color: '#F59E0B', parent: 'aydinlatma', sortOrder: 8 },

  // ─── Alt kategoriler: Pano ───
  { slug: 'pano-kutu', name: 'Pano Kutusu (Sıva Üstü/Altı)', icon: 'package', color: '#8B5CF6', parent: 'pano-malzemeleri', sortOrder: 1 },
  { slug: 'pano-aksesuar', name: 'Pano Aksesuar (Ray, Kanal, Kapak)', icon: 'package', color: '#8B5CF6', parent: 'pano-malzemeleri', sortOrder: 2 },
  { slug: 'kompanzasyon-pano', name: 'Kompanzasyon Panosu', icon: 'package', color: '#8B5CF6', parent: 'pano-malzemeleri', sortOrder: 3 },

  // ─── Alt kategoriler: Klemens ───
  { slug: 'tornavida-klemens', name: 'Tornavida Geçmeli Klemens', icon: 'zap', color: '#06B6D4', parent: 'klemens', sortOrder: 1 },
  { slug: 'yayli-klemens', name: 'Yaylı (Push-in) Klemens', icon: 'zap', color: '#06B6D4', parent: 'klemens', sortOrder: 2 },
  { slug: 'kablo-pabuc', name: 'Kablo Pabuç & Yüksük', icon: 'zap', color: '#06B6D4', parent: 'klemens', sortOrder: 3 },
  { slug: 'konnektor', name: 'Konnektör & Baralar', icon: 'zap', color: '#06B6D4', parent: 'klemens', sortOrder: 4 },

  // ─── Alt kategoriler: Motor & Sürücü ───
  { slug: 'kontaktor', name: 'Kontaktör (AC/DC)', icon: 'bolt', color: '#EAB308', parent: 'motor-surucu', sortOrder: 1 },
  { slug: 'termik-role', name: 'Termik Röle / Aşırı Akım Koruyucu', icon: 'bolt', color: '#EAB308', parent: 'motor-surucu', sortOrder: 2 },
  { slug: 'soft-starter', name: 'Soft Starter & Yıldız-Üçgen', icon: 'bolt', color: '#EAB308', parent: 'motor-surucu', sortOrder: 3 },
  { slug: 'frekans-inverter', name: 'Frekans İnverteri (VFD)', icon: 'bolt', color: '#EAB308', parent: 'motor-surucu', sortOrder: 4 },
  { slug: 'asenkron-motor', name: 'Asenkron Motor (1F/3F)', icon: 'bolt', color: '#EAB308', parent: 'motor-surucu', sortOrder: 5 },

  // ─── Alt kategoriler: Zayıf Akım ───
  { slug: 'diafon', name: 'Diafon & İnterkom Sistemleri', icon: 'cpu', color: '#0EA5E9', parent: 'zayif-akim', sortOrder: 1 },
  { slug: 'kart-okuyucu', name: 'Kart Okuyucu & Geçiş Kontrol', icon: 'cpu', color: '#0EA5E9', parent: 'zayif-akim', sortOrder: 2 },
  { slug: 'kamera', name: 'Güvenlik Kamerası & NVR', icon: 'cpu', color: '#0EA5E9', parent: 'zayif-akim', sortOrder: 3 },
  { slug: 'tv-sistemleri', name: 'TV / Uydu / Data Sistemleri', icon: 'cpu', color: '#0EA5E9', parent: 'zayif-akim', sortOrder: 4 },

  // ─── Alt kategoriler: Endüstriyel ───
  { slug: 'endustiriyel-fis', name: 'Endüstriyel Fiş & Priz (CEE)', icon: 'plug', color: '#F97316', parent: 'endustriyel', sortOrder: 1 },
  { slug: 'kauçuk-priz', name: 'Kauçuk Fiş & Priz (IP44/IP67)', icon: 'plug', color: '#F97316', parent: 'endustriyel', sortOrder: 2 },
  { slug: 'mobil-priz', name: 'Mobil Panolar & Prize Kutuları', icon: 'plug', color: '#F97316', parent: 'endustriyel', sortOrder: 3 },

  // ─── Alt kategoriler: Trafo & UPS ───
  { slug: 'trafo-alcak', name: 'Alçak Gerilim Trafosu', icon: 'zap', color: '#7C3AED', parent: 'trafolar', sortOrder: 1 },
  { slug: 'trafo-kontrol', name: 'Kontrol & İzolasyon Trafosu', icon: 'zap', color: '#7C3AED', parent: 'trafolar', sortOrder: 2 },
  { slug: 'regulator', name: 'Voltaj Regülatörü', icon: 'zap', color: '#7C3AED', parent: 'trafolar', sortOrder: 3 },
  { slug: 'ups', name: 'UPS & Kesintisiz Güç Kaynağı', icon: 'battery', color: '#7C3AED', parent: 'ups-jenerator', sortOrder: 1 },
  { slug: 'aku', name: 'Akü & Pil', icon: 'battery', color: '#7C3AED', parent: 'ups-jenerator', sortOrder: 2 },
  { slug: 'inverter', name: 'İnverter & Solar', icon: 'battery', color: '#7C3AED', parent: 'ups-jenerator', sortOrder: 3 },
  { slug: 'jenerator', name: 'Jeneratör', icon: 'battery', color: '#7C3AED', parent: 'ups-jenerator', sortOrder: 4 },

  // ─── Alt kategoriler: Topraklama ───
  { slug: 'topraklama-barasi', name: 'Topraklama Barası & Levhası', icon: 'shield-check', color: '#10B981', parent: 'topraklama', sortOrder: 1 },
  { slug: 'paratoner', name: 'Paratoner & Yıldırım Koruma', icon: 'shield-check', color: '#10B981', parent: 'topraklama', sortOrder: 2 },
  { slug: 'topraklama-klemens', name: 'Topraklama Klemensi & Aksesuar', icon: 'shield-check', color: '#10B981', parent: 'topraklama', sortOrder: 3 },
];

async function seedCategories(orgId: string) {
  const slugToId = new Map<string, string>();

  // Önce ana kategoriler
  for (const cat of CATEGORIES.filter((c) => !c.parent)) {
    const existing = await prisma.category.findFirst({
      where: { organizationId: orgId, slug: cat.slug },
    });
    const saved = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: { name: cat.name, icon: cat.icon, color: cat.color },
        })
      : await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            color: cat.color,
            organizationId: orgId,
          },
        });
    slugToId.set(cat.slug, saved.id);
  }

  // Sonra alt kategoriler
  for (const cat of CATEGORIES.filter((c2) => c2.parent)) {
    const parentId = slugToId.get(cat.parent!);
    if (!parentId) continue;

    const existing = await prisma.category.findFirst({
      where: { organizationId: orgId, slug: cat.slug },
    });
    const saved = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: {
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            parentId,
          },
        })
      : await prisma.category.create({
          data: {
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            color: cat.color,
            parentId,
            organizationId: orgId,
          },
        });
    slugToId.set(cat.slug, saved.id);
  }
  console.log(`✅ ${CATEGORIES.length} kategoriler (${slugToId.size} unique)`);
  return slugToId;
}

// =================================================================
// 4) MARKA (Brand) oluştur (Prisma modeli varsa, yoksa categories üzerinden gidiyoruz)
//    Prisma schema'da Brand modeli var, onu kullanıyoruz
// =================================================================
const BRANDS: Array<{ name: string; logoUrl?: string }> = [
  { name: 'Schneider Electric' },
  { name: 'Siemens' },
  { name: 'ABB' },
  { name: 'Legrand' },
  { name: 'Viko (Panasonic)' },
  { name: 'Mutlusan' },
  { name: 'Klemsan' },
  { name: 'Schneider Electric Acti9' },
  { name: 'Hager' },
  { name: 'Eaton' },
  { name: 'Phoenix Contact' },
  { name: 'Weidmüller' },
  { name: 'Wago' },
  { name: 'EAE' },
  { name: 'CATA' },
  { name: 'Cetaform' },
  { name: 'Federal' },
  { name: 'Bemis' },
  { name: 'Tunçmatik' },
  { name: 'Çetsan' },
  { name: 'Çetinkaya' },
  { name: 'Ortaç' },
  { name: 'Şafak' },
  { name: 'Makel' },
  { name: 'Nilson' },
  { name: 'Polyester' },
  { name: 'Bticino' },
  { name: 'Omron' },
  { name: 'Telemecanique' },
  { name: 'Gewiss' },
  { name: 'Brennenstuhl' },
  { name: 'Noas' },
  { name: 'Netelsan' },
  { name: 'Reçber' },
  { name: 'Braytron' },
  { name: 'Horoz' },
  { name: 'Simge' },
];

async function seedBrands(orgId: string) {
  const nameToId = new Map<string, string>();
  for (const b of BRANDS) {
    const existing = await prisma.brand.findFirst({
      where: { organizationId: orgId, name: b.name },
    });
    const saved = existing
      ? existing
      : await prisma.brand.create({
          data: { name: b.name, organizationId: orgId },
        });
    nameToId.set(b.name, saved.id);
  }
  console.log(`✅ ${BRANDS.length} marka`);
  return nameToId;
}

// =================================================================
// 5) ÜRÜNLER — Gerçekçi SKU ve fiyatlarla
// =================================================================
interface ProductDef {
  sku: string;
  name: string;
  barcode?: string;
  categorySlug: string;
  brandName?: string;
  unitShortName: string;
  purchasePrice: number;
  salePrice: number;
  vatRate: number;
  minStock: number;
  specifications?: Record<string, any>;
}

const PRODUCTS: ProductDef[] = [
  // ─── Kablolar ───
  { sku: 'NYM-3X1.5', name: 'NYM 3x1.5 mm² Enerji Kablosu', barcode: '8690000000015', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 8.50, salePrice: 12.75, vatRate: 20, minStock: 100, specifications: { kesit: '1.5mm²', damar: 3, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-3X2.5', name: 'NYM 3x2.5 mm² Enerji Kablosu', barcode: '8690000000022', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 12.40, salePrice: 18.60, vatRate: 20, minStock: 100, specifications: { kesit: '2.5mm²', damar: 3, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-3X4', name: 'NYM 3x4 mm² Enerji Kablosu', barcode: '8690000000039', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 18.90, salePrice: 28.35, vatRate: 20, minStock: 50, specifications: { kesit: '4mm²', damar: 3, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-3X6', name: 'NYM 3x6 mm² Enerji Kablosu', barcode: '8690000000046', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 28.50, salePrice: 42.75, vatRate: 20, minStock: 50, specifications: { kesit: '6mm²', damar: 3, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-5X2.5', name: 'NYM 5x2.5 mm² Enerji Kablosu', barcode: '8690000000053', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 18.70, salePrice: 28.05, vatRate: 20, minStock: 50, specifications: { kesit: '2.5mm²', damar: 5, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-5X6', name: 'NYM 5x6 mm² Enerji Kablosu', barcode: '8690000000060', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 47.30, salePrice: 70.95, vatRate: 20, minStock: 30, specifications: { kesit: '6mm²', damar: 5, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYM-5X10', name: 'NYM 5x10 mm² Enerji Kablosu', barcode: '8690000000077', categorySlug: 'nym-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 78.00, salePrice: 117.00, vatRate: 20, minStock: 30, specifications: { kesit: '10mm²', damar: 5, 'voltaj': '300/500V', renk: 'gri' } },
  { sku: 'NYY-4X10', name: 'NYY 4x10 mm² Yeraltı Kablosu', categorySlug: 'xlpe-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 65.00, salePrice: 97.50, vatRate: 20, minStock: 30, specifications: { kesit: '10mm²', damar: 4, 'voltaj': '0.6/1kV' } },
  { sku: 'NYY-4X16', name: 'NYY 4x16 mm² Yeraltı Kablosu', categorySlug: 'xlpe-kablolar', brandName: 'Mutlusan', unitShortName: 'm', purchasePrice: 95.00, salePrice: 142.50, vatRate: 20, minStock: 20, specifications: { kesit: '16mm²', damar: 4, 'voltaj': '0.6/1kV' } },
  { sku: 'CAT6-UTP-305', name: 'CAT6 UTP Data Kablosu 305m', categorySlug: 'cat-data-kablo', unitShortName: 'rl', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 5, specifications: { 'kategori': 'CAT6', uzunluk: '305m', renk: 'mavi' } },
  { sku: 'RG6-COAX-100', name: 'RG6 Koaksiyel Anten Kablosu 100m', categorySlug: 'koaksiyel-kablo', unitShortName: 'rl', purchasePrice: 320, salePrice: 480, vatRate: 20, minStock: 10, specifications: { tip: 'RG6', uzunluk: '100m', empedans: '75 Ohm' } },

  // ─── Sigortalar (NH Bıçaklı) ───
  { sku: 'NH000-25A', name: 'NH Bıçaklı Sigorta 000 Boy 25A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 28, salePrice: 42, vatRate: 20, minStock: 10, specifications: { boy: '000', akim: '25A', 'sinif': 'gG', 'kesme kapasitesi': '120kA' } },
  { sku: 'NH000-63A', name: 'NH Bıçaklı Sigorta 000 Boy 63A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 10, specifications: { boy: '000', akim: '63A', 'sinif': 'gG', 'kesme kapasitesi': '120kA' } },
  { sku: 'NH000-100A', name: 'NH Bıçaklı Sigorta 000 Boy 100A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 38, salePrice: 57, vatRate: 20, minStock: 10, specifications: { boy: '000', akim: '100A', 'sinif': 'gG' } },
  { sku: 'NH00-160A', name: 'NH Bıçaklı Sigorta 00 Boy 160A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 45, salePrice: 68, vatRate: 20, minStock: 10, specifications: { boy: '00', akim: '160A', 'sinif': 'gG' } },
  { sku: 'NH1-250A', name: 'NH Bıçaklı Sigorta 1 Boy 250A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 85, salePrice: 128, vatRate: 20, minStock: 5, specifications: { boy: '1', akim: '250A', 'sinif': 'gG' } },
  { sku: 'NH2-400A', name: 'NH Bıçaklı Sigorta 2 Boy 400A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 145, salePrice: 218, vatRate: 20, minStock: 5, specifications: { boy: '2', akim: '400A', 'sinif': 'gG' } },
  { sku: 'NH3-630A', name: 'NH Bıçaklı Sigorta 3 Boy 630A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 3, specifications: { boy: '3', akim: '630A', 'sinif': 'gG' } },
  { sku: 'NH4-1000A', name: 'NH Bıçaklı Sigorta 4 Boy 1000A gG', categorySlug: 'nh-sigorta', brandName: 'Federal', unitShortName: 'ad', purchasePrice: 580, salePrice: 870, vatRate: 20, minStock: 2, specifications: { boy: '4', akim: '1000A', 'sinif': 'gG' } },

  // ─── W Otomatik Sigortalar (MCB) ───
  { sku: 'MCB-C1X6', name: 'W Otomatik Sigorta C Tipi 1P 6A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 38, salePrice: 57, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '6A', 'kesme': '6kA' } },
  { sku: 'MCB-C1X10', name: 'W Otomatik Sigorta C Tipi 1P 10A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 38, salePrice: 57, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '10A', 'kesme': '6kA' } },
  { sku: 'MCB-C1X16', name: 'W Otomatik Sigorta C Tipi 1P 16A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 38, salePrice: 57, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '16A', 'kesme': '6kA' } },
  { sku: 'MCB-C1X20', name: 'W Otomatik Sigorta C Tipi 1P 20A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 42, salePrice: 63, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '20A', 'kesme': '6kA' } },
  { sku: 'MCB-C1X25', name: 'W Otomatik Sigorta C Tipi 1P 25A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 45, salePrice: 68, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '25A' } },
  { sku: 'MCB-C1X32', name: 'W Otomatik Sigorta C Tipi 1P 32A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 48, salePrice: 72, vatRate: 20, minStock: 20, specifications: { tip: 'C', kutup: '1P', akim: '32A' } },
  { sku: 'MCB-C1X40', name: 'W Otomatik Sigorta C Tipi 1P 40A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 55, salePrice: 83, vatRate: 20, minStock: 15, specifications: { tip: 'C', kutup: '1P', akim: '40A' } },
  { sku: 'MCB-C1X63', name: 'W Otomatik Sigorta C Tipi 1P 63A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 85, salePrice: 128, vatRate: 20, minStock: 10, specifications: { tip: 'C', kutup: '1P', akim: '63A' } },
  { sku: 'MCB-C3X25', name: 'W Otomatik Sigorta C Tipi 3P 25A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 165, salePrice: 248, vatRate: 20, minStock: 10, specifications: { tip: 'C', kutup: '3P', akim: '25A' } },
  { sku: 'MCB-C3X32', name: 'W Otomatik Sigorta C Tipi 3P 32A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 175, salePrice: 263, vatRate: 20, minStock: 10, specifications: { tip: 'C', kutup: '3P', akim: '32A' } },
  { sku: 'MCB-C3X63', name: 'W Otomatik Sigorta C Tipi 3P 63A', categorySlug: 'woltmetrik-sigorta', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 280, salePrice: 420, vatRate: 20, minStock: 5, specifications: { tip: 'C', kutup: '3P', akim: '63A' } },

  // ─── Kaçak Akım Rölesi ───
  { sku: 'RCD-2X25A-30', name: 'Kaçak Akım Rölesi 2P 25A 30mA', categorySlug: 'kacak-akim', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 220, salePrice: 330, vatRate: 20, minStock: 10, specifications: { kutup: '2P', akim: '25A', hassasiyet: '30mA', tip: 'AC' } },
  { sku: 'RCD-2X40A-30', name: 'Kaçak Akım Rölesi 2P 40A 30mA', categorySlug: 'kacak-akim', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 10, specifications: { kutup: '2P', akim: '40A', hassasiyet: '30mA' } },
  { sku: 'RCD-4X25A-30', name: 'Kaçak Akım Rölesi 4P 25A 30mA', categorySlug: 'kacak-akim', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 320, salePrice: 480, vatRate: 20, minStock: 5, specifications: { kutup: '4P', akim: '25A', hassasiyet: '30mA' } },
  { sku: 'RCD-4X40A-300', name: 'Kaçak Akım Rölesi 4P 40A 300mA', categorySlug: 'kacak-akim', brandName: 'Schneider Electric Acti9', unitShortName: 'ad', purchasePrice: 380, salePrice: 570, vatRate: 20, minStock: 5, specifications: { kutup: '4P', akim: '40A', hassasiyet: '300mA' } },

  // ─── Anahtar & Priz ───
  { sku: 'V-ANTR-BYZ', name: 'Viko Karre Anahtar Tekli Beyaz', categorySlug: 'anahtar', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 18, salePrice: 30, vatRate: 20, minStock: 50, specifications: { tip: 'Tekli', renk: 'beyaz', 'seri': 'Karre' } },
  { sku: 'V-VAVN-BYZ', name: 'Viko Karre Vavien Anahtar Beyaz', categorySlug: 'anahtar', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 25, salePrice: 42, vatRate: 20, minStock: 30, specifications: { tip: 'Vavien', renk: 'beyaz' } },
  { sku: 'V-KMT-BYZ', name: 'Viko Karre Komütatör Anahtar Beyaz', categorySlug: 'anahtar', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 32, salePrice: 52, vatRate: 20, minStock: 30, specifications: { tip: 'Komütatör', renk: 'beyaz' } },
  { sku: 'V-PRZ-BYZ', name: 'Viko Karre Priz Tekli Topraklı Beyaz', categorySlug: 'priz', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 25, salePrice: 42, vatRate: 20, minStock: 50, specifications: { tip: 'Topraklı', renk: 'beyaz' } },
  { sku: 'V-UPS-BYZ', name: 'Viko UPS Priz Kırmızı', categorySlug: 'priz', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 42, salePrice: 65, vatRate: 20, minStock: 20, specifications: { tip: 'UPS', renk: 'kırmızı' } },
  { sku: 'V-CRV-2L', name: 'Viko Karre Çerçeve 2\'li Beyaz', categorySlug: 'cerceve', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 12, salePrice: 20, vatRate: 20, minStock: 30, specifications: { 'li': 'Hasta 2', renk: 'beyaz' } },
  { sku: 'V-CRV-3L', name: 'Viko Karre Çerçeve 3\'lü Beyaz', categorySlug: 'cerceve', brandName: 'Viko (Panasonic)', unitShortName: 'ad', purchasePrice: 18, salePrice: 30, vatRate: 20, minStock: 20, specifications: { 'li': 'Hasta 3', renk: 'beyaz' } },
  { sku: 'LG-ANTR-BYZ', name: 'Legrand Niloe Anahtar Tekli Beyaz', categorySlug: 'anahtar', brandName: 'Legrand', unitShortName: 'ad', purchasePrice: 22, salePrice: 35, vatRate: 20, minStock: 30, specifications: { 'seri': 'Niloe', renk: 'beyaz' } },
  { sku: 'LG-PRZ-BYZ', name: 'Legrand Niloe Priz Topraklı Beyaz', categorySlug: 'priz', brandName: 'Legrand', unitShortName: 'ad', purchasePrice: 30, salePrice: 48, vatRate: 20, minStock: 30, specifications: { 'seri': 'Niloe', renk: 'beyaz' } },

  // ─── LED Aydınlatma ───
  { sku: 'LED-E27-9W-GN', name: 'LED Ampul E27 9W Gün Işığı 6500K', categorySlug: 'led-ampul', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 15, salePrice: 25, vatRate: 20, minStock: 50, specifications: { duy: 'E27', guc: '9W', renk: '6500K', lumen: '900lm' } },
  { sku: 'LED-E27-12W-GN', name: 'LED Ampul E27 12W Gün Işığı 6500K', categorySlug: 'led-ampul', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 22, salePrice: 35, vatRate: 20, minStock: 50, specifications: { duy: 'E27', guc: '12W', renk: '6500K', lumen: '1200lm' } },
  { sku: 'LED-E27-15W-GN', name: 'LED Ampul E27 15W Gün Işığı 6500K', categorySlug: 'led-ampul', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 28, salePrice: 45, vatRate: 20, minStock: 30, specifications: { duy: 'E27', guc: '15W', lumen: '1500lm' } },
  { sku: 'LED-GU10-7W', name: 'LED Spot GU10 7W Gün Işığı', categorySlug: 'led-ampul', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 18, salePrice: 30, vatRate: 20, minStock: 30, specifications: { duy: 'GU10', guc: '7W', lumen: '700lm' } },
  { sku: 'LED-PNL-18W', name: 'LED Sıva Altı Panel 18W 6500K Yuvarlak', categorySlug: 'led-panel', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 45, salePrice: 75, vatRate: 20, minStock: 20, specifications: { guc: '18W', sekil: 'Yuvarlak', renk: '6500K', lumen: '1620lm' } },
  { sku: 'LED-PNL-24W', name: 'LED Sıva Altı Panel 24W 6500K Kare', categorySlug: 'led-panel', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 65, salePrice: 100, vatRate: 20, minStock: 20, specifications: { guc: '24W', sekil: 'Kare', renk: '6500K', lumen: '2160lm' } },
  { sku: 'LED-PROJ-100W', name: 'LED Projektör 100W 6500K IP65', categorySlug: 'led-projektor', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 320, salePrice: 480, vatRate: 20, minStock: 10, specifications: { guc: '100W', koruma: 'IP65', renk: '6500K' } },
  { sku: 'LED-PROJ-200W', name: 'LED Projektör 200W 6500K IP65', categorySlug: 'led-projektor', brandName: 'CATA', unitShortName: 'ad', purchasePrice: 580, salePrice: 870, vatRate: 20, minStock: 5, specifications: { guc: '200W', koruma: 'IP65' } },
  { sku: 'LED-STR-5M-GN', name: 'LED Şerit 12V SMD2835 5m Gün Işığı', categorySlug: 'led-serit', brandName: 'CATA', unitShortName: 'rl', purchasePrice: 95, salePrice: 145, vatRate: 20, minStock: 10, specifications: { 'voltaj': '12V', chip: 'SMD2835', uzunluk: '5m', 'renk': 'Gün Işığı' } },

  // ─── Klemens ───
  { sku: 'KLM-2.5-GRI', name: 'Tornavida Geçmeli Klemens 2.5mm² Gri', categorySlug: 'tornavida-klemens', brandName: 'Klemsan', unitShortName: 'ad', purchasePrice: 5, salePrice: 9, vatRate: 20, minStock: 100, specifications: { kesit: '2.5mm²', renk: 'gri' } },
  { sku: 'KLM-4-GRI', name: 'Tornavida Geçmeli Klemens 4mm² Gri', categorySlug: 'tornavida-klemens', brandName: 'Klemsan', unitShortName: 'ad', purchasePrice: 6, salePrice: 10, vatRate: 20, minStock: 100, specifications: { kesit: '4mm²', renk: 'gri' } },
  { sku: 'KLM-6-GRI', name: 'Tornavida Geçmeli Klemens 6mm² Gri', categorySlug: 'tornavida-klemens', brandName: 'Klemsan', unitShortName: 'ad', purchasePrice: 8, salePrice: 13, vatRate: 20, minStock: 80, specifications: { kesit: '6mm²', renk: 'gri' } },
  { sku: 'KLM-10-GRI', name: 'Tornavida Geçmeli Klemens 10mm² Gri', categorySlug: 'tornavida-klemens', brandName: 'Klemsan', unitShortName: 'ad', purchasePrice: 12, salePrice: 20, vatRate: 20, minStock: 60, specifications: { kesit: '10mm²', renk: 'gri' } },
  { sku: 'KLM-YAY-2.5', name: 'Yaylı (Push-in) Klemens 2.5mm²', categorySlug: 'yayli-klemens', brandName: 'Phoenix Contact', unitShortName: 'ad', purchasePrice: 18, salePrice: 28, vatRate: 20, minStock: 50, specifications: { tip: 'Push-in', kesit: '2.5mm²' } },
  { sku: 'PAB-6', name: 'İzoleli Kablo Pabucu 6mm²', categorySlug: 'kablo-pabuc', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 2.5, salePrice: 5, vatRate: 20, minStock: 200, specifications: { kesit: '6mm²', 'malzeme': 'bakır kalay' } },
  { sku: 'PAB-10', name: 'İzoleli Kablo Pabucu 10mm²', categorySlug: 'kablo-pabuc', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 4, salePrice: 7, vatRate: 20, minStock: 200, specifications: { kesit: '10mm²' } },
  { sku: 'YUK-1.5', name: 'Kablo Yüksük (Ader Sonu) 1.5mm²', categorySlug: 'kablo-pabuc', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 0.5, salePrice: 1, vatRate: 20, minStock: 500, specifications: { kesit: '1.5mm²', 'uzunluk': '8mm' } },

  // ─── Kontaktörler ───
  { sku: 'KNT-9A-220', name: 'Kontaktör 9A 220V AC 3P+1NC', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 165, salePrice: 250, vatRate: 20, minStock: 10, specifications: { akim: '9A', 'bobin': '220V AC', 'kutup': '3P', 'yardimci kontak': '1NC' } },
  { sku: 'KNT-12A-220', name: 'Kontaktör 12A 220V AC 3P+1NO', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 195, salePrice: 295, vatRate: 20, minStock: 10, specifications: { akim: '12A', 'bobin': '220V AC', 'kutup': '3P' } },
  { sku: 'KNT-18A-220', name: 'Kontaktör 18A 220V AC 3P+1NO', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 8, specifications: { akim: '18A', 'bobin': '220V AC', 'kutup': '3P' } },
  { sku: 'KNT-25A-220', name: 'Kontaktör 25A 220V AC 3P+1NO', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 310, salePrice: 465, vatRate: 20, minStock: 5, specifications: { akim: '25A', 'kutup': '3P' } },
  { sku: 'KNT-40A-220', name: 'Kontaktör 40A 220V AC 3P', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 520, salePrice: 780, vatRate: 20, minStock: 3, specifications: { akim: '40A', 'kutup': '3P' } },
  { sku: 'KNT-65A-220', name: 'Kontaktör 65A 220V AC 3P', categorySlug: 'kontaktor', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 880, salePrice: 1320, vatRate: 20, minStock: 2, specifications: { akim: '65A', 'kutup': '3P' } },
  { sku: 'TRM-09A', name: 'Termik Röle 4-6A (Kontaktör için)', categorySlug: 'termik-role', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 165, salePrice: 248, vatRate: 20, minStock: 10, specifications: { 'akim araligi': '4-6A', 'kontaktor': '9A' } },
  { sku: 'TRM-25A', name: 'Termik Röle 17-25A (Kontaktör için)', categorySlug: 'termik-role', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 220, salePrice: 330, vatRate: 20, minStock: 10, specifications: { 'akim araligi': '17-25A' } },

  // ─── Frekans İnverteri ───
  { sku: 'VFD-0.75KW', name: 'Frekans İnverteri 0.75kW 1F/3F 220V', categorySlug: 'frekans-inverter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 3, specifications: { guc: '0.75kW', giris: '1F 220V', cikis: '3F 220V' } },
  { sku: 'VFD-2.2KW', name: 'Frekans İnverteri 2.2kW 3F 380V', categorySlug: 'frekans-inverter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 2450, salePrice: 3675, vatRate: 20, minStock: 2, specifications: { guc: '2.2kW', giris: '3F 380V' } },
  { sku: 'VFD-7.5KW', name: 'Frekans İnverteri 7.5kW 3F 380V', categorySlug: 'frekans-inverter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 5800, salePrice: 8700, vatRate: 20, minStock: 1, specifications: { guc: '7.5kW', giris: '3F 380V' } },

  // ─── Pano ───
  { sku: 'PNO-12M', name: 'Sıva Üstü Pano 12 Modül', categorySlug: 'pano-kutu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 95, salePrice: 145, vatRate: 20, minStock: 10, specifications: { modul: '12', 'tip': 'Sıva Üstü', 'malzeme': 'Metal' } },
  { sku: 'PNO-24M', name: 'Sıva Üstü Pano 24 Modül', categorySlug: 'pano-kutu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 165, salePrice: 248, vatRate: 20, minStock: 10, specifications: { modul: '24', 'tip': 'Sıva Üstü' } },
  { sku: 'PNO-36M', name: 'Sıva Üstü Pano 36 Modül', categorySlug: 'pano-kutu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 8, specifications: { modul: '36' } },
  { sku: 'PNO-SA-12M', name: 'Sıva Altı Pano 12 Modül', categorySlug: 'pano-kutu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 115, salePrice: 175, vatRate: 20, minStock: 10, specifications: { modul: '12', 'tip': 'Sıva Altı' } },
  { sku: 'PNO-SA-24M', name: 'Sıva Altı Pano 24 Modül', categorySlug: 'pano-kutu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 195, salePrice: 295, vatRate: 20, minStock: 8, specifications: { modul: '24', 'tip': 'Sıva Altı' } },

  // ─── Kanal & Boru ───
  { sku: 'KAN-25X40-2M', name: 'PVC Elektrik Kanalı 25x40mm (2m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 14, salePrice: 22, vatRate: 20, minStock: 50, specifications: { olcu: '25x40mm', uzunluk: '2m', 'malzeme': 'PVC' } },
  { sku: 'KAN-40X60-2M', name: 'PVC Elektrik Kanalı 40x60mm (2m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 30, specifications: { olcu: '40x60mm' } },
  { sku: 'KAN-60X90-2M', name: 'PVC Elektrik Kanalı 60x90mm (2m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 65, salePrice: 100, vatRate: 20, minStock: 20, specifications: { olcu: '60x90mm' } },
  { sku: 'BOR-PVC-16-3M', name: 'PVC Alev Yaymayan Boru Ø16 (3m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 25, salePrice: 38, vatRate: 20, minStock: 100, specifications: { cevre: 'Ø16mm', uzunluk: '3m' } },
  { sku: 'BOR-PVC-20-3M', name: 'PVC Alev Yaymayan Boru Ø20 (3m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 80, specifications: { cevre: 'Ø20mm' } },
  { sku: 'BOR-PVC-25-3M', name: 'PVC Alev Yaymayan Boru Ø25 (3m)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 45, salePrice: 68, vatRate: 20, minStock: 50, specifications: { cevre: 'Ø25mm' } },

  // ─── Endüstriyel Fiş & Priz ───
  { sku: 'CEE-16A-3P-FIS', name: 'CEE Fiş 3P+E 16A 220V IP44', categorySlug: 'endustiriyel-fis', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 65, salePrice: 100, vatRate: 20, minStock: 20, specifications: { akim: '16A', kutup: '3P+E', 'koruma': 'IP44' } },
  { sku: 'CEE-32A-3P-FIS', name: 'CEE Fiş 3P+E 32A 380V IP44', categorySlug: 'endustiriyel-fis', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 95, salePrice: 145, vatRate: 20, minStock: 15, specifications: { akim: '32A', kutup: '3P+E' } },
  { sku: 'CEE-63A-5P-FIS', name: 'CEE Fiş 5P 63A 380V IP67', categorySlug: 'endustiriyel-fis', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 280, salePrice: 420, vatRate: 20, minStock: 5, specifications: { akim: '63A', kutup: '5P', 'koruma': 'IP67' } },
  { sku: 'CEE-16A-3P-PRZ', name: 'CEE Priz Duvar 3P+E 16A 220V IP44', categorySlug: 'endustiriyel-fis', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 95, salePrice: 145, vatRate: 20, minStock: 15, specifications: { akim: '16A', 'tip': 'Duvar Priz' } },
  { sku: 'CEE-32A-3P-PRZ', name: 'CEE Priz Duvar 3P+E 32A 380V IP44', categorySlug: 'endustiriyel-fis', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 145, salePrice: 218, vatRate: 20, minStock: 10, specifications: { akim: '32A' } },
  { sku: 'KAUCUK-FIS-16A', name: 'Kauçuk Fiş 2P+E 16A IP44', categorySlug: 'kauçuk-priz', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 30, specifications: { akim: '16A', 'malzeme': 'kauçuk' } },
  { sku: 'KAUCUK-PRZ-16A', name: 'Kauçuk Priz Duvar 2P+E 16A IP44', categorySlug: 'kauçuk-priz', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 45, salePrice: 68, vatRate: 20, minStock: 20, specifications: { akim: '16A' } },

  // ─── Ölçüm Aletleri ───
  { sku: 'MUL-DIG-TRUE', name: 'Dijital Multimetre True RMS', categorySlug: 'mobil-priz', brandName: 'Horoz', unitShortName: 'ad', purchasePrice: 580, salePrice: 870, vatRate: 20, minStock: 5, specifications: { tip: 'True RMS', 'fonksiyonlar': 'V, A, Ohm, Cap, Hz' } },
  { sku: 'KLE-AKIM-PENS', name: 'Pens Tip Dijital Multimetre AC/DC 1000A', categorySlug: 'mobil-priz', brandName: 'Horoz', unitShortName: 'ad', purchasePrice: 880, salePrice: 1320, vatRate: 20, minStock: 3, specifications: { 'akim': '1000A AC/DC', tip: 'Pens' } },
  { sku: 'LAZO-MEGER', name: 'Dijital Meger (İzolasyon Test) 1000V', categorySlug: 'mobil-priz', brandName: 'Simge', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 2, specifications: { 'voltaj': '1000V' } },

  // ─── Akü & UPS ───
  { sku: 'AKU-12V-7AH', name: 'Kuru Tip Akü 12V 7Ah', categorySlug: 'aku', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 10, specifications: { 'voltaj': '12V', kapasite: '7Ah' } },
  { sku: 'AKU-12V-100AH', name: 'Kuru Tip Akü 12V 100Ah', categorySlug: 'aku', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 2200, salePrice: 3300, vatRate: 20, minStock: 3, specifications: { 'voltaj': '12V', kapasite: '100Ah' } },
  { sku: 'UPS-1KVA', name: 'Online UPS 1kVA 230V', categorySlug: 'ups', brandName: 'Tunçmatik', unitShortName: 'ad', purchasePrice: 2800, salePrice: 4200, vatRate: 20, minStock: 2, specifications: { guc: '1kVA', 'tip': 'Online' } },
  { sku: 'UPS-3KVA', name: 'Online UPS 3kVA 230V', categorySlug: 'ups', brandName: 'Tunçmatik', unitShortName: 'ad', purchasePrice: 6800, salePrice: 10200, vatRate: 20, minStock: 1, specifications: { guc: '3kVA', 'tip': 'Online' } },

  // ─── Trafo ───
  { sku: 'TR-220-24-100W', name: 'Trafo 220V/24V AC 100VA', categorySlug: 'trafo-kontrol', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 145, salePrice: 220, vatRate: 20, minStock: 10, specifications: { giris: '220V AC', cikis: '24V AC', guc: '100VA' } },
  { sku: 'TR-220-12-200W', name: 'Trafo 220V/12V AC 200VA', categorySlug: 'trafo-kontrol', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 195, salePrice: 295, vatRate: 20, minStock: 8, specifications: { guc: '200VA' } },
  { sku: 'REG-1KVA-SERVO', name: 'Servo Voltaj Regülatörü 1kVA', categorySlug: 'regulator', brandName: 'Tunçmatik', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 3, specifications: { guc: '1kVA', 'tip': 'Servo' } },
  { sku: 'REG-5KVA-SERVO', name: 'Servo Voltaj Regülatörü 5kVA', categorySlug: 'regulator', brandName: 'Tunçmatik', unitShortName: 'ad', purchasePrice: 4800, salePrice: 7200, vatRate: 20, minStock: 2, specifications: { guc: '5kVA' } },

  // ─── Topraklama ───
  { sku: 'TP-BARA-30X3', name: 'Topraklama Barası 30x3mm 1m Bakır', categorySlug: 'topraklama-barasi', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 240, salePrice: 360, vatRate: 20, minStock: 10, specifications: { 'malzeme': 'Bakır', 'boyut': '30x3mm' } },
  { sku: 'PTN-T1', name: 'Tip 1 Paratoner (Yıldırım Koruma)', categorySlug: 'paratoner', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 3, specifications: { tip: 'Tip 1', 'kullanma': 'Bina girişi' } },
  { sku: 'TP-KLMENS', name: 'Topraklama Klemensi 16mm²', categorySlug: 'topraklama-klemens', brandName: 'Weidmüller', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 30, specifications: { kesit: '16mm²' } },

  // ─── Konnektör ───
  { sku: 'KNT-2P-2.5', name: '2 Pin Konnektör 2.5mm²', categorySlug: 'konnektor', brandName: 'Wago', unitShortName: 'ad', purchasePrice: 12, salePrice: 20, vatRate: 20, minStock: 50, specifications: { pin: '2P' } },
  { sku: 'KNT-3P-2.5', name: '3 Pin Konnektör 2.5mm²', categorySlug: 'konnektor', brandName: 'Wago', unitShortName: 'ad', purchasePrice: 15, salePrice: 25, vatRate: 20, minStock: 30, specifications: { pin: '3P' } },
  { sku: 'KNT-5P-4', name: '5 Pin Konnektör 4mm²', categorySlug: 'konnektor', brandName: 'Wago', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 30, specifications: { pin: '5P' } },

  // ─── İzole Bant ───
  { sku: 'BANT-19X20-SYH', name: 'PVC İzolasyon Bantı 19mmx20m Siyah', categorySlug: 'izole-bant', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 8, salePrice: 14, vatRate: 20, minStock: 100, specifications: { genislik: '19mm', uzunluk: '20m', 'renk': 'siyah' } },
  { sku: 'BANT-19X20-KIRM', name: 'PVC İzole Bant 19mmx20m Kırmızı', categorySlug: 'izole-bant', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 8, salePrice: 14, vatRate: 20, minStock: 50, specifications: { renk: 'kırmızı' } },
  { sku: 'BANT-19X20-MAV', name: 'PVC İzole Bant 19mmx20m Mavi', categorySlug: 'izole-bant', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 8, salePrice: 14, vatRate: 20, minStock: 50, specifications: { renk: 'mavi' } },
  { sku: 'KABLO-BAG-100', name: 'Kablo Bağı (Klips) 100mm Siyah (100 adet)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'pk', purchasePrice: 18, salePrice: 28, vatRate: 20, minStock: 50, specifications: { uzunluk: '100mm', 'adet': '100' } },
  { sku: 'KABLO-BAG-200', name: 'Kablo Bağı (Klips) 200mm Siyah (100 adet)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'pk', purchasePrice: 28, salePrice: 42, vatRate: 20, minStock: 40, specifications: { uzunluk: '200mm' } },
  { sku: 'KABLO-BAG-300', name: 'Kablo Bağı (Klips) 300mm Beyaz (100 adet)', categorySlug: 'kanal-boru', brandName: 'Mutlusan', unitShortName: 'pk', purchasePrice: 38, salePrice: 58, vatRate: 20, minStock: 30, specifications: { uzunluk: '300mm', 'renk': 'beyaz' } },

  // ─── Sigorta Kutusu ───
  { sku: 'SIG-K-1L', name: '1\'li Sigorta Kutusu Sıva Üstü (Mühürlü)', categorySlug: 'sigorta-kutusu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 32, salePrice: 48, vatRate: 20, minStock: 20, specifications: { 'li': '1', 'tip': 'Sıva Üstü' } },
  { sku: 'SIG-K-3L', name: '3\'lü Sigorta Kutusu Sıva Üstü (Mühürlü)', categorySlug: 'sigorta-kutusu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 65, salePrice: 100, vatRate: 20, minStock: 15, specifications: { 'li': '3' } },
  { sku: 'SIG-K-6L', name: '6\'lı Sigorta Kutusu Sıva Üstü (Mühürlü)', categorySlug: 'sigorta-kutusu', brandName: 'Mutlusan', unitShortName: 'ad', purchasePrice: 115, salePrice: 175, vatRate: 20, minStock: 10, specifications: { 'li': '6' } },

  // ─── El Feneri ───
  { sku: 'FL-LED-10W-SARJ', name: 'LED Şarjlı El Feneri 10W 1000 Lümen', categorySlug: 'el-feneri', brandName: 'Braytron', unitShortName: 'ad', purchasePrice: 195, salePrice: 295, vatRate: 20, minStock: 10, specifications: { guc: '10W', lumen: '1000lm', 'sarj': 'USB' } },

  // ─── Kompakt Şalter ───
  { sku: 'MCCB-3X100', name: 'Kompakt Şalter 3P 100A 25kA', categorySlug: 'kompakt-salter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 2200, salePrice: 3300, vatRate: 20, minStock: 2, specifications: { kutup: '3P', akim: '100A', 'kesme kapasitesi': '25kA' } },
  { sku: 'MCCB-3X250', name: 'Kompakt Şalter 3P 250A 36kA', categorySlug: 'kompakt-salter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 4800, salePrice: 7200, vatRate: 20, minStock: 1, specifications: { kutup: '3P', akim: '250A', 'kesme kapasitesi': '36kA' } },
  { sku: 'MCCB-3X400', name: 'Kompakt Şalter 3P 400A 50kA', categorySlug: 'kompakt-salter', brandName: 'Schneider Electric', unitShortName: 'ad', purchasePrice: 8800, salePrice: 13200, vatRate: 20, minStock: 1, specifications: { kutup: '3P', akim: '400A' } },

  // ─── Asenkron Motor ───
  { sku: 'MOTOR-3F-0.37KW', name: 'Asenkron Motor 3F 0.37kW 380V B3', categorySlug: 'asenkron-motor', brandName: 'Siemens', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 2, specifications: { guc: '0.37kW', 'voltaj': '380V', 'tip': 'B3' } },
  { sku: 'MOTOR-3F-1.5KW', name: 'Asenkron Motor 3F 1.5kW 380V B3', categorySlug: 'asenkron-motor', brandName: 'Siemens', unitShortName: 'ad', purchasePrice: 2800, salePrice: 4200, vatRate: 20, minStock: 1, specifications: { guc: '1.5kW' } },
  { sku: 'MOTOR-3F-4KW', name: 'Asenkron Motor 3F 4kW 380V B3', categorySlug: 'asenkron-motor', brandName: 'Siemens', unitShortName: 'ad', purchasePrice: 5800, salePrice: 8700, vatRate: 20, minStock: 1, specifications: { guc: '4kW' } },
  { sku: 'MOTOR-1F-0.55KW', name: 'Asenkron Motor 1F 0.55kW 220V', categorySlug: 'asenkron-motor', brandName: 'Siemens', unitShortName: 'ad', purchasePrice: 1450, salePrice: 2175, vatRate: 20, minStock: 2, specifications: { guc: '0.55kW', 'voltaj': '220V' } },

  // ─── Diafon ───
  { sku: 'DIAFON-4DAIRE', name: 'Diafon 4 Daire Görüntülü Villa Tipi', categorySlug: 'diafon', brandName: 'Netelsan', unitShortName: 'ad', purchasePrice: 4800, salePrice: 7200, vatRate: 20, minStock: 1, specifications: { 'daire': '4', 'renkli': true } },
];

async function seedProducts(orgId: string, categorySlugToId: Map<string, string>, brandNameToId: Map<string, string>, unitShortNameToId: Map<string, string>) {
  let count = 0;
  for (const p of PRODUCTS) {
    const categoryId = categorySlugToId.get(p.categorySlug);
    const brandId = p.brandName ? brandNameToId.get(p.brandName) : undefined;
    const unitId = unitShortNameToId.get(p.unitShortName);

    if (!categoryId || !unitId) {
      console.log(`⚠️  Skip ${p.sku}: missing category or unit`);
      continue;
    }

    const existing = await prisma.product.findFirst({
      where: { organizationId: orgId, sku: p.sku },
    });

    const data = {
      sku: p.sku,
      barcode: p.barcode ?? null,
      name: p.name,
      description: null,
      categoryId,
      brandId: brandId ?? null,
      unitId,
      purchasePrice: p.purchasePrice,
      salePrice: p.salePrice,
      vatRate: p.vatRate,
      minStock: p.minStock,
      criticalStock: Math.floor(p.minStock / 2),
      specifications: p.specifications ?? undefined,
      isActive: true,
      organizationId: orgId,
    };

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data });
    } else {
      await prisma.product.create({ data });
    }
    count++;
  }
  console.log(`✅ ${count} ürün (${PRODUCTS.length} tanımlı)`);
}

// =================================================================
// 6) DEPO — W Ahmet 3 depo, her biri 6 varsayılan raf
// =================================================================
async function seedWarehouses(orgId: string) {
  const WAREHOUSES = [
    { code: 'ANA', name: 'Ana Depo', city: 'İstanbul', isDefault: true, address: 'Atatürk Cad. No:123' },
    { code: 'SUBE', name: 'Şube Deposu', city: 'Ankara', isDefault: false, address: 'Kızılay Mah.' },
    { code: 'PROJE', name: 'Proje Deposu', city: 'İzmir', isDefault: false, address: 'Alsancak' },
  ];

  for (const w of WAREHOUSES) {
    const existing = await prisma.warehouse.findFirst({
      where: { organizationId: orgId, code: w.code },
    });

    let wh;
    if (existing) {
      wh = await prisma.warehouse.update({
        where: { id: existing.id },
        data: w,
      });
    } else {
      wh = await prisma.warehouse.create({
        data: { ...w, organizationId: orgId },
      });
      // Otomatik 6 varsayılan raf
      const shelves = ['A-1', 'A-2', 'A-3', 'B-1', 'B-2', 'C-1'];
      for (const code of shelves) {
        await prisma.shelf.upsert({
          where: { warehouseId_code: { warehouseId: wh.id, code } },
          update: {},
          create: { code, warehouseId: wh.id },
        });
      }
    }
  }
  console.log(`✅ ${WAREHOUSES.length} depolar (her biri 6 raf)`);
}

// =================================================================
// 7) MÜŞTERİ & TEDARİKÇİ
// =================================================================
async function seedCustomersAndSuppliers(orgId: string) {
  const customers = [
    { code: 'MUS-001', name: 'Yıldırım İnşaat A.Ş.', type: 'CONTRACTOR', taxNumber: '5556667778', city: 'İstanbul', phone: '+90 532 111 22 33', email: 'ali@yildirim.com', contactPerson: 'Ali Yıldırım', creditLimit: 50000 },
    { code: 'MUS-002', name: 'Avcı Elektrik Ltd.', type: 'CORPORATE', taxNumber: '1234567890', city: 'İstanbul', phone: '+90 212 555 12 34', email: 'info@avcielektrik.com', contactPerson: 'Mehmet Avcı', creditLimit: 25000 },
    { code: 'MUS-003', name: 'Canan Özdemir (Bireysel)', type: 'INDIVIDUAL', taxNumber: '12345678901', city: 'İzmir', phone: '+90 555 999 88 77', contactPerson: 'Canan Özdemir', creditLimit: 5000 },
  ];

  for (const c of customers) {
    const existing = await prisma.customer.findFirst({
      where: { organizationId: orgId, code: c.code },
    });
    if (existing) {
      await prisma.customer.update({ where: { id: existing.id }, data: c });
    } else {
      await prisma.customer.create({ data: { ...c, organizationId: orgId, balance: 0, isActive: true } });
    }
  }

  // Tedarikçi şeması yok ama categories/products var. Tedarikçi olarak müşteri modelini kullanalım:
  const suppliers = [
    { code: 'TED-001', name: 'Schneider Electric Türkiye', type: 'CORPORATE' as const, taxNumber: '1111111111', city: 'İstanbul', phone: '+90 212 444 55 66', contactPerson: 'Mehmet Bey', creditLimit: 0 },
    { code: 'TED-002', name: 'Mutlusan Kablo', type: 'CORPORATE' as const, taxNumber: '2222222222', city: 'İstanbul', phone: '+90 212 333 44 55', contactPerson: 'Satış Departmanı', creditLimit: 0 },
    { code: 'TED-003', name: 'Federal Elektrik', type: 'CORPORATE' as const, taxNumber: '3333333333', city: 'İstanbul', phone: '+90 212 222 33 44', contactPerson: 'Satış Temsilcisi', creditLimit: 0 },
    { code: 'TED-004', name: 'CATA Aydınlatma', type: 'CORPORATE' as const, taxNumber: '4444444444', city: 'İstanbul', phone: '+90 212 555 66 77', contactPerson: 'CATA Satış', creditLimit: 0 },
  ];

  for (const s of suppliers) {
    const existing = await prisma.customer.findFirst({
      where: { organizationId: orgId, code: s.code },
    });
    if (existing) {
      await prisma.customer.update({ where: { id: existing.id }, data: s });
    } else {
      await prisma.customer.create({ data: { ...s, organizationId: orgId, balance: 0, isActive: true } });
    }
  }

  console.log(`✅ ${customers.length} müşteri + ${suppliers.length} tedarikçi`);
}

// =================================================================
// MAIN
// =================================================================
async function main() {
  console.log('\n🌱 WireStock v2 — Kapsamlı Seed başlıyor...\n');

  const org = await seedOrganization();
  await seedUnits(org.id);

  const catSlugToId = await seedCategories(org.id);
  const brandNameToId = await seedBrands(org.id);

  // Unit shortName → ID map
  const unitShortNameToId = new Map<string, string>();
  const units = await prisma.unit.findMany({ where: { organizationId: org.id } });
  for (const u of units) {
    unitShortNameToId.set(u.shortName, u.id);
  }

  await seedProducts(org.id, catSlugToId, brandNameToId, unitShortNameToId);
  await seedWarehouses(org.id);
  await seedCustomersAndSuppliers(org.id);

  console.log('\n🎉 TÜM SEED TAMAMLANDI!\n');
  console.log(`📦 ${PRODUCTS.length} ürün, ${CATEGORIES.length} kategori, ${BRANDS.length} marka`);
  console.log('\n✅ Login: admin@wirestock.com / demo123456\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });