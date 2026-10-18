'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  FolderTree,
  ScanLine,
  ShoppingCart,
  Truck,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  Zap,
  Bell,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  {
    title: 'Genel',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Stok & Depo',
    items: [
      { href: '/products', label: 'Ürünler', icon: Package },
      { href: '/categories', label: 'Kategoriler', icon: FolderTree },
      { href: '/warehouses', label: 'Depolar', icon: Warehouse },
      { href: '/stock', label: 'Stok Hareketleri', icon: ScanLine },
    ],
  },
  {
    title: 'Operasyon',
    items: [
      { href: '/purchases', label: 'Satın Alma', icon: Truck },
      { href: '/sales', label: 'Satış', icon: ShoppingCart },
      { href: '/customers', label: 'Müşteriler', icon: Users },
      { href: '/suppliers', label: 'Tedarikçiler', icon: Users },
    ],
  },
  {
    title: 'Yönetim',
    items: [
      { href: '/invoices', label: 'Faturalar', icon: FileText },
      { href: '/reports', label: 'Raporlar', icon: BarChart3 },
      { href: '/settings', label: 'Ayarlar', icon: Settings },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-background-surface transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-brand">
                <Zap className="h-4 w-4 text-background" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-gradient">WireStock</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-1 text-text-muted hover:bg-card lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navigation.map((group) => (
              <div key={group.title} className="mb-6">
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-brand/10 text-brand shadow-glow-brand'
                            : 'text-text-secondary hover:bg-card hover:text-text-primary',
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4',
                            isActive ? 'text-brand' : 'text-text-muted group-hover:text-text-primary',
                          )}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-border p-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-card"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-background">
                  {user?.firstName[0]}
                  {user?.lastName[0]}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-text-muted">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-text-muted" />
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-background-surface hover:text-text-primary"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    Ayarlar
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-background-surface px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-text-muted hover:bg-card lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Ürün, müşteri veya sipariş ara..."
                className="h-9 w-64 rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative rounded-md p-2 text-text-muted hover:bg-card">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>

            {user?.organization && (
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 lg:flex">
                <div className="h-2 w-2 rounded-full bg-success" />
                <span className="text-sm text-text-secondary">
                  {user.organization.name}
                </span>
                <span className="rounded bg-brand/10 px-1.5 py-0.5 text-xs font-medium text-brand">
                  {user.organization.plan}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
