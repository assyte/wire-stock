'use client';

import { useEffect, useState } from 'react';
import { Users, Plus, Search, Loader2, X, Edit3, Trash2, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  _count?: { stockMovements: number };
}

const initialForm = {
  firstName: '',
  lastName: '',
  title: 'Usta Elektrikçi',
  phone: '',
  email: '',
  isActive: true,
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Worker | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workers', {
        params: { search: search || undefined },
      });
      setWorkers(data.data ?? []);
    } catch {
      toast.error('Çalışanlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchWorkers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setModalOpen(true);
  };

  const openEdit = (w: Worker) => {
    setEditing(w);
    setForm({
      firstName: w.firstName,
      lastName: w.lastName,
      title: w.title,
      phone: w.phone ?? '',
      email: w.email ?? '',
      isActive: w.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Ad ve soyad zorunludur');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        title: form.title,
        phone: form.phone || undefined,
        email: form.email || undefined,
        isActive: form.isActive,
      };
      if (editing) {
        await api.put(`/workers/${editing.id}`, payload);
        toast.success('Çalışan güncellendi');
      } else {
        await api.post('/workers', payload);
        toast.success('Çalışan eklendi');
      }
      setModalOpen(false);
      fetchWorkers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (w: Worker) => {
    if (!confirm(`"${w.firstName} ${w.lastName}" silinsin mi?`)) return;
    try {
      await api.delete(`/workers/${w.id}`);
      toast.success('Çalışan silindi');
      fetchWorkers();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  const toggleActive = async (w: Worker) => {
    try {
      await api.patch(`/workers/${w.id}/toggle`);
      toast.success(w.isActive ? 'Pasif yapıldı' : 'Aktif yapıldı');
      fetchWorkers();
    } catch {
      toast.error('Durum değiştirilemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-text-primary">
            <Users className="h-7 w-7 text-brand" />
            Çalışanlar
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Ustalar ve çıraklar — malzeme kim aldı, kime verildi.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Çalışan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Çalışan ara (ad, telefon)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : workers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Users className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz çalışan yok</p>
              <p className="text-xs text-text-muted">Yeni çalışan ekleyerek başla</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                    <th className="py-3 px-2">Ad Soyad</th>
                    <th className="py-3 px-2">Unvan</th>
                    <th className="py-3 px-2">İletişim</th>
                    <th className="py-3 px-2">Hareket</th>
                    <th className="py-3 px-2">Durum</th>
                    <th className="py-3 px-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.id} className="border-b border-border/50 hover:bg-card/50">
                      <td className="py-3 px-2">
                        <p className="text-sm font-medium text-text-primary">
                          {w.firstName} {w.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
                          {w.title}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        {w.phone && (
                          <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Phone className="h-3 w-3" />
                            {w.phone}
                          </p>
                        )}
                        {w.email && (
                          <p className="mt-0.5 text-xs text-text-muted">{w.email}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-xs text-text-muted">
                        {w._count?.stockMovements ?? 0} hareket
                      </td>
                      <td className="py-3 px-2">
                        <button
                          type="button"
                          onClick={() => toggleActive(w)}
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                            w.isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted text-text-muted hover:bg-muted/80',
                          )}
                        >
                          {w.isActive ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(w)}
                            className="rounded-md p-1.5 text-text-muted hover:bg-card hover:text-brand"
                            title="Düzenle"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(w)}
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editing ? 'Çalışanı Düzenle' : 'Yeni Çalışan'}
              </CardTitle>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-text-muted hover:bg-card hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Ad *</Label>
                    <Input
                      id="firstName"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Soyad *</Label>
                    <Input
                      id="lastName"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Unvan</Label>
                  <select
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="Usta Elektrikçi">Usta Elektrikçi</option>
                    <option value="Çırak">Çırak</option>
                    <option value="İşveren">İşveren</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    placeholder="+90 5XX XXX XX XX"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                  />
                  <span className="text-sm text-text-secondary">Aktif çalışan</span>
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Check className="mr-2 h-4 w-4" />
                    {editing ? 'Güncelle' : 'Ekle'}
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

function cn(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(' ');
}