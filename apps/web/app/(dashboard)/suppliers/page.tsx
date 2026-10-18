'use client';

import {
  Truck,
  Plus,
  Search,
  Loader2,
  X,
  Edit2,
  Trash2,
  Check,
  Phone,
  Mail,
  CreditCard,
  FileText,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Supplier {
  id: string;
  code: string;
  name: string;
  taxNumber?: string | null;
  taxOffice?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  iban?: string | null;
  paymentTerms?: string | null;
  isActive: boolean;
  _count?: { products: number; purchaseOrders: number };
}

const initialForm = {
  code: '',
  name: '',
  taxNumber: '',
  taxOffice: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  iban: '',
  paymentTerms: '30 gün vade',
  isActive: true,
};

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/suppliers', { params: { search: search || undefined } });
      const items = data.data?.items ?? data.data;
      setSuppliers(Array.isArray(items) ? items : []);
    } catch {
      toast.error('Tedarikçiler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchSuppliers, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...initialForm, code: '', name: '' });
    setModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({
      code: s.code,
      name: s.name,
      taxNumber: s.taxNumber ?? '',
      taxOffice: s.taxOffice ?? '',
      contactPerson: s.contactPerson ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      city: s.city ?? '',
      iban: s.iban ?? '',
      paymentTerms: s.paymentTerms ?? '',
      isActive: s.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      toast.error('Kod ve isim zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        code: form.code,
        name: form.name,
        taxNumber: form.taxNumber || undefined,
        taxOffice: form.taxOffice || undefined,
        contactPerson: form.contactPerson || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        iban: form.iban || undefined,
        paymentTerms: form.paymentTerms || undefined,
        isActive: form.isActive,
      };

      if (editing) {
        await api.put(`/suppliers/${editing.id}`, payload);
        toast.success('Tedarikçi güncellendi');
      } else {
        await api.post('/suppliers', payload);
        toast.success('Tedarikçi oluşturuldu');
      }
      setModalOpen(false);
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (s: Supplier) => {
    if (!confirm(`"${s.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/suppliers/${s.id}`);
      toast.success('Tedarikçi silindi');
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Tedarikçiler</h1>
          <p className="text-sm text-text-secondary">
            Toplam <strong className="text-text-primary">{suppliers.length}</strong> tedarikçi
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Tedarikçi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-brand" />
            Tedarikçi Listesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Tedarikçi ara (ad, kod, telefon, vergi no)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Truck className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz tedarikçi yok</p>
              <p className="text-xs text-text-muted">Yeni tedarikçi ekleyerek başla</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">Kod</th>
                    <th className="py-3 px-2">Tedarikçi</th>
                    <th className="py-3 px-2">İletişim</th>
                    <th className="py-3 px-2">Ödeme</th>
                    <th className="py-3 px-2 text-right">İşlem</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-2 font-mono text-xs text-text-secondary">{s.code}</td>
                      <td className="py-3 px-2">
                        <p className="text-sm font-medium text-text-primary">{s.name}</p>
                        {s.taxNumber && (
                          <p className="text-xs text-text-muted">VKN: {s.taxNumber}</p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {s.contactPerson && (
                          <p className="text-xs text-text-primary">{s.contactPerson}</p>
                        )}
                        {s.phone && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                            <Phone className="h-3 w-3" />
                            {s.phone}
                          </p>
                        )}
                        {s.email && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                            <Mail className="h-3 w-3" />
                            {s.email}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {s.paymentTerms && (
                          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <FileText className="h-3 w-3" />
                            {s.paymentTerms}
                          </p>
                        )}
                        {s.iban && (
                          <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-text-muted">
                            <CreditCard className="h-3 w-3" />
                            {s.iban.replace(/(.{4})/g, '$1 ').trim()}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <p className="text-sm text-text-primary">{s._count?.products ?? 0} ürün</p>
                        <p className="text-xs text-text-muted">{s._count?.purchaseOrders ?? 0} sipariş</p>
                        {!s.isActive && (
                          <span className="mt-1 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                            Pasif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(s)}
                            className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-brand"
                            title="Düzenle"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s)}
                            className="rounded-md p-1.5 text-text-muted hover:bg-destructive/10 hover:text-destructive"
                            title="Sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-3xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editing ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi'}</CardTitle>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Kod *</Label>
                  <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
                </div>
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor="name">Tedarikçi adı *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi No</Label>
                  <Input id="taxNumber" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxOffice">Vergi Dairesi</Label>
                  <Input id="taxOffice" value={form.taxOffice} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Yetkili</Label>
                  <Input id="contactPerson" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">Adres</Label>
                  <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Şehir</Label>
                  <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Ödeme Vadesi</Label>
                  <Input id="paymentTerms" value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="Örn: 30 gün vade" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input id="iban" value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} placeholder="TR00 0000 0000 0000 0000 0000 00" />
                </div>
                <label className="sm:col-span-2 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-secondary">Aktif tedarikçi</span>
                </label>

                <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>İptal</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" />
                    {editing ? 'Güncelle' : 'Oluştur'}
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