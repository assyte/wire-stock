'use client';

import {
  Warehouse,
  Plus,
  Loader2,
  Trash2,
  X,
  Package,
  Check,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Shelf {
  id: string;
  code: string;
  name?: string | null;
}

interface WarehouseData {
  id: string;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  isDefault: boolean;
  isActive: boolean;
  shelves: Shelf[];
  productCount: number;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/warehouses');
      setWarehouses(data.data);
    } catch {
      toast.error('Depolar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/warehouses', { name, code, address, city, isDefault });
      toast.success('Depo oluşturuldu (6 varsayılan raf ile)');
      setName('');
      setCode('');
      setAddress('');
      setCity('');
      setIsDefault(false);
      setModalOpen(false);
      fetchWarehouses();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Depo oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (wh: WarehouseData) => {
    if (!confirm(`"${wh.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/warehouses/${wh.id}`);
      toast.success('Depo silindi');
      fetchWarehouses();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  const handleDeleteShelf = async (shelf: Shelf) => {
    if (!confirm(`"${shelf.code}" rafı silinsin mi?`)) return;
    try {
      await api.delete(`/warehouses/shelves/${shelf.id}`);
      toast.success('Raf silindi');
      fetchWarehouses();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Raf silinemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Depolar</h1>
          <p className="text-sm text-text-secondary">
            Depolarını ve raflarını yönet. Her yeni depoda otomatik 6 varsayılan raf oluşur.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Depo
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      ) : warehouses.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Warehouse className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz depo yok</p>
              <p className="text-xs text-text-muted">Yeni depo ekleyerek başla</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {warehouses.map((wh) => (
            <Card key={wh.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="h-4 w-4 text-brand" />
                    {wh.name}
                    {wh.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                        <Star className="h-3 w-3" />
                        Varsayılan
                      </span>
                    )}
                  </CardTitle>
                  <p className="mt-1 font-mono text-xs text-text-muted">{wh.code}</p>
                  {wh.city && (
                    <p className="mt-1 text-xs text-text-secondary">{wh.city}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(wh)}
                  className="rounded-md p-2 text-text-muted hover:bg-destructive/10 hover:text-destructive"
                  title="Sil"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2 text-xs text-text-secondary">
                  <Package className="h-3 w-3" />
                  <span>{wh.productCount} stok hareketi</span>
                  <span className="text-text-muted">•</span>
                  <span>{wh.shelves.length} raf</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {wh.shelves.map((shelf) => (
                    <div
                      key={shelf.id}
                      className="group flex items-center gap-1.5 rounded-md border border-border bg-background-surface px-2.5 py-1.5 text-xs"
                    >
                      <span className="font-mono font-medium text-text-primary">
                        {shelf.code}
                      </span>
                      {shelf.name && (
                        <span className="text-text-muted">— {shelf.name}</span>
                      )}
                      <button
                        onClick={() => handleDeleteShelf(shelf)}
                        className="ml-1 rounded p-0.5 text-text-muted opacity-0 hover:text-destructive group-hover:opacity-100"
                        title="Raf sil"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Depo</CardTitle>
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
                  <Label htmlFor="name">Depo adı *</Label>
                  <Input
                    id="name"
                    placeholder="Örn: Ana Depo, Şube Deposu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Kod *</Label>
                  <Input
                    id="code"
                    placeholder="Örn: ANA, SUBE1"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={20}
                    required
                  />
                  <p className="text-xs text-text-muted">
                    Benzersiz kısa kod (örn: ANA, SUBE1, DEPO-2)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input
                    id="city"
                    placeholder="İstanbul"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input
                    id="address"
                    placeholder="Atatürk Cad. No:123"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-secondary">
                    Varsayılan depo olarak işaretle
                  </span>
                </label>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting || !name.trim() || !code.trim()}>
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