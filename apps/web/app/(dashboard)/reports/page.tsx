'use client';

import {
  BarChart3,
  Loader2,
  AlertTriangle,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Boxes,
  Filter,
  Download,
  Hash,
  Calendar,
  ChevronRight,
  Layers,
  AlertCircle,
  CheckCircle2,
  TrendingUp as TrendingUpIcon,
  Activity,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { KpiPanel, StatusPanel, MiniStatPanel } from '@/components/big-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// =================================================================
// Types
// =================================================================
type TabId = 'summary' | 'low-stock' | 'purchase' | 'movement' | 'dead-stock';

interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  totalWarehouses: number;
  activeWorkers: number;
  todayMovements: number;
  totalStockValue: number;
  totalSaleValue: number;
  stockAlerts: {
    outOfStock: number;
    critical: number;
    low: number;
  };
}

interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  category: { id: string; name: string; color: string | null };
  unit: { shortName: string };
  totalStock: number;
  minStock: number;
  criticalStock: number;
  maxStock: number | null;
  status: 'OUT' | 'CRITICAL' | 'LOW' | 'OK';
  suggestedOrderQty: number;
  lastMovementAt: string | null;
}

interface PurchaseItem extends LowStockItem {
  last30daysConsumption: number;
  dailyConsumption: number;
  daysRemaining: number;
  urgencyScore: number;
  estimatedCost: number;
}

interface TopMovementItem {
  productId: string;
  sku: string;
  name: string;
  category: { id: string; name: string; color: string | null };
  unit: { shortName: string };
  totalQuantity: number;
  movementCount: number;
}

interface DeadStockItem {
  id: string;
  sku: string;
  name: string;
  category: { id: string; name: string; color: string | null };
  unit: { shortName: string };
  totalStock: number;
  purchasePrice: number;
  stockValue: number;
  lastMovementAt: string;
  daysSinceMovement: number;
}

interface MovementDaily {
  day?: string;
  date: string;
  inQty: number;
  outQty: number;
}

const TABS: { id: TabId; label: string; icon: typeof BarChart3; emoji: string; color: string }[] = [
  { id: 'summary', label: 'Genel Bakış', icon: BarChart3, emoji: '📊', color: 'emerald' },
  { id: 'low-stock', label: 'Kritik Stok', icon: AlertTriangle, emoji: '🚨', color: 'red' },
  { id: 'purchase', label: 'Satın Alma', icon: ShoppingCart, emoji: '🛒', color: 'amber' },
  { id: 'movement', label: 'Hareket Analizi', icon: Activity, emoji: '📈', color: 'blue' },
  { id: 'dead-stock', label: 'Ölü Stok', icon: Clock, emoji: '🕰️', color: 'slate' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [lowStockSummary, setLowStockSummary] = useState<any>(null);
  const [purchase, setPurchase] = useState<{
    items: PurchaseItem[];
    totalEstimatedCost: number;
    totalSuggested: number;
    generatedAt: string;
  } | null>(null);
  const [topMovement, setTopMovement] = useState<TopMovementItem[]>([]);
  const [deadStock, setDeadStock] = useState<{
    items: DeadStockItem[];
    thresholdDays: number;
    summary: { total: number; totalStockValue: number };
  } | null>(null);
  const [loading, setLoading] = useState<Record<TabId, boolean>>({
    summary: false,
    'low-stock': false,
    purchase: false,
    movement: false,
    'dead-stock': false,
  });

  const fetchSummary = async () => {
    try {
      setLoading((p) => ({ ...p, summary: true }));
      const { data } = await api.get('/reports/dashboard-summary');
      setSummary(data.data);
    } catch {
      toast.error('Özet yüklenemedi');
    } finally {
      setLoading((p) => ({ ...p, summary: false }));
    }
  };

  const fetchLowStock = async () => {
    try {
      setLoading((p) => ({ ...p, 'low-stock': true }));
      const { data } = await api.get('/reports/low-stock');
      setLowStock(data.data.items);
      setLowStockSummary(data.data.summary);
    } catch {
      toast.error('Kritik stok raporu yüklenemedi');
    } finally {
      setLoading((p) => ({ ...p, 'low-stock': false }));
    }
  };

  const fetchPurchase = async () => {
    try {
      setLoading((p) => ({ ...p, purchase: true }));
      const { data } = await api.get('/reports/purchase-suggestion?limit=50');
      setPurchase(data.data);
    } catch {
      toast.error('Satın alma önerileri yüklenemedi');
    } finally {
      setLoading((p) => ({ ...p, purchase: false }));
    }
  };

  const fetchMovement = async () => {
    try {
      setLoading((p) => ({ ...p, movement: true }));
      const { data } = await api.get('/reports/top-movement?days=30&limit=15&type=OUT');
      setTopMovement(data.data.items);
    } catch {
      toast.error('Hareket raporu yüklenemedi');
    } finally {
      setLoading((p) => ({ ...p, movement: false }));
    }
  };

  const fetchDeadStock = async () => {
    try {
      setLoading((p) => ({ ...p, 'dead-stock': true }));
      const { data } = await api.get('/reports/dead-stock?days=90');
      setDeadStock(data.data);
    } catch {
      toast.error('Ölü stok raporu yüklenemedi');
    } finally {
      setLoading((p) => ({ ...p, 'dead-stock': false }));
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 'summary':
        if (!summary) fetchSummary();
        break;
      case 'low-stock':
        if (lowStock.length === 0) fetchLowStock();
        break;
      case 'purchase':
        if (!purchase) fetchPurchase();
        break;
      case 'movement':
        if (topMovement.length === 0) fetchMovement();
        break;
      case 'dead-stock':
        if (!deadStock) fetchDeadStock();
        break;
    }
  }, [activeTab]);

  return (
    <div className="relative min-h-screen bg-kraft-paper-light">
      <div className="space-y-8 p-1">
        {/* ============ HEADER ============ */}
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900">
              <BarChart3 className="h-3 w-3" />
              DEPO ANALİZ MERKEZİ
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
              Raporlar & <span className="text-brand">Analiz</span>
            </h1>
            <p className="max-w-xl text-base text-stone-600">
              Stoğun nabzını tut, neyin bittiğini gör, satın alma listesi al.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-stone-300">
              <Download className="mr-2 h-4 w-4" />
              PDF İndir
            </Button>
          </div>
        </header>

        {/* ============ TABS ============ */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border-2 px-4 py-2 text-sm transition-all',
                  isActive
                    ? 'border-stone-900 bg-stone-900 text-white shadow-md'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400 hover:shadow-sm',
                )}
              >
                <span className="text-base">{tab.emoji}</span>
                <Icon className="h-4 w-4" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============ TAB CONTENT ============ */}
        <div className="animate-fade-in">
          {activeTab === 'summary' && (
            <SummaryTab summary={summary} loading={loading.summary} />
          )}
          {activeTab === 'low-stock' && (
            <LowStockTab
              items={lowStock}
              summary={lowStockSummary}
              loading={loading['low-stock']}
            />
          )}
          {activeTab === 'purchase' && (
            <PurchaseTab purchase={purchase} loading={loading.purchase} />
          )}
          {activeTab === 'movement' && (
            <MovementTab items={topMovement} loading={loading.movement} />
          )}
          {activeTab === 'dead-stock' && (
            <DeadStockTab data={deadStock} loading={loading['dead-stock']} />
          )}
        </div>
      </div>
    </div>
  );
}

// =================================================================
// SUMMARY TAB — Genel Bakış
// =================================================================
function SummaryTab({ summary, loading }: { summary: DashboardSummary | null; loading: boolean }) {
  if (loading || !summary) {
    return <LoadingPanel />;
  }

  const totalAlerts =
    summary.stockAlerts.outOfStock + summary.stockAlerts.critical + summary.stockAlerts.low;

  return (
    <div className="space-y-6">
      {/* KPI Cards — Big Panel */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <KpiPanel
          label="Toplam Ürün"
          value={summary.totalProducts}
          emoji="📦"
          tone="positive"
          delta={12}
          deltaUnit=" bu hafta"
        />
        <KpiPanel
          label="Stok Değeri (Alış)"
          value={`₺${summary.totalStockValue.toLocaleString('tr-TR')}`}
          emoji="💰"
          tone="amber"
        />
        <KpiPanel
          label="Tahmini Satış Değeri"
          value={`₺${summary.totalSaleValue.toLocaleString('tr-TR')}`}
          emoji="📈"
          tone="info"
          footer={
            <span>
              Potansiyel kar:{' '}
              <strong className="text-emerald-700">
                +₺{(summary.totalSaleValue - summary.totalStockValue).toLocaleString('tr-TR')}
              </strong>
            </span>
          }
        />
        <KpiPanel
          label="Bugünkü Hareket"
          value={summary.todayMovements}
          emoji="⚡"
          tone="violet"
        />
      </div>

      {/* Stok Alarmları — STATUS PANEL */}
      {totalAlerts > 0 && (
        <StatusPanel
          title={`${totalAlerts} ürün dikkat bekliyor`}
          subtitle="Tedarik sürecini başlatmanız gereken malzemeler."
          emoji="🚨"
          tone="danger"
          footer={
            <span>
              <strong>İpucu:</strong> Stok bitti ve kritik seviyede olan ürünleri hemen tedarik
              listesine al.
            </span>
          }
        >
          <div className="grid grid-cols-3 gap-4">
            <StatusCounter
              label="Stoğu Bitti"
              value={summary.stockAlerts.outOfStock}
              emoji="🚫"
            />
            <StatusCounter
              label="Kritik Seviye"
              value={summary.stockAlerts.critical}
              emoji="⚠️"
            />
            <StatusCounter
              label="Azalan"
              value={summary.stockAlerts.low}
              emoji="📉"
            />
          </div>
        </StatusPanel>
      )}

      {/* Operasyonel Bilgiler */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniStatPanel
          icon={Layers}
          label="Ana Kategori (Raf)"
          value={summary.totalCategories}
          tone="warning"
        />
        <MiniStatPanel
          icon={Boxes}
          label="Aktif Depo"
          value={summary.totalWarehouses}
          tone="positive"
        />
        <MiniStatPanel
          icon={Hash}
          label="Aktif Çalışan"
          value={summary.activeWorkers}
          tone="info"
        />
      </div>
    </div>
  );
}

function StatusCounter({
  label,
  value,
  emoji,
  tone = 'danger',
}: {
  label: string;
  value: number | string;
  emoji: string;
  tone?: 'danger' | 'info' | 'warning';
}) {
  const toneMap = {
    danger: 'border-red-200 bg-white text-red-700',
    info: 'border-sky-200 bg-white text-sky-700',
    warning: 'border-amber-200 bg-white text-amber-700',
  };
  return (
    <div className={cn('rounded-2xl border-2 p-5 text-center shadow-sm', toneMap[tone])}>
      <div className="text-4xl">{emoji}</div>
      <div className="mt-2 font-display text-5xl font-black leading-none">
        {value}
      </div>
      <div className="mt-2 text-xs font-bold uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// =================================================================
// LOW STOCK TAB — Kritik Stok
// =================================================================
function LowStockTab({
  items,
  summary,
  loading,
}: {
  items: LowStockItem[];
  summary: any;
  loading: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OUT' | 'CRITICAL' | 'LOW'>('ALL');

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return items;
    return items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  if (loading) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      {/* Summary Banner — BigPanels */}
      {summary && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <KpiPanel
            label="Toplam Sorunlu"
            value={summary.total}
            emoji="🚨"
            tone="danger"
          />
          <KpiPanel
            label="Stoğu Biten"
            value={summary.out}
            emoji="🚫"
            tone="danger"
          />
          <KpiPanel
            label="Kritik Seviyede"
            value={summary.critical}
            emoji="⚠️"
            tone="warning"
          />
          <KpiPanel
            label="Toplam Sipariş Miktarı"
            value={`${summary.totalSuggestedOrderItems.toLocaleString('tr-TR')} parça`}
            emoji="📦"
            tone="info"
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {(['ALL', 'OUT', 'CRITICAL', 'LOW'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-bold transition-all',
              statusFilter === f
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500',
            )}
          >
            {f === 'ALL' ? 'Hepsi' : f === 'OUT' ? 'Bitti' : f === 'CRITICAL' ? 'Kritik' : 'Az'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🎉"
          title="Her şey yolunda!"
          subtitle="Bu kategoride kritik stok yok."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-200">
              {filtered.slice(0, 100).map((item) => (
                <LowStockRow key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
          {filtered.length > 100 && (
            <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 text-center text-xs text-stone-500">
              İlk 100 ürün gösteriliyor. Tüm liste için{' '}
              <span className="font-bold">PDF İndir</span>'i kullan.
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// =================================================================
// PURCHASE TAB — Satın Alma Önerisi
// =================================================================
function PurchaseTab({
  purchase,
  loading,
}: {
  purchase: {
    items: PurchaseItem[];
    totalEstimatedCost: number;
    totalSuggested: number;
    generatedAt: string;
  } | null;
  loading: boolean;
}) {
  if (loading || !purchase) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      {/* Big Total Card — Mega Panel */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-8 text-white shadow-pop md:p-12">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-yellow-300 opacity-20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-red-400 opacity-30 blur-3xl" />

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur">
              <ShoppingCart className="h-3.5 w-3.5" />
              Bugün Satın Al
            </div>
            <div className="font-display text-7xl font-black leading-none tracking-tight md:text-8xl">
              ₺{purchase.totalEstimatedCost.toLocaleString('tr-TR')}
            </div>
            <p className="mt-4 text-base text-orange-100 md:text-lg">
              Tahmini toplam maliyet · <strong>{purchase.totalSuggested} ürün</strong> için
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow-lg">
              <ShoppingCart className="h-4 w-4" />
              Sipariş Listesi Hazır
            </div>
          </div>

          <div className="text-center md:text-right">
            <div className="text-9xl">🛒</div>
          </div>
        </div>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-stone-200">
            {purchase.items.map((item, i) => (
              <PurchaseRow key={item.id} item={item} rank={i + 1} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =================================================================
// MOVEMENT TAB — Hareket Analizi
// =================================================================
function MovementTab({
  items,
  loading,
}: {
  items: TopMovementItem[];
  loading: boolean;
}) {
  if (loading) return <LoadingPanel />;

  const maxQty = Math.max(...items.map((i) => i.totalQuantity), 1);

  return (
    <div className="space-y-6">
      <StatusPanel
        title="Hızlı Tüketim — Hangi Malzeme Çok Çıkıyor?"
        subtitle="Satın alma planlaması için tüketim hızı analizi · Son 30 gün"
        emoji="📈"
        tone="info"
        footer={
          <span>
            <strong>İpucu:</strong> Tüketim hızı yüksek ürünleri her zaman min stok seviyesinin üstünde tut.
          </span>
        }
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatusCounter
            label="Takip Edilen Ürün"
            value={items.length}
            emoji="📦"
            tone="info"
          />
          <StatusCounter
            label="Toplam Tüketim (30g)"
            value={items.reduce((s, i) => s + i.totalQuantity, 0)}
            emoji="📊"
            tone="info"
          />
          <StatusCounter
            label="Toplam Hareket"
            value={items.reduce((s, i) => s + i.movementCount, 0)}
            emoji="🔄"
            tone="info"
          />
        </div>
      </StatusPanel>

      {items.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="Henüz tüketim verisi yok"
          subtitle="Stok çıkışı olduğunda burada analiz göreceksin."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-200">
              {items.map((item, i) => {
                const percent = (item.totalQuantity / maxQty) * 100;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-stone-50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-display text-lg font-black text-blue-700">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        SKU: {item.sku} · {item.category.name}
                      </p>
                      {/* Bar */}
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-black text-stone-900">
                        {item.totalQuantity}
                      </div>
                      <div className="text-xs text-stone-500">
                        {item.unit.shortName} · {item.movementCount} hareket
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =================================================================
// DEAD STOCK TAB — Ölü Stok
// =================================================================
function DeadStockTab({
  data,
  loading,
}: {
  data: { items: DeadStockItem[]; thresholdDays: number; summary: { total: number; totalStockValue: number } } | null;
  loading: boolean;
}) {
  if (loading || !data) return <LoadingPanel />;

  return (
    <div className="space-y-6">
      <StatusPanel
        title="Ölü Stok — Ne Duruyor, Ne Çürüyor?"
        subtitle={`Bu malzemeler rafta duruyor ama kullanılmıyor. İade, eriten satış veya gözden geçirme adayları · Son ${data.thresholdDays} gün`}
        emoji="🕰️"
        tone="neutral"
      >
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <StatusCounter
            label="Ölü Stok (adet)"
            value={data.summary.total}
            emoji="📦"
            tone="warning"
          />
          <StatusCounter
            label="Toplam Değer"
            value={`₺${data.summary.totalStockValue.toLocaleString('tr-TR')}`}
            emoji="💸"
            tone="warning"
          />
          <StatusCounter
            label="Eşik (gün)"
            value={data.thresholdDays}
            emoji="⏰"
            tone="info"
          />
        </div>
      </StatusPanel>

      {data.items.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Tertemiz Depo!"
          subtitle={`Son ${data.thresholdDays} günde tüm ürünler hareket etmiş.`}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-stone-200">
              {data.items.slice(0, 50).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-stone-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl">
                      🕰️
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-stone-900">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        {item.sku} · {item.category.name} · Son:{' '}
                        {new Date(item.lastMovementAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-lg font-black text-slate-700">
                      {item.daysSinceMovement} gün
                    </div>
                    <div className="text-xs text-stone-500">
                      {item.totalStock} {item.unit.shortName} · ₺{item.stockValue.toLocaleString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =================================================================
// HELPER COMPONENTS
// =================================================================

function LoadingPanel() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm text-stone-500">Rapor yükleniyor...</p>
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center">
      <div className="mb-4 text-7xl opacity-50">{emoji}</div>
      <h3 className="font-display text-xl font-bold text-stone-700">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-stone-500">{subtitle}</p>
    </div>
  );
}

function LowStockRow({ item }: { item: LowStockItem }) {
  const statusMap = {
    OUT: { label: 'Stok Bitti', emoji: '🚫', bg: 'bg-red-100 text-red-700' },
    CRITICAL: { label: 'Kritik', emoji: '⚠️', bg: 'bg-orange-100 text-orange-700' },
    LOW: { label: 'Az', emoji: '📉', bg: 'bg-amber-100 text-amber-700' },
    OK: { label: 'OK', emoji: '✅', bg: 'bg-emerald-100 text-emerald-700' },
  };
  const s = statusMap[item.status];

  return (
    <div className="flex items-center gap-4 transition-colors hover:bg-stone-50">
      <div className="flex w-12 flex-shrink-0 items-center justify-center py-4">
        <span
          className={cn('rounded-full px-2 py-1 text-xs font-bold', s.bg)}
          title={s.label}
        >
          {s.emoji}
        </span>
      </div>
      <div className="min-w-0 flex-1 py-4">
        <p className="truncate font-semibold text-stone-900">{item.name}</p>
        <p className="text-xs text-stone-500">
          {item.sku} · {item.category.name} · Min: {item.minStock} {item.unit.shortName}
        </p>
      </div>
      <div className="flex items-center gap-6 px-4 text-right">
        <div>
          <div className="text-xs text-stone-500">Mevcut</div>
          <div className="font-display text-lg font-black text-stone-900">
            {item.totalStock}
          </div>
        </div>
        <div>
          <div className="text-xs text-stone-500">Önerilen</div>
          <div className="font-display text-lg font-black text-amber-600">
            +{item.suggestedOrderQty}
          </div>
        </div>
      </div>
    </div>
  );
}

function PurchaseRow({ item, rank }: { item: PurchaseItem; rank: number }) {
  const urgencyColor =
    item.urgencyScore >= 90
      ? 'bg-red-100 text-red-700 border-red-300'
      : item.urgencyScore >= 70
      ? 'bg-orange-100 text-orange-700 border-orange-300'
      : 'bg-amber-100 text-amber-700 border-amber-300';

  return (
    <div className="flex items-center gap-4 p-4 transition-colors hover:bg-amber-50/30">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 font-display text-lg font-black text-white">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-semibold text-stone-900">{item.name}</p>
          <span
            className={cn(
              'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase',
              urgencyColor,
            )}
          >
            ACİL {item.urgencyScore}
          </span>
        </div>
        <p className="text-xs text-stone-500">
          {item.sku} · {item.category.name} · Stok: {item.totalStock} {item.unit.shortName}
        </p>
        <div className="mt-1 flex items-center gap-3 text-[11px] text-stone-600">
          <span>
            📊 Tüketim: <b>{item.last30daysConsumption}</b>/ay
          </span>
          <span>·</span>
          <span>
            ⏳ <b>{item.daysRemaining === 999 ? '∞' : `${item.daysRemaining}g`}</b> yeter
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-stone-500">+{item.suggestedOrderQty} adet</div>
        <div className="font-display text-lg font-black text-amber-700">
          ₺{item.estimatedCost.toLocaleString('tr-TR')}
        </div>
      </div>
    </div>
  );
}