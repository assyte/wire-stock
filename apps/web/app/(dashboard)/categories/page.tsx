'use client';

import {
  Plus,
  Trash2,
  Loader2,
  X,
  Search,
  CheckSquare,
  Square,
  Cable,
  Plug,
  Lightbulb,
  Shield,
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
  ChevronRight,
  type LucideIcon,
  Hash,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { KpiPanel } from '@/components/big-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { getPalette } from '@/lib/category-palette';
import { cn } from '@/lib/utils';

// =================================================================
// ICON MAP (Lucide)
// =================================================================
const ICON_MAP: Record<string, LucideIcon> = {
  plug: Plug,
  lightbulb: Lightbulb,
  cable: Cable,
  package: Package,
  shield: Shield,
  'shield-check': Shield,
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

// Texture fallback'leri — texture'ı olmayan kategoriler için
const TEXTURE_MAP: Record<string, string> = {
  aydinlatma: '/categories/main/ayd\u0131nlatma.png',
  'anahtar-priz': '/categories/main/anahtar-priz.png',
  kablolar: '/categories/main/kablolar-tesisat.png',
  'kanal-boru': '/categories/main/kanal-boru-buat.png',
  klemens: '/categories/main/klemens-baglanti.png',
  'motor-surucu': '/categories/main/motor-surucu-kontaktor.png',
  otomasyon: '/categories/main/otomasyon-kontrol.png',
  'pano-malzemeleri': '/categories/main/pano-salt-tesisleri.png',
  'pano-sigorta': '/categories/main/pano-sigorta.png',
  'salt-malzemeleri': '/categories/main/salt-malzemeleri-koruma.png',
  trafolar: '/categories/main/trafo.png',
};

const ICON_OPTIONS = [
  { value: 'plug', label: 'Priz/Fiş' },
  { value: 'lightbulb', label: 'Aydınlatma' },
  { value: 'cable', label: 'Kablo' },
  { value: 'package', label: 'Paket' },
  { value: 'shield', label: 'Koruma' },
  { value: 'zap', label: 'Enerji' },
  { value: 'wrench', label: 'Alet' },
  { value: 'box', label: 'Kutu' },
  { value: 'bolt', label: 'Cıvata' },
  { value: 'cpu', label: 'Otomasyon' },
  { value: 'flame', label: 'Yangın' },
  { value: 'sun', label: 'Solar' },
  { value: 'battery', label: 'Akü/UPS' },
  { value: 'antenna', label: 'Anten' },
];

const COLOR_OPTIONS = [
  { value: '#059669', label: 'Yeşil' },
  { value: '#F59E0B', label: 'Turuncu' },
  { value: '#EF4444', label: 'Kırmızı' },
  { value: '#3B82F6', label: 'Mavi' },
  { value: '#8B5CF6', label: 'Mor' },
  { value: '#1E293B', label: 'Antrasit' },
];

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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/categories');
      setCategories(data.data ?? []);
    } catch {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const rootCategories = useMemo(
    () => categories.filter((c) => !c.parentId),
    [categories],
  );

  const childrenMap = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories.forEach((c) => {
      if (c.parentId) {
        const arr = map.get(c.parentId) ?? [];
        arr.push(c);
        map.set(c.parentId, arr);
      }
    });
    return map;
  }, [categories]);

  const filteredRoots = useMemo(() => {
    if (!search.trim()) return rootCategories;
    const q = search.toLowerCase();
    return rootCategories.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [rootCategories, search]);

  const stats = useMemo(() => {
    const roots = rootCategories.length;
    const subs = categories.length - roots;
    const products = categories.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);
    return { roots, subs, products };
  }, [categories, rootCategories]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '', icon: 'plug', color: '#3B82F6', parentId: '' });
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

  const handleDelete = async (id: string, name: string) => {
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
      toast.success(`${success} silindi${failed ? `, ${failed} atlandı` : ''}`);
      setSelectedIds(new Set());
      fetchCategories();
    } catch {
      toast.error('Toplu silme başarısız');
    }
  };

  // Asimetrik grid için featured ilk kart + kalan grid
  const [featured, ...restRoots] = filteredRoots;
  const restGrid = restRoots;

  return (
    <div className="relative min-h-screen bg-kraft-paper-light">
      <div className="space-y-8 p-1">
        {/* ============ HEADER (samimi) ============ */}
        <header className="flex flex-col gap-6 border-b border-stone-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              <Hash className="h-3 w-3" />
              RAF KATALOĞU
            </div>
            <h1 className="font-display text-4xl font-black tracking-tight text-stone-900 md:text-5xl">
              Depo <span className="text-brand">Raflarımız</span>
            </h1>
            <p className="max-w-xl text-base text-stone-600">
              Malzemelerini raf raf düzenledik. Bir rafa{' '}
              <span className="font-semibold text-stone-800">tıkla</span>, altındaki parçaları gör.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.size > 0 && (
              <Button variant="outline" onClick={handleBulkDelete} className="border-stone-300">
                <Trash2 className="mr-2 h-4 w-4" />
                {selectedIds.size} Sil
              </Button>
            )}
            <Button
              onClick={openCreate}
              className="bg-gradient-to-r from-brand to-brand-light shadow-lg shadow-brand/30 hover:shadow-xl hover:shadow-brand/40"
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Tezgah
            </Button>
          </div>
        </header>

        {/* ============ STATS (BigPanel) ============ */}
        <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <KpiPanel
            label="Ana Raf"
            value={stats.roots}
            emoji="🏷️"
            tone="warning"
            compact
          />
          <KpiPanel
            label="Alt Raf"
            value={stats.subs}
            emoji="🗄️"
            tone="info"
            compact
          />
          <KpiPanel
            label="Toplam Parça"
            value={stats.products}
            emoji="🔩"
            tone="positive"
            compact
          />
        </section>

        {/* ============ SEARCH ============ */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
          <Input
            placeholder="Raf ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-full border-stone-300 bg-white pl-11 text-base shadow-sm focus:border-brand focus:ring-brand"
          />
        </div>

        {/* ============ GRID — Asimetrik ============ */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : filteredRoots.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <>
            {/* FEATURED (ilk ve büyük kart) */}
            {featured && (
              <FeaturedCategoryCard
                category={featured}
                subCategories={childrenMap.get(featured.id) ?? []}
                isSelected={selectedIds.has(featured.id)}
                onToggleSelect={() => toggleSelect(featured.id)}
                onDelete={() => handleDelete(featured.id, featured.name)}
              />
            )}

            {/* REGULAR GRID (kalan) */}
            {restGrid.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {restGrid.map((cat, i) => (
                  <CategoryShowcaseCard
                    key={cat.id}
                    category={cat}
                    subCategories={childrenMap.get(cat.id) ?? []}
                    isSelected={selectedIds.has(cat.id)}
                    onToggleSelect={() => toggleSelect(cat.id)}
                    onDelete={() => handleDelete(cat.id, cat.name)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ============ MODAL ============ */}
        {modalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-md"
            onClick={() => setModalOpen(false)}
          >
            <Card
              className="w-full max-w-lg border-stone-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
                <h2 className="font-display text-xl font-bold text-stone-900">
                  {editingCategory ? 'Rafı Düzenle' : 'Yeni Raf Aç'}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-stone-700">Raf Adı</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ör: Aydınlatma"
                      autoFocus
                      className="border-stone-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc" className="text-stone-700">Not (opsiyonel)</Label>
                    <Input
                      id="desc"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Kısa açıklama"
                      className="border-stone-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="parent" className="text-stone-700">Üst Raf (opsiyonel)</Label>
                    <select
                      id="parent"
                      value={form.parentId}
                      onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="">— Ana Raf</option>
                      {rootCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label className="text-stone-700">Simge</Label>
                    <div className="grid grid-cols-7 gap-2">
                      {ICON_OPTIONS.map((opt) => {
                        const Icon = (ICON_MAP[opt.value] ?? Plug) as LucideIcon;
                        const isActive = form.icon === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, icon: opt.value })}
                            className={cn(
                              'flex h-10 w-10 items-center justify-center rounded-lg border transition-all',
                              isActive
                                ? 'border-brand bg-brand/10 text-brand'
                                : 'border-stone-300 text-stone-600 hover:border-brand/40',
                            )}
                            title={opt.label}
                          >
                            <Icon className="h-5 w-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="text-stone-700">Renk</Label>
                    <div className="grid grid-cols-6 gap-2">
                      {COLOR_OPTIONS.map((opt) => {
                        const isActive = form.color === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setForm({ ...form, color: opt.value })}
                            className={cn(
                              'h-9 w-full rounded-lg border-2 transition-all',
                              isActive
                                ? 'scale-110 border-stone-900 shadow-md'
                                : 'border-transparent hover:scale-105',
                            )}
                            style={{ backgroundColor: opt.value }}
                            title={opt.label}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      disabled={submitting}
                      className="border-stone-300"
                    >
                      İptal
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="bg-gradient-to-r from-brand to-brand-light"
                    >
                      {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingCategory ? 'Güncelle' : 'Rafı Aç'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

// =================================================================
// Featured Card — İlk ve en büyük raf (taşan texture + hero)
// =================================================================
function FeaturedCategoryCard({
  category,
  subCategories,
  isSelected,
  onToggleSelect,
  onDelete,
}: {
  category: Category;
  subCategories: Category[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
}) {
  const palette = getPalette(category.slug);
  const texture = TEXTURE_MAP[category.slug];
  const Icon = (ICON_MAP[category.icon ?? 'plug'] ?? Plug) as LucideIcon;
  const totalProducts =
    (category._count?.products ?? 0) +
    subCategories.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'group/feat relative block overflow-hidden rounded-3xl border-2 transition-all duration-500',
        'shadow-kraft hover:shadow-kraft-hover hover:-translate-y-1',
        isSelected
          ? 'border-brand ring-4 ring-brand/20'
          : 'border-stone-200 hover:border-stone-300',
      )}
      style={{
        background: `linear-gradient(135deg, ${palette.bg} 0%, white 50%, ${palette.bg} 100%)`,
      }}
    >
      {/* Background blob — animasyonlu */}
      <div
        className="pointer-events-none absolute -right-20 -z-10 w-96 animate-blob-float rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: palette.primary }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 animate-blob-float rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: palette.secondary,
          animationDelay: '2s',
        }}
      />

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-[1fr_280px] md:p-10">
          {/* TEXT BLOCK */}
          <div className="flex flex-col justify-between gap-6">
            {/* Sticker — featured */}
            <div className="flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm"
                style={{
                  backgroundColor: palette.primary,
                  color: 'white',
                }}
              >
                <Sparkles className="h-3 w-3" />
                Öne Çıkan Raf
              </div>
              <span className="font-mono text-xs text-stone-500">
                #{category.slug.toUpperCase()}
              </span>
            </div>

            <div>
              <div
                className="mb-3 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: palette.accent }}
              >
                <span className="text-2xl">{palette.emoji}</span>
                <span>{palette.tagline}</span>
              </div>
              <h2
                className="font-display text-5xl font-black leading-[0.95] tracking-tight transition-all md:text-6xl"
                style={{ color: palette.accent }}
              >
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-3 max-w-md text-base text-stone-600">{category.description}</p>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm"
                style={{
                  backgroundColor: 'white',
                  color: palette.accent,
                }}
              >
                <ChevronRight className="h-4 w-4" />
                <span>
                  <span className="font-bold">{subCategories.length}</span>{' '}
                  <span className="text-stone-500">raf</span>
                </span>
              </div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-sm"
                style={{
                  backgroundColor: 'white',
                  color: palette.accent,
                }}
              >
                <Package className="h-4 w-4" />
                <span>
                  <span className="font-bold">{totalProducts}</span>{' '}
                  <span className="text-stone-500">parça</span>
                </span>
              </div>

              <div className="ml-auto hidden items-center gap-1 text-sm font-bold text-stone-700 md:flex">
                Rafa Git
                <ArrowRight className="h-4 w-4 transition-transform group-hover/feat:translate-x-1" />
              </div>
            </div>
          </div>

          {/* VISUAL BLOCK — taşan texture */}
          <div className="relative hidden h-56 md:block">
            {texture ? (
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Glow halo */}
                <div
                  className="absolute h-48 w-48 rounded-full blur-2xl opacity-60"
                  style={{ backgroundColor: palette.primary }}
                />
                {/* Texture — taşıyor */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={texture}
                  alt={category.name}
                  className="relative h-64 w-64 object-contain drop-shadow-2xl transition-transform duration-700 group-hover/feat:scale-110 group-hover/feat:rotate-3"
                  style={{ filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.2))' }}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div
                  className="flex h-40 w-40 items-center justify-center rounded-3xl shadow-2xl transition-transform duration-700 group-hover/feat:scale-110 group-hover/feat:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                    boxShadow: `0 20px 40px -10px ${palette.primary}80`,
                  }}
                >
                  <Icon className="h-20 w-20 text-white" style={{ strokeWidth: 1.5 }} />
                </div>
              </div>
            )}

            {/* Köşe pul (corner stamp) */}
            <div
              className="absolute -right-2 -top-2 hidden h-16 w-16 rotate-12 items-center justify-center rounded-full shadow-lg md:flex"
              style={{ backgroundColor: palette.primary, color: 'white' }}
            >
              <div className="text-center leading-tight">
                <div className="text-[9px] font-bold uppercase tracking-wider">Yeni</div>
                <div className="text-[8px] opacity-90">sezon</div>
              </div>
            </div>
          </div>
        </div>

      {/* Bottom accent bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${palette.primary}, ${palette.secondary}, ${palette.primary})`,
        }}
      />

      {/* Action buttons — overlay */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleSelect();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-stone-500 backdrop-blur transition-all hover:scale-110 hover:text-brand shadow-sm"
        >
          {isSelected ? <CheckSquare className="h-4 w-4 text-brand" /> : <Square className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-stone-500 backdrop-blur transition-all hover:scale-110 hover:bg-red-50 hover:text-red-600 shadow-sm"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}

// =================================================================
// Showcase Card — Kalan raflar (küçük kart)
// =================================================================
function CategoryShowcaseCard({
  category,
  subCategories,
  isSelected,
  onToggleSelect,
  onDelete,
  index,
}: {
  category: Category;
  subCategories: Category[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  index: number;
}) {
  const palette = getPalette(category.slug);
  const texture = TEXTURE_MAP[category.slug];
  const Icon = (ICON_MAP[category.icon ?? 'plug'] ?? Plug) as LucideIcon;
  const totalProducts =
    (category._count?.products ?? 0) +
    subCategories.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'group/shop relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300',
        'border border-stone-200 bg-white shadow-kraft hover:shadow-kraft-hover hover:-translate-y-1',
        isSelected && 'border-brand ring-4 ring-brand/20',
      )}
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Visual header — texture/boyancy taşıyor */}
      <div
        className="relative flex h-36 items-center justify-center overflow-visible"
        style={{
          background: `linear-gradient(135deg, ${palette.bg}, white)`,
        }}
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, ${palette.primary}40, transparent 40%)`,
          }}
        />

        {texture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={texture}
            alt={category.name}
            className="relative h-32 w-32 -translate-y-2 object-contain transition-transform duration-500 group-hover/shop:scale-110 group-hover/shop:-translate-y-3"
            style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}
          />
        ) : (
          <div
            className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover/shop:scale-110 group-hover/shop:rotate-6"
            style={{
              background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              boxShadow: `0 8px 24px -4px ${palette.primary}60`,
            }}
          >
            <Icon className="h-10 w-10 text-white" style={{ strokeWidth: 1.8 }} />
          </div>
        )}

        {/* Raf numarası — sol üst köşe pul */}
        <div
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg font-mono text-xs font-bold shadow-md"
          style={{
            backgroundColor: palette.accent,
            color: 'white',
          }}
        >
          #{String(index + 2).padStart(2, '0')}
        </div>

        {/* Emoji badge — sağ üst */}
        <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-base shadow-sm">
          {palette.emoji}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div
          className="mb-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: palette.primary }}
        >
          {palette.tagline}
        </div>
        <h3 className="line-clamp-1 font-display text-lg font-bold text-stone-900 transition-colors group-hover/shop:text-stone-700">
          {category.name}
        </h3>

        <div className="mt-auto flex items-center justify-between border-t border-stone-200 pt-3 text-xs">
          <div className="flex items-center gap-1 text-stone-600">
            <ChevronRight className="h-3 w-3" />
            <span className="font-bold text-stone-900">{subCategories.length}</span>
            <span>raf</span>
          </div>
          <div className="flex items-center gap-1 text-stone-600">
            <Package className="h-3 w-3" />
            <span className="font-bold text-stone-900">{totalProducts}</span>
            <span>parça</span>
          </div>
        </div>
      </div>

      {/* Bottom accent — ince */}
      <div className="h-1 w-full" style={{ backgroundColor: palette.primary }} />

      {/* Hover overlay — hover'da "Rafa Git" */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-stone-900/0 opacity-0 transition-all duration-300 group-hover/shop:bg-stone-900/40 group-hover/shop:opacity-100">
        <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-900 shadow-lg">
          Rafa Git →
        </span>
      </div>

      {/* Action buttons */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 opacity-0 transition-opacity group-hover/shop:opacity-100">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onToggleSelect();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-stone-500 backdrop-blur shadow-sm hover:text-brand"
        >
          {isSelected ? <CheckSquare className="h-3.5 w-3.5 text-brand" /> : <Square className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/90 text-stone-500 backdrop-blur shadow-sm hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </Link>
  );
}

// =================================================================
// Empty State — Samimi
// =================================================================
function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center">
      <div className="mb-4 text-7xl opacity-50">{search ? '🔍' : '🏗️'}</div>
      <h3 className="font-display text-xl font-bold text-stone-700">
        {search ? 'Eşleşen raf bulunamadı' : 'Depo Henüz Boş'}
      </h3>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        {search
          ? `"${search}" için bir sonuç yok. Farklı bir terim dene.`
          : 'İlk rafını aç ve malzeme kategorilerini düzenlemeye başla.'}
      </p>
    </div>
  );
}