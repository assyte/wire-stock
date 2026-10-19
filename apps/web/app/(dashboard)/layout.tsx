'use client';

import {
  LayoutDashboard,
  Package,
  Warehouse,
  ArrowDownToLine,
  HardHat,
  LogOut,
  Boxes,
  Tags,
  ChevronRight,
  BarChart3,
  ScanLine,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import { AuthGuard } from '@/components/auth-guard';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import api from '@/lib/api';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  section: 'stok' | 'raporlar' | 'yonetim';
}

const NAV_ITEMS: NavItem[] = [
  // STOK
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard, section: 'stok' },
  { href: '/scan', label: 'Barkod Tara', icon: ScanLine, section: 'stok' },
  { href: '/products', label: 'Ürünler', icon: Package, section: 'stok' },
  { href: '/stock', label: 'Stok Hareketleri', icon: ArrowDownToLine, section: 'stok' },
  { href: '/warehouses', label: 'Depolar & Raflar', icon: Warehouse, section: 'stok' },
  { href: '/categories', label: 'Kategoriler', icon: Tags, section: 'stok' },
  // RAPORLAR
  { href: '/reports', label: 'Raporlar & Analiz', icon: BarChart3, section: 'raporlar' },
  // YÖNETİM
  { href: '/workers', label: 'Çalışanlar', icon: HardHat, section: 'yonetim' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    logout();
    router.push('/login');
  };

  const grouped = useMemo(() => {
    const stok = NAV_ITEMS.filter((i) => i.section === 'stok');
    const raporlar = NAV_ITEMS.filter((i) => i.section === 'raporlar');
    const yonetim = NAV_ITEMS.filter((i) => i.section === 'yonetim');
    return { stok, raporlar, yonetim };
  }, []);

  return (
    <div className="flex min-h-screen bg-background-surface">
      {/* ============= SIDEBAR ============= */}
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-white md:flex">
        {/* Brand */}
        <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-brand">
            <Boxes className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-text-primary">WireStock</span>
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              DükkanDepo
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <NavSection title="Stok" items={grouped.stok} pathname={pathname} />
          <NavSection title="Raporlar" items={grouped.raporlar} pathname={pathname} />
          <NavSection title="Yönetim" items={grouped.yonetim} pathname={pathname} />
        </nav>

        {/* User card */}
        <div className="border-t border-border/60 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-background-surface px-2.5 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              {user?.lastName?.[0]?.toUpperCase() ?? ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="truncate text-[11px] text-text-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-muted transition-all hover:bg-destructive/10 hover:text-destructive"
              title="Çıkış"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <p className="px-2 text-[10px] text-text-muted">v1.1.0-alpha · Light</p>
        </div>
      </aside>

      {/* ============= MAIN ============= */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </div>
  );
}

function NavSection({
  title,
  items,
  pathname,
}: {
  title: string;
  items: NavItem[];
  pathname: string | null;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
        {title}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={`${item.section}-${item.label}`}
              href={item.href}
              className={cn(
                'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-brand text-white shadow-glow-brand'
                  : 'text-text-secondary hover:bg-background-surface hover:text-text-primary',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-white' : 'text-text-muted group-hover:text-brand',
                )}
              />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}