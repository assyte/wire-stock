'use client';

import { cn, formatCurrency, formatNumber } from '@wire-stock/utils';
import {
  Package,
  Plus,
  Search,
  Loader2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Product {
  id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  purchasePrice: number | string;
  salePrice: number | string;
  vatRate: number | string;
  minStock: number | string;
  criticalStock: number | string;
  totalStock?: number;
  category?: { id: string; name: string; color?: string };
  unit?: { id: string; name: string; shortName: string };
  brand?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  name: string;
  shortName: string;
}

interface Brand {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    sku: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: '',
    unitId: '',
    brandId: '',
    purchasePrice: 0,
    salePrice: 0,
    vatRate: 20,
    minStock: 0,
    criticalStock: 0,
  });

  const fetchRefs = async () => {
    try {
      const [catsRes, unitsRes, brandsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/units'),
        api.get('/suppliers'), // marka listesi yoksa suppliers'tan çekeceğiz
      ]);
      setCategories(catsRes.data.data ?? catsRes.data.data?.items ?? []);
      setUnits(unitsRes.data.data ?? unitsRes.data.data?.items ?? []);
      // Marka listesi customers/suppliers endpointinden farklı. Suppliers'ı buraya alıyoruz ki brand yerine.
      // v1.0.6'da brands endpoint'i eklenince değişecek
      setBrands(brandsRes.data.data?.items ?? brandsRes.data.data ?? []);
    } catch {
      // sessizce yoksay
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products', {
        params: {
          page,
          pageSize,
          search: search || undefined,
          categoryId: categoryFilter || undefined,
          lowStock: lowStockOnly ? 'true' : undefined,
        },
      });
      setProducts(data.data.items);
      setTotal(data.data.meta.total);
      setTotalPages(data.data.meta.totalPages);
    } catch (err) {
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, lowStockOnly]);

  // debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 400);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      sku: '',
      barcode: '',
      name: '',
      description: '',
      categoryId: categories[0]?.id ?? '',
      unitId: units[0]?.id ?? '',
      brandId: '',
      purchasePrice: 0,
      salePrice: 0,
      vatRate: 20,
      minStock: 0,
      criticalStock: 0,
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku,
      barcode: p.barcode ?? '',
      name: p.name,
      description: p.description ?? '',
      categoryId: p.category?.id ?? '',
      unitId: p.unit?.id ?? '',
      brandId: p.brand?.id ?? '',
      purchasePrice: Number(p.purchasePrice),
      salePrice: Number(p.salePrice),
      vatRate: Number(p.vatRate ?? 20),
      minStock: Number(p.minStock),
      criticalStock: Number(p.criticalStock ?? 0),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sku || !form.name || !form.categoryId || !form.unitId) {
      toast.error('SKU, isim, kategori ve birim zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        sku: form.sku,
        barcode: form.barcode || undefined,
        name: form.name,
        description: form.description || undefined,
        categoryId: form.categoryId,
        unitId: form.unitId,
        brandId: form.brandId || undefined,
        purchasePrice: form.purchasePrice,
        salePrice: form.salePrice,
        vatRate: form.vatRate,
        minStock: form.minStock,
        criticalStock: form.criticalStock,
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        toast.success('Ürün güncellendi');
      } else {
        await api.post('/products', payload);
        toast.success('Ürün oluşturuldu');
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`"${p.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success('Ürün silindi');
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  const stockBadge = (p: Product) => {
    const total = Number(p.totalStock ?? 0);
    const min = Number(p.minStock ?? 0);
    const crit = Number(p.criticalStock ?? 0);
    if (total <= crit) {
      return { label: 'Kritik', color: 'bg-destructive/10 text-destructive' };
    }
    if (total <= min) {
      return { label: 'Düşük', color: 'bg-warning/10 text-warning' };
    }
    return { label: 'Yeterli', color: 'bg-success/10 text-success' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Ürünler</h1>
          <p className="text-sm text-text-secondary">
            Toplam <strong className="text-text-primary">{total}</strong> ürün
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Ürün
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-4 w-4 text-brand" />
            Ürün Listesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="SKU, isim veya barkod ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus:border-brand focus:outline-none"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <label className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }}
                className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
              />
              <AlertTriangle className="h-4 w-4 text-warning" />
              Düşük Stok
            </label>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Package className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Ürün bulunamadı</p>
              <p className="text-xs text-text-muted">Filtreleri değiştir veya yeni ürün ekle</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">SKU</th>
                    <th className="py-3 px-2">Ürün</th>
                    <th className="py-3 px-2">Kategori</th>
                    <th className="py-3 px-2 text-right">Alış</th>
                    <th className="py-3 px-2 text-right">Satış</th>
                    <th className="py-3 px-2 text-center">Stok</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const badge = stockBadge(p);
                    return (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-3 px-2 font-mono text-xs text-text-secondary">{p.sku}</td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-medium text-text-primary">{p.name}</p>
                          {p.barcode && <p className="text-xs text-text-muted">{p.barcode}</p>}
                        </td>
                        <td className="py-3 px-2">
                          {p.category && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs"
                              style={{
                                backgroundColor: `${p.category.color ?? '#3B82F6'}20`,
                                color: p.category.color ?? '#3B82F6',
                              }}
                            >
                              {p.category.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right text-sm tabular-nums text-text-secondary">
                          {formatCurrency(Number(p.purchasePrice))}
                        </td>
                        <td className="py-3 px-2 text-right text-sm font-medium tabular-nums text-text-primary">
                          {formatCurrency(Number(p.salePrice))}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', badge.color)}>
                            {formatNumber(Number(p.totalStock ?? 0))} {p.unit?.shortName ?? ''}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-brand"
                              title="Düzenle"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p)}
                              className="rounded-md p-1.5 text-text-muted hover:bg-destructive/10 hover:text-destructive"
                              title="Sil"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-xs text-text-muted">
                Sayfa {page} / {totalPages} • {total} ürün
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

      {/* Edit Modal */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Ürün Düzenle: {editingProduct.name}</CardTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input id="sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="barcode">Barkod</Label>
                  <Input id="barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Ürün adı *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">Açıklama</Label>
                  <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="categoryId">Kategori *</Label>
                  <select
                    id="categoryId"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                    required
                  >
                    <option value="">Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="unitId">Birim *</Label>
                  <select
                    id="unitId"
                    value={form.unitId}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                    required
                  >
                    <option value="">Seçin</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>{u.name} ({u.shortName})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="brandId">Tedarikçi (opsiyonel)</Label>
                  <select
                    id="brandId"
                    value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="">Seçin</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchasePrice">Alış fiyatı</Label>
                  <Input id="purchasePrice" type="number" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Satış fiyatı</Label>
                  <Input id="salePrice" type="number" step="0.01" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatRate">KDV (%)</Label>
                  <Input id="vatRate" type="number" step="0.01" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min. Stok</Label>
                  <Input id="minStock" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })} />
                </div>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>İptal</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Kaydet
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