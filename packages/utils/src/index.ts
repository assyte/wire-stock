import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind class'larını birleştirmek için yardımcı fonksiyon
 * shadcn/ui tarafından kullanılır
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sayıyı Türk Lirası formatında gösterir
 */
export function formatCurrency(
  amount: number | string,
  currency: string = 'TRY',
  locale: string = 'tr-TR',
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

/**
 * Sayıyı binlik ayracı ile formatlar
 */
export function formatNumber(num: number | string, locale: string = 'tr-TR'): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat(locale).format(n);
}

/**
 * Tarihi Türkçe formatında gösterir
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale: string = 'tr-TR',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Tarih ve saat
 */
export function formatDateTime(
  date: Date | string,
  locale: string = 'tr-TR',
): string {
  return formatDate(date, { dateStyle: 'short', timeStyle: 'short' }, locale);
}

/**
 * SKU kodu üretir
 */
export function generateSku(prefix: string = 'PRD'): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Barkod kodu üretir (EAN-13 benzeri)
 */
export function generateBarcode(): string {
  const code = Math.floor(100000000000 + Math.random() * 900000000000);
  return code.toString();
}

/**
 * Metin kısaltma
 */
export function truncate(str: string, max: number = 50): string {
  if (str.length <= max) return str;
  return str.substring(0, max) + '...';
}

/**
 * Initials (baş harfler) - avatar için
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Rastgele renk üretir (avatar için)
 */
export function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Stok durumu rengi
 */
export function getStockStatusColor(
  quantity: number,
  minStock: number,
  criticalStock: number,
): 'success' | 'warning' | 'destructive' {
  if (quantity <= criticalStock) return 'destructive';
  if (quantity <= minStock) return 'warning';
  return 'success';
}

/**
 * Stok durumu metni
 */
export function getStockStatusText(
  quantity: number,
  minStock: number,
  criticalStock: number,
): string {
  if (quantity <= 0) return 'Tükendi';
  if (quantity <= criticalStock) return 'Kritik';
  if (quantity <= minStock) return 'Az Kaldı';
  return 'Yeterli';
}

/**
 * Dosya boyutunu formatlar
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Slug oluşturur
 */
export function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: 'c',
    Ç: 'C',
    ğ: 'g',
    Ğ: 'G',
    ş: 's',
    Ş: 'S',
    ü: 'u',
    Ü: 'U',
    ı: 'i',
    İ: 'I',
    ö: 'o',
    Ö: 'O',
  };
  return text
    .replace(/[çÇğĞşŞüÜıİöÖ]/g, (m) => trMap[m] || m)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Debounce
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Sayıdan yüzde hesaplar
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * KDV dahil fiyat hesaplar
 */
export function calculateVatIncluded(price: number, vatRate: number): number {
  return price * (1 + vatRate / 100);
}

/**
 * KDV hariç fiyat hesaplar
 */
export function calculateVatExcluded(price: number, vatRate: number): number {
  return price / (1 + vatRate / 100);
}
