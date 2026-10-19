// =================================================================
// EAN-13 Barkod Üretim & Doğrulama
// 869 = Türkiye GS1 prefix (8690123456789 gibi)
// =================================================================

/**
 * 12 haneli base için EAN-13 checksum hesapla.
 * EAN-13 algoritması:
 *  - Tek pozisyondaki (1, 3, 5, ...) haneler 1 ile çarpılır
 *  - Çift pozisyondaki (2, 4, 6, ...) haneler 3 ile çarpılır
 *  - Toplam mod 10 → 10 - (toplam mod 10) → checksum
 */
export function calculateEAN13Checksum(twelveDigits: string): number {
  if (!/^\d{12}$/.test(twelveDigits)) {
    throw new Error('EAN-13 base 12 haneli rakam olmalı');
  }
  const digits = twelveDigits.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += (digits[i] ?? 0) * (i % 2 === 0 ? 1 : 3);
  }
  const checksum = (10 - (sum % 10)) % 10;
  return checksum;
}

/**
 * Rastgele 13 haneli EAN-13 barkod üret.
 * Türkiye prefix'i (869) ile başlar.
 */
export function generateEAN13(): string {
  // 869 = Türkiye GS1 prefix
  // Sonraki 9 hane: rastgele
  const random9 = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const base12 = '869' + random9; // 12 hane
  const checksum = calculateEAN13Checksum(base12);
  return base12 + checksum;
}

/**
 * Verilen 13 haneli barkodun geçerli olup olmadığını kontrol et.
 */
export function isValidEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;
  const expected = calculateEAN13Checksum(barcode.slice(0, 12));
  return expected === Number(barcode[12]);
}

/**
 * Barkodun başında Türkiye prefix'i var mı?
 */
export function isTurkishEAN13(barcode: string): boolean {
  return /^869\d{10}$/.test(barcode);
}

/**
 * Barkoddan ülke kodunu çıkar (EAN-13 ilk 3 hane).
 */
export function getCountryCode(barcode: string): string | null {
  if (!/^\d{13}$/.test(barcode)) return null;
  return barcode.slice(0, 3);
}