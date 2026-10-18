'use client';

import { cn, formatCurrency, formatNumber } from '@wire-stock/utils';
import {
  Users,
  Plus,
  Search,
  Loader2,
  X,
  Edit2,
  Trash2,
  Check,
  Phone,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Customer {
  id: string;
  code: string;
  name: string;
  type: 'INDIVIDUAL' | 'CORPORATE' | 'CONTRACTOR' | 'DEALER';
  taxNumber?: string | null;
  taxOffice?: string | null;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  creditLimit?: number | string | null;
  balance: number | string;
  isActive: boolean;
  _count?: { salesOrders: number; projects: number };
}

const TYPE_META: Record<Customer['type'], { label: string; color: string }> = {
  INDIVIDUAL: { label: 'Bireysel', color: 'bg-info/10 text-info' },
  CORPORATE:  { label: 'Kurumsal', color: 'bg-brand/10 text-brand' },
  CONTRACTOR: { label: 'Taahhüt', color: 'bg-warning/10 text-warning' },
  DEALER:     { label: 'Bayi',    color: 'bg-accent/10 text-accent' },
};

const initialForm = {
  code: '',
  name: '',
  type: 'CORPORATE' as Customer['type'],
  taxNumber: '',
  taxOffice: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  creditLimit: 0,
  isActive: true,
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers', { params: { search: search || undefined } });
      setCustomers(data.data);
    } catch {
      toast.error('Müşteriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...initialForm, code: '', name: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      type: c.type,
      taxNumber: c.taxNumber ?? '',
      taxOffice: c.taxOffice ?? '',
      contactPerson: c.contactPerson ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      creditLimit: Number(c.creditLimit ?? 0),
      isActive: c.isActive,
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
        type: form.type,
        taxNumber: form.taxNumber || undefined,
        taxOffice: form.taxOffice || undefined,
        contactPerson: form.contactPerson || undefined,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        creditLimit: form.creditLimit || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await api.put(`/customers/${editing.id}`, payload);
        toast.success('Müşteri güncellendi');
      } else {
        await api.post('/customers', payload);
        toast.success('Müşteri oluşturuldu');
      }
      setModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Customer) => {
    if (!confirm(`"${c.name}" silinsin mi?`)) return;
    try {
      await api.delete(`/customers/${c.id}`);
      toast.success('Müşteri silindi');
      fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Müşteriler</h1>
          <p className="text-sm text-text-secondary">
            Toplam <strong className="text-text-primary">{customers.length}</strong> müşteri
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4 text-brand" />
            Müşteri Listesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Müşteri ara (ad, kod, telefon, vergi no)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Users className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz müşteri yok</p>
              <p className="text-xs text-text-muted">Yeni müşteri ekleyerek başla</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">Kod</th>
                    <th className="py-3 px-2">Müşteri</th>
                    <th className="py-3 px-2">Tip</th>
                    <th className="py-3 px-2">İletişim</th>
                    <th className="py-3 px-2 text-right">Bakiye</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => {
                    const balance = Number(c.balance ?? 0);
                    const creditLimit = Number(c.creditLimit ?? 0);
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-card/50">
                        <td className="py-3 px-2 font-mono text-xs text-text-secondary">{c.code}</td>
                        <td className="py-3 px-2">
                          <p className="text-sm font-medium text-text-primary">{c.name}</p>
                          {c.taxNumber && (
                            <p className="text-xs text-text-muted">VKN: {c.taxNumber}</p>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', TYPE_META[c.type].color)}>
                            {TYPE_META[c.type].label}
                          </span>
                          {!c.isActive && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                              Pasif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {c.phone && (
                            <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <Phone className="h-3 w-3" />
                              {c.phone}
                            </p>
                          )}
                          {c.email && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-text-secondary">
                              <Mail className="h-3 w-3" />
                              {c.email}
                            </p>
                          )}
                          {c.city && !c.phone && !c.email && (
                            <p className="text-xs text-text-muted">{c.city}</p>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <p className={cn(
                            'text-sm font-semibold tabular-nums',
                            balance > 0 ? 'text-destructive' : 'text-text-primary',
                          )}>
                            {formatCurrency(balance)}
                          </p>
                          {creditLimit > 0 && (
                            <p className="text-xs text-text-muted">
                              Limit: {formatNumber(creditLimit)}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-text-muted">
                            {c._count?.salesOrders ?? 0} sipariş
                          </p>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(c)}
                              className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-brand"
                              title="Düzenle"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(c)}
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
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editing ? 'Müşteri Düzenle' : 'Yeni Müşteri'}</CardTitle>
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
                <div className="space-y-2">
                  <Label>Müşteri tipi</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as Customer['type'] })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="CORPORATE">Kurumsal</option>
                    <option value="INDIVIDUAL">Bireysel</option>
                    <option value="CONTRACTOR">Taahhüt</option>
                    <option value="DEALER">Bayi</option>
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Ad / Ünvan *</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Vergi No / TC</Label>
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
                  <Label htmlFor="creditLimit">Kredi Limiti</Label>
                  <Input id="creditLimit" type="number" min="0" step="100" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: parseFloat(e.target.value) || 0 })} />
                </div>
                <label className="sm:col-span-2 flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-secondary">Aktif müşteri</span>
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