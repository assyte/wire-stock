'use client';

import { Plus, Trash2, FolderTree, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  _count?: { products: number };
}

const ICON_OPTIONS = [
  'plug', 'lightbulb', 'cable', 'package', 'shield', 'shield-check',
  'zap', 'wrench', 'tool', 'box', 'bolt', 'cpu',
];
const COLOR_OPTIONS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#FFB800', '#00D9A3', '#06B6D4',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('plug');
  const [color, setColor] = useState('#3B82F6');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (err) {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await api.post('/categories', { name, description, icon, color });
      toast.success('Kategori oluşturuldu');
      setName('');
      setDescription('');
      setIcon('plug');
      setColor('#3B82F6');
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Kategori oluşturulamadı');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori silindi');
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Kategori silinemedi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Kategoriler</h1>
          <p className="text-sm text-text-secondary">
            Ürünlerini gruplandır, raporlamayı kolaylaştır.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-brand" />
            Tüm Kategoriler ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <FolderTree className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz kategori yok</p>
              <p className="text-xs text-text-muted">Yeni kategori ekleyerek başla</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="group flex items-center justify-between rounded-lg border border-border bg-background-surface p-4 transition-all hover:border-brand/30 hover:shadow-glow-brand"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${cat.color ?? '#3B82F6'}20`,
                        color: cat.color ?? '#3B82F6',
                      }}
                    >
                      <FolderTree className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                      <p className="text-xs text-text-muted">
                        {cat._count?.products ?? 0} ürün
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="rounded-md p-2 text-text-muted opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Yeni Kategori</CardTitle>
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
                  <Label htmlFor="name">Kategori adı</Label>
                  <Input
                    id="name"
                    placeholder="Örn: Anahtar & Priz"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama (opsiyonel)</Label>
                  <Input
                    id="description"
                    placeholder="Kısa açıklama"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>İkon</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICON_OPTIONS.map((ic) => (
                      <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`flex h-9 items-center justify-center rounded-md border text-xs transition-all ${
                          icon === ic
                            ? 'border-brand bg-brand/10 text-brand'
                            : 'border-border bg-background-surface text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {ic.slice(0, 2)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Renk</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-7 w-7 rounded-full transition-all ${
                          color === c ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting || !name.trim()}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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