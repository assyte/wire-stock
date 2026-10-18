'use client';

import { cn, formatNumber } from '@wire-stock/utils';
import {
  ScanLine,
  Plus,
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Loader2,
  X,
  Check,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Movement {
  id: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGE';
  quantity: number | string;
  unitPrice?: number | string | null;
  totalPrice?: number | string | null;
  note?: string | null;
  referenceType?: string | null;
  createdAt: string;
  product?: { name: string; sku: string };
  warehouse?: { name: string; code: string };
  user?: { firstName: string; lastName: string };
}

interface Product {
  id: string;
  sku: string;
  name: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  shelves: Array<{ id: string; code: string }>;
}

const TYPE_META: Record<
  Movement['type'],
  { label: string; color: string; icon: typeof ArrowDownToLine; sign: '+' | '-' | '~' }
> = {
  IN:       { label: 'Giriş',       color: 'bg-success/10 text-success',       icon: ArrowDownToLine, sign: '+' },
  OUT:      { label: 'Çıkış',       color: 'bg-destructive/10 text-destructive', icon: ArrowUpFromLine, sign: '-' },
  TRANSFER: { label: 'Transfer',    color: 'bg-info/10 text-info',             icon: ScanLine,        sign: '~' },
  ADJUSTMENT:{ label: 'Düzeltme',   color: 'bg-warning/10 text-warning',       icon: ScanLine,        sign: '~' },
  RETURN:   { label: 'İade',        color: 'bg-accent/10 text-accent',         icon: ArrowDownToLine, sign: '+' },
  DAMAGE:   { label: 'Hasar',       color: 'bg-destructive/10 text-destructive', icon: ArrowUpFromLine, sign: '-' },
};

export default function StockPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    productId: '',
    warehouseId: '',
    type: 'IN' as Movement['type'],
    quantity: 1,
    unitPrice: undefined as number | undefined,
    note: '',
  });

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/stock/movements', {
        params: {
          page,
          pageSize: 20,
          warehouseId: warehouseFilter || undefined,
          type: typeFilter || undefined,
        },
      });
      setMovements(data.data.items);
      setTotal(data.data.meta.total);
      setTotalPages(data.data.meta.totalPages);
    } catch {
      toast.error('Hareketler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [productsRes, warehousesRes] = await Promise.all([
        api.get('/products', { params: { page: 1, pageSize: 100 } }),
        api.get('/warehouses'),
      ]);
      setProducts(productsRes.data.data.items);
      setWarehouses(warehousesRes.data.data);
    } catch {
      // sessizce yoksay
    }
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  useEffect(() => {
    fetchMovements();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, typeFilter, warehouseFilter]);

  // Search ürün adı/SKU üzerinden client-side filtreleme (API'de search yok)
  const filtered = useMemo(() => {
    if (!search) return movements;
    const q = search.toLowerCase();
    return movements.filter((m) => {
      const sku = m.product?.sku?.toLowerCase() ?? '';
      const name = m.product?.name?.toLowerCase() ?? '';
      return sku.includes(q) || name.includes(q);
    });
  }, [movements, search]);

  const openCreate = () => {
    setForm({
      productId: '',
      warehouseId: '',
      type: 'IN',
      quantity: 1,
      unitPrice: undefined,
      note: '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productId || !form.warehouseId || form.quantity <= 0) {
      toast.error('Ürün, depo ve miktar zorunludur');
      return;
    }
    try {
      setSubmitting(true);
      await api.post('/stock/movements', {
        productId: form.productId,
        warehouseId: form.warehouseId,
        type: form.type,
        quantity: form.quantity,
        unitPrice: form.unitPrice,
        note: form.note || undefined,
      });
      toast.success('Stok hareketi oluşturuldu');
      setModalOpen(false);
      fetchMovements();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Stok Hareketleri</h1>
          <p className="text-sm text-text-secondary">
            Giriş, çıkış, transfer ve sayım düzeltmeleri
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Hareket
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-brand" />
            Tüm Hareketler ({total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tüm Tipler</option>
              <option value="IN">Giriş</option>
              <option value="OUT">Çıkış</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUSTMENT">Düzeltme</option>
              <option value="RETURN">İade</option>
              <option value="DAMAGE">Hasar</option>
            </select>

            <select
              value={warehouseFilter}
              onChange={(e) => { setWarehouseFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tüm Depolar</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.code} — {w.name}</option>
              ))}
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <ScanLine className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Hareket bulunamadı</p>
              <p className="text-xs text-text-muted">Yeni hareket oluşturarak başla</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">Tip</th>
                    <th className="py-3 px-2">Ürün</th>
                    <th className="py-3 px-2">Depo</th>
                    <th className="py-3 px-2 text-right">Miktar</th>
                    <th className="py-3 px-2">Kullanıcı</th>
                    <th className="py-3 px-2">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => {
                    const meta = TYPE_META[m.type] ?? TYPE_META.ADJUSTMENT;
                    const Icon = meta.icon;
                    const qty = Number(m.quantity);
                    const date = new Date(m.createdAt);
                    return (
                      <tr key={m.id} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-3 px-2">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs', meta.color)}>
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-medium text-text-primary">{m.product?.name ?? '—'}</p>
                          <p className="font-mono text-xs text-text-muted">{m.product?.sku}</p>
                        </td>
                        <td className="py-3 px-2">
                          <p className="text-sm text-text-secondary">{m.warehouse?.name ?? '—'}</p>
                          <p className="font-mono text-xs text-text-muted">{m.warehouse?.code}</p>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums',
                            meta.sign === '+' && 'bg-success/10 text-success',
                            meta.sign === '-' && 'bg-destructive/10 text-destructive',
                            meta.sign === '~' && 'bg-info/10 text-info',
                          )}>
                            {meta.sign}{formatNumber(qty)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-text-secondary">
                          {m.user ? `${m.user.firstName} ${m.user.lastName}` : '—'}
                        </td>
                        <td className="py-3 px-2 text-xs text-text-muted">
                          {date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-text-muted">
                Sayfa {page} / {totalPages} • {total} hareket
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Movement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Stok Hareketi</CardTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Hareket tipi</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(['IN', 'OUT', 'RETURN', 'DAMAGE'] as const).map((t) => {
                      const meta = TYPE_META[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm({ ...form, type: t })}
                          className={cn(
                            'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition-all',
                            form.type === t
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-border bg-background-surface text-text-muted hover:text-text-primary',
                          )}
                        >
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="productId">Ürün *</Label>
                  <select
                    id="productId"
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                    required
                  >
                    <option value="">Ürün seçin</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.sku} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warehouseId">Depo *</Label>
                  <select
                    id="warehouseId"
                    value={form.warehouseId}
                    onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                    required
                  >
                    <option value="">Depo seçin</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.code} — {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Miktar *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Birim fiyat</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="0.01"
                      value={form.unitPrice ?? ''}
                      onChange={(e) => setForm({ ...form, unitPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="opsiyonel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">Not</Label>
                  <Input
                    id="note"
                    placeholder="Açıklama (opsiyonel)"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !form.productId || !form.warehouseId || form.quantity <= 0}
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" />
                    Oluştur
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}