'use client';

import { cn } from '@wire-stock/utils';
import {
  Package,
  Warehouse,
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ScanLine,
  Activity,
  DollarSign,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';



interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalWarehouses: number;
  recentMovements: number;
}

// Backend /organizations/me/stats response → DashboardStats (v1.0.2)
const mapApiStats = (api: any): DashboardStats => ({
  totalProducts: api.totalProducts ?? 0,
  totalStockValue: 0, // backend v1.0.5'te eklenecek
  lowStockProducts: api.lowStockProducts ?? 0,
  outOfStockProducts: api.outOfStockProducts ?? 0,
  totalCustomers: api.totalCustomers ?? 0,
  totalSuppliers: api.totalSuppliers ?? 0,
  totalWarehouses: api.totalWarehouses ?? 0,
  recentMovements: 0,
});

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/organizations/me/stats');
        setStats(mapApiStats(response.data.data));
      } catch (error) {
        console.error('Stats fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  type StatChangeType = 'up' | 'down' | 'warning';

const statCards: Array<{
  title: string;
  value: string | number;
  icon: any;
  change: string;
  changeType: StatChangeType;
  color: 'brand' | 'accent' | 'warning' | 'info';
}> = [
    {
      title: 'Toplam Ürün',
      value: stats?.totalProducts ?? 0,
      icon: Package,
      change: '+12%',
      changeType: 'up',
      color: 'brand',
    },
    {
      title: 'Stok Değeri',
      value: '—',
      icon: DollarSign,
      change: 'v1.0.5',
      changeType: 'up',
      color: 'accent',
    },
    {
      title: 'Düşük Stok',
      value: stats?.lowStockProducts ?? 0,
      icon: AlertTriangle,
      change: stats?.outOfStockProducts ? `${stats.outOfStockProducts} tükendi` : '',
      changeType: 'warning',
      color: 'warning',
    },
    {
      title: 'Müşteri',
      value: stats?.totalCustomers ?? 0,
      icon: Users,
      change: '+5%',
      changeType: 'up',
      color: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold text-text-primary">
          Hoş geldin, {user?.firstName} 👋
        </h1>
        <p className="text-sm text-text-secondary">
          İşte bugünkü {user?.organization?.name} özeti
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary">{stat.title}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-text-primary">
                      {isLoading ? (
                        <span className="inline-block h-7 w-16 animate-pulse rounded bg-card" />
                      ) : (
                        stat.value
                      )}
                    </p>
                    {stat.change && (
                      <p
                        className={cn(
                          'mt-1 flex items-center gap-1 text-xs',
                          stat.changeType === 'up' && 'text-success',
                          stat.changeType === 'down' && 'text-destructive',
                          stat.changeType === 'warning' && 'text-warning',
                        )}
                      >
                        {stat.changeType === 'up' && <TrendingUp className="h-3 w-3" />}
                        {stat.changeType === 'down' && <TrendingDown className="h-3 w-3" />}
                        {stat.changeType === 'warning' && <AlertTriangle className="h-3 w-3" />}
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg',
                      stat.color === 'brand' && 'bg-brand/10 text-brand',
                      stat.color === 'accent' && 'bg-accent/10 text-accent',
                      stat.color === 'warning' && 'bg-warning/10 text-warning',
                      stat.color === 'info' && 'bg-info/10 text-info',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Hızlı İşlemler */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Yeni Ürün', icon: Package, color: 'brand' },
                { label: 'Stok Girişi', icon: ScanLine, color: 'success' },
                { label: 'Yeni Depo', icon: Warehouse, color: 'accent' },
                { label: 'Yeni Müşteri', icon: Users, color: 'info' },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="group flex flex-col items-center gap-2 rounded-lg border border-border bg-background-surface p-4 transition-all hover:border-brand/30 hover:bg-card hover:shadow-glow-brand"
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        action.color === 'brand' && 'bg-brand/10 text-brand',
                        action.color === 'success' && 'bg-success/10 text-success',
                        action.color === 'accent' && 'bg-accent/10 text-accent',
                        action.color === 'info' && 'bg-info/10 text-info',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sistem Durumu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              Sistem Durumu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Veritabanı', status: 'online' },
              { label: 'API', status: 'online' },
              { label: 'Depolama', status: 'online' },
              { label: 'Yedekleme', status: 'online' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-text-muted">Çevrimiçi</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Placeholder Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand" />
              Son Stok Hareketleri
            </CardTitle>
            <button className="flex items-center gap-1 text-xs text-brand hover:underline">
              Tümünü Gör
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-card p-3">
                <Activity className="h-6 w-6 text-text-muted" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Henüz hareket yok</p>
              <p className="text-xs text-text-muted">Stok giriş/çıkışı yapınca burada görünecek</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Düşük Stok Uyarıları
            </CardTitle>
            <button className="flex items-center gap-1 text-xs text-brand hover:underline">
              Tümünü Gör
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-warning/10 p-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <p className="mt-3 text-sm text-text-secondary">Uyarı yok 🎉</p>
              <p className="text-xs text-text-muted">Tüm stoklar yeterli seviyede</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
