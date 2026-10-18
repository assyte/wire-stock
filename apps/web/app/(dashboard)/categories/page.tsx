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
  Cable,
  Plug,
  Lightbulb,
  Shield,
  ShieldCheck,
  Zap,
  Wrench,
  Package,
  Cpu,
  Sun,
  Battery,
  Flame,
  Antenna,
  Phone,
  Car,
  Box,
  Bolt,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

// =================================================================
// Lucide Icon Mapping (gerçek vektör ikonlar)
// =================================================================
const ICON_MAP: Record<string, LucideIcon> = {
  plug: Plug,
  lightbulb: Lightbulb,
  cable: Cable,
  package: Package,
  shield: Shield,
  'shield-check': ShieldCheck,
  zap: Zap,
  wrench: Wrench,
  tool: Wrench,
  box: Box,
  bolt: Bolt,
  cpu: Cpu,
  flame: Flame,
  car: Car,
  sun: Sun,
  battery: Battery,
  antenna: Antenna,
  phone: Phone,
};

// Emoji fallback'ler (lucide bulamazsa)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _EMOJI_MAP: Record<string, string> = {
  plug: '🔌', lightbulb: '💡', cable: '🔌', package: '📦',
  shield: '🛡️', 'shield-check': '✅', zap: '⚡', wrench: '🔧',
  tool: '🛠️', box: '📦', bolt: '⚡', cpu: '🤖',
  flame: '🔥', car: '🚗', sun: '☀️', battery: '🔋',
  antenna: '📡', phone: '☎️',
};

const ICON_OPTIONS = [
  { value: 'plug', label: 'Priz/Fiş' },
  { value: 'lightbulb', label: 'Aydınlatma' },
  { value: 'cable', label: 'Kablo' },
  { value: 'package', label: 'Paket' },
  { value: 'shield', label: 'Koruma' },
  { value: 'shield-check', label: 'Güvenlik' },
  { value: 'zap', label: 'Enerji' },
  { value: 'wrench', label: 'Alet' },
  { value: 'box', label: 'Kutu' },
  { value: 'bolt', label: 'Cıvata' },
  { value: 'cpu', label: 'Otomasyon' },
  { value: 'flame', label: 'Yangın' },
  { value: 'car', label: 'Araç' },
  { value: 'sun', label: 'Solar' },
  { value: 'battery', label: 'Akü/UPS' },
  { value: 'antenna', label: 'Anten' },
  { value: 'phone', label: 'Telefon' },
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
      setExpanded(new Set((data.data ?? []).map((c: Category) => c.id)));
    } catch {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const treeSearched = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const filter = (node: CategoryNode): CategoryNode | null => {
      const children = node.children.map(filter).filter(Boolean) as CategoryNode[];
      const match = node.name.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
      if (match || children.length > 0) return { ...node, children };
      return null;
    };
    return tree.map(filter).filter(Boolean) as CategoryNode[];
  }, [tree, search]);

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
    if (selectedIds.size === categories.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(categories.map((c) => c.id)));
  };

  const openCreate = (parentId: string | null = null) => {
    setEditingCategory(null);
    setForm({ name: '', description: '', icon: 'plug', color: '#3B82F6', parentId: parentId ?? '' });
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
        try { await api.delete(`/categories/${id}`); success++; }
        catch { failed++; }
      }
      toast.success(`${success} silindi${failed ? `, ${failed} atlandı` : ''}`);
      setSelectedIds(new Set());
      fetchCategories();
    } catch {
      toast.error('Toplu silme başarısız');
    }
  };

  // =================================================================
  // Kategori kartı (büyük hero)
  // =================================================================
  const CategoryCard = ({ node, level = 0 }: { node: CategoryNode; level?: number }) => {
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedIds.has(node.id);
    const hasChildren = node.children.length > 0;
    const productCount = countProducts(node);
    const Icon = ICON_MAP[node.icon ?? 'plug'] ?? Plug;
    const color = node.color ?? '#3B82F6';

    return (
      <div key={node.id} className={cn('group/card', level > 0 && 'ml-4 md:ml-8 mt-2')}>
        <div
          className={cn(
            'relative overflow-hidden rounded-2xl border bg-background-surface transition-all duration-300',
            'hover:shadow-2xl hover:-translate-y-0.5',
            isSelected
              ? 'border-brand ring-2 ring-brand/40 shadow-lg'
              : 'border-border hover:border-brand/40',
          )}
          style={{
            // Renk-temalı shadow
            boxShadow: isSelected
              ? `0 0 0 4px ${color}30, 0 8px 24px ${color}25`
              : undefined,
          }}
        >
          {/* Gradient overlay background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              background: `radial-gradient(circle at 100% 0%, ${color}, transparent 60%)`,
            }}
          />

          {/* Animated shimmer on hover */}
          <div
            className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-700 group-hover/card:translate-x-full group-hover/card:opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
            }}
          />

          <div className="relative flex items-center gap-3 p-4 md:p-5">
            {/* Expand toggle */}
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleExpand(node.id)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-all hover:scale-110 hover:bg-card hover:text-text-primary"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-7 flex-shrink-0" />
            )}

            {/* Checkbox */}
            <button
              type="button"
              onClick={() => toggleSelect(node.id)}
              className="flex-shrink-0 text-text-muted transition-all hover:scale-110 hover:text-brand"
              title="Seç"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-brand" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>

            {/* Large animated icon */}
            <div
              className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl shadow-lg transition-all duration-300 group-hover/card:scale-110 group-hover/card:rotate-3"
              style={{
                background: `linear-gradient(135deg, ${color}25, ${color}60)`,
                border: `2px solid ${color}50`,
                boxShadow: `0 4px 16px ${color}30`,
              }}
            >
              <Icon
                className="h-7 w-7 transition-all"
                style={{ color, strokeWidth: 2 }}
              />
              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
                style={{
                  background: `radial-gradient(circle, ${color}20, transparent 70%)`,
                }}
              />
            </div>

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className="truncate font-display text-base font-semibold text-text-primary md:text-lg"
                >
                  {node.name}
                </p>
                {level === 0 && hasChildren && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: `${color}20`,
                      color,
                    }}
                  >
                    {node.children.length} alt kategori
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                <span className="font-medium text-text-primary">{productCount}</span> ürün
                {hasChildren && level === 0 && (
                  <span className="text-text-muted"> ({countProducts(node) - (node._count?.products ?? 0)} alt)</span>
                )}
                {node.description && (
                  <>
                    <span className="mx-1.5 text-text-muted">•</span>
                    <span>{node.description}</span>
                  </>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
              <button
                type="button"
                onClick={() => openCreate(node.id)}
                className="rounded-lg p-2 text-text-muted transition-all hover:scale-110 hover:bg-card hover:text-brand"
                title="Alt kategori ekle"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => openEdit(node)}
                className="rounded-lg p-2 text-text-muted transition-all hover:scale-110 hover:bg-card hover:text-info"
                title="Düzenle"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(node.id, node.name, (node._count?.products ?? 0) > 0)}
                className="rounded-lg p-2 text-text-muted transition-all hover:scale-110 hover:bg-destructive/10 hover:text-destructive"
                title="Sil"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Children (alt kategoriler) */}
          {hasChildren && isExpanded && (
            <div className="space-y-2 border-t border-border/40 bg-background/30 p-2 md:p-3">
              {node.children.map((c) => <CategoryCard key={c.id} node={c} level={level + 1} />)}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 font-display text-3xl font-bold text-text-primary">
            <FolderTree className="h-7 w-7 text-brand" />
            Kategoriler
          </h1>
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
        <Card className="overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
              <FolderTree className="h-5 w-5 text-brand" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Ana Kategori</p>
              <p className="font-display text-2xl font-bold text-text-primary">{stats.roots}</p>
            </div>
          </div>
        </Card>
        <Card className="overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
              <ChevronRight className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Alt Kategori</p>
              <p className="font-display text-2xl font-bold text-text-primary">{stats.subs}</p>
            </div>
          </div>
        </Card>
        <Card className="overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Package className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Toplam Ürün</p>
              <p className="font-display text-2xl font-bold text-text-primary">{stats.products}</p>
            </div>
          </div>
        </Card>
        <Card className="overflow-hidden p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              stats.orphans > 0 ? 'bg-warning/10' : 'bg-muted',
            )}>
              <AlertTriangle />
            </div>
            <div>
              <p className="text-xs text-text-muted">Yetim Kategori</p>
              <p className={cn(
                'font-display text-2xl font-bold',
                stats.orphans > 0 ? 'text-warning' : 'text-text-primary',
              )}>
                {stats.orphans}
              </p>
            </div>
          </div>
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
              onClick={() => setExpanded(new Set(categories.map((c) => c.id)))}
            >
              Tümünü Aç
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpanded(new Set())}>
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
            <div className="space-y-3">
              {treeSearched.map((node) => <CategoryCard key={node.id} node={node} />)}
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
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = ICON_MAP[opt.value];
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, icon: opt.value })}
                          title={opt.label}
                          className={cn(
                            'flex h-10 flex-col items-center justify-center gap-0.5 rounded-md border text-xs transition-all',
                            form.icon === opt.value
                              ? 'border-brand bg-brand/10 text-brand shadow-glow-brand'
                              : 'border-border bg-background-surface text-text-muted hover:border-brand/40 hover:text-text-primary',
                          )}
                        >
                          {IconComp && <IconComp className="h-4 w-4" />}
                          <span className="text-[10px]">{opt.label}</span>
                        </button>
                      );
                    })}
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

// Yardımcı: stats card'ta AlertTriangle için stub
function AlertTriangle() {
  return <span>⚠</span>;
}