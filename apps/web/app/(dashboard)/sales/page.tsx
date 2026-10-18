'use client';

import { cn, formatCurrency, formatNumber } from '@wire-stock/utils';
import {
  ShoppingCart,
  Plus,
  Search,
  Loader2,
  X,
  Trash2,
  Check,
  ArrowRight,
  Eye,
  Package,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Customer { id: string; name: string; code: string; }
interface Product { id: string; sku: string; name: string; salePrice?: number | string; vatRate?: number | string; }

interface OrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  discount: number;
  total: number;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  status: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'INVOICED' | 'CANCELLED';
  orderDate: string;
  deliveryDate?: string | null;
  subtotal: number | string;
  vatTotal: number | string;
  total: number | string;
  customer?: { id: string; name: string; code: string };
  _count?: { items: number };
  items?: OrderItem[];
}

const STATUS_META: Record<SalesOrder['status'], { label: string; color: string }> = {
  DRAFT:     { label: 'Taslak',     color: 'bg-text-muted/10 text-text-muted' },
  CONFIRMED: { label: 'Onaylı',     color: 'bg-info/10 text-info' },
  PREPARING: { label: 'Hazırlanıyor', color: 'bg-warning/10 text-warning' },
  READY:     { label: 'Hazır',      color: 'bg-accent/10 text-accent' },
  DELIVERED: { label: 'Teslim edildi', color: 'bg-success/10 text-success' },
  INVOICED:  { label: 'Faturalandı', color: 'bg-brand/10 text-brand' },
  CANCELLED: { label: 'İptal',      color: 'bg-destructive/10 text-destructive' },
};

const STATUS_FLOW: SalesOrder['status'][] = ['DRAFT', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'INVOICED'];

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState<SalesOrder | null>(null);

  const [form, setForm] = useState({
    customerId: '',
    orderNumber: '',
    note: '',
    items: [] as OrderItem[],
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/sales', {
        params: {
          page: 1,
          pageSize: 50,
          status: statusFilter || undefined,
        },
      });
      setOrders(data.data.items);
    } catch {
      toast.error('Siparişler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchRefs = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        api.get('/customers', { params: { isActive: 'true' } }),
        api.get('/products', { params: { page: 1, pageSize: 100 } }),
      ]);
      setCustomers(customersRes.data.data);
      setProducts(productsRes.data.data.items);
    } catch {
      // sessizce yoksay
    }
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const openCreate = () => {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setForm({
      customerId: customers[0]?.id ?? '',
      orderNumber: `SO-${yy}${mm}${dd}-001`,
      note: '',
      items: [],
    });
    setModalOpen(true);
  };

  const openDetail = async (order: SalesOrder) => {
    try {
      const { data } = await api.get(`/sales/${order.id}`);
      setDetailOrder(data.data);
      setDetailOpen(true);
    } catch {
      toast.error('Sipariş detayı yüklenemedi');
    }
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0, vatRate: 20, discount: 0, total: 0 }],
    }));
  };

  const updateItem = (idx: number, patch: Partial<OrderItem>) => {
    setForm((prev) => {
      const items = [...prev.items];
      const current = items[idx];
      if (!current) return prev;
      const merged: OrderItem = { ...current, ...patch };
      // Ürün değiştiyse fiyatını doldur
      if (patch.productId) {
        const product = products.find((p) => p.id === patch.productId);
        if (product) {
          merged.productName = product.name;
          merged.unitPrice = Number(product.salePrice ?? 0);
          merged.vatRate = Number(product.vatRate ?? 20);
        }
      }
      // Total'i yeniden hesapla
      const subtotal = merged.quantity * merged.unitPrice;
      const afterDiscount = subtotal - merged.discount;
      const vat = afterDiscount * (merged.vatRate / 100);
      merged.total = afterDiscount + vat;
      items[idx] = merged;
      return { ...prev, items };
    });
  };

  const removeItem = (idx: number) => {
    setForm((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const totals = form.items.reduce(
    (acc, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const afterDiscount = subtotal - item.discount;
      const vat = afterDiscount * (item.vatRate / 100);
      acc.subtotal += subtotal;
      acc.vatTotal += vat;
      acc.total += afterDiscount + vat;
      return acc;
    },
    { subtotal: 0, vatTotal: 0, total: 0 },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.orderNumber || form.items.length === 0) {
      toast.error('Müşteri, sipariş no ve en az 1 ürün zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        customerId: form.customerId,
        orderNumber: form.orderNumber,
        status: 'DRAFT',
        note: form.note || undefined,
        items: form.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          vatRate: it.vatRate,
          discount: it.discount,
        })),
      };
      await api.post('/sales', payload);
      toast.success('Sipariş oluşturuldu');
      setModalOpen(false);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const advanceStatus = async (order: SalesOrder, nextStatus: SalesOrder['status']) => {
    try {
      await api.put(`/sales/${order.id}`, { status: nextStatus });
      toast.success(`Sipariş "${STATUS_META[nextStatus].label}" durumuna geçti`);
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Güncellenemedi');
    }
  };

  const cancelOrder = async (order: SalesOrder) => {
    if (!confirm(`${order.orderNumber} iptal edilsin mi?`)) return;
    try {
      await api.delete(`/sales/${order.id}`);
      toast.success('Sipariş iptal edildi');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İptal edilemedi');
    }
  };

  const filtered = search
    ? orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customer?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Satış Siparişleri</h1>
          <p className="text-sm text-text-secondary">
            Müşteri siparişlerini oluştur ve takip et
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Sipariş
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-brand" />
            Siparişler ({orders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Sipariş no veya müşteri ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tüm Durumlar</option>
              {Object.entries(STATUS_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <ShoppingCart className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz sipariş yok</p>
              <p className="text-xs text-text-muted">Yeni sipariş oluşturarak başla</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">Sipariş No</th>
                    <th className="py-3 px-2">Müşteri</th>
                    <th className="py-3 px-2">Durum</th>
                    <th className="py-3 px-2">Tarih</th>
                    <th className="py-3 px-2 text-right">Tutar</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => {
                    const meta = STATUS_META[o.status];
                    const currentIdx = STATUS_FLOW.indexOf(o.status);
                    const nextStatus = STATUS_FLOW[currentIdx + 1];
                    return (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-3 px-2">
                          <p className="font-mono text-sm font-medium text-text-primary">{o.orderNumber}</p>
                          <p className="text-xs text-text-muted">{o._count?.items ?? 0} ürün</p>
                        </td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-medium text-text-primary">{o.customer?.name ?? '—'}</p>
                          <p className="font-mono text-xs text-text-muted">{o.customer?.code}</p>
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs', meta.color)}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-xs text-text-muted">
                          {new Date(o.orderDate).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <p className="text-sm font-semibold tabular-nums text-text-primary">
                            {formatCurrency(Number(o.total))}
                          </p>
                          <p className="text-xs text-text-muted">
                            +KDV {formatCurrency(Number(o.vatTotal))}
                          </p>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openDetail(o)}
                              className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-info"
                              title="Detay"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {nextStatus && (
                              <button
                                onClick={() => advanceStatus(o, nextStatus)}
                                className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-success"
                                title={`${STATUS_META[nextStatus].label} durumuna geç`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </button>
                            )}
                            {o.status !== 'CANCELLED' && o.status !== 'INVOICED' && (
                              <button
                                onClick={() => cancelOrder(o)}
                                className="rounded-md p-1.5 text-text-muted hover:bg-destructive/10 hover:text-destructive"
                                title="İptal"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Satış Siparişi</CardTitle>
              <button onClick={() => setModalOpen(false)} className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Müşteri *</Label>
                    <select
                      value={form.customerId}
                      onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                      required
                    >
                      <option value="">Seçin</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sipariş No *</Label>
                    <Input value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} required />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Ürünler *</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addItem}>
                      <Plus className="mr-1 h-3 w-3" />
                      Ürün Ekle
                    </Button>
                  </div>

                  {form.items.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border bg-background-surface/50 p-6 text-center">
                      <Package className="mx-auto h-6 w-6 text-text-muted" />
                      <p className="mt-2 text-sm text-text-secondary">Henüz ürün eklenmedi</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.items.map((it, idx) => (
                        <div key={idx} className="grid items-end gap-2 rounded-lg border border-border bg-background-surface/50 p-3 sm:grid-cols-12">
                          <div className="space-y-1 sm:col-span-5">
                            <Label className="text-xs">Ürün</Label>
                            <select
                              value={it.productId}
                              onChange={(e) => updateItem(idx, { productId: e.target.value })}
                              className="h-9 w-full rounded-md border border-border bg-card px-2 text-sm focus:border-brand focus:outline-none"
                            >
                              <option value="">Seçin</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">Adet</Label>
                            <Input type="number" min="0.01" step="0.01" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">Birim Fiyat</Label>
                            <Input type="number" min="0" step="0.01" value={it.unitPrice} onChange={(e) => updateItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="space-y-1 sm:col-span-2">
                            <Label className="text-xs">KDV %</Label>
                            <Input type="number" min="0" step="1" value={it.vatRate} onChange={(e) => updateItem(idx, { vatRate: parseFloat(e.target.value) || 0 })} />
                          </div>
                          <div className="flex items-end justify-end sm:col-span-1">
                            <button type="button" onClick={() => removeItem(idx)} className="rounded p-1.5 text-text-muted hover:bg-destructive/10 hover:text-destructive">
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals */}
                {form.items.length > 0 && (
                  <div className="rounded-lg border border-border bg-background-surface p-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-text-muted">Ara Toplam</p>
                        <p className="font-semibold tabular-nums">{formatCurrency(totals.subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">KDV</p>
                        <p className="font-semibold tabular-nums">{formatCurrency(totals.vatTotal)}</p>
                      </div>
                      <div>
                        <p className="text-text-muted">Toplam</p>
                        <p className="font-display text-lg font-bold text-brand tabular-nums">{formatCurrency(totals.total)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Not</Label>
                  <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Opsiyonel açıklama" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>İptal</Button>
                  <Button type="submit" disabled={submitting || form.items.length === 0}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" />
                    Taslak Olarak Oluştur
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detail Modal */}
      {detailOpen && detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{detailOrder.orderNumber}</CardTitle>
              <button onClick={() => setDetailOpen(false)} className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted">Müşteri</p>
                  <p className="font-medium">{detailOrder.customer?.name}</p>
                </div>
                <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm', STATUS_META[detailOrder.status].color)}>
                  {STATUS_META[detailOrder.status].label}
                </span>
              </div>
              <table className="w-full">
                <thead className="border-b border-border text-xs uppercase text-text-muted">
                  <tr>
                    <th className="py-2 text-left">Ürün</th>
                    <th className="py-2 text-right">Adet</th>
                    <th className="py-2 text-right">Fiyat</th>
                    <th className="py-2 text-right">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items?.map((item, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 text-sm">{item.productName ?? item.productId}</td>
                      <td className="py-2 text-right tabular-nums">{formatNumber(item.quantity)}</td>
                      <td className="py-2 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 text-right tabular-nums">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end gap-4 border-t border-border pt-3 text-sm">
                <div><span className="text-text-muted">Ara Toplam:</span> <span className="font-medium tabular-nums">{formatCurrency(Number(detailOrder.subtotal))}</span></div>
                <div><span className="text-text-muted">KDV:</span> <span className="font-medium tabular-nums">{formatCurrency(Number(detailOrder.vatTotal))}</span></div>
                <div><span className="text-text-muted">Toplam:</span> <span className="font-display text-lg font-bold text-brand tabular-nums">{formatCurrency(Number(detailOrder.total))}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}