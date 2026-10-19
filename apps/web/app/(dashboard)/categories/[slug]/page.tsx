'use client';

import {
  ArrowLeft,
  Loader2,
  Search,
  ChevronRight,
  Package,
  Lightbulb,
  Plug,
  Cable,
  Shield,
  Zap,
  Wrench,
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
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
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

// =================================================================
// TEXTURE MAP (PNG)
// =================================================================
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

const getTexture = (slug?: string | null) => (slug ? TEXTURE_MAP[slug] ?? null : null);

// =================================================================
// Types
// =================================================================
interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  _count?: { products: number };
}

interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  parentId?: string | null;
  children: SubCategory[];
  _count?: { products: number };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  salePrice: number | string;
  totalStock: number;
  minStock?: number;
  category?: { id: string; name: string; color: string; icon: string };
  unit?: { shortName: string };
}

export default function CategoryDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Kategori detayını çek
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/categories/slug/${slug}`);
        setCategory(data.data);
      } catch (err: any) {
        toast.error('Kategori yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchCategory();
  }, [slug]);

  // Seçili alt kategorinin ürünlerini çek
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;
      try {
        setProductsLoading(true);
        let categoryIds: string[] = [];
        if (selectedSubId) {
          categoryIds = [selectedSubId];
        } else {
          // Tüm ürünler: ana + alt kategoriler
          categoryIds = [category.id, ...category.children.map((c) => c.id)];
        }
        const all: Product[] = [];
        for (const id of categoryIds) {
          const { data } = await api.get(`/products?categoryId=${id}&pageSize=100`);
          all.push(...(data.data.items ?? []));
        }
        setProducts(all);
      } catch (err) {
        toast.error('Ürünler yüklenemedi');
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [category, selectedSubId]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const filteredChildren = useMemo(() => {
    if (!category) return [];
    if (!search.trim()) return category.children;
    const q = search.toLowerCase();
    return category.children.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [category, search]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!category) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
        <p className="text-text-primary">Kategori bulunamadı</p>
        <Link href="/categories">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kategorilere Dön
          </Button>
        </Link>
      </Card>
    );
  }

  const Icon = (ICON_MAP[category.icon ?? 'plug'] ?? Plug) as LucideIcon;
  const color = category.color ?? '#3B82F6';
  const texture = getTexture(category.slug);
  const totalProducts =
    (category._count?.products ?? 0) +
    category.children.reduce((acc, c) => acc + (c._count?.products ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Link href="/categories" className="flex items-center gap-1 hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Ana Kategoriler
        </Link>
        <ChevronRight className="h-4 w-4 text-text-muted" />
        <span className="font-medium text-text-primary">{category.name}</span>
      </div>

      {/* Hero - Kategori Başlığı */}
      <Card className="overflow-hidden border-0 shadow-card">
        <div
          className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:gap-6 md:p-8"
          style={{
            background: `linear-gradient(135deg, ${color}15, ${color}05)`,
          }}
        >
          {/* Texture/Icon */}
          <div
            className="flex h-32 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-3xl shadow-lg md:h-40 md:w-40"
            style={{
              background: texture ? 'white' : `linear-gradient(135deg, ${color}30, ${color}80)`,
              border: texture ? '1px solid rgba(0,0,0,0.05)' : `2px solid ${color}60`,
            }}
          >
            {texture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={texture}
                alt={category.name}
                className="h-full w-full object-contain p-3"
              />
            ) : (
              <Icon className="h-16 w-16 md:h-20 md:w-20" style={{ color, strokeWidth: 1.8 }} />
            )}
          </div>

          {/* Başlık + Meta */}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-text-muted">Ana Kategori</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-text-primary md:text-4xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-2 text-sm text-text-secondary">{category.description}</p>
            )}

            {/* Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                <ChevronRight className="h-4 w-4" style={{ color }} />
                <span className="text-sm">
                  <span className="font-bold text-text-primary">{category.children.length}</span>
                  <span className="text-text-muted"> alt kategori</span>
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm">
                <Package className="h-4 w-4" style={{ color }} />
                <span className="text-sm">
                  <span className="font-bold text-text-primary">{totalProducts}</span>
                  <span className="text-text-muted"> ürün</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          placeholder="Alt kategori veya ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Alt Kategoriler - Yan yana grid */}
      {category.children.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold text-text-primary">
            <ChevronRight className="h-5 w-5 text-brand" />
            Alt Kategoriler
            <span className="text-sm font-normal text-text-muted">
              ({filteredChildren.length})
            </span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredChildren.map((sub) => {
              const SubI = (ICON_MAP[sub.icon ?? 'plug'] ?? Plug) as LucideIcon;
              const subColor = sub.color ?? '#3B82F6';
              const isActive = selectedSubId === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubId(isActive ? null : sub.id)}
                  className={cn(
                    'group/sub relative overflow-hidden rounded-xl border bg-white p-4 text-left shadow-sm transition-all duration-200',
                    'hover:-translate-y-0.5 hover:shadow-md',
                    isActive
                      ? 'border-brand ring-2 ring-brand/40 shadow-md'
                      : 'border-border hover:border-brand/40',
                  )}
                >
                  <div
                    className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover/sub:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${subColor}25, ${subColor}60)`,
                    }}
                  >
                    <SubI className="h-5 w-5" style={{ color: subColor }} />
                  </div>
                  <p className="line-clamp-1 font-display text-sm font-semibold text-text-primary">
                    {sub.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {sub._count?.products ?? 0} ürün
                  </p>
                  {isActive && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand">
                      <ChevronRight className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Ürünler Listesi */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-text-primary">
            <Package className="h-5 w-5 text-brand" />
            {selectedSubId
              ? category.children.find((c) => c.id === selectedSubId)?.name + ' Ürünleri'
              : 'Tüm Ürünler'}
            <span className="text-sm font-normal text-text-muted">
              ({filteredProducts.length})
            </span>
          </h2>
          {selectedSubId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubId(null)}
            >
              Tümünü Göster
            </Button>
          )}
        </div>

        {productsLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="mx-auto mb-2 h-10 w-10 text-text-muted" />
            <p className="text-text-secondary">
              {search ? 'Aramanızla eşleşen ürün bulunamadı.' : 'Bu kategoride henüz ürün yok.'}
            </p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-4 p-3 transition-colors hover:bg-background-surface"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand/10">
                        <Package className="h-5 w-5 text-brand" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{p.name}</p>
                        <p className="text-xs text-text-muted">
                          SKU: {p.sku}
                          {p.unit?.shortName && ` · ${p.unit.shortName}`}
                          {p.category && p.category.id !== category.id && ` · ${p.category.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-display text-sm font-semibold text-text-primary">
                          ₺{Number(p.salePrice).toFixed(2)}
                        </p>
                        <p
                          className={cn(
                            'text-xs',
                            p.totalStock <= (p.minStock ?? 0) ? 'text-destructive' : 'text-text-muted',
                          )}
                        >
                          {p.totalStock} stok
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}