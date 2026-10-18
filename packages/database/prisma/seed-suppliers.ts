/**
 * WireStock v3 Seed — Tedarikçileri (Suppliers) ayrı tabloya taşı
 *
 * Customer tablosundaki TED-* kodlu tedarikçileri silip
 * Supplier tablosuna gerçek tedarikçi kayıtları olarak ekler.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUPPLIERS = [
  {
    code: 'TED-001',
    name: 'Schneider Electric Türkiye',
    taxNumber: '1111111111',
    taxOffice: 'Merkez',
    contactPerson: 'Mehmet Bey',
    phone: '+90 212 444 55 66',
    email: 'sales.tr@se.com',
    iban: 'TR12 0006 4000 0011 1111 1111 11',
    paymentTerms: '30 gün vade',
    address: 'Maslak Mah. Büyükdere Cad.',
    city: 'İstanbul',
  },
  {
    code: 'TED-002',
    name: 'Mutlusan Kablo',
    taxNumber: '2222222222',
    taxOffice: 'Gebze',
    contactPerson: 'Satış Departmanı',
    phone: '+90 262 333 44 55',
    email: 'info@mutlusan.com',
    iban: 'TR98 0006 2000 0022 2222 2222 22',
    paymentTerms: '45 gün vade',
    address: 'Gebze OSB',
    city: 'Kocaeli',
  },
  {
    code: 'TED-003',
    name: 'Federal Elektrik',
    taxNumber: '3333333333',
    taxOffice: 'Beşiktaş',
    contactPerson: 'Satış Temsilcisi',
    phone: '+90 212 222 33 44',
    email: 'sales@federal.com.tr',
    paymentTerms: '30 gün vade',
    address: 'Levent Mah.',
    city: 'İstanbul',
  },
  {
    code: 'TED-004',
    name: 'CATA Aydınlatma',
    taxNumber: '4444444444',
    taxOffice: 'Beşiktaş',
    contactPerson: 'CATA Satış',
    phone: '+90 212 555 66 77',
    email: 'cata@cata.com.tr',
    paymentTerms: '60 gün vade',
    address: 'Beylikdüzü',
    city: 'İstanbul',
  },
  {
    code: 'TED-005',
    name: 'Klemsan',
    taxNumber: '5555555555',
    taxOffice: 'Çerkezköy',
    contactPerson: 'Bölge Satış',
    phone: '+90 282 444 11 22',
    email: 'info@klemsan.com.tr',
    paymentTerms: '30 gün vade',
    address: 'Çerkezköy OSB',
    city: 'Tekirdağ',
  },
  {
    code: 'TED-006',
    name: 'Phoenix Contact Türkiye',
    taxNumber: '6666666666',
    taxOffice: 'Ataşehir',
    contactPerson: 'Satış Departmanı',
    phone: '+90 216 666 88 99',
    email: 'info@phoenixcontact.com.tr',
    paymentTerms: '30 gün vade',
    address: 'Ataşehir',
    city: 'İstanbul',
  },
  {
    code: 'TED-007',
    name: 'Tunçmatik',
    taxNumber: '7777777777',
    taxOffice: 'Ümraniye',
    contactPerson: 'Satış',
    phone: '+90 216 777 11 22',
    email: 'info@tuncmatik.com.tr',
    paymentTerms: '45 gün vade',
    address: 'Ümraniye',
    city: 'İstanbul',
  },
  {
    code: 'TED-008',
    name: 'Netelsan Diafon',
    taxNumber: '8888888888',
    taxOffice: 'Maltepe',
    contactPerson: 'Bölge Satış',
    phone: '+90 216 888 33 44',
    email: 'info@netelsan.com.tr',
    paymentTerms: '30 gün vade',
    address: 'Maltepe',
    city: 'İstanbul',
  },
];

async function main() {
  console.log('\n🏭 Tedarikçiler Supplier tablosuna taşınıyor...\n');

  const org = await prisma.organization.findFirst({
    where: { slug: 'demo-elektrik' },
  });
  if (!org) {
    console.error('❌ Demo organizasyon bulunamadı!');
    return;
  }

  for (const s of SUPPLIERS) {
    const existing = await prisma.supplier.findFirst({
      where: { organizationId: org.id, code: s.code },
    });
    if (existing) {
      await prisma.supplier.update({
        where: { id: existing.id },
        data: s,
      });
    } else {
      await prisma.supplier.create({
        data: { ...s, organizationId: org.id, isActive: true },
      });
    }
  }
  console.log(`✅ ${SUPPLIERS.length} tedarikçi Supplier tablosuna eklendi`);

  // Eski TED-* kodlu customer'ları sil (idempotent)
  const tedCustomers = await prisma.customer.findMany({
    where: { organizationId: org.id, code: { startsWith: 'TED-' } },
  });
  for (const c of tedCustomers) {
    await prisma.customer.update({
      where: { id: c.id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
  console.log(`✅ ${tedCustomers.length} eski TED-* müşteri kaydı temizlendi`);

  console.log('\n🎉 Tedarikçiler başarıyla Supplier tablosuna taşındı!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });