'use client';

import {
  Plus,
  Trash2,
  FolderTree,
  Loader2,
  X,
  Search,
  ChevronRight,
  ChevronDown,
  Edit3,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parentId?: string | null;
  _count?: { products: number };
}

// Lucide ikon listesi (gerçek ikonlar)
const ICON_OPTIONS = [
  { value: 'plug', label: 'Priz/Fiş', icon: '🔌' },
  { value: 'lightbulb', label: 'Aydınlatma', icon: '💡' },
  { value: 'cable', label: 'Kablo', icon: '🔌' },
  { value: 'package', label: 'Paket', icon: '📦' },
  { value: 'shield', label: 'Koruma', icon: '🛡️' },
  { value: 'shield-check', label: 'Güvenlik', icon: '✅' },
  { value: 'zap', label: 'Enerji', icon: '⚡' },
  { value: 'wrench', label: 'Alet', icon: '🔧' },
  { value: 'tool', label: 'Takım', icon: '🛠️' },
  { value: 'box', label: 'Kutu', icon: '📦' },
  { value: 'bolt', label: 'Cıvata', icon: '⚡' },
  { value: 'cpu', label: 'Otomasyon', icon: '🤖' },
  { value: 'flame', label: 'Yangın', icon: '🔥' },
  { value: 'car', label: 'Araç', icon: '🚗' },
  { value: 'sun', label: 'Solar', icon: '☀️' },
  { value: 'battery', label: 'Akü/UPS', icon: '🔋' },
  { value: 'antenna', label: 'Anten', icon: '📡' },
  { value: 'phone', label: 'Telefon', icon: '☎️' },
];

const COLOR_OPTIONS = [
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#10B981', label: 'Yeşil' },
  { value: '#F59E0B', label: 'Turuncu' },
  { value: '#EF4444', label: 'Kırmızı' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#EC4899', label: 'Pembe' },
  { value: '#14B8A6', label: 'Teal' },
  { value: '#FFB800', label: 'Sarı' },
  { value: '#00D9A3', label: 'Mint' },
  { value: '#06B6D4', label: 'Cyan' },
  { value: '#737373', label: 'Gri' },
  { value: '#7C3AED', label: 'İndigo' },
];

// Türkçe-uyumlu sıralama
const trCollator = new Intl.Collator('tr', { sensitivity: 'base', numeric: true });
const sortTr = (a: string, b: string) => trCollator.compare(a, b);

interface CategoryNode extends Category {
  children: CategoryNode[];
}

function buildTree(categories: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  categories.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortTree = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => sortTr(a.name, b.name));
    nodes.forEach((n) => sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}

// Toplam ürün sayısını recursive hesapla
function countProducts(node: CategoryNode): number {
  const own = node._count?.products ?? 0;
  return own + node.children.reduce((acc, c) => acc + countProducts(c), 0);
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: 'plug',
    color: '#3B82F6',
    parentId: '',
  });

  const tree = useMemo(() => buildTree(categories), [categories]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.data ?? []);
      // Tümünü başta aç
      const allIds = (data.data ?? []).map((c: Category) => c.id);
      setExpanded(new Set(allIds));
    } catch {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Arama filtresi (recursive)
  const treeSearched = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const filter = (node: CategoryNode): CategoryNode | null => {
      const children = node.children.map(filter).filter(Boolean) as CategoryNode[];
      const match = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
      if (match || children.length > 0) {
        return { ...node, children };
      }
      return null;
    };
    return tree.map(filter).filter(Boolean) as CategoryNode[];
  }, [tree, search]);

  // Toplam istatistikler
  const stats = useMemo(() => {
    const roots = categories.filter((c) => !c.parentId).length;
    const subs = categories.filter((c) => c.parentId).length;
    const products = categories.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);
    const orphans = categories.filter((c) => c.parentId && !categories.some((p) => p.id === c.parentId)).length;
    return { roots, subs, products, orphans };
  }, [categories]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === categories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(categories.map((c) => c.id)));
    }
  };

  const openCreate = (parentId: string | null = null) => {
    setEditingCategory(null);
    setForm({
      name: '',
      description: '',
      icon: 'plug',
      color: '#3B82F6',
      parentId: parentId ?? '',
    });
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? '',
      icon: cat.icon ?? 'plug',
      color: cat.color ?? '#3B82F6',
      parentId: cat.parentId ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Kategori adı zorunludur');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        description: form.description || undefined,
        icon: form.icon,
        color: form.color,
        parentId: form.parentId || undefined,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Kategori güncellendi');
      } else {
        await api.post('/categories', payload);
        toast.success('Kategori oluşturuldu');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'İşlem başarısız');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string, hasProducts: boolean) => {
    if (hasProducts) {
      toast.error('Bu kategoride ürün var. Önce ürünleri taşıyın.');
      return;
    }
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Kategori silindi');
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message || 'Silinemedi');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size} kategoriyi silmek istediğinize emin misiniz?`)) return;
    try {
      let success = 0;
      let failed = 0;
      for (const id of selectedIds) {
        try {
          await api.delete(`/categories/${id}`);
          success++;
        } catch {
          failed++;
        }
      }
      toast.success(`${success} silindi${failed ? `, ${failed} atlandı (ürün var)` : ''}`);
      setSelectedIds(new Set());
      fetchCategories();
    } catch {
      toast.error('Toplu silme başarısız');
    }
  };

  // Recursive tree render
  const renderNode = (node: CategoryNode, level: number = 0) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const productCount = countProducts(node);

    return (
      <div key={node.id} className={cn('group', level > 0 && 'ml-6')}>
        <div
          className={cn(
            'flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-card/50',
            isSelected && 'border-brand/40 bg-brand/5',
          )}
        >
          {/* Expand toggle */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleExpand(node.id)}
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-muted hover:bg-card hover:text-text-primary"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-6 flex-shrink-0" />
          )}

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => toggleSelect(node.id)}
            className="flex-shrink-0 text-text-muted hover:text-brand"
            title="Seç"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-brand" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          {/* Color dot */}
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${node.color ?? '#3B82F6'}20`,
              color: node.color ?? '#3B82F6',
            }}
          >
            <FolderTree className="h-4 w-4" />
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-text-primary">
                {node.name}
              </p>
              {level === 0 && hasChildren && (
                <span className="rounded bg-card px-1.5 py-0.5 text-xs text-text-muted">
                  {node.children.length} alt kategori
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {productCount} ürün
              {hasChildren && level === 0 ? ` (${countProducts(node) - (node._count?.products ?? 0)} alt)` : ''}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => openCreate(node.id)}
              className="rounded p-1.5 text-text-muted hover:bg-card hover:text-brand"
              title="Alt kategori ekle"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openEdit(node)}
              className="rounded p-1.5 text-text-muted hover:bg-card hover:text-info"
              title="Düzenle"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(node.id, node.name, (node._count?.products ?? 0) > 0)}
              className="rounded p-1.5 text-text-muted hover:bg-destructive/10 hover:text-destructive"
              title="Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 border-l-2 border-border/50 pl-2">
            {node.children.map((c) => renderNode(c, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold text-text-primary">Kategoriler</h1>
          <p className="text-sm text-text-secondary">
            Ürünlerini hiyerarşik olarak gruplandır.
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kategori
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs text-text-muted">Ana Kategori</p>
          <p className="mt-1 font-display text-2xl font-bold text-text-primary">{stats.roots}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted">Alt Kategori</p>
          <p className="mt-1 font-display text-2xl font-bold text-text-primary">{stats.subs}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted">Toplam Ürün</p>
          <p className="mt-1 font-display text-2xl font-bold text-text-primary">{stats.products}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted">Yetim Kategori</p>
          <p className={cn(
            'mt-1 font-display text-2xl font-bold',
            stats.orphans > 0 ? 'text-warning' : 'text-text-primary',
          )}>{stats.orphans}</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-brand" />
              Kategori Hiyerarşisi ({categories.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-xs text-text-muted">{selectedIds.size} seçili</span>
                  <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Toplu Sil
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                    İptal
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search + Actions bar */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Kategori ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-brand focus:outline-none"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedIds.size === categories.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allIds = new Set(categories.map((c) => c.id));
                setExpanded(allIds);
              }}
            >
              Tümünü Aç
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(new Set())}
            >
              Tümünü Kapat
            </Button>
          </div>
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
          ) : treeSearched.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-8 w-8 text-text-muted" />
              <p className="mt-3 text-sm text-text-secondary">Sonuç bulunamadı</p>
              <p className="text-xs text-text-muted">"{search}" için eşleşen kategori yok</p>
            </div>
          ) : (
            <div className="space-y-1">
              {treeSearched.map((node) => renderNode(node))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur">
          <Card className="w-full max-w-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
                {form.parentId && (
                  <span className="ml-2 text-sm font-normal text-text-muted">
                    (alt kategori olarak)
                  </span>
                )}
              </CardTitle>
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
                  <Label htmlFor="name">Kategori adı *</Label>
                  <Input
                    id="name"
                    placeholder="Örn: NYM Antistatik Kablolar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Açıklama (opsiyonel)</Label>
                  <Input
                    id="description"
                    placeholder="Kısa açıklama"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentId">Üst Kategori (opsiyonel)</Label>
                  <select
                    id="parentId"
                    value={form.parentId}
                    onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm focus:border-brand focus:outline-none"
                  >
                    <option value="">— Ana Kategori —</option>
                    {categories
                      .filter((c) => c.id !== editingCategory?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>İkon</Label>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-9">
                    {ICON_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, icon: opt.value })}
                        title={opt.label}
                        className={cn(
                          'flex h-10 flex-col items-center justify-center rounded-md border text-lg transition-all',
                          form.icon === opt.value
                            ? 'border-brand bg-brand/10'
                            : 'border-border bg-background-surface hover:border-brand/50',
                        )}
                      >
                        <span>{opt.icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Renk</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setForm({ ...form, color: c.value })}
                        title={c.label}
                        className={cn(
                          'h-8 w-8 rounded-full transition-all',
                          form.color === c.value ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : '',
                        )}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit" disabled={submitting || !form.name.trim()}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCategory ? 'Güncelle' : 'Oluştur'}
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