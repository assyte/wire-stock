import { Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';

import { PrismaService } from '@/common/prisma/prisma.service';

type StockStatus = 'OUT' | 'CRITICAL' | 'LOW' | 'OK';

interface LowStockItem {
  id: string;
  sku: string;
  name: string;
  category: { id: string; name: string; color: string | null };
  unit: { shortName: string };
  totalStock: number;
  minStock: number;
  criticalStock: number;
  maxStock: number | null;
  status: StockStatus;
  /** Alınması gereken miktar (maxStock varsa farkı, yoksa minStock'in 2 katına tamamlama) */
  suggestedOrderQty: number;
  /** Son hareket tarihi */
  lastMovementAt: string | null;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // =================================================================
  // 1. Dashboard Özeti
  // =================================================================
  async getDashboardSummary(organizationId: string) {
    const [
      totalProducts,
      totalCategories,
      totalWarehouses,
      activeWorkers,
      todayMovements,
    ] = await Promise.all([
      this.prisma.product.count({
        where: { organizationId, deletedAt: null },
      }),
      this.prisma.category.count({
        where: { organizationId, parentId: null },
      }),
      this.prisma.warehouse.count({
        where: { organizationId, isActive: true },
      }),
      this.prisma.worker.count({
        where: { organizationId, isActive: true },
      }),
      this.prisma.stockMovement.count({
        where: {
          organizationId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    // Stok değerlerini hesapla
    const stockLevels = await this.prisma.stockLevel.findMany({
      where: {
        product: { organizationId, deletedAt: null },
      },
      include: {
        product: {
          select: { purchasePrice: true, salePrice: true, minStock: true, criticalStock: true },
        },
      },
    });

    let totalStockValue = 0;
    let totalSaleValue = 0;
    let outOfStockCount = 0;
    let criticalStockCount = 0;
    let lowStockCount = 0;

    // Ürün başına stok toplamı için grupla
    const productStockMap = new Map<string, number>();
    stockLevels.forEach((sl) => {
      const current = productStockMap.get(sl.productId) ?? 0;
      productStockMap.set(sl.productId, current + Number(sl.quantity));
    });

    // Ürünleri çek (fiyatlar için)
    const products = await this.prisma.product.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        purchasePrice: true,
        salePrice: true,
        minStock: true,
        criticalStock: true,
      },
    });

    products.forEach((p) => {
      const stock = productStockMap.get(p.id) ?? 0;
      totalStockValue += stock * Number(p.purchasePrice);
      totalSaleValue += stock * Number(p.salePrice);

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= Number(p.criticalStock) || Number(p.criticalStock) === 0) {
        // criticalStock 0 ise sadece stock=0 OUT sayılır, kalanlar OK
        if (stock <= Number(p.criticalStock) && Number(p.criticalStock) > 0) {
          criticalStockCount++;
        } else if (Number(p.criticalStock) === 0 && stock <= Number(p.minStock)) {
          lowStockCount++;
        }
      } else if (stock <= Number(p.minStock)) {
        lowStockCount++;
      }
    });

    return {
      totalProducts,
      totalCategories,
      totalWarehouses,
      activeWorkers,
      todayMovements,
      totalStockValue: Number(totalStockValue.toFixed(2)),
      totalSaleValue: Number(totalSaleValue.toFixed(2)),
      stockAlerts: {
        outOfStock: outOfStockCount,
        critical: criticalStockCount,
        low: lowStockCount,
      },
    };
  }

  // =================================================================
  // 2. Kritik Stok Raporu
  // =================================================================
  async getLowStockReport(
    organizationId: string,
    options: { status?: 'CRITICAL' | 'LOW' | 'OUT'; categoryId?: string } = {},
  ) {
    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isActive: true,
        ...(options.categoryId && { categoryId: options.categoryId }),
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        unit: { select: { shortName: true } },
        stockLevels: {
          select: { quantity: true, lastMovementAt: true },
        },
      },
    });

    const items: LowStockItem[] = products
      .map((p) => {
        const totalStock = p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
        const minStock = Number(p.minStock);
        const criticalStock = Number(p.criticalStock);
        const maxStock = p.maxStock ? Number(p.maxStock) : null;

        let status: StockStatus = 'OK';
        if (totalStock === 0) status = 'OUT';
        else if (criticalStock > 0 && totalStock <= criticalStock) status = 'CRITICAL';
        else if (totalStock <= minStock) status = 'LOW';

        // Son hareket tarihi
        const lastMovementAt = p.stockLevels
          .map((l) => l.lastMovementAt)
          .filter((d): d is Date => !!d)
          .sort((a, b) => b.getTime() - a.getTime())[0];

        // Önerilen sipariş miktarı
        let suggestedOrderQty = 0;
        if (status !== 'OK') {
          if (maxStock) {
            suggestedOrderQty = Math.max(0, maxStock - totalStock);
          } else {
            suggestedOrderQty = Math.max(0, minStock * 2 - totalStock);
          }
        }

        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          unit: p.unit,
          totalStock,
          minStock,
          criticalStock,
          maxStock,
          status,
          suggestedOrderQty: Math.ceil(suggestedOrderQty),
          lastMovementAt: lastMovementAt?.toISOString() ?? null,
        };
      })
      .filter((p) => p.status !== 'OK');

    // Filtre
    let filtered = items;
    if (options.status) {
      filtered = items.filter((i) => i.status === options.status);
    }

    // Öncelik sıralaması: OUT > CRITICAL > LOW, sonra stok az olan önce
    const statusOrder: Record<StockStatus, number> = {
      OUT: 0,
      CRITICAL: 1,
      LOW: 2,
      OK: 3,
    };
    filtered.sort((a, b) => {
      const s = statusOrder[a.status] - statusOrder[b.status];
      if (s !== 0) return s;
      return a.totalStock - b.totalStock;
    });

    // Kategori bazlı özet
    const byCategory = new Map<string, { name: string; color: string | null; count: number; items: number }>();
    filtered.forEach((i) => {
      const existing = byCategory.get(i.category.id);
      if (existing) {
        existing.count++;
        existing.items += i.suggestedOrderQty;
      } else {
        byCategory.set(i.category.id, {
          name: i.category.name,
          color: i.category.color,
          count: 1,
          items: i.suggestedOrderQty,
        });
      }
    });

    return {
      items: filtered,
      summary: {
        total: filtered.length,
        out: filtered.filter((i) => i.status === 'OUT').length,
        critical: filtered.filter((i) => i.status === 'CRITICAL').length,
        low: filtered.filter((i) => i.status === 'LOW').length,
        totalSuggestedOrderItems: filtered.reduce((sum, i) => sum + i.suggestedOrderQty, 0),
        byCategory: Array.from(byCategory.entries()).map(([id, data]) => ({
          categoryId: id,
          ...data,
        })),
      },
    };
  }

  // =================================================================
  // 3. Ölü Stok (X gündür hareket görmemiş)
  // =================================================================
  async getDeadStock(organizationId: string, days: number) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - days);

    const products = await this.prisma.product.findMany({
      where: {
        organizationId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        category: { select: { id: true, name: true, color: true } },
        unit: { select: { shortName: true } },
        stockLevels: {
          select: { quantity: true, lastMovementAt: true },
        },
      },
    });

    const items = products
      .map((p) => {
        const totalStock = p.stockLevels.reduce((s, l) => s + Number(l.quantity), 0);
        const lastMovementAt = p.stockLevels
          .map((l) => l.lastMovementAt)
          .filter((d): d is Date => !!d)
          .sort((a, b) => b.getTime() - a.getTime())[0];

        // Stokta olan ama hareket etmeyenler
        if (totalStock === 0) return null;
        if (!lastMovementAt) return null;
        if (lastMovementAt >= threshold) return null;

        const daysSinceMovement = Math.floor(
          (Date.now() - lastMovementAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          id: p.id,
          sku: p.sku,
          name: p.name,
          category: p.category,
          unit: p.unit,
          totalStock,
          purchasePrice: Number(p.purchasePrice),
          stockValue: totalStock * Number(p.purchasePrice),
          lastMovementAt: lastMovementAt.toISOString(),
          daysSinceMovement,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.daysSinceMovement - a.daysSinceMovement);

    return {
      thresholdDays: days,
      items,
      summary: {
        total: items.length,
        totalStockValue: Number(items.reduce((s, i) => s + i.stockValue, 0).toFixed(2)),
      },
    };
  }

  // =================================================================
  // 4. En Çok Hareket (top movement)
  // =================================================================
  async getTopMovement(
    organizationId: string,
    options: { days: number; limit: number; type?: 'IN' | 'OUT' },
  ) {
    const since = new Date();
    since.setDate(since.getDate() - options.days);

    const where: Prisma.StockMovementWhereInput = {
      organizationId,
      createdAt: { gte: since },
    };
    if (options.type) {
      where.type = options.type === 'IN' ? MovementType.IN : MovementType.OUT;
    }

    const movements = await this.prisma.stockMovement.groupBy({
      by: ['productId'],
      where,
      _sum: { quantity: true },
      _count: { id: true },
    });

    // Ürünleri çek
    const productIds = movements.map((m) => m.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, deletedAt: null },
      include: {
        category: { select: { id: true, name: true, color: true } },
        unit: { select: { shortName: true } },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    const items = movements
      .map((m) => {
        const product = productMap.get(m.productId);
        if (!product) return null;
        return {
          productId: m.productId,
          sku: product.sku,
          name: product.name,
          category: product.category,
          unit: product.unit,
          totalQuantity: Number(m._sum.quantity ?? 0),
          movementCount: m._count.id,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, options.limit);

    return {
      periodDays: options.days,
      type: options.type ?? 'ALL',
      items,
    };
  }

  // =================================================================
  // 5. Hareket Özeti (tarih aralığı)
  // =================================================================
  async getMovementSummary(
    organizationId: string,
    options: { startDate?: Date; endDate?: Date } = {},
  ) {
    const end = options.endDate ?? new Date();
    const start = options.startDate ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const movements = await this.prisma.stockMovement.findMany({
      where: {
        organizationId,
        createdAt: { gte: start, lte: end },
      },
      include: {
        product: { select: { purchasePrice: true } },
      },
    });

    const byType: Record<string, { count: number; quantity: number; value: number }> = {};
    let totalValue = 0;

    movements.forEach((m) => {
      const qty = Number(m.quantity);
      const total = Number(m.totalPrice ?? 0);
      if (!byType[m.type]) {
        byType[m.type] = { count: 0, quantity: 0, value: 0 };
      }
      byType[m.type].count++;
      byType[m.type].quantity += qty;
      byType[m.type].value += total;
      totalValue += total;
    });

    // Günlük dağılım
    const dailyMap = new Map<string, { inQty: number; outQty: number; date: string }>();
    movements.forEach((m) => {
      const dayKey = m.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dayKey) ?? { day: dayKey, inQty: 0, outQty: 0, date: dayKey };
      if (m.type === MovementType.IN || m.type === MovementType.RETURN) {
        existing.inQty += Number(m.quantity);
      } else if (m.type === MovementType.OUT || m.type === MovementType.DAMAGE) {
        existing.outQty += Number(m.quantity);
      }
      dailyMap.set(dayKey, existing);
    });

    return {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      },
      totalMovements: movements.length,
      totalValue: Number(totalValue.toFixed(2)),
      byType,
      daily: Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  // =================================================================
  // 6. Satın Alma Önerisi
  // =================================================================
  async getPurchaseSuggestion(organizationId: string, limit: number) {
    // Önce low-stock raporunu al
    const lowStock = await this.getLowStockReport(organizationId);

    // Her ürün için son 30 gündeki tüketim hızını hesapla
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const productIds = lowStock.items.map((i) => i.id);
    const outMovements = await this.prisma.stockMovement.groupBy({
      by: ['productId'],
      where: {
        organizationId,
        productId: { in: productIds },
        type: MovementType.OUT,
        createdAt: { gte: since },
      },
      _sum: { quantity: true },
    });

    const consumptionMap = new Map<string, number>();
    outMovements.forEach((m) => {
      consumptionMap.set(m.productId, Number(m._sum.quantity ?? 0));
    });

    // Her ürünü zenginleştir
    const enriched = lowStock.items.map((item) => {
      const last30daysConsumption = consumptionMap.get(item.id) ?? 0;
      const dailyConsumption = last30daysConsumption / 30;
      // Mevcut stok kaç gün yeter?
      const daysRemaining = dailyConsumption > 0 ? item.totalStock / dailyConsumption : 999;

      return {
        ...item,
        last30daysConsumption,
        dailyConsumption: Number(dailyConsumption.toFixed(2)),
        daysRemaining: Math.floor(daysRemaining),
        // Aciliyet skoru (0-100): OUT = 100, daysRemaining < 7 = 90, ...
        urgencyScore: Math.min(
          100,
          item.status === 'OUT'
            ? 100
            : item.status === 'CRITICAL'
            ? 90
            : Math.max(20, 100 - daysRemaining * 2),
        ),
      };
    });

    // Aciliyet skoruna göre sırala
    enriched.sort((a, b) => b.urgencyScore - a.urgencyScore);

    // Toplam tahmini maliyet (purchasePrice ile)
    const products = await this.prisma.product.findMany({
      where: { id: { in: enriched.map((e) => e.id) } },
      select: { id: true, purchasePrice: true },
    });
    const priceMap = new Map(products.map((p) => [p.id, Number(p.purchasePrice)]));

    const items = enriched.slice(0, limit).map((item) => ({
      ...item,
      estimatedCost: Number((item.suggestedOrderQty * (priceMap.get(item.id) ?? 0)).toFixed(2)),
    }));

    const totalEstimatedCost = items.reduce((sum, i) => sum + i.estimatedCost, 0);

    return {
      generatedAt: new Date().toISOString(),
      totalSuggested: items.length,
      totalEstimatedCost: Number(totalEstimatedCost.toFixed(2)),
      items,
    };
  }
}