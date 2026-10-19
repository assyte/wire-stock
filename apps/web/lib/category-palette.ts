// =================================================================
// Category Palette — Her ana kategoriye özel samimi renkler
// Elektrik ustasının dünyasından: pano siyah, kablo bakır, vs.
// =================================================================

export interface CategoryPalette {
  /** Ana renk — kartın ana tonu */
  primary: string;
  /** İkincil renk — gradient'ler için */
  secondary: string;
  /** Arka plan tonu — kart arkasındaki blob */
  bg: string;
  /** Vurgu rengi — badge'ler, fiyatlar */
  accent: string;
  /** Samimi emoji / ikon — ustanın sektörel simgesi */
  emoji: string;
  /** Samimi etiket — "Bu raf şunu barındırır" */
  tagline: string;
  /** Material simgesi — ahşap mı, metal mi, kablo mu? */
  texture: 'wood' | 'metal' | 'cable' | 'paper' | 'ceramic';
}

export const CATEGORY_PALETTE: Record<string, CategoryPalette> = {
  // ── Aydınlatma → Voltaj sarısı + armatür parıltısı ──
  aydinlatma: {
    primary: '#F59E0B',
    secondary: '#FBBF24',
    bg: '#FEF3C7',
    accent: '#92400E',
    emoji: '💡',
    tagline: 'Işık Veren Parçalar',
    texture: 'metal',
  },

  // ── Anahtar & Priz → Krem + klasik beyaz elektrik ──
  'anahtar-priz': {
    primary: '#475569',
    secondary: '#94A3B8',
    bg: '#F1F5F9',
    accent: '#0F172A',
    emoji: '🔌',
    tagline: 'Temastan Kontrole',
    texture: 'ceramic',
  },

  // ── Kablolar & Tesisat → Bakır + yalıtım siyah ──
  kablolar: {
    primary: '#B45309',
    secondary: '#F97316',
    bg: '#FED7AA',
    accent: '#7C2D12',
    emoji: '🔌',
    tagline: 'Enerji Taşıyıcılar',
    texture: 'cable',
  },

  // ── Kanal, Boru & Buat → Sıva üstü gri ──
  'kanal-boru': {
    primary: '#64748B',
    secondary: '#CBD5E1',
    bg: '#F1F5F9',
    accent: '#1E293B',
    emoji: '🪚',
    tagline: 'Tesisat Omurgası',
    texture: 'metal',
  },

  // ── Klemens & Bağlantı → Sarı-yeşil topraklama ──
  klemens: {
    primary: '#65A30D',
    secondary: '#A3E635',
    bg: '#ECFCCB',
    accent: '#365314',
    emoji: '🔗',
    tagline: 'Bağlantı Noktaları',
    texture: 'metal',
  },

  // ── Pano & Şalt Tesisleri → Endüstriyel koyu ──
  'pano-malzemeleri': {
    primary: '#1E293B',
    secondary: '#475569',
    bg: '#E2E8F0',
    accent: '#F59E0B',
    emoji: '⚙️',
    tagline: 'Pano İçi Donanım',
    texture: 'metal',
  },

  // ── Pano & Sigorta → Koruyucu kırmızı ──
  'pano-sigorta': {
    primary: '#DC2626',
    secondary: '#F87171',
    bg: '#FEE2E2',
    accent: '#7F1D1D',
    emoji: '🛡️',
    tagline: 'Koruyucu Kalkan',
    texture: 'metal',
  },

  // ── Şalt Malzemeleri & Koruma → Sarı uyarı ──
  'salt-malzemeleri': {
    primary: '#CA8A04',
    secondary: '#FACC15',
    bg: '#FEF9C3',
    accent: '#713F12',
    emoji: '⚡',
    tagline: 'Yüksek Gerilim Ekibi',
    texture: 'metal',
  },

  // ── Motor, Sürücü & Kontaktör → Endüstriyel turuncu ──
  'motor-surucu': {
    primary: '#EA580C',
    secondary: '#FB923C',
    bg: '#FFEDD5',
    accent: '#7C2D12',
    emoji: '⚙️',
    tagline: 'Dönen Güç',
    texture: 'metal',
  },

  // ── Otomasyon & Kontrol → Teknoloji mavi ──
  otomasyon: {
    primary: '#2563EB',
    secondary: '#60A5FA',
    bg: '#DBEAFE',
    accent: '#1E3A8A',
    emoji: '🤖',
    tagline: 'Akıl Veren Sistem',
    texture: 'ceramic',
  },

  // ── Trafo & Regülatör → Bakır bobin ──
  trafolar: {
    primary: '#92400E',
    secondary: '#D97706',
    bg: '#FEF3C7',
    accent: '#451A03',
    emoji: '🔋',
    tagline: 'Gerilim Dönüştürücü',
    texture: 'cable',
  },

  // ── Kompanzasyon & Harmonik → Reaktif mavi ──
  kompanzasyon: {
    primary: '#0891B2',
    secondary: '#22D3EE',
    bg: '#CFFAFE',
    accent: '#164E63',
    emoji: '📊',
    tagline: 'Güç Faktörü Uzmanı',
    texture: 'ceramic',
  },

  // ── UPS & Jeneratör → Yedek enerji yeşil ──
  'ups-jenerator': {
    primary: '#059669',
    secondary: '#34D399',
    bg: '#D1FAE5',
    accent: '#064E3B',
    emoji: '🔋',
    tagline: 'Yedek Güç Deposu',
    texture: 'metal',
  },

  // ── Topraklama & Yıldırım Koruma → Sarı-yeşil şerit ──
  topraklama: {
    primary: '#84CC16',
    secondary: '#A3E635',
    bg: '#F7FEE7',
    accent: '#365314',
    emoji: '⚡',
    tagline: 'Güvenli Topraklama',
    texture: 'metal',
  },

  // ── Test & Ölçüm → Hassas sarı ──
  'test-olcum': {
    primary: '#CA8A04',
    secondary: '#FDE047',
    bg: '#FEF9C3',
    accent: '#713F12',
    emoji: '🔬',
    tagline: 'Ölçen & Test Eden',
    texture: 'paper',
  },

  // ── El Aletleri & Sıkma Penseleri → Klasik turuncu-siyah ──
  'el-aletleri': {
    primary: '#C2410C',
    secondary: '#FB923C',
    bg: '#FED7AA',
    accent: '#7C2D12',
    emoji: '🔧',
    tagline: 'Ustanın Sağ Kolu',
    texture: 'wood',
  },

  // ── Aksesuar & Montaj → Nötr gri ──
  aksesuar: {
    primary: '#52525B',
    secondary: '#A1A1AA',
    bg: '#F4F4F5',
    accent: '#18181B',
    emoji: '🧰',
    tagline: 'Tamamlayıcı Parçalar',
    texture: 'metal',
  },

  // ── İzole Bant & Yapıştırıcı → Elektrik sarısı ──
  'izole-bant': {
    primary: '#EAB308',
    secondary: '#FACC15',
    bg: '#FEF9C3',
    accent: '#713F12',
    emoji: '🟡',
    tagline: 'İzole Eden & Yapıştıran',
    texture: 'paper',
  },

  // ── Endüstriyel Fiş & Priz → CEE mavi ──
  endustriyel: {
    primary: '#1E40AF',
    secondary: '#3B82F6',
    bg: '#DBEAFE',
    accent: '#1E3A8A',
    emoji: '🔌',
    tagline: 'Ağır Hizmet Tipi',
    texture: 'ceramic',
  },

  // ── Zayıf Akım & Data → Network mor ──
  'zayif-akim': {
    primary: '#7C3AED',
    secondary: '#A78BFA',
    bg: '#EDE9FE',
    accent: '#4C1D95',
    emoji: '📡',
    tagline: 'Veri & Sinyal',
    texture: 'paper',
  },

  // ── Güvenlik & Alarm → Alarm kırmızı ──
  guvenlik: {
    primary: '#B91C1C',
    secondary: '#EF4444',
    bg: '#FEE2E2',
    accent: '#7F1D1D',
    emoji: '🚨',
    tagline: 'Koruyan Gözler',
    texture: 'metal',
  },

  // ── Akıllı Ev & Bina Otomasyonu → Akıllı mavi-yeşil ──
  'ev-akilli': {
    primary: '#0D9488',
    secondary: '#5EEAD4',
    bg: '#CCFBF1',
    accent: '#134E4A',
    emoji: '🏠',
    tagline: 'Akıllı Yaşam',
    texture: 'ceramic',
  },

  // ── Yangın Algılama & Alarm → Acil kırmızı ──
  yangin: {
    primary: '#DC2626',
    secondary: '#FCA5A5',
    bg: '#FEE2E2',
    accent: '#7F1D1D',
    emoji: '🔥',
    tagline: 'Acil Durum Ekibi',
    texture: 'metal',
  },
};

// Fallback palette (bilinmeyen slug için)
export const FALLBACK_PALETTE: CategoryPalette = {
  primary: '#059669',
  secondary: '#34D399',
  bg: '#D1FAE5',
  accent: '#064E3B',
  emoji: '📦',
  tagline: 'Kategorik Ürünler',
  texture: 'paper',
};

export const getPalette = (slug?: string | null): CategoryPalette =>
  (slug && CATEGORY_PALETTE[slug]) || FALLBACK_PALETTE;

// =================================================================
// Stock Badge Helper — Samimi stok rozetleri
// =================================================================
export interface StockStatus {
  label: string;
  emoji: string;
  bgClass: string;
  textClass: string;
}

export const getStockStatus = (current: number, min: number): StockStatus => {
  if (current === 0)
    return {
      label: 'Bitti',
      emoji: '🚫',
      bgClass: 'bg-red-100',
      textClass: 'text-red-700',
    };
  if (current <= min)
    return {
      label: 'Az Kaldı',
      emoji: '⚠️',
      bgClass: 'bg-amber-100',
      textClass: 'text-amber-700',
    };
  if (current > min * 5)
    return {
      label: 'Stokta Bol',
      emoji: '✅',
      bgClass: 'bg-emerald-100',
      textClass: 'text-emerald-700',
    };
  return {
    label: 'Yeterli',
    emoji: '👍',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  };
};